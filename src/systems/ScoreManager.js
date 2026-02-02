import { SCORING } from '../config/constants.js';

export class ScoreManager {
  constructor(scene) {
    this.scene = scene;
    this.score = 0;
    this.distanceAccumulator = 0;
  }

  addPoints(points) {
    this.score += points;
    return this.score;
  }

  addDistancePoints(distance) {
    // Accumulate distance and add points periodically
    this.distanceAccumulator += distance;

    // Add 1 point per 10 pixels traveled
    while (this.distanceAccumulator >= 10) {
      this.score += SCORING.DISTANCE_POINTS;
      this.distanceAccumulator -= 10;
    }
  }

  getScore() {
    return Math.round(this.score);
  }

  reset() {
    this.score = 0;
    this.distanceAccumulator = 0;
  }
}
