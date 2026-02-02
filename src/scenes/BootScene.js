import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 60, 'Loading...', {
      font: '24px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Progress events
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.THREAT_SAFE, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Generate placeholder graphics as textures
    this.createPlaceholderTextures();
  }

  createPlaceholderTextures() {
    // Husky vehicle texture
    const huskyGraphics = this.make.graphics({ add: false });

    // Main body
    huskyGraphics.fillStyle(COLORS.HUSKY_BODY);
    huskyGraphics.fillRect(0, 20, 120, 60);

    // Elevated cockpit
    huskyGraphics.fillStyle(COLORS.HUSKY_COCKPIT);
    huskyGraphics.fillRect(20, 0, 80, 30);

    // Window
    huskyGraphics.fillStyle(COLORS.HUSKY_WINDOW);
    huskyGraphics.fillRect(30, 5, 60, 15);

    // Wheels
    huskyGraphics.fillStyle(0x1a1a1a);
    huskyGraphics.fillCircle(25, 80, 18);
    huskyGraphics.fillCircle(95, 80, 18);

    // Detector arm (front)
    huskyGraphics.fillStyle(0x666666);
    huskyGraphics.fillRect(115, 40, 40, 8);
    huskyGraphics.fillCircle(155, 44, 10);

    huskyGraphics.generateTexture('husky', 170, 100);
    huskyGraphics.destroy();

    // IED marker texture
    const iedGraphics = this.make.graphics({ add: false });
    iedGraphics.fillStyle(COLORS.IED_HIDDEN);
    iedGraphics.fillCircle(20, 20, 15);
    iedGraphics.fillRect(15, 10, 10, 20);
    iedGraphics.generateTexture('ied', 40, 40);
    iedGraphics.destroy();

    // Explosion texture
    const explosionGraphics = this.make.graphics({ add: false });
    explosionGraphics.fillStyle(COLORS.EXPLOSION);
    explosionGraphics.fillCircle(50, 50, 50);
    explosionGraphics.fillStyle(0xFFFF00);
    explosionGraphics.fillCircle(50, 50, 30);
    explosionGraphics.fillStyle(0xFFFFFF);
    explosionGraphics.fillCircle(50, 50, 15);
    explosionGraphics.generateTexture('explosion', 100, 100);
    explosionGraphics.destroy();

    // Scan pulse texture
    const scanGraphics = this.make.graphics({ add: false });
    scanGraphics.lineStyle(4, COLORS.SCAN_PULSE, 0.8);
    scanGraphics.strokeCircle(75, 75, 70);
    scanGraphics.lineStyle(2, COLORS.SCAN_PULSE, 0.5);
    scanGraphics.strokeCircle(75, 75, 50);
    scanGraphics.strokeCircle(75, 75, 30);
    scanGraphics.generateTexture('scanPulse', 150, 150);
    scanGraphics.destroy();
  }

  create() {
    // Transition to menu
    this.scene.start('MenuScene');
  }
}
