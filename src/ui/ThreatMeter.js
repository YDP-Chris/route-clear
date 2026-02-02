import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';

export class ThreatMeter extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;
    this.meterWidth = 200;
    this.meterHeight = 16;

    // Background bar
    this.background = scene.add.rectangle(
      0, 0,
      this.meterWidth, this.meterHeight,
      0x222222, 1
    );
    this.background.setStrokeStyle(2, 0x444444);
    this.add(this.background);

    // Fill bar (will change color)
    this.fill = scene.add.rectangle(
      -this.meterWidth / 2 + 2, 0,
      0, this.meterHeight - 4,
      COLORS.THREAT_SAFE, 1
    );
    this.fill.setOrigin(0, 0.5);
    this.add(this.fill);

    // Label
    this.label = scene.add.text(0, -15, 'THREAT', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#888888'
    }).setOrigin(0.5);
    this.add(this.label);

    // State text
    this.stateText = scene.add.text(0, 0, 'CLEAR', {
      fontFamily: 'Arial',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#00FF00'
    }).setOrigin(0.5);
    this.add(this.stateText);

    // Danger indicators on sides
    this.leftIndicator = scene.add.triangle(
      -this.meterWidth / 2 - 15, 0,
      10, 0, 0, -8, 0, 8,
      0xFF0000, 0
    );
    this.add(this.leftIndicator);

    this.rightIndicator = scene.add.triangle(
      this.meterWidth / 2 + 15, 0,
      0, 0, 10, -8, 10, 8,
      0xFF0000, 0
    );
    this.add(this.rightIndicator);

    scene.add.existing(this);
  }

  update(threatLevel, progress) {
    const maxWidth = this.meterWidth - 4;

    // Update fill width
    this.fill.width = maxWidth * progress;

    // Update colors based on threat level
    switch (threatLevel) {
      case 'critical':
        this.fill.setFillStyle(COLORS.THREAT_CRITICAL);
        this.stateText.setText('DANGER');
        this.stateText.setColor('#FF0000');
        this.background.setStrokeStyle(2, COLORS.THREAT_CRITICAL);
        this.leftIndicator.setFillStyle(0xFF0000, 1);
        this.rightIndicator.setFillStyle(0xFF0000, 1);

        // Pulse effect
        if (!this.pulsing) {
          this.pulsing = true;
          this.scene.tweens.add({
            targets: [this.leftIndicator, this.rightIndicator],
            alpha: 0.3,
            duration: 150,
            yoyo: true,
            repeat: -1
          });
        }
        break;

      case 'warning':
        this.fill.setFillStyle(COLORS.THREAT_WARNING);
        this.stateText.setText('CAUTION');
        this.stateText.setColor('#FFAA00');
        this.background.setStrokeStyle(2, COLORS.THREAT_WARNING);
        this.leftIndicator.setFillStyle(0xFFAA00, 0.5);
        this.rightIndicator.setFillStyle(0xFFAA00, 0.5);
        this.stopPulse();
        break;

      default:
        this.fill.setFillStyle(COLORS.THREAT_SAFE);
        this.stateText.setText('CLEAR');
        this.stateText.setColor('#00FF00');
        this.background.setStrokeStyle(2, 0x444444);
        this.leftIndicator.setFillStyle(0x00FF00, 0);
        this.rightIndicator.setFillStyle(0x00FF00, 0);
        this.stopPulse();
        break;
    }
  }

  stopPulse() {
    if (this.pulsing) {
      this.pulsing = false;
      this.scene.tweens.killTweensOf(this.leftIndicator);
      this.scene.tweens.killTweensOf(this.rightIndicator);
      this.leftIndicator.setAlpha(1);
      this.rightIndicator.setAlpha(1);
    }
  }
}
