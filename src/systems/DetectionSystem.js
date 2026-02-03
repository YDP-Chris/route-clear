import Phaser from 'phaser';
import { TIMING } from '../config/constants.js';
import { IED_STATES } from '../config/iedConfig.js';

export class DetectionSystem {
  constructor(scene) {
    this.scene = scene;
    this.threatLevel = 'safe';
    this.nearestIEDDistance = Infinity;
    this.scanRange = TIMING.SCAN_RANGE;
    this.iedsInScanRange = 0;
  }

  update(time, delta) {
    this.updateThreatLevel();
    this.updateIEDsInRange();
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

  updateIEDsInRange() {
    const husky = this.scene.husky;
    if (!husky) {
      this.iedsInScanRange = 0;
      return;
    }

    const detectorPos = husky.getDetectorPosition();
    const ieds = this.scene.activeIEDs;
    let count = 0;

    for (const ied of ieds) {
      if (!ied.isActive()) continue;

      const distance = Phaser.Math.Distance.Between(
        detectorPos.x, detectorPos.y,
        ied.x, ied.y
      );

      if (distance < this.scanRange) {
        count++;
      }
    }

    this.iedsInScanRange = count;
  }

  performScan() {
    const husky = this.scene.husky;
    if (!husky) return { success: false, count: 0, blocked: [] };

    const detectorPos = husky.getDetectorPosition();
    const ieds = this.scene.activeIEDs;

    // Find ALL IEDs within scan range
    const neutralized = [];
    const blocked = [];  // IEDs that couldn't be scanned (RCIED no signal, PPIED too fast)

    for (const ied of ieds) {
      if (!ied.isActive()) continue;

      const distance = Phaser.Math.Distance.Between(
        detectorPos.x, detectorPos.y,
        ied.x, ied.y
      );

      if (distance < this.scanRange) {
        // Check if this IED can currently be scanned
        if (ied.canBeScan()) {
          neutralized.push(ied);
        } else {
          blocked.push(ied);
        }
      }
    }

    // Neutralize scannable IEDs
    for (const ied of neutralized) {
      ied.neutralize();
    }

    // Return result for feedback
    return {
      success: neutralized.length > 0,
      count: neutralized.length,
      blocked: blocked  // For showing "TOO FAST" or "WAIT FOR SIGNAL" feedback
    };
  }

  getThreatLevel() {
    return this.threatLevel;
  }

  getNearestDistance() {
    return this.nearestIEDDistance;
  }

  getIEDsInScanRange() {
    return this.iedsInScanRange;
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
