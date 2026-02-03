import Phaser from 'phaser';
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
    this.swipeStart = null;
    this.swipeThreshold = 50; // Minimum swipe distance

    // Keyboard keys
    this.keys = null;

    // Prevent double-tap lane switch
    this.lastLaneSwitch = 0;
    this.laneSwitchCooldown = 200;
  }

  setup() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Calculate touch zones (top 70% of screen for controls)
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
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      e: Phaser.Input.Keyboard.KeyCodes.E
    });

    // Lane switch on key press (not hold)
    this.keys.left.on('down', () => this.tryLaneSwitch('left'));
    this.keys.right.on('down', () => this.tryLaneSwitch('right'));
    this.keys.q.on('down', () => this.tryLaneSwitch('left'));
    this.keys.e.on('down', () => this.tryLaneSwitch('right'));

    // Scan on spacebar
    this.keys.space.on('down', () => this.scene.triggerScan());
  }

  onPointerDown(pointer) {
    // Record swipe start position
    this.swipeStart = { x: pointer.x, y: pointer.y, time: Date.now() };

    const zone = this.getZone(pointer.x);
    this.activePointers.set(pointer.id, { zone, startX: pointer.x, startY: pointer.y });

    this.updateStateFromPointers();
  }

  onPointerUp(pointer) {
    const pointerData = this.activePointers.get(pointer.id);

    if (pointerData && this.swipeStart) {
      const dx = pointer.x - this.swipeStart.x;
      const dy = pointer.y - this.swipeStart.y;
      const dt = Date.now() - this.swipeStart.time;

      // Check for horizontal swipe (quick, mostly horizontal)
      if (dt < 300 && Math.abs(dx) > this.swipeThreshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0) {
          this.tryLaneSwitch('right');
        } else {
          this.tryLaneSwitch('left');
        }
      } else if (pointerData.zone === 'center' && Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        // Tap in center = scan (only if not a swipe)
        this.scene.triggerScan();
      }
    }

    this.activePointers.delete(pointer.id);
    this.swipeStart = null;
    this.updateStateFromPointers();
  }

  onPointerMove(pointer) {
    if (this.activePointers.has(pointer.id)) {
      const zone = this.getZone(pointer.x);
      const data = this.activePointers.get(pointer.id);
      data.zone = zone;
      this.activePointers.set(pointer.id, data);
      this.updateStateFromPointers();
    }
  }

  tryLaneSwitch(direction) {
    const now = Date.now();
    if (now - this.lastLaneSwitch < this.laneSwitchCooldown) return;

    const husky = this.scene.husky;
    if (!husky) return;

    let success = false;
    if (direction === 'left') {
      success = husky.moveLeft();
    } else if (direction === 'right') {
      success = husky.moveRight();
    }

    if (success) {
      this.lastLaneSwitch = now;
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

    for (const data of this.activePointers.values()) {
      if (data.zone === 'left') {
        this.state.brake = true;
      } else if (data.zone === 'right') {
        this.state.accelerate = true;
      }
    }
  }

  getInput() {
    // Combine touch and keyboard input for speed control
    // W/S or Up/Down for speed, A/D now also work
    const brake = this.state.brake ||
      (this.keys && (this.keys.s.isDown || this.keys.down.isDown));

    const accelerate = this.state.accelerate ||
      (this.keys && (this.keys.w.isDown || this.keys.up.isDown));

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
