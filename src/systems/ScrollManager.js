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

    // Sky layer (gradient)
    this.layers.sky = this.scene.add.graphics();
    this.layers.sky.fillGradientStyle(
      COLORS.SKY, COLORS.SKY,
      0xE8D4A8, 0xE8D4A8
    );
    this.layers.sky.fillRect(0, 0, width, height * 0.3);

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
    graphics.fillStyle(COLORS.MOUNTAINS);

    // Draw several mountain peaks
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
  }

  drawDesert(graphics, offset) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const startY = height * 0.28;
    const endY = height * 0.85;

    graphics.clear();

    // Main desert area
    graphics.fillGradientStyle(
      0xD4B896, 0xD4B896,
      COLORS.DESERT, COLORS.DESERT
    );
    graphics.fillRect(0, startY, width, endY - startY);

    // Add some terrain texture with darker patches
    graphics.fillStyle(0xB8A080, 0.3);
    for (let i = 0; i < 8; i++) {
      const x = ((i * 120 + offset * 0.5) % (width + 100)) - 50;
      const y = startY + 50 + (i % 3) * 80;
      graphics.fillEllipse(x, y, 60, 25);
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

    // Road surface
    graphics.fillStyle(COLORS.ROAD);
    graphics.fillRect(roadX, roadStartY, roadWidth, roadEndY - roadStartY);

    // Road edges (slightly darker)
    graphics.fillStyle(0x3A3A3A);
    graphics.fillRect(roadX - 5, roadStartY, 10, roadEndY - roadStartY);
    graphics.fillRect(roadX + roadWidth - 5, roadStartY, 10, roadEndY - roadStartY);

    // Shoulder/gravel
    graphics.fillStyle(0x8B7355, 0.5);
    graphics.fillRect(roadX - 30, roadStartY, 30, roadEndY - roadStartY);
    graphics.fillRect(roadX + roadWidth, roadStartY, 30, roadEndY - roadStartY);
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
