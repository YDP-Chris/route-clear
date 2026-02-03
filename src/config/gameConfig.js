import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { GameOverScene } from '../scenes/GameOverScene.js';
import { ChallengeSelectScene } from '../scenes/ChallengeSelectScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
    min: {
      width: 360,
      height: 640
    },
    max: {
      width: 1080,
      height: 1920
    }
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },

  input: {
    activePointers: 3
  },

  scene: [BootScene, MenuScene, ChallengeSelectScene, GameScene, GameOverScene],

  render: {
    pixelArt: false,
    antialias: true
  },

  fps: {
    target: 60,
    forceSetTimeOut: false
  }
};
