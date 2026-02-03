import Phaser from 'phaser';
import { COLORS, LAYOUT } from '../config/constants.js';
import { ThreatMeter } from './ThreatMeter.js';

export class HUD extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);

    this.scene = scene;
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const hudHeight = height * LAYOUT.HUD_HEIGHT;

    // HUD background
    this.background = scene.add.rectangle(
      width / 2, hudHeight / 2,
      width, hudHeight,
      COLORS.HUD_BACKGROUND, 0.7
    );
    this.add(this.background);

    // Score display
    this.scoreText = scene.add.text(20, hudHeight / 2, 'SCORE: 0', {
      fontFamily: 'Arial',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);
    this.add(this.scoreText);

    // Distance display
    this.distanceText = scene.add.text(width - 20, hudHeight / 2, 'DIST: 0m', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#AAAAAA'
    }).setOrigin(1, 0.5);
    this.add(this.distanceText);

    // Speed indicator
    this.speedText = scene.add.text(width / 2, hudHeight / 2 - 15, 'SPEED', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0.5);
    this.add(this.speedText);

    this.speedValue = scene.add.text(width / 2, hudHeight / 2 + 10, '150', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    this.add(this.speedValue);

    // Threat meter
    this.threatMeter = new ThreatMeter(scene, width / 2, hudHeight + 30);
    this.add(this.threatMeter);

    // Message display (for neutralized/detonated feedback)
    this.messageText = scene.add.text(width / 2, height * 0.4, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.messageText.setAlpha(0);
    this.add(this.messageText);

    // IED counter
    this.neutralizedText = scene.add.text(20, hudHeight + 10, 'CLEARED: 0', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#00FF00'
    });
    this.add(this.neutralizedText);

    // Blue Falcon counter (shame indicator)
    this.bfText = scene.add.text(width - 20, hudHeight + 10, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#6699FF'
    }).setOrigin(1, 0);
    this.add(this.bfText);

    // Add to scene
    scene.add.existing(this);

    // Ensure HUD is on top
    this.setDepth(100);
  }

  update() {
    const state = this.scene.gameState;

    // Update score
    this.scoreText.setText(`SCORE: ${this.scene.scoreManager.getScore()}`);

    // Update distance
    this.distanceText.setText(`DIST: ${Math.round(state.distance)}m`);

    // Update speed
    this.speedValue.setText(Math.round(state.speed).toString());

    // Color speed based on value
    if (state.speed > 200) {
      this.speedValue.setColor('#FF4444');
    } else if (state.speed < 80) {
      this.speedValue.setColor('#44FF44');
    } else {
      this.speedValue.setColor('#FFFFFF');
    }

    // Update neutralized count
    this.neutralizedText.setText(`CLEARED: ${state.neutralized}`);

    // Update Blue Falcon counter
    if (state.blueFalcons > 0) {
      this.bfText.setText(`🦅 ${state.blueFalcons}/3`);
    }

    // Update threat meter
    this.threatMeter.update(
      this.scene.detectionSystem.getThreatLevel(),
      this.scene.detectionSystem.getWarningProgress()
    );
  }

  showMessage(text, color = 0xFFFFFF) {
    this.messageText.setText(text);
    this.messageText.setColor(Phaser.Display.Color.IntegerToColor(color).rgba);
    this.messageText.setAlpha(1);
    this.messageText.setScale(0.5);

    // Animate in
    this.scene.tweens.add({
      targets: this.messageText,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // Fade out
    this.scene.tweens.add({
      targets: this.messageText,
      alpha: 0,
      delay: 1500,
      duration: 500
    });
  }
}
