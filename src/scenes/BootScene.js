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
    this.createHuskyTexture();
    this.createExplosionTexture();
    this.createScanPulseTexture();
    this.createDebrisTextures();
    this.createConvoyTextures();
  }

  createConvoyTextures() {
    // Humvee texture (convoy vehicle)
    const g = this.make.graphics({ add: false });

    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(40, 48, 70, 12);

    // Wheels
    g.fillStyle(0x1a1a1a);
    g.fillCircle(15, 45, 9);
    g.fillCircle(65, 45, 9);

    // Body
    g.fillStyle(0x5C5346);
    g.fillRect(5, 22, 70, 26);

    // Cabin
    g.fillStyle(0x4A4538);
    g.fillRect(12, 8, 45, 18);

    // Windshield
    g.fillStyle(0x2D4A5C);
    g.fillRect(17, 11, 35, 10);

    // Roof
    g.fillStyle(0x3D3D35);
    g.fillRect(20, 2, 25, 8);

    g.generateTexture('convoy_humvee', 80, 55);
    g.destroy();

    // Damaged humvee
    const d = this.make.graphics({ add: false });

    // Shadow
    d.fillStyle(0x000000, 0.25);
    d.fillEllipse(40, 48, 70, 12);

    // Wheels (one blown)
    d.fillStyle(0x1a1a1a);
    d.fillCircle(15, 45, 9);
    d.fillStyle(0x333333);
    d.fillCircle(65, 47, 5);

    // Body (damaged, scorched)
    d.fillStyle(0x3A3530);
    d.fillRect(5, 22, 70, 26);

    // Scorch marks
    d.fillStyle(0x222222, 0.7);
    d.fillCircle(55, 32, 12);
    d.fillCircle(45, 38, 8);

    // Cabin
    d.fillStyle(0x2A2520);
    d.fillRect(12, 8, 45, 18);

    // Cracked windshield
    d.fillStyle(0x1A2A3C);
    d.fillRect(17, 11, 35, 10);
    d.lineStyle(1, 0x4A5A6C, 0.8);
    d.lineBetween(25, 11, 40, 21);
    d.lineBetween(35, 11, 25, 21);

    // Smoke
    d.fillStyle(0x444444, 0.5);
    d.fillCircle(50, 10, 10);
    d.fillStyle(0x555555, 0.4);
    d.fillCircle(55, 0, 7);

    d.generateTexture('convoy_humvee_damaged', 80, 55);
    d.destroy();
  }

  createHuskyTexture() {
    const g = this.make.graphics({ add: false });
    const w = 180, h = 110;

    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(85, 100, 140, 20);

    // Wheels (6 wheels for MRAP look)
    g.fillStyle(0x1a1a1a);
    g.fillCircle(25, 85, 16);
    g.fillCircle(65, 85, 16);
    g.fillCircle(105, 85, 16);
    // Wheel rims
    g.fillStyle(0x333333);
    g.fillCircle(25, 85, 8);
    g.fillCircle(65, 85, 8);
    g.fillCircle(105, 85, 8);

    // Main armored body - V-hull shape for mine protection
    g.fillStyle(0x5C5346); // Tan/desert camo base
    g.beginPath();
    g.moveTo(5, 70);
    g.lineTo(15, 35);
    g.lineTo(115, 35);
    g.lineTo(125, 70);
    g.lineTo(125, 75);
    g.lineTo(5, 75);
    g.closePath();
    g.fillPath();

    // Body highlight
    g.fillStyle(0x6B6355);
    g.fillRect(15, 35, 100, 8);

    // Armored cabin
    g.fillStyle(0x4A4538);
    g.fillRect(20, 15, 85, 25);

    // Windshield (armored glass - darker)
    g.fillStyle(0x2D4A5C);
    g.fillRect(28, 18, 70, 12);
    // Windshield reflection
    g.fillStyle(0x4A7A9C, 0.5);
    g.fillRect(28, 18, 35, 6);

    // Roof equipment (antenna, armor)
    g.fillStyle(0x3D3D35);
    g.fillRect(40, 8, 50, 10);
    // Antenna
    g.fillStyle(0x222222);
    g.fillRect(80, 0, 3, 15);

    // Side armor plates
    g.fillStyle(0x4D4840);
    g.fillRect(8, 45, 8, 25);
    g.fillRect(114, 45, 8, 25);

    // Detector arm mount
    g.fillStyle(0x3A3A3A);
    g.fillRect(125, 45, 15, 12);

    // Detector arm
    g.fillStyle(0x555555);
    g.fillRect(140, 48, 30, 6);

    // Detector head (sensor array)
    g.fillStyle(0x333333);
    g.fillCircle(172, 51, 8);
    g.fillStyle(COLORS.THREAT_SAFE, 0.8);
    g.fillCircle(172, 51, 5);

    // Headlights
    g.fillStyle(0xFFFFAA, 0.8);
    g.fillCircle(15, 55, 4);

    // Military markings
    g.fillStyle(0x3D3D35);
    g.fillRect(50, 50, 30, 15);

    g.generateTexture('husky', w, h);
    g.destroy();
  }

  createExplosionTexture() {
    const g = this.make.graphics({ add: false });
    const size = 120;
    const cx = size / 2, cy = size / 2;

    // Outer glow
    g.fillStyle(0xFF4400, 0.3);
    g.fillCircle(cx, cy, 55);

    // Main fireball
    g.fillStyle(0xFF6600, 0.8);
    g.fillCircle(cx, cy, 45);

    // Inner fire
    g.fillStyle(0xFF9900);
    g.fillCircle(cx, cy, 35);

    // Hot center
    g.fillStyle(0xFFCC00);
    g.fillCircle(cx, cy, 25);

    // White hot core
    g.fillStyle(0xFFFFAA);
    g.fillCircle(cx, cy, 12);

    // Flame tendrils (spiky edges)
    g.fillStyle(0xFF6600, 0.7);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const len = 45 + Math.random() * 10;
      g.fillTriangle(
        cx, cy,
        cx + Math.cos(angle - 0.2) * 30, cy + Math.sin(angle - 0.2) * 30,
        cx + Math.cos(angle) * len, cy + Math.sin(angle) * len
      );
    }

    g.generateTexture('explosion', size, size);
    g.destroy();
  }

  createScanPulseTexture() {
    const g = this.make.graphics({ add: false });
    const size = 160;
    const cx = size / 2, cy = size / 2;

    // Multiple concentric rings
    g.lineStyle(3, COLORS.SCAN_PULSE, 0.9);
    g.strokeCircle(cx, cy, 70);

    g.lineStyle(2, COLORS.SCAN_PULSE, 0.6);
    g.strokeCircle(cx, cy, 50);

    g.lineStyle(2, COLORS.SCAN_PULSE, 0.4);
    g.strokeCircle(cx, cy, 30);

    // Radar sweep effect
    g.fillStyle(COLORS.SCAN_PULSE, 0.2);
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, 70, -0.3, 0.3);
    g.closePath();
    g.fillPath();

    g.generateTexture('scanPulse', size, size);
    g.destroy();
  }

  createDebrisTextures() {
    // Small debris pieces for explosions
    const g = this.make.graphics({ add: false });

    // Metal debris
    g.fillStyle(0x666666);
    g.fillRect(0, 0, 8, 4);
    g.generateTexture('debris_metal', 8, 4);

    g.clear();
    // Dirt debris
    g.fillStyle(0x8B7355);
    g.fillCircle(5, 5, 5);
    g.generateTexture('debris_dirt', 10, 10);

    g.clear();
    // Smoke puff
    g.fillStyle(0x444444, 0.6);
    g.fillCircle(15, 15, 15);
    g.fillStyle(0x555555, 0.4);
    g.fillCircle(12, 12, 10);
    g.generateTexture('smoke', 30, 30);

    g.destroy();
  }

  create() {
    // Transition to menu
    this.scene.start('MenuScene');
  }
}
