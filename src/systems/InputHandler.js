import { LAYOUT } from '../config/constants.js';

export class InputHandler {
  constructor(scene) {
    this.scene = scene;
    this.state = {
      brake: false,
      accelerate: false,
      scan: false
    };

    // Touch tracking
    this.activePointers = new Map();

    // Keyboard keys
    this.keys = null;
  }

  setup() {
    const width = this.scene.cameras.main.width;

    // Calculate touch zones
    this.zones = {
      left: width * LAYOUT.LEFT_ZONE,
      center: width * LAYOUT.CENTER_ZONE
    };

    // Setup touch input
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
    this.scene.input.on('pointerupoutside', this.onPointerUp, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);

    // Setup keyboard input
    this.keys = this.scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S
    });
  }

  onPointerDown(pointer) {
    const zone = this.getZone(pointer.x);
    this.activePointers.set(pointer.id, zone);

    if (zone === 'center') {
      // Trigger scan on center tap
      this.scene.triggerScan();
    }

    this.updateStateFromPointers();
  }

  onPointerUp(pointer) {
    this.activePointers.delete(pointer.id);
    this.updateStateFromPointers();
  }

  onPointerMove(pointer) {
    if (this.activePointers.has(pointer.id)) {
      const zone = this.getZone(pointer.x);
      this.activePointers.set(pointer.id, zone);
      this.updateStateFromPointers();
    }
  }

  getZone(x) {
    if (x < this.zones.left) {
      return 'left';
    } else if (x < this.zones.center) {
      return 'center';
    } else {
      return 'right';
    }
  }

  updateStateFromPointers() {
    this.state.brake = false;
    this.state.accelerate = false;

    for (const zone of this.activePointers.values()) {
      if (zone === 'left') {
        this.state.brake = true;
      } else if (zone === 'right') {
        this.state.accelerate = true;
      }
    }
  }

  getInput() {
    // Combine touch and keyboard input
    const brake = this.state.brake ||
      (this.keys && (this.keys.left.isDown || this.keys.a.isDown || this.keys.s.isDown));

    const accelerate = this.state.accelerate ||
      (this.keys && (this.keys.right.isDown || this.keys.d.isDown || this.keys.w.isDown));

    return {
      brake,
      accelerate
    };
  }

  isScanning() {
    return this.keys && this.keys.space.isDown;
  }

  destroy() {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.scene.input.off('pointerupoutside', this.onPointerUp, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
  }
}
