import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalData = {
      distance: data.distance || 0,
      neutralized: data.neutralized || 0,
      score: data.score || 0,
      blueFalcons: data.blueFalcons || 0,
      reason: data.reason || 'detonation'
    };
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Camera fade in
    this.cameras.main.fadeIn(500);

    // Dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Title - different for Blue Falcon vs Detonation
    const isBlueFalcon = this.finalData.reason === 'blueFalcon';
    const title = isBlueFalcon ? 'BLUE FALCON' : 'MISSION FAILED';
    const titleColor = isBlueFalcon ? '#6699FF' : '#FF4444';

    this.add.text(width / 2, height * 0.15, title, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Blue Falcon subtitle
    if (isBlueFalcon) {
      this.add.text(width / 2, height * 0.22, 'Convoy abandoned you', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#6699FF'
      }).setOrigin(0.5);
    }

    // Stats container
    const statsY = height * 0.35;
    const lineHeight = 60;

    this.add.text(width / 2, statsY, 'DEBRIEF', {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Distance traveled
    this.add.text(width * 0.3, statsY + lineHeight, 'Distance:', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#AAAAAA'
    }).setOrigin(0, 0.5);

    this.add.text(width * 0.7, statsY + lineHeight, `${this.finalData.distance}m`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(1, 0.5);

    // IEDs neutralized
    this.add.text(width * 0.3, statsY + lineHeight * 2, 'IEDs Cleared:', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#AAAAAA'
    }).setOrigin(0, 0.5);

    this.add.text(width * 0.7, statsY + lineHeight * 2, `${this.finalData.neutralized}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#00FF00'
    }).setOrigin(1, 0.5);

    // Blue Falcons (if any)
    if (this.finalData.blueFalcons > 0) {
      this.add.text(width * 0.3, statsY + lineHeight * 3, 'Blue Falcons:', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#AAAAAA'
      }).setOrigin(0, 0.5);

      this.add.text(width * 0.7, statsY + lineHeight * 3, `🦅 ${this.finalData.blueFalcons}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#6699FF'
      }).setOrigin(1, 0.5);
    }

    // Score
    const scoreRow = this.finalData.blueFalcons > 0 ? 4 : 3;
    this.add.text(width * 0.3, statsY + lineHeight * scoreRow, 'Score:', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#AAAAAA'
    }).setOrigin(0, 0.5);

    this.add.text(width * 0.7, statsY + lineHeight * scoreRow, `${this.finalData.score}`, {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#FFD700'
    }).setOrigin(1, 0.5);

    // Divider line
    const dividerRow = this.finalData.blueFalcons > 0 ? 5 : 4;
    const line = this.add.graphics();
    line.lineStyle(2, 0x444444);
    line.lineBetween(width * 0.2, statsY + lineHeight * dividerRow, width * 0.8, statsY + lineHeight * dividerRow);

    // Message - different for Blue Falcon
    const message = isBlueFalcon
      ? 'The convoy behind you paid the price.\nNo one left behind. Clear every threat.'
      : 'Every route clearer saves lives.\nTheir vigilance protects all who follow.';

    this.add.text(width / 2, height * 0.68, message, {
      fontFamily: 'Arial',
      fontSize: '18px',
      fontStyle: 'italic',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);

    // Retry button
    const retryText = this.add.text(width / 2, height * 0.82, 'TAP TO TRY AGAIN', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: retryText,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    // Return to menu option
    this.add.text(width / 2, height * 0.92, 'Press M for Menu', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#666666'
    }).setOrigin(0.5);

    // Input handling
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', () => {
        this.restartGame();
      });
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.restartGame();
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      this.restartGame();
    });

    this.input.keyboard.once('keydown-M', () => {
      this.goToMenu();
    });
  }

  restartGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('GameScene');
    });
  }

  goToMenu() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
