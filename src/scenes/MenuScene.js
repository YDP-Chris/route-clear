import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.SKY, COLORS.SKY, COLORS.DESERT, COLORS.DESERT);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, height * 0.25, 'ROUTE CLEAR', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.33, 'IED Detection Training', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Husky silhouette
    const husky = this.add.image(width / 2, height * 0.5, 'husky');
    husky.setScale(2);

    // Tap to start (pulsing)
    const startText = this.add.text(width / 2, height * 0.72, 'TAP TO START', {
      fontFamily: 'Arial',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Controls hint
    this.add.text(width / 2, height * 0.82, 'LEFT: Brake | CENTER: Scan | RIGHT: Accelerate', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Dedication
    this.add.text(width / 2, height * 0.92, 'Honoring Husky VMMD Operators', {
      fontFamily: 'Arial',
      fontSize: '16px',
      fontStyle: 'italic',
      color: '#FFD700'
    }).setOrigin(0.5);

    // Start game on tap/click
    this.input.once('pointerdown', () => {
      this.startGame();
    });

    // Keyboard support
    this.input.keyboard.once('keydown-SPACE', () => {
      this.startGame();
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      this.startGame();
    });
  }

  startGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('GameScene');
    });
  }
}
