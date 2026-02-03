// Achievement Definitions

export const ACHIEVEMENTS = {
  // First time achievements
  first_clear: {
    id: 'first_clear',
    name: 'Route Clearer',
    description: 'Neutralize your first IED',
    icon: '🎖️',
    condition: (stats) => stats.totalNeutralized >= 1
  },

  first_perfect: {
    id: 'first_perfect',
    name: 'Precision Timing',
    description: 'Get your first PERFECT scan',
    icon: '💎',
    condition: (stats) => stats.totalPerfects >= 1
  },

  first_vbied: {
    id: 'first_vbied',
    name: 'Car Bomb Hunter',
    description: 'Neutralize a VBIED',
    icon: '🚗',
    condition: (stats) => stats.vbiedsNeutralized >= 1
  },

  // Milestone achievements
  neutralize_50: {
    id: 'neutralize_50',
    name: 'Veteran',
    description: 'Neutralize 50 total IEDs',
    icon: '⭐',
    condition: (stats) => stats.totalNeutralized >= 50
  },

  neutralize_100: {
    id: 'neutralize_100',
    name: 'Expert',
    description: 'Neutralize 100 total IEDs',
    icon: '🌟',
    condition: (stats) => stats.totalNeutralized >= 100
  },

  neutralize_500: {
    id: 'neutralize_500',
    name: 'Master',
    description: 'Neutralize 500 total IEDs',
    icon: '👑',
    condition: (stats) => stats.totalNeutralized >= 500
  },

  distance_1000: {
    id: 'distance_1000',
    name: 'Road Warrior',
    description: 'Travel 1,000m total',
    icon: '🛣️',
    condition: (stats) => stats.totalDistance >= 1000
  },

  distance_10000: {
    id: 'distance_10000',
    name: 'Marathon Runner',
    description: 'Travel 10,000m total',
    icon: '🏃',
    condition: (stats) => stats.totalDistance >= 10000
  },

  // Streak achievements
  streak_5: {
    id: 'streak_5',
    name: 'Consistent',
    description: 'Get a 5x neutralization streak',
    icon: '🔥',
    condition: (stats) => stats.bestStreak >= 5
  },

  streak_10: {
    id: 'streak_10',
    name: 'On Fire',
    description: 'Get a 10x neutralization streak',
    icon: '💥',
    condition: (stats) => stats.bestStreak >= 10
  },

  // Perfect achievements
  perfect_streak_3: {
    id: 'perfect_streak_3',
    name: 'Triple Perfect',
    description: 'Get 3 PERFECTs in a row',
    icon: '✨',
    condition: (stats) => stats.bestPerfectStreak >= 3
  },

  perfect_streak_5: {
    id: 'perfect_streak_5',
    name: 'Perfect Form',
    description: 'Get 5 PERFECTs in a row',
    icon: '🎯',
    condition: (stats) => stats.bestPerfectStreak >= 5
  },

  // Score achievements
  score_10000: {
    id: 'score_10000',
    name: 'High Scorer',
    description: 'Score 10,000 points in one run',
    icon: '📈',
    condition: (stats) => stats.bestScore >= 10000
  },

  score_50000: {
    id: 'score_50000',
    name: 'Score Master',
    description: 'Score 50,000 points in one run',
    icon: '💰',
    condition: (stats) => stats.bestScore >= 50000
  },

  // Special achievements
  no_blue_falcon: {
    id: 'no_blue_falcon',
    name: 'No Man Left Behind',
    description: 'Complete a run (500m+) with 0 Blue Falcons',
    icon: '🦅',
    hidden: true, // Hidden until unlocked
    condition: (stats) => stats.cleanRunDistance >= 500
  },

  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Neutralize 5 IEDs while maintaining 200+ speed',
    icon: '⚡',
    condition: (stats) => stats.speedDemonCount >= 5
  },

  // Challenge achievements
  challenge_first: {
    id: 'challenge_first',
    name: 'Challenger',
    description: 'Complete your first challenge',
    icon: '🏁',
    condition: (stats) => stats.challengesCompleted >= 1
  },

  challenge_all: {
    id: 'challenge_all',
    name: 'Champion',
    description: 'Complete all challenges',
    icon: '🏆',
    condition: (stats) => stats.challengesCompleted >= 6
  },

  challenge_gold: {
    id: 'challenge_gold',
    name: 'Golden',
    description: 'Earn a Gold medal on any challenge',
    icon: '🥇',
    condition: (stats) => stats.goldMedals >= 1
  },

  all_gold: {
    id: 'all_gold',
    name: 'Perfectionist',
    description: 'Earn Gold on all challenges',
    icon: '👑',
    condition: (stats) => stats.goldMedals >= 6
  }
};

export const ACHIEVEMENT_STORAGE_KEY = 'routeClear_achievements';
export const STATS_STORAGE_KEY = 'routeClear_stats';

// Default stats structure
export function getDefaultStats() {
  return {
    totalNeutralized: 0,
    totalPerfects: 0,
    totalDistance: 0,
    totalRuns: 0,
    bestScore: 0,
    bestStreak: 0,
    bestPerfectStreak: 0,
    vbiedsNeutralized: 0,
    cleanRunDistance: 0, // Furthest run with 0 BFs
    speedDemonCount: 0,
    challengesCompleted: 0,
    goldMedals: 0
  };
}

// Load stats from localStorage
export function getStats() {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      return { ...getDefaultStats(), ...JSON.parse(stored) };
    }
  } catch (e) {}
  return getDefaultStats();
}

// Save stats to localStorage
export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {}
}

// Get unlocked achievements
export function getUnlockedAchievements() {
  try {
    const stored = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [];
}

// Save unlocked achievements
export function saveUnlockedAchievements(unlocked) {
  try {
    localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(unlocked));
  } catch (e) {}
}

// Check and unlock achievements, returns newly unlocked
export function checkAchievements(stats) {
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked = [];

  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (!unlocked.includes(id) && achievement.condition(stats)) {
      unlocked.push(id);
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlockedAchievements(unlocked);
  }

  return newlyUnlocked;
}
