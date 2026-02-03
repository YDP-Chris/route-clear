import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';
import {
  CHALLENGES,
  CHALLENGE_ORDER,
  getChallengeProgress,
  isChallengeUnlocked
} from '../config/challengeConfig.js';

export class ChallengeSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChallengeSelectScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Title
    this.add.text(width / 2, 40, 'CHALLENGES', {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Get progress
    const progress = getChallengeProgress();

    // Create challenge cards
    const startY = 100;
    const cardHeight = 85;
    const cardSpacing = 10;

    CHALLENGE_ORDER.forEach((challengeId, index) => {
      const challenge = CHALLENGES[challengeId];
      const unlocked = isChallengeUnlocked(challengeId);
      const medal = progress.medals[challengeId];
      const bestScore = progress.bestScores[challengeId];

      this.createChallengeCard(
        width / 2,
        startY + index * (cardHeight + cardSpacing),
        challenge,
        unlocked,
        medal,
        bestScore
      );
    });

    // Back button
    const backBtn = this.add.text(width / 2, height - 40, '< BACK TO MENU', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setColor('#FFFFFF'));
    backBtn.on('pointerout', () => backBtn.setColor('#888888'));
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Keyboard back
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }

  createChallengeCard(x, y, challenge, unlocked, medal, bestScore) {
    const width = this.cameras.main.width * 0.9;
    const height = 80;

    // Card background
    const bgColor = unlocked ? 0x2a2a2a : 0x1a1a1a;
    const card = this.add.rectangle(x, y, width, height, bgColor);
    card.setStrokeStyle(2, unlocked ? 0x444444 : 0x333333);

    if (unlocked) {
      card.setInteractive({ useHandCursor: true });
      card.on('pointerover', () => {
        card.setFillStyle(0x3a3a3a);
      });
      card.on('pointerout', () => {
        card.setFillStyle(0x2a2a2a);
      });
      card.on('pointerdown', () => {
        this.startChallenge(challenge.id);
      });
    }

    // Icon
    const icon = this.add.text(x - width / 2 + 30, y, unlocked ? challenge.icon : '🔒', {
      fontSize: '32px'
    }).setOrigin(0.5);

    // Name
    const nameColor = unlocked ? '#FFFFFF' : '#666666';
    this.add.text(x - width / 2 + 70, y - 15, challenge.name, {
      fontFamily: 'Arial',
      fontSize: '20px',
      fontStyle: 'bold',
      color: nameColor
    }).setOrigin(0, 0.5);

    // Description
    const descColor = unlocked ? '#AAAAAA' : '#444444';
    this.add.text(x - width / 2 + 70, y + 12, challenge.description, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: descColor
    }).setOrigin(0, 0.5);

    // Medal indicator (if earned)
    if (medal) {
      const medalIcons = { gold: '🥇', silver: '🥈', bronze: '🥉' };
      this.add.text(x + width / 2 - 30, y - 15, medalIcons[medal], {
        fontSize: '24px'
      }).setOrigin(0.5);
    }

    // Best score (if any)
    if (bestScore) {
      this.add.text(x + width / 2 - 30, y + 12, bestScore.toLocaleString(), {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#FFD700'
      }).setOrigin(0.5);
    }
  }

  startChallenge(challengeId) {
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene', { mode: 'challenge', challengeId: challengeId });
    });
  }
}
