import Phaser from 'phaser';
import { COLORS, TIMING } from '../config/constants.js';
import { IED_TYPES, IED_STATES } from '../config/iedConfig.js';

export class IED extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type = 'cwied') {
    super(scene, x, y);

    this.scene = scene;
    this.type = type;
    this.config = IED_TYPES[type.toUpperCase()] || IED_TYPES.CWIED;

    this.state = IED_STATES.HIDDEN;
    this.stateStartTime = 0;
    this.warningTimer = null;
    this.criticalTimer = null;

    // Create visual elements
    this.createVisuals();

    // Add to scene
    scene.add.existing(this);
  }

  createVisuals() {
    const width = this.scene.cameras.main.width;

    // Visual cue depends on IED type
    switch (this.config.visualCue) {
      case 'wire':
        this.createWireVisuals();
        break;
      case 'plate':
        this.createPlateVisuals();
        break;
      case 'antenna':
        this.createAntennaVisuals();
        break;
      case 'vehicle':
        this.createVehicleVisuals();
        break;
      default:
        this.createWireVisuals();
    }

    // Warning ring (hidden initially)
    this.warningRing = this.scene.add.circle(0, 0, 30, 0x000000, 0);
    this.warningRing.setStrokeStyle(3, this.config.color.warning, 0);
    this.add(this.warningRing);

    // Critical ring (hidden initially)
    this.criticalRing = this.scene.add.circle(0, 0, 25, 0x000000, 0);
    this.criticalRing.setStrokeStyle(4, this.config.color.critical, 0);
    this.add(this.criticalRing);

    // Neutralized indicator (hidden initially)
    this.neutralizedMark = this.scene.add.text(0, 0, '✓', {
      fontSize: '32px',
      color: '#00FF00'
    }).setOrigin(0.5);
    this.neutralizedMark.setVisible(false);
    this.add(this.neutralizedMark);
  }

  createWireVisuals() {
    // CWIED - Command Wire IED
    this.body = this.scene.add.circle(0, 0, 18, this.config.color.hidden);
    this.body.setAlpha(0.3);
    this.add(this.body);

    // Disturbed dirt
    this.dirt = this.scene.add.ellipse(0, 5, 40, 20, COLORS.DESERT, 0.5);
    this.add(this.dirt);

    // Command wire extending off-road
    this.wire = this.scene.add.graphics();
    this.wire.lineStyle(2, COLORS.WIRE, 0.6);

    const wireLength = this.config.wireLength;
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.wireDirection = direction;
    const endX = direction * wireLength;

    this.wire.lineBetween(0, 0, endX, -30);
    this.add(this.wire);

    // Small connector at IED
    this.connector = this.scene.add.circle(0, 0, 4, COLORS.WIRE);
    this.add(this.connector);
  }

  createPlateVisuals() {
    // PPIED - Pressure Plate IED
    // Subtle disturbed ground - harder to see!
    this.dirt = this.scene.add.ellipse(0, 0, 50, 25, COLORS.DESERT, 0.4);
    this.add(this.dirt);

    // Pressure plate outline (barely visible)
    this.body = this.scene.add.rectangle(0, 0, 35, 25, this.config.color.hidden, 0.2);
    this.body.setStrokeStyle(1, 0x666666, 0.3);
    this.add(this.body);

    // Crack lines in the ground
    this.cracks = this.scene.add.graphics();
    this.cracks.lineStyle(1, 0x5C4033, 0.4);
    this.cracks.lineBetween(-15, -5, 10, 8);
    this.cracks.lineBetween(5, -8, -8, 5);
    this.add(this.cracks);
  }

  createAntennaVisuals() {
    // RCIED - Radio Controlled IED
    this.body = this.scene.add.circle(0, 0, 15, this.config.color.hidden);
    this.body.setAlpha(0.4);
    this.add(this.body);

    // Electronics box
    this.box = this.scene.add.rectangle(0, 5, 20, 12, 0x333333, 0.7);
    this.add(this.box);

    // Antenna
    this.antenna = this.scene.add.graphics();
    this.antenna.lineStyle(2, 0x888888, 0.8);
    this.antenna.lineBetween(0, -5, 0, -25);
    this.add(this.antenna);

    // Signal indicator (blinks)
    this.signal = this.scene.add.circle(0, -25, 4, 0x00FF00, 0);
    this.add(this.signal);

    // Start signal blinking
    this.signalVisible = false;
    this.startSignalBlink();
  }

  createVehicleVisuals() {
    // VBIED - Vehicle Borne IED (car bomb)
    // Car body
    this.body = this.scene.add.rectangle(0, 0, 50, 30, 0x4A4A4A, 0.8);
    this.body.setStrokeStyle(2, 0x333333);
    this.add(this.body);

    // Windshield
    this.windshield = this.scene.add.rectangle(0, -8, 30, 10, 0x6699AA, 0.6);
    this.add(this.windshield);

    // Wheels
    this.wheel1 = this.scene.add.circle(-18, 12, 6, 0x222222);
    this.wheel2 = this.scene.add.circle(18, 12, 6, 0x222222);
    this.add(this.wheel1);
    this.add(this.wheel2);

    // Suspicious bulge/weight in back
    this.cargo = this.scene.add.rectangle(0, 5, 35, 15, 0x3A3A3A, 0.9);
    this.add(this.cargo);
  }

  startSignalBlink() {
    if (this.config.visualCue !== 'antenna') return;

    const interval = this.config.signalInterval || 1500;
    const duration = this.config.signalDuration || 800;

    this.signalTimer = this.scene.time.addEvent({
      delay: interval,
      callback: () => {
        if (this.state === IED_STATES.NEUTRALIZED || this.state === IED_STATES.DETONATED) return;

        // Signal on
        this.signalVisible = true;
        this.signal.setAlpha(1);
        this.signal.setFillStyle(0x00FF00);

        // Pulse animation
        this.scene.tweens.add({
          targets: this.signal,
          scale: 1.5,
          duration: 200,
          yoyo: true,
          repeat: 2
        });

        // Signal off after duration
        this.scene.time.delayedCall(duration, () => {
          this.signalVisible = false;
          this.signal.setAlpha(0);
        });
      },
      loop: true
    });
  }

  update(time, delta) {
    if (this.state === IED_STATES.NEUTRALIZED || this.state === IED_STATES.DETONATED) {
      return;
    }

    // Check proximity to player
    const husky = this.scene.husky;
    if (!husky) return;

    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      husky.x, husky.y
    );

    // State transitions based on distance
    if (this.state === IED_STATES.HIDDEN) {
      if (distance < this.config.detectionRange) {
        this.enterWarningState();
      }
    } else if (this.state === IED_STATES.WARNING) {
      if (distance < this.config.criticalRange) {
        this.enterCriticalState();
      }
    }

    // PPIED special: instant critical if going too fast when close
    if (this.config.visualCue === 'plate' && this.state === IED_STATES.WARNING) {
      const speed = this.scene.gameState.speed;
      const maxSpeed = this.config.maxSpeedToScan || 120;
      if (speed > maxSpeed && distance < this.config.criticalRange + 50) {
        // Too fast! Instant critical
        this.enterCriticalState();
      }
    }
  }

  // Check if this IED can currently be scanned
  canBeScan() {
    if (this.state === IED_STATES.NEUTRALIZED || this.state === IED_STATES.DETONATED) {
      return false;
    }

    // RCIED: Only scannable when signal is visible
    if (this.config.requiresSignal && !this.signalVisible) {
      return false;
    }

    // PPIED: Only scannable if going slow enough
    if (this.config.maxSpeedToScan) {
      const speed = this.scene.gameState.speed;
      if (speed > this.config.maxSpeedToScan) {
        return false;
      }
    }

    return true;
  }

  enterWarningState() {
    if (this.state !== IED_STATES.HIDDEN) return;

    this.state = IED_STATES.WARNING;
    this.stateStartTime = this.scene.time.now;

    // Visual changes
    this.body.setFillStyle(this.config.color.warning);
    this.body.setAlpha(0.8);

    // Show warning ring with pulse
    this.warningRing.setStrokeStyle(3, this.config.color.warning, 1);
    this.scene.tweens.add({
      targets: this.warningRing,
      scale: 1.5,
      alpha: 0,
      duration: 600,
      repeat: -1,
      onRepeat: () => {
        this.warningRing.setScale(1);
        this.warningRing.setAlpha(1);
      }
    });

    // Start timer to critical
    this.warningTimer = this.scene.time.delayedCall(
      this.config.warningDuration,
      () => this.enterCriticalState()
    );
  }

  enterCriticalState() {
    if (this.state === IED_STATES.CRITICAL ||
        this.state === IED_STATES.NEUTRALIZED ||
        this.state === IED_STATES.DETONATED) return;

    // Cancel warning timer if still running
    if (this.warningTimer) {
      this.warningTimer.remove();
      this.warningTimer = null;
    }

    this.state = IED_STATES.CRITICAL;
    this.stateStartTime = this.scene.time.now;

    // Visual changes
    this.body.setFillStyle(this.config.color.critical);
    this.body.setAlpha(1);

    // Show critical ring with fast pulse
    this.criticalRing.setStrokeStyle(4, this.config.color.critical, 1);
    this.scene.tweens.add({
      targets: this.criticalRing,
      scale: 1.3,
      alpha: 0,
      duration: 200,
      repeat: -1,
      onRepeat: () => {
        this.criticalRing.setScale(1);
        this.criticalRing.setAlpha(1);
      }
    });

    // Shake the IED body
    this.scene.tweens.add({
      targets: this.body,
      x: 3,
      duration: 50,
      yoyo: true,
      repeat: -1
    });

    // Start timer to detonation
    this.criticalTimer = this.scene.time.delayedCall(
      this.config.criticalDuration,
      () => this.detonate()
    );
  }

  neutralize() {
    if (this.state === IED_STATES.NEUTRALIZED ||
        this.state === IED_STATES.DETONATED) return;

    // Cancel all timers
    if (this.warningTimer) {
      this.warningTimer.remove();
    }
    if (this.criticalTimer) {
      this.criticalTimer.remove();
    }

    this.state = IED_STATES.NEUTRALIZED;

    // Stop all tweens on this container
    this.scene.tweens.killTweensOf(this.body);
    this.scene.tweens.killTweensOf(this.warningRing);
    this.scene.tweens.killTweensOf(this.criticalRing);

    // Visual changes
    this.body.setFillStyle(COLORS.THREAT_SAFE);
    this.body.setAlpha(0.5);
    this.warningRing.setVisible(false);
    this.criticalRing.setVisible(false);
    this.neutralizedMark.setVisible(true);

    // Fade wire if present
    if (this.wire) {
      this.scene.tweens.add({
        targets: [this.wire, this.connector],
        alpha: 0.2,
        duration: 300
      });
    }

    // Notify scene
    this.scene.onIEDNeutralized(this);

    // Fade out and destroy
    this.scene.time.delayedCall(1000, () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 500,
        onComplete: () => this.destroy()
      });
    });
  }

  detonate() {
    if (this.state === IED_STATES.NEUTRALIZED ||
        this.state === IED_STATES.DETONATED) return;

    this.state = IED_STATES.DETONATED;

    // Stop all tweens
    this.scene.tweens.killTweensOf(this.body);
    this.scene.tweens.killTweensOf(this.warningRing);
    this.scene.tweens.killTweensOf(this.criticalRing);

    // Notify scene (will create explosion effect)
    this.scene.onIEDDetonated(this);

    // Destroy immediately
    this.destroy();
  }

  getState() {
    return this.state;
  }

  isActive() {
    return this.state !== IED_STATES.NEUTRALIZED &&
           this.state !== IED_STATES.DETONATED;
  }

  destroy() {
    // Clean up timers
    if (this.warningTimer) {
      this.warningTimer.remove();
    }
    if (this.criticalTimer) {
      this.criticalTimer.remove();
    }
    if (this.signalTimer) {
      this.signalTimer.remove();
    }

    super.destroy();
  }
}
