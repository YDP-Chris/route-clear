import Phaser from 'phaser';
import { COLORS, SPEEDS, TIMING, LAYOUT, PARALLAX, SCORING, LANES } from '../config/constants.js';
import { IED_TYPES, SPAWN_CONFIG } from '../config/iedConfig.js';
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
      streak: 0,
      blueFalcons: 0
    };

    // Track which IED types player has seen (for tutorial hints)
    this.seenTypes = new Set();
    this.currentDifficultyLevel = 0;
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

    // Create lane markers (subtle visual guides)
    this.createLaneMarkers();

    // Create IED group
    this.ieds = this.add.group();
    this.activeIEDs = [];

    // Create player vehicle (start in center lane)
    const startX = width * LANES.POSITIONS[LANES.DEFAULT_LANE];
    const startY = height * LAYOUT.HUSKY_Y_PERCENT;
    this.husky = new Husky(this, startX, startY);

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

  createLaneMarkers() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Subtle lane dividers
    this.laneMarkers = this.add.graphics();
    this.laneMarkers.lineStyle(1, 0xFFFFFF, 0.1);

    // Draw lane dividers
    const laneWidth = (LANES.ROAD_RIGHT - LANES.ROAD_LEFT) * width / LANES.COUNT;
    for (let i = 1; i < LANES.COUNT; i++) {
      const x = width * LANES.ROAD_LEFT + laneWidth * i;
      this.laneMarkers.lineBetween(x, 0, x, height);
    }
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

    // Update touch controls (lane indicator)
    this.touchControls.update();

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
    const distance = this.gameState.distance;

    // Get current difficulty level based on distance
    let diffLevel = SPAWN_CONFIG.difficultyLevels[0];
    for (let i = 0; i < SPAWN_CONFIG.difficultyLevels.length; i++) {
      if (distance >= SPAWN_CONFIG.difficultyLevels[i].distance) {
        diffLevel = SPAWN_CONFIG.difficultyLevels[i];
        this.currentDifficultyLevel = i;
      }
    }

    // Choose IED type based on available types and weights
    const type = this.chooseIEDType(diffLevel.types);

    // Choose a random lane
    const lane = Phaser.Math.Between(0, LANES.COUNT - 1);
    const x = width * LANES.POSITIONS[lane];
    const y = -50;

    const ied = new IED(this, x, y, type);
    ied.lane = lane;
    this.activeIEDs.push(ied);

    // Show tutorial hint for new IED types
    if (!this.seenTypes.has(type)) {
      this.seenTypes.add(type);
      this.showTypeHint(type);
    }

    // Adjust spawn timer based on difficulty
    const baseDelay = TIMING.IED_SPAWN_MIN + Math.random() * (TIMING.IED_SPAWN_MAX - TIMING.IED_SPAWN_MIN);
    this.spawnTimer.delay = baseDelay * (1 - diffLevel.spawnRate * 0.5);

    // Occasionally spawn double IEDs at higher difficulty
    const difficultyFactor = Math.min(distance / 5000, 1);
    if (difficultyFactor > 0.5 && Math.random() < 0.2) {
      const otherLane = (lane + Phaser.Math.Between(1, 2)) % LANES.COUNT;
      const otherX = width * LANES.POSITIONS[otherLane];
      const otherType = this.chooseIEDType(diffLevel.types);

      this.time.delayedCall(200, () => {
        if (this.gameState.isPlaying) {
          const ied2 = new IED(this, otherX, -50, otherType);
          ied2.lane = otherLane;
          this.activeIEDs.push(ied2);

          if (!this.seenTypes.has(otherType)) {
            this.seenTypes.add(otherType);
            this.showTypeHint(otherType);
          }
        }
      });
    }
  }

  chooseIEDType(availableTypes) {
    // Weighted random selection
    const weights = availableTypes.map(t => SPAWN_CONFIG.typeWeights[t] || 1.0);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < availableTypes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return availableTypes[i];
      }
    }

    return availableTypes[0];
  }

  showTypeHint(type) {
    const config = IED_TYPES[type.toUpperCase()];
    if (!config || !config.hint) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Pause briefly to show hint
    const hintBg = this.add.rectangle(width / 2, height * 0.3, width * 0.9, 80, 0x000000, 0.8);
    hintBg.setStrokeStyle(2, config.color.warning);

    const hintTitle = this.add.text(width / 2, height * 0.3 - 15, 'NEW THREAT', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFAA00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const hintText = this.add.text(width / 2, height * 0.3 + 15, config.hint, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Fade out after delay
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: [hintBg, hintTitle, hintText],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          hintBg.destroy();
          hintTitle.destroy();
          hintText.destroy();
        }
      });
    });
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
        // IED passed without being neutralized - BLUE FALCON
        if (ied.isActive()) {
          this.onBlueFalcon(ied);
        }
        ied.destroy();
        this.activeIEDs.splice(i, 1);
      }
    }
  }

  triggerScan() {
    if (!this.gameState.isPlaying) return;

    const didScan = this.husky.scan();
    if (!didScan) return; // On cooldown

    const result = this.detectionSystem.performScan();

    if (result.success) {
      // Show success feedback
      if (result.count > 1) {
        this.hud.showMessage(`${result.count}x IEDs NEUTRALIZED!`, COLORS.THREAT_SAFE);
      }
      // Individual neutralization messages handled by onIEDNeutralized
    } else if (result.blocked && result.blocked.length > 0) {
      // Show why scan was blocked
      this.showBlockedScan(result.blocked[0]);
    } else {
      // Show miss feedback
      this.showScanMiss();
    }
  }

  showBlockedScan(ied) {
    const config = ied.config;
    let message = 'SCAN BLOCKED';
    let color = 0xFF6666;

    if (config.requiresSignal) {
      message = 'WAIT FOR SIGNAL!';
      color = 0x00FFFF;
    } else if (config.maxSpeedToScan) {
      message = 'TOO FAST! SLOW DOWN!';
      color = 0xFF6600;
    }

    const text = this.add.text(this.husky.x, this.husky.y - 80, message, {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      stroke: '#000000',
      strokeThickness: 3
    });
    text.setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });

    // Play warning sound
    this.audioManager.playWarning();
  }

  showScanMiss() {
    // Visual feedback for missed scan
    const missText = this.add.text(this.husky.x, this.husky.y - 80, 'MISS', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#FF6666',
      stroke: '#000000',
      strokeThickness: 3
    });
    missText.setOrigin(0.5);

    this.tweens.add({
      targets: missText,
      y: missText.y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => missText.destroy()
    });

    // Play miss sound
    this.audioManager.playMiss();
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

    // Show floating score
    this.showFloatingScore(ied.x, ied.y, points);

    // Remove from active
    const index = this.activeIEDs.indexOf(ied);
    if (index > -1) {
      this.activeIEDs.splice(index, 1);
    }
  }

  showFloatingScore(x, y, points) {
    const scoreText = this.add.text(x, y, `+${points}`, {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#00FF00',
      stroke: '#000000',
      strokeThickness: 3
    });
    scoreText.setOrigin(0.5);

    this.tweens.add({
      targets: scoreText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => scoreText.destroy()
    });
  }

  onIEDDetonated(ied) {
    this.gameState.casualties++;
    this.gameState.streak = 0;

    const isVBIED = ied.config.instantKill;
    const blastRadius = ied.config.blastRadius || 100;

    // Show feedback
    const message = isVBIED ? 'VBIED DETONATED - CATASTROPHIC' : 'IED DETONATED - CASUALTY';
    this.hud.showMessage(message, COLORS.THREAT_CRITICAL);
    this.audioManager.playExplosion();

    // Create explosion effect (bigger for VBIED)
    this.createExplosion(ied.x, ied.y, isVBIED ? 2.0 : 1.0);

    // Screen shake (more intense for VBIED)
    this.cameras.main.shake(isVBIED ? 800 : 500, isVBIED ? 0.04 : 0.02);

    // Remove from active
    const index = this.activeIEDs.indexOf(ied);
    if (index > -1) {
      this.activeIEDs.splice(index, 1);
    }

    // Check game over - VBIED is always instant, others after 1 casualty
    if (isVBIED || this.gameState.casualties >= 1) {
      this.gameOver(isVBIED ? 'vbied' : 'detonation');
    }
  }

  onBlueFalcon(ied) {
    this.gameState.blueFalcons++;
    this.gameState.streak = 0;

    // Show BLUE FALCON feedback
    this.hud.showMessage('BLUE FALCON', 0x0066FF);
    this.audioManager.playBlueFalcon();

    // Show the blue falcon graphic
    this.showBlueFalconGraphic();

    // Screen flash blue
    this.cameras.main.flash(300, 0, 50, 200);

    // Check game over - convoy abandons you after 3
    if (this.gameState.blueFalcons >= 3) {
      this.gameOverBlueFalcon();
    }
  }

  showBlueFalconGraphic() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create blue falcon text (will be replaced with image asset later)
    const falconText = this.add.text(width / 2, height / 2, '🦅', {
      fontSize: '80px'
    });
    falconText.setOrigin(0.5);
    falconText.setTint(0x0066FF);

    // "BUDDY FUCKER" subtitle
    const subtitle = this.add.text(width / 2, height / 2 + 60, 'You left it for the convoy!', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#6699FF',
      stroke: '#000000',
      strokeThickness: 3
    });
    subtitle.setOrigin(0.5);

    // BF counter
    const counter = this.add.text(width / 2, height / 2 + 85, `${this.gameState.blueFalcons}/3`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FF6666',
      stroke: '#000000',
      strokeThickness: 2
    });
    counter.setOrigin(0.5);

    // Animate out
    this.tweens.add({
      targets: [falconText, subtitle, counter],
      y: '-=50',
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        falconText.destroy();
        subtitle.destroy();
        counter.destroy();
      }
    });
  }

  gameOverBlueFalcon() {
    this.gameState.isPlaying = false;

    // Stop spawning
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Show message
    this.hud.showMessage('CONVOY ABANDONED YOU', 0x0066FF);

    // Fade out
    this.cameras.main.fadeOut(1500, 0, 0, 100);

    this.time.delayedCall(1500, () => {
      this.scene.start('GameOverScene', {
        distance: Math.round(this.gameState.distance),
        neutralized: this.gameState.neutralized,
        score: this.scoreManager.getScore(),
        blueFalcons: this.gameState.blueFalcons,
        reason: 'blueFalcon'
      });
    });
  }

  createExplosion(x, y, scale = 1.0) {
    const explosion = this.add.image(x, y, 'explosion');
    explosion.setScale(0.5 * scale);
    explosion.setAlpha(1);

    this.tweens.add({
      targets: explosion,
      scale: 3 * scale,
      alpha: 0,
      duration: 600 + (scale * 200),
      ease: 'Power2',
      onComplete: () => explosion.destroy()
    });

    // Dust particles (more for bigger explosions)
    const particleCount = Math.floor(8 * scale);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const dust = this.add.circle(x, y, 10 * scale, COLORS.DESERT);
      this.tweens.add({
        targets: dust,
        x: x + Math.cos(angle) * 150 * scale,
        y: y + Math.sin(angle) * 150 * scale,
        alpha: 0,
        scale: 0.5,
        duration: 800 + (scale * 200),
        ease: 'Power2',
        onComplete: () => dust.destroy()
      });
    }
  }

  gameOver(reason = 'detonation') {
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
        score: this.scoreManager.getScore(),
        blueFalcons: this.gameState.blueFalcons,
        reason: reason
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
