import Phaser from 'phaser';
import { COLORS, LAYOUT } from '../config/constants.js';

export class TouchControls extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);

    this.scene = scene;
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;

    const controlsHeight = height * LAYOUT.CONTROLS_HEIGHT;
    const controlsY = height - controlsHeight / 2;

    // Control zone backgrounds (semi-transparent)
    const zoneWidth = width / 3;

    // Left zone (Brake)
    this.leftZone = scene.add.rectangle(
      zoneWidth / 2, controlsY,
      zoneWidth - 10, controlsHeight - 20,
      0x330000, 0.3
    );
    this.leftZone.setStrokeStyle(2, 0x660000);
    this.add(this.leftZone);

    this.leftLabel = scene.add.text(zoneWidth / 2, controlsY - 20, 'BRAKE', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#FF6666'
    }).setOrigin(0.5);
    this.add(this.leftLabel);

    this.leftIcon = scene.add.text(zoneWidth / 2, controlsY + 10, '◄', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#FF6666'
    }).setOrigin(0.5);
    this.add(this.leftIcon);

    // Center zone (Scan)
    this.centerZone = scene.add.rectangle(
      width / 2, controlsY,
      zoneWidth - 10, controlsHeight - 20,
      0x003333, 0.3
    );
    this.centerZone.setStrokeStyle(2, 0x006666);
    this.add(this.centerZone);

    this.centerLabel = scene.add.text(width / 2, controlsY - 20, 'SCAN', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#00FFFF'
    }).setOrigin(0.5);
    this.add(this.centerLabel);

    this.centerIcon = scene.add.text(width / 2, controlsY + 10, '◉', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#00FFFF'
    }).setOrigin(0.5);
    this.add(this.centerIcon);

    // Right zone (Accelerate)
    this.rightZone = scene.add.rectangle(
      width - zoneWidth / 2, controlsY,
      zoneWidth - 10, controlsHeight - 20,
      0x003300, 0.3
    );
    this.rightZone.setStrokeStyle(2, 0x006600);
    this.add(this.rightZone);

    this.rightLabel = scene.add.text(width - zoneWidth / 2, controlsY - 20, 'ACCEL', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#66FF66'
    }).setOrigin(0.5);
    this.add(this.rightLabel);

    this.rightIcon = scene.add.text(width - zoneWidth / 2, controlsY + 10, '►', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#66FF66'
    }).setOrigin(0.5);
    this.add(this.rightIcon);

    // Add keyboard hints (smaller, below icons)
    this.keyHintLeft = scene.add.text(zoneWidth / 2, controlsY + 40, '[←/A]', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#666666'
    }).setOrigin(0.5);
    this.add(this.keyHintLeft);

    this.keyHintCenter = scene.add.text(width / 2, controlsY + 40, '[SPACE]', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#666666'
    }).setOrigin(0.5);
    this.add(this.keyHintCenter);

    this.keyHintRight = scene.add.text(width - zoneWidth / 2, controlsY + 40, '[→/D]', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#666666'
    }).setOrigin(0.5);
    this.add(this.keyHintRight);

    // Add to scene
    scene.add.existing(this);

    // Set depth below HUD but above game
    this.setDepth(50);

    // Setup visual feedback
    this.setupFeedback();
  }

  setupFeedback() {
    // Listen for input to show visual feedback
    this.scene.input.on('pointerdown', (pointer) => {
      this.highlightZone(pointer.x);
    });

    this.scene.input.on('pointerup', () => {
      this.clearHighlights();
    });
  }

  highlightZone(x) {
    const width = this.scene.cameras.main.width;
    const zoneWidth = width / 3;

    if (x < zoneWidth) {
      this.leftZone.setFillStyle(0x660000, 0.6);
    } else if (x < zoneWidth * 2) {
      this.centerZone.setFillStyle(0x006666, 0.6);
    } else {
      this.rightZone.setFillStyle(0x006600, 0.6);
    }
  }

  clearHighlights() {
    this.leftZone.setFillStyle(0x330000, 0.3);
    this.centerZone.setFillStyle(0x003333, 0.3);
    this.rightZone.setFillStyle(0x003300, 0.3);
  }
}
