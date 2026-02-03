import Phaser from 'phaser';
import { TIMING, SPEEDS } from '../config/constants.js';
import { IED_STATES } from '../config/iedConfig.js';

// Perfect timing constants (based on human factors research)
const HUMAN_REACTION_TIME = 0.25; // 250ms average reaction time
const PERFECT_WINDOW_RATIO = 0.15; // ±15% of optimal distance
const PERFECT_BONUS_MULTIPLIER = 2.0;
const GOOD_BONUS_MULTIPLIER = 1.5;

export class DetectionSystem {
  constructor(scene) {
    this.scene = scene;
    this.threatLevel = 'safe';
    this.nearestIEDDistance = Infinity;
    this.scanRange = TIMING.SCAN_RANGE;
    this.iedsInScanRange = 0;

    // Perfect timing tracking
    this.lastScanRating = null; // 'perfect', 'good', 'early', 'late'
    this.perfectStreak = 0;
  }

  /**
   * Calculate optimal scan distance based on current speed
   * Formula: optimalDist = reactionTime * speed + safetyMargin
   * This gives the player enough time to react while maximizing points
   */
  calculateOptimalDistance() {
    const speed = this.scene.gameState?.speed || SPEEDS.CRUISE;
    // Convert speed to pixels per second (speed is already in px/s roughly)
    const approachRate = speed;

    // Optimal distance = reaction time buffer + safety margin
    // At higher speeds, you need more distance to react
    const reactionBuffer = HUMAN_REACTION_TIME * approachRate;
    const safetyMargin = 40; // Base safety margin in pixels

    return Math.max(80, reactionBuffer + safetyMargin);
  }

  /**
   * Rate a scan based on how close to optimal timing
   * Returns: { rating: 'perfect'|'good'|'early'|'late', multiplier: number, distance: number }
   */
  rateScanTiming(iedDistance) {
    const optimalDist = this.calculateOptimalDistance();
    const deviation = Math.abs(iedDistance - optimalDist);
    const deviationRatio = deviation / optimalDist;

    if (deviationRatio <= PERFECT_WINDOW_RATIO) {
      return { rating: 'perfect', multiplier: PERFECT_BONUS_MULTIPLIER, distance: iedDistance };
    } else if (deviationRatio <= PERFECT_WINDOW_RATIO * 2) {
      return { rating: 'good', multiplier: GOOD_BONUS_MULTIPLIER, distance: iedDistance };
    } else if (iedDistance > optimalDist) {
      return { rating: 'early', multiplier: 1.0, distance: iedDistance };
    } else {
      return { rating: 'late', multiplier: 1.0, distance: iedDistance };
    }
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
    if (!husky) return { success: false, count: 0, blocked: [], ratings: [] };

    const detectorPos = husky.getDetectorPosition();
    const ieds = this.scene.activeIEDs;

    // Find ALL IEDs within scan range
    const neutralized = [];
    const blocked = [];  // IEDs that couldn't be scanned (RCIED no signal, PPIED too fast)
    const ratings = [];  // Timing ratings for each neutralized IED

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

          // Rate the timing of this scan
          const rating = this.rateScanTiming(distance);
          ratings.push({ ied, ...rating });
        } else {
          blocked.push(ied);
        }
      }
    }

    // Neutralize scannable IEDs
    for (const ied of neutralized) {
      ied.neutralize();
    }

    // Track perfect streak
    const bestRating = ratings.length > 0 ?
      ratings.reduce((best, r) => r.multiplier > best.multiplier ? r : best, ratings[0]) : null;

    if (bestRating) {
      this.lastScanRating = bestRating.rating;
      if (bestRating.rating === 'perfect') {
        this.perfectStreak++;
      } else {
        this.perfectStreak = 0;
      }
    }

    // Return result for feedback
    return {
      success: neutralized.length > 0,
      count: neutralized.length,
      blocked: blocked,
      ratings: ratings,
      bestRating: bestRating,
      perfectStreak: this.perfectStreak
    };
  }

  getOptimalDistance() {
    return this.calculateOptimalDistance();
  }

  getPerfectStreak() {
    return this.perfectStreak;
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
