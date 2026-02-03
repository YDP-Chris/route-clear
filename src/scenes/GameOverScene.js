import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';
import { ScoreManager } from '../systems/ScoreManager.js';

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
      perfects: data.perfects || 0,
      reason: data.reason || 'detonation',
      // Challenge mode data
      mode: data.mode || 'endless',
      challengeId: data.challengeId,
      success: data.success,
      medal: data.medal
    };
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Camera fade in
    this.cameras.main.fadeIn(500);

    // Dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Handle challenge vs endless mode differently
    if (this.finalData.mode === 'challenge') {
      this.createChallengeResults(width, height);
      return;
    }

    // ENDLESS MODE RESULTS
    // Title - different based on death reason
    const isBlueFalcon = this.finalData.reason === 'blueFalcon';
    const isVBIED = this.finalData.reason === 'vbied';

    let title = 'MISSION FAILED';
    let titleColor = '#FF4444';
    let subtitle = null;

    if (isBlueFalcon) {
      title = 'BLUE FALCON';
      titleColor = '#6699FF';
      subtitle = 'Convoy abandoned you';
    } else if (isVBIED) {
      title = 'CATASTROPHIC LOSS';
      titleColor = '#FF0000';
      subtitle = 'Vehicle bomb destroyed the convoy';
    }

    this.add.text(width / 2, height * 0.15, title, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle if applicable
    if (subtitle) {
      this.add.text(width / 2, height * 0.22, subtitle, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: titleColor
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

    // Check and save high score
    const isNewHighScore = ScoreManager.isHighScore(this.finalData.score);
    const rank = ScoreManager.saveHighScore({
      score: this.finalData.score,
      distance: this.finalData.distance,
      neutralized: this.finalData.neutralized,
      date: Date.now()
    });

    // Show NEW HIGH SCORE if applicable
    if (isNewHighScore && this.finalData.score > 0) {
      const highScoreText = this.add.text(width / 2, statsY + lineHeight * (scoreRow + 0.7),
        rank === 1 ? '★ NEW RECORD! ★' : `★ HIGH SCORE #${rank}! ★`, {
        fontFamily: 'Arial Black',
        fontSize: '22px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Pulse animation
      this.tweens.add({
        targets: highScoreText,
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    // Divider line
    const dividerRow = this.finalData.blueFalcons > 0 ? 5.5 : 4.5;
    const line = this.add.graphics();
    line.lineStyle(2, 0x444444);
    line.lineBetween(width * 0.2, statsY + lineHeight * dividerRow, width * 0.8, statsY + lineHeight * dividerRow);

    // High Scores list
    this.showHighScores(width, statsY + lineHeight * (dividerRow + 0.5));

    // Message - different based on reason
    let message = 'Every route clearer saves lives.\nTheir vigilance protects all who follow.';
    if (isBlueFalcon) {
      message = 'The convoy behind you paid the price.\nNo one left behind. Clear every threat.';
    } else if (isVBIED) {
      message = 'VBIEDs are the deadliest threat.\nSpot the parked vehicle. Neutralize it first.';
    }

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

  createChallengeResults(width, height) {
    const success = this.finalData.success;
    const medal = this.finalData.medal;

    // Title
    const title = success ? 'CHALLENGE COMPLETE!' : 'CHALLENGE FAILED';
    const titleColor = success ? '#00FF00' : '#FF4444';

    this.add.text(width / 2, height * 0.12, title, {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Medal display (if earned)
    if (medal) {
      const medalIcons = { gold: '🥇', silver: '🥈', bronze: '🥉' };
      const medalNames = { gold: 'GOLD', silver: 'SILVER', bronze: 'BRONZE' };

      this.add.text(width / 2, height * 0.22, medalIcons[medal], {
        fontSize: '64px'
      }).setOrigin(0.5);

      this.add.text(width / 2, height * 0.30, medalNames[medal], {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: medal === 'gold' ? '#FFD700' : medal === 'silver' ? '#C0C0C0' : '#CD7F32'
      }).setOrigin(0.5);
    } else if (!success) {
      // Failure reason
      this.add.text(width / 2, height * 0.25, this.finalData.reason || 'Objective not met', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#FF6666'
      }).setOrigin(0.5);
    }

    // Stats
    const statsY = height * 0.40;
    const lineHeight = 40;

    this.add.text(width / 2, statsY, 'RESULTS', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // IEDs Cleared
    this.add.text(width * 0.3, statsY + lineHeight, 'Cleared:', {
      fontFamily: 'Arial', fontSize: '20px', color: '#AAAAAA'
    }).setOrigin(0, 0.5);
    this.add.text(width * 0.7, statsY + lineHeight, `${this.finalData.neutralized}`, {
      fontFamily: 'Arial', fontSize: '20px', color: '#00FF00'
    }).setOrigin(1, 0.5);

    // Perfects
    this.add.text(width * 0.3, statsY + lineHeight * 2, 'Perfects:', {
      fontFamily: 'Arial', fontSize: '20px', color: '#AAAAAA'
    }).setOrigin(0, 0.5);
    this.add.text(width * 0.7, statsY + lineHeight * 2, `${this.finalData.perfects}`, {
      fontFamily: 'Arial', fontSize: '20px', color: '#FFD700'
    }).setOrigin(1, 0.5);

    // Score
    this.add.text(width * 0.3, statsY + lineHeight * 3, 'Score:', {
      fontFamily: 'Arial', fontSize: '20px', color: '#AAAAAA'
    }).setOrigin(0, 0.5);
    this.add.text(width * 0.7, statsY + lineHeight * 3, `${this.finalData.score}`, {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#FFD700'
    }).setOrigin(1, 0.5);

    // Buttons
    const retryBtn = this.add.text(width / 2, height * 0.72, 'RETRY CHALLENGE', {
      fontFamily: 'Arial',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.on('pointerover', () => retryBtn.setColor('#00FF00'));
    retryBtn.on('pointerout', () => retryBtn.setColor('#FFFFFF'));
    retryBtn.on('pointerdown', () => this.retryChallenge());

    this.tweens.add({
      targets: retryBtn,
      alpha: 0.5,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    const backBtn = this.add.text(width / 2, height * 0.82, 'Back to Challenges', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setColor('#FFFFFF'));
    backBtn.on('pointerout', () => backBtn.setColor('#888888'));
    backBtn.on('pointerdown', () => this.goToChallenges());

    // Keyboard
    this.input.keyboard.once('keydown-SPACE', () => this.retryChallenge());
    this.input.keyboard.once('keydown-ENTER', () => this.retryChallenge());
    this.input.keyboard.once('keydown-ESC', () => this.goToChallenges());
  }

  retryChallenge() {
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene', { mode: 'challenge', challengeId: this.finalData.challengeId });
    });
  }

  goToChallenges() {
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(300, () => {
      this.scene.start('ChallengeSelectScene');
    });
  }

  showHighScores(centerX, startY) {
    const scores = ScoreManager.getHighScores();
    if (scores.length === 0) return;

    this.add.text(centerX, startY, 'HIGH SCORES', {
      fontFamily: 'Arial',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#888888'
    }).setOrigin(0.5);

    scores.slice(0, 3).forEach((entry, i) => {
      const y = startY + 25 + i * 22;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
      const isCurrentRun = entry.score === this.finalData.score &&
                          entry.distance === this.finalData.distance;

      this.add.text(centerX - 80, y, `${medal} ${entry.score.toLocaleString()}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: isCurrentRun ? '#FFD700' : '#AAAAAA'
      }).setOrigin(0, 0.5);

      this.add.text(centerX + 80, y, `${entry.distance}m`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#666666'
      }).setOrigin(1, 0.5);
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
