import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';

// Prevent context menu on long press
window.addEventListener('contextmenu', (e) => e.preventDefault());

// Create game instance
const game = new Phaser.Game(gameConfig);

// Handle visibility change (pause when tab hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.scenes.forEach(scene => {
      if (scene.scene.isActive() && scene.scene.key === 'GameScene') {
        scene.scene.pause();
      }
    });
  }
});

// Export for debugging
window.game = game;
