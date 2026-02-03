import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';
import { ScoreManager } from '../systems/ScoreManager.js';

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
    const husky = this.add.image(width / 2, height * 0.48, 'husky');
    husky.setScale(2);

    // High Score display
    const topScore = ScoreManager.getTopScore();
    if (topScore > 0) {
      this.add.text(width / 2, height * 0.62, `BEST: ${topScore.toLocaleString()}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // Endless Mode button
    const endlessBtn = this.add.text(width / 2, height * 0.70, 'ENDLESS MODE', {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    endlessBtn.setInteractive({ useHandCursor: true });
    endlessBtn.on('pointerover', () => endlessBtn.setColor('#00FF00'));
    endlessBtn.on('pointerout', () => endlessBtn.setColor('#FFFFFF'));
    endlessBtn.on('pointerdown', () => this.startGame());

    // Pulse animation
    this.tweens.add({
      targets: endlessBtn,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Challenges button
    const challengeBtn = this.add.text(width / 2, height * 0.78, 'CHALLENGES', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    challengeBtn.setInteractive({ useHandCursor: true });
    challengeBtn.on('pointerover', () => challengeBtn.setColor('#FFFF00'));
    challengeBtn.on('pointerout', () => challengeBtn.setColor('#FFD700'));
    challengeBtn.on('pointerdown', () => this.startChallenges());

    // Controls hint
    this.add.text(width / 2, height * 0.86, 'LEFT: Brake | CENTER: Scan | RIGHT: Accelerate', {
      fontFamily: 'Arial',
      fontSize: '16px',
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

    // Keyboard support
    this.input.keyboard.once('keydown-SPACE', () => {
      this.startGame();
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      this.startGame();
    });

    this.input.keyboard.once('keydown-C', () => {
      this.startChallenges();
    });
  }

  startGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('GameScene', { mode: 'endless' });
    });
  }

  startChallenges() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('ChallengeSelectScene');
    });
  }
}
