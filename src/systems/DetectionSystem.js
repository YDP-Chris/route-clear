import Phaser from 'phaser';
import { TIMING } from '../config/constants.js';
import { IED_STATES } from '../config/iedConfig.js';

export class DetectionSystem {
  constructor(scene) {
    this.scene = scene;
    this.threatLevel = 'safe';
    this.nearestIEDDistance = Infinity;
    this.scanRange = TIMING.SCAN_RANGE;
  }

  update(time, delta) {
    this.updateThreatLevel();
  }

  updateThreatLevel() {
    const husky = this.scene.husky;
    if (!husky) return;

    const ieds = this.scene.activeIEDs;
    this.nearestIEDDistance = Infinity;
    let nearestIED = null;

    // Find nearest active IED
    for (const ied of ieds) {
      if (!ied.isActive()) continue;

      const distance = Phaser.Math.Distance.Between(
        husky.x, husky.y,
        ied.x, ied.y
      );

      if (distance < this.nearestIEDDistance) {
        this.nearestIEDDistance = distance;
        nearestIED = ied;
      }
    }

    // Determine threat level
    if (!nearestIED || this.nearestIEDDistance > TIMING.DETECTION_FAR) {
      this.threatLevel = 'safe';
    } else if (this.nearestIEDDistance <= TIMING.DETECTION_NEAR) {
      this.threatLevel = 'critical';
    } else {
      this.threatLevel = 'warning';
    }

    // Also consider IED state
    if (nearestIED) {
      const state = nearestIED.getState();
      if (state === IED_STATES.CRITICAL) {
        this.threatLevel = 'critical';
      } else if (state === IED_STATES.WARNING && this.threatLevel === 'safe') {
        this.threatLevel = 'warning';
      }
    }
  }

  performScan() {
    const husky = this.scene.husky;
    if (!husky) return;

    const detectorPos = husky.getDetectorPosition();
    const ieds = this.scene.activeIEDs;

    let scannedIED = null;
    let closestDistance = Infinity;

    // Find IED within scan range
    for (const ied of ieds) {
      if (!ied.isActive()) continue;

      const distance = Phaser.Math.Distance.Between(
        detectorPos.x, detectorPos.y,
        ied.x, ied.y
      );

      if (distance < this.scanRange && distance < closestDistance) {
        closestDistance = distance;
        scannedIED = ied;
      }
    }

    if (scannedIED) {
      // Successful scan - neutralize IED
      scannedIED.neutralize();
      return true;
    }

    return false;
  }

  getThreatLevel() {
    return this.threatLevel;
  }

  getNearestDistance() {
    return this.nearestIEDDistance;
  }

  getWarningProgress() {
    // Returns 0-1 based on how close to danger
    if (this.nearestIEDDistance >= TIMING.DETECTION_FAR) {
      return 0;
    }

    const range = TIMING.DETECTION_FAR - TIMING.DETECTION_NEAR;
    const current = this.nearestIEDDistance - TIMING.DETECTION_NEAR;

    return 1 - Math.max(0, Math.min(1, current / range));
  }
}
