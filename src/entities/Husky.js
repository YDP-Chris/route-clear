import Phaser from 'phaser';
import { COLORS, TIMING } from '../config/constants.js';

export class Husky extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;
    this.isScanning = false;
    this.lastScanTime = 0;
    this.scanCooldown = TIMING.SCAN_COOLDOWN;

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

    // Add to scene
    scene.add.existing(this);

    // Idle bobbing animation
    scene.tweens.add({
      targets: this,
      y: y + 3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(time, delta) {
    // Update detector glow based on threat level
    this.updateDetectorGlow();
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

  getDetectorPosition() {
    // Return world position of detector arm tip
    return {
      x: this.x + 70,
      y: this.y
    };
  }
}
