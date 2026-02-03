import Phaser from 'phaser';
import { COLORS, TIMING, LANES } from '../config/constants.js';

export class Husky extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;
    this.isScanning = false;
    this.lastScanTime = 0;
    this.scanCooldown = TIMING.SCAN_COOLDOWN;

    // Lane system
    this.currentLane = LANES.DEFAULT_LANE;
    this.targetX = x;
    this.isChangingLane = false;

    // Create scan range indicator (shown when IED nearby)
    this.scanRangeIndicator = scene.add.graphics();
    this.scanRangeIndicator.setAlpha(0);
    this.add(this.scanRangeIndicator);
    this.drawScanRange();

    // Create vehicle sprite
    this.sprite = scene.add.image(0, 0, 'husky');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setAngle(-90); // Face right (forward)
    this.add(this.sprite);

    // Scan indicator (hidden by default)
    this.scanIndicator = scene.add.circle(60, 0, 15, COLORS.SCAN_PULSE, 0.8);
    this.scanIndicator.setVisible(false);
    this.add(this.scanIndicator);

    // Detector arm glow
    this.detectorGlow = scene.add.circle(70, 0, 12, COLORS.THREAT_SAFE, 0.3);
    this.add(this.detectorGlow);

    // "SCAN NOW" prompt
    this.scanPrompt = scene.add.text(0, -60, 'SCAN!', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#00FFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scanPrompt.setOrigin(0.5);
    this.scanPrompt.setVisible(false);
    this.add(this.scanPrompt);

    // Add to scene
    scene.add.existing(this);

    // Idle bobbing animation
    this.bobbingTween = scene.tweens.add({
      targets: this,
      y: y + 3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  drawScanRange() {
    this.scanRangeIndicator.clear();
    this.scanRangeIndicator.lineStyle(2, COLORS.SCAN_PULSE, 0.5);
    this.scanRangeIndicator.fillStyle(COLORS.SCAN_PULSE, 0.1);

    // Draw arc in front of detector
    const radius = TIMING.SCAN_RANGE;
    this.scanRangeIndicator.beginPath();
    this.scanRangeIndicator.arc(70, 0, radius, -Math.PI/2, Math.PI/2);
    this.scanRangeIndicator.closePath();
    this.scanRangeIndicator.fillPath();
    this.scanRangeIndicator.strokePath();
  }

  update(time, delta) {
    // Update detector glow based on threat level
    this.updateDetectorGlow();

    // Smooth lane transition
    if (this.isChangingLane) {
      const diff = this.targetX - this.x;
      if (Math.abs(diff) < 2) {
        this.x = this.targetX;
        this.isChangingLane = false;
      }
    }

    // Update scan range visibility based on threat
    this.updateScanRangeVisibility();
  }

  updateScanRangeVisibility() {
    if (this.scene.detectionSystem) {
      const threatLevel = this.scene.detectionSystem.getThreatLevel();
      const canScan = this.canScan();
      const iedsInRange = this.scene.detectionSystem.getIEDsInScanRange();

      // Show scan range when IEDs are nearby and we can scan
      if (iedsInRange > 0 && canScan) {
        this.scanRangeIndicator.setAlpha(0.6);
        this.scanPrompt.setVisible(true);

        // Pulse the prompt
        if (!this.promptTween) {
          this.promptTween = this.scene.tweens.add({
            targets: this.scanPrompt,
            scale: 1.2,
            duration: 300,
            yoyo: true,
            repeat: -1
          });
        }
      } else {
        this.scanRangeIndicator.setAlpha(0);
        this.scanPrompt.setVisible(false);
        if (this.promptTween) {
          this.promptTween.stop();
          this.promptTween = null;
          this.scanPrompt.setScale(1);
        }
      }
    }
  }

  updateDetectorGlow() {
    // Get nearest IED distance from detection system
    if (this.scene.detectionSystem) {
      const threatLevel = this.scene.detectionSystem.getThreatLevel();

      if (threatLevel === 'critical') {
        this.detectorGlow.setFillStyle(COLORS.THREAT_CRITICAL, 0.8);
        this.pulseDetector(true);
      } else if (threatLevel === 'warning') {
        this.detectorGlow.setFillStyle(COLORS.THREAT_WARNING, 0.6);
        this.pulseDetector(false);
      } else {
        this.detectorGlow.setFillStyle(COLORS.THREAT_SAFE, 0.3);
        this.stopPulse();
      }
    }
  }

  pulseDetector(fast) {
    if (this.pulseTween) return;

    this.pulseTween = this.scene.tweens.add({
      targets: this.detectorGlow,
      scale: 1.5,
      alpha: 1,
      duration: fast ? 150 : 300,
      yoyo: true,
      repeat: -1
    });
  }

  stopPulse() {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
      this.detectorGlow.setScale(1);
      this.detectorGlow.setAlpha(0.3);
    }
  }

  canScan() {
    const now = this.scene.time.now;
    return !this.isScanning && (now - this.lastScanTime) >= this.scanCooldown;
  }

  scan() {
    if (!this.canScan()) return false;

    this.isScanning = true;
    this.lastScanTime = this.scene.time.now;

    // Show scan indicator
    this.scanIndicator.setVisible(true);
    this.scanIndicator.setScale(0.5);
    this.scanIndicator.setAlpha(1);

    // Scan pulse animation
    this.scene.tweens.add({
      targets: this.scanIndicator,
      scale: 2,
      alpha: 0,
      duration: TIMING.SCAN_DURATION,
      ease: 'Power2',
      onComplete: () => {
        this.scanIndicator.setVisible(false);
        this.isScanning = false;
      }
    });

    // Create expanding scan wave
    const wave = this.scene.add.image(this.x + 60, this.y, 'scanPulse');
    wave.setScale(0.3);
    wave.setAlpha(0.8);

    this.scene.tweens.add({
      targets: wave,
      scale: 2.5,
      alpha: 0,
      duration: TIMING.SCAN_DURATION * 1.5,
      ease: 'Power2',
      onComplete: () => wave.destroy()
    });

    // Flash the vehicle
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    return true;
  }

  // Lane movement
  moveLeft() {
    if (this.isChangingLane || this.currentLane <= 0) return false;

    this.currentLane--;
    this.moveToLane(this.currentLane);
    return true;
  }

  moveRight() {
    if (this.isChangingLane || this.currentLane >= LANES.COUNT - 1) return false;

    this.currentLane++;
    this.moveToLane(this.currentLane);
    return true;
  }

  moveToLane(laneIndex) {
    const width = this.scene.cameras.main.width;
    this.targetX = width * LANES.POSITIONS[laneIndex];
    this.isChangingLane = true;

    // Smooth transition
    this.scene.tweens.add({
      targets: this,
      x: this.targetX,
      duration: LANES.SWITCH_DURATION,
      ease: 'Power2',
      onComplete: () => {
        this.isChangingLane = false;
      }
    });
  }

  getCurrentLane() {
    return this.currentLane;
  }

  getDetectorPosition() {
    // Return world position of detector arm tip
    return {
      x: this.x + 70,
      y: this.y
    };
  }
}
