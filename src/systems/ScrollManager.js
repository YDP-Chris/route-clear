import Phaser from 'phaser';
import { COLORS, PARALLAX } from '../config/constants.js';

export class ScrollManager {
  constructor(scene) {
    this.scene = scene;
    this.layers = {};
    this.scrollOffsets = {
      sky: 0,
      mountains: 0,
      desert: 0,
      road: 0
    };
  }

  createLayers() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Sky layer (gradient - desert sky)
    this.layers.sky = this.scene.add.graphics();
    // Upper sky (blue)
    this.layers.sky.fillGradientStyle(
      0x4A7BA7, 0x4A7BA7,
      0x87CEEB, 0x87CEEB
    );
    this.layers.sky.fillRect(0, 0, width, height * 0.15);
    // Lower sky (hazy horizon)
    this.layers.sky.fillGradientStyle(
      0x87CEEB, 0x87CEEB,
      0xE8DCC8, 0xE8DCC8
    );
    this.layers.sky.fillRect(0, height * 0.15, width, height * 0.18);

    // Sun glow
    this.layers.sky.fillStyle(0xFFF8E0, 0.4);
    this.layers.sky.fillCircle(width * 0.8, height * 0.1, 40);
    this.layers.sky.fillStyle(0xFFFFFF, 0.6);
    this.layers.sky.fillCircle(width * 0.8, height * 0.1, 20);

    // Mountains layer (simple shapes)
    this.layers.mountains = this.scene.add.graphics();
    this.drawMountains(this.layers.mountains, 0);

    // Desert layer
    this.layers.desert = this.scene.add.graphics();
    this.drawDesert(this.layers.desert, 0);

    // Road layer
    this.layers.road = this.scene.add.graphics();
    this.drawRoad(this.layers.road, 0);

