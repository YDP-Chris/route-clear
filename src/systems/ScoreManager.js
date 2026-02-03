import { SCORING } from '../config/constants.js';

const STORAGE_KEY = 'routeClear_highScores';
const MAX_HIGH_SCORES = 5;

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

  // High score management
  static getHighScores() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load high scores:', e);
    }
    return [];
  }

  static saveHighScore(entry) {
    // entry: { score, distance, neutralized, date }
    try {
      const scores = ScoreManager.getHighScores();
      scores.push(entry);

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      // Keep only top N
      const trimmed = scores.slice(0, MAX_HIGH_SCORES);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

      // Return rank (1-indexed), or 0 if not in top N
      const rank = trimmed.findIndex(s => s.score === entry.score && s.date === entry.date);
      return rank >= 0 ? rank + 1 : 0;
    } catch (e) {
      console.warn('Could not save high score:', e);
      return 0;
    }
  }

  static isHighScore(score) {
    const scores = ScoreManager.getHighScores();
    if (scores.length < MAX_HIGH_SCORES) return true;
    return score > scores[scores.length - 1].score;
  }

  static getTopScore() {
    const scores = ScoreManager.getHighScores();
    return scores.length > 0 ? scores[0].score : 0;
  }

  static clearHighScores() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear high scores:', e);
    }
  }
}
