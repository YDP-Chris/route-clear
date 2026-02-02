import Phaser from 'phaser';
import { COLORS, SPEEDS, TIMING, LAYOUT, PARALLAX, SCORING } from '../config/constants.js';
import { Husky } from '../entities/Husky.js';
import { IED } from '../entities/IED.js';
import { DetectionSystem } from '../systems/DetectionSystem.js';
import { ScrollManager } from '../systems/ScrollManager.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { InputHandler } from '../systems/InputHandler.js';
import { HUD } from '../ui/HUD.js';
import { TouchControls } from '../ui/TouchControls.js';
import { AudioManager } from '../utils/AudioManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    this.gameState = {
      isPlaying: true,
      isPaused: false,
      distance: 0,
      speed: SPEEDS.CRUISE,
      casualties: 0,
      neutralized: 0,
      streak: 0
    };
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Camera fade in
    this.cameras.main.fadeIn(500);

    // Initialize managers
    this.audioManager = new AudioManager(this);
    this.scrollManager = new ScrollManager(this);
    this.scoreManager = new ScoreManager(this);
    this.inputHandler = new InputHandler(this);
    this.detectionSystem = new DetectionSystem(this);

    // Create background layers
    this.scrollManager.createLayers();

    // Create IED group
    this.ieds = this.add.group();
    this.activeIEDs = [];

    // Create player vehicle
    this.husky = new Husky(this, width * LAYOUT.HUSKY_X_PERCENT, height * LAYOUT.HUSKY_Y_PERCENT);

    // Create UI
    this.hud = new HUD(this);
    this.touchControls = new TouchControls(this);

    // Setup input
    this.inputHandler.setup();

    // IED spawning timer
    this.spawnTimer = this.time.addEvent({
      delay: TIMING.IED_SPAWN_MIN + Math.random() * (TIMING.IED_SPAWN_MAX - TIMING.IED_SPAWN_MIN),
      callback: this.spawnIED,
      callbackScope: this,
      loop: true
    });

    // Initial IED after delay
    this.time.delayedCall(2000, () => {
      if (this.gameState.isPlaying) {
        this.spawnIED();
      }
    });

    // Pause handling
    this.events.on('pause', this.onPause, this);
    this.events.on('resume', this.onResume, this);
  }

  update(time, delta) {
    if (!this.gameState.isPlaying || this.gameState.isPaused) return;

    const deltaSeconds = delta / 1000;

    // Update speed based on input
    this.updateSpeed(deltaSeconds);

    // Update distance traveled
    this.gameState.distance += this.gameState.speed * deltaSeconds * 0.01; // Convert to "meters"

    // Update scroll manager
    this.scrollManager.update(this.gameState.speed);

    // Update husky
    this.husky.update(time, delta);

    // Update IEDs
    this.updateIEDs(time, delta);

    // Run detection system
    this.detectionSystem.update(time, delta);

    // Update HUD
    this.hud.update();

    // Update score from distance
    this.scoreManager.addDistancePoints(this.gameState.speed * deltaSeconds);
  }

  updateSpeed(deltaSeconds) {
    const input = this.inputHandler.getInput();

    if (input.brake) {
      this.gameState.speed -= SPEEDS.BRAKE_POWER * deltaSeconds;
    } else if (input.accelerate) {
      this.gameState.speed += SPEEDS.ACCELERATION * deltaSeconds;
    } else {
      // Gradually return to cruise speed
      if (this.gameState.speed < SPEEDS.CRUISE) {
        this.gameState.speed += SPEEDS.ACCELERATION * 0.5 * deltaSeconds;
      } else if (this.gameState.speed > SPEEDS.CRUISE) {
        this.gameState.speed -= SPEEDS.ACCELERATION * 0.5 * deltaSeconds;
      }
    }

    // Clamp speed
    this.gameState.speed = Phaser.Math.Clamp(this.gameState.speed, SPEEDS.MIN, SPEEDS.MAX);
  }

  spawnIED() {
    if (!this.gameState.isPlaying) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Spawn above screen
    const x = width * 0.4 + Math.random() * width * 0.2;
    const y = -50;

    const ied = new IED(this, x, y, 'cwied');
    this.activeIEDs.push(ied);

    // Randomize next spawn time based on difficulty
    const difficultyFactor = Math.min(this.gameState.distance / 5000, 1);
    const minDelay = TIMING.IED_SPAWN_MIN * (1 - difficultyFactor * 0.3);
    const maxDelay = TIMING.IED_SPAWN_MAX * (1 - difficultyFactor * 0.4);

    this.spawnTimer.delay = minDelay + Math.random() * (maxDelay - minDelay);
  }

  updateIEDs(time, delta) {
    // Move IEDs down based on speed
    const moveAmount = this.gameState.speed * (delta / 1000);

    for (let i = this.activeIEDs.length - 1; i >= 0; i--) {
      const ied = this.activeIEDs[i];
      ied.y += moveAmount;
      ied.update(time, delta);

      // Remove if off screen
      if (ied.y > this.cameras.main.height + 100) {
        ied.destroy();
        this.activeIEDs.splice(i, 1);
      }
    }
  }

  triggerScan() {
    if (!this.gameState.isPlaying) return;

    this.husky.scan();
    this.detectionSystem.performScan();
  }

  onIEDNeutralized(ied) {
    this.gameState.neutralized++;
    this.gameState.streak++;

    // Calculate score
    const speedBonus = (this.gameState.speed / SPEEDS.MAX) * SCORING.SPEED_BONUS_MULTIPLIER;
    const streakBonus = (this.gameState.streak - 1) * SCORING.STREAK_MULTIPLIER;
    const points = Math.round(SCORING.IED_NEUTRALIZED * (1 + speedBonus + streakBonus));

    this.scoreManager.addPoints(points);

    // Show feedback
    this.hud.showMessage('IED NEUTRALIZED', COLORS.THREAT_SAFE);
    this.audioManager.playNeutralized();

    // Remove from active
    const index = this.activeIEDs.indexOf(ied);
    if (index > -1) {
      this.activeIEDs.splice(index, 1);
    }
  }

  onIEDDetonated(ied) {
    this.gameState.casualties++;
    this.gameState.streak = 0;

    // Show feedback
    this.hud.showMessage('IED DETONATED - CASUALTY', COLORS.THREAT_CRITICAL);
    this.audioManager.playExplosion();

    // Create explosion effect
    this.createExplosion(ied.x, ied.y);

    // Screen shake
    this.cameras.main.shake(500, 0.02);

    // Remove from active
    const index = this.activeIEDs.indexOf(ied);
    if (index > -1) {
      this.activeIEDs.splice(index, 1);
    }

    // Check game over
    if (this.gameState.casualties >= 1) {
      this.gameOver();
    }
  }

  createExplosion(x, y) {
    const explosion = this.add.image(x, y, 'explosion');
    explosion.setScale(0.5);
    explosion.setAlpha(1);

    this.tweens.add({
      targets: explosion,
      scale: 3,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => explosion.destroy()
    });

    // Dust particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dust = this.add.circle(x, y, 10, COLORS.DESERT);
      this.tweens.add({
        targets: dust,
        x: x + Math.cos(angle) * 150,
        y: y + Math.sin(angle) * 150,
        alpha: 0,
        scale: 0.5,
        duration: 800,
        ease: 'Power2',
        onComplete: () => dust.destroy()
      });
    }
  }

  gameOver() {
    this.gameState.isPlaying = false;

    // Stop spawning
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Fade out
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        distance: Math.round(this.gameState.distance),
        neutralized: this.gameState.neutralized,
        score: this.scoreManager.getScore()
      });
    });
  }

  onPause() {
    this.gameState.isPaused = true;
  }

  onResume() {
    this.gameState.isPaused = false;
  }
}