    // Road markings (separate for scrolling)
    this.roadMarkings = [];
    this.createRoadMarkings();
  }

  drawMountains(graphics, offset) {
    const width = this.scene.cameras.main.width;
    const baseY = this.scene.cameras.main.height * 0.25;

    graphics.clear();

    // Far mountains (lighter, hazier)
    graphics.fillStyle(0x9B8B7B, 0.6);
    const farPeaks = [
      { x: 50, peak: 60 },
      { x: 200, peak: 90 },
      { x: 400, peak: 70 },
      { x: 550, peak: 100 },
      { x: 700, peak: 75 }
    ];

    for (const p of farPeaks) {
      const x = (p.x + offset * 0.3) % (width + 200) - 100;
      graphics.fillTriangle(
        x - 120, baseY + 100,
        x, baseY - p.peak + 80,
        x + 120, baseY + 100
      );
    }

    // Near mountains (darker, more defined)
    graphics.fillStyle(COLORS.MOUNTAINS);
    const peaks = [
      { x: 0, peak: 80 },
      { x: 150, peak: 120 },
      { x: 300, peak: 90 },
      { x: 450, peak: 140 },
      { x: 600, peak: 100 },
      { x: 720, peak: 110 }
    ];

    for (const p of peaks) {
      const x = (p.x + offset) % (width + 200) - 100;
      graphics.fillTriangle(
        x - 100, baseY + 100,
        x, baseY - p.peak + 100,
        x + 100, baseY + 100
      );
    }

    // Mountain highlights (sun-facing sides)
    graphics.fillStyle(0x8B7B6B, 0.5);
    for (const p of peaks) {
      const x = (p.x + offset) % (width + 200) - 100;
      graphics.fillTriangle(
        x - 100, baseY + 100,
        x, baseY - p.peak + 100,
        x - 30, baseY + 100
      );
    }
  }

  drawDesert(graphics, offset) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const startY = height * 0.28;
    const endY = height * 0.85;

    graphics.clear();

    // Main desert area - gradient from horizon
    graphics.fillGradientStyle(
      0xD4C4A8, 0xD4C4A8,
      COLORS.DESERT, COLORS.DESERT
    );
    graphics.fillRect(0, startY, width, endY - startY);

    // Distant sand dunes (subtle)
    graphics.fillStyle(0xC4B498, 0.4);
    for (let i = 0; i < 5; i++) {
      const x = ((i * 180 + offset * 0.2) % (width + 200)) - 100;
      const y = startY + 20;
      graphics.fillEllipse(x, y, 100, 20);
    }

    // Rocky outcrops
    graphics.fillStyle(0x8B7B65, 0.6);
    for (let i = 0; i < 4; i++) {
      const x = ((i * 200 + offset * 0.4) % (width + 150)) - 75;
      const y = startY + 60 + (i % 2) * 40;
      graphics.fillTriangle(x - 15, y + 20, x, y, x + 20, y + 20);
    }

    // Scrub brush / vegetation spots
    graphics.fillStyle(0x6B7B55, 0.4);
    for (let i = 0; i < 6; i++) {
      const x = ((i * 140 + offset * 0.6) % (width + 100)) - 50;
      const y = startY + 100 + (i % 3) * 50;
      graphics.fillCircle(x, y, 8 + (i % 3) * 3);
    }

    // Ground texture - dirt patches
    graphics.fillStyle(0xA89070, 0.25);
    for (let i = 0; i < 10; i++) {
      const x = ((i * 100 + offset * 0.5) % (width + 80)) - 40;
      const y = startY + 40 + (i % 4) * 60;
      graphics.fillEllipse(x, y, 40 + (i % 3) * 15, 15);
    }
  }

  drawRoad(graphics, offset) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const roadWidth = width * 0.5;
    const roadX = (width - roadWidth) / 2;
    const roadStartY = height * 0.35;
    const roadEndY = height * 0.95;

    graphics.clear();

    // Outer shoulder/dirt
    graphics.fillStyle(0x8B7B65, 0.7);
    graphics.fillRect(roadX - 40, roadStartY, 45, roadEndY - roadStartY);
    graphics.fillRect(roadX + roadWidth - 5, roadStartY, 45, roadEndY - roadStartY);

    // Gravel shoulder
    graphics.fillStyle(0x9B8B75);
    graphics.fillRect(roadX - 20, roadStartY, 25, roadEndY - roadStartY);
    graphics.fillRect(roadX + roadWidth - 5, roadStartY, 25, roadEndY - roadStartY);

    // Road base (darker asphalt)
    graphics.fillStyle(0x2A2A2A);
    graphics.fillRect(roadX, roadStartY, roadWidth, roadEndY - roadStartY);

    // Road surface (main asphalt)
    graphics.fillStyle(COLORS.ROAD);
    graphics.fillRect(roadX + 3, roadStartY, roadWidth - 6, roadEndY - roadStartY);

    // Road wear/patches (lighter worn areas)
    graphics.fillStyle(0x4A4A4A, 0.3);
    graphics.fillRect(roadX + roadWidth * 0.2, roadStartY, roadWidth * 0.15, roadEndY - roadStartY);
    graphics.fillRect(roadX + roadWidth * 0.65, roadStartY, roadWidth * 0.15, roadEndY - roadStartY);

    // Edge lines (faded white)
    graphics.fillStyle(0xCCCCCC, 0.4);
    graphics.fillRect(roadX + 8, roadStartY, 3, roadEndY - roadStartY);
    graphics.fillRect(roadX + roadWidth - 11, roadStartY, 3, roadEndY - roadStartY);

    // Dust on edges
    graphics.fillStyle(0xB8A890, 0.2);
    graphics.fillRect(roadX, roadStartY, 15, roadEndY - roadStartY);
    graphics.fillRect(roadX + roadWidth - 15, roadStartY, 15, roadEndY - roadStartY);
  }

  createRoadMarkings() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const centerX = width / 2;

    // Create dashed center line segments
    const markingHeight = 40;
    const gapHeight = 30;
    const totalHeight = markingHeight + gapHeight;

    for (let y = -totalHeight; y < height + totalHeight; y += totalHeight) {
      const marking = this.scene.add.rectangle(
        centerX, y,
        6, markingHeight,
        COLORS.ROAD_MARKING, 0.8
      );
      this.roadMarkings.push(marking);
    }
  }

  update(speed) {
    const height = this.scene.cameras.main.height;
    const scrollAmount = speed * 0.016; // Assuming 60fps

    // Update mountain scroll
    this.scrollOffsets.mountains += scrollAmount * PARALLAX.MOUNTAINS;
    this.drawMountains(this.layers.mountains, this.scrollOffsets.mountains);

    // Update desert scroll
    this.scrollOffsets.desert += scrollAmount * PARALLAX.DESERT;
    this.drawDesert(this.layers.desert, this.scrollOffsets.desert);

    // Update road markings
    for (const marking of this.roadMarkings) {
      marking.y += scrollAmount * PARALLAX.ROAD;

      // Wrap around
      if (marking.y > height + 50) {
        marking.y = -50;
      }
    }
  }
}
