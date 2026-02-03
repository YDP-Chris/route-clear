// Challenge Mode Configurations

export const CHALLENGES = {
  // Challenge 1: Basic Training
  basic_training: {
    id: 'basic_training',
    name: 'Basic Training',
    description: 'Clear 10 CWIEDs to complete training',
    icon: '🎯',
    unlocked: true,

    // Objectives
    objectives: {
      neutralize: 10,
      maxBlueFalcons: 3,
      maxCasualties: 0
    },

    // IED spawn pattern (fixed, not random)
    pattern: [
      { distance: 100, type: 'cwied', lane: 1 },
      { distance: 250, type: 'cwied', lane: 0 },
      { distance: 400, type: 'cwied', lane: 2 },
      { distance: 550, type: 'cwied', lane: 1 },
      { distance: 700, type: 'cwied', lane: 0 },
      { distance: 850, type: 'cwied', lane: 2 },
      { distance: 1000, type: 'cwied', lane: 1 },
      { distance: 1150, type: 'cwied', lane: 1 },
      { distance: 1300, type: 'cwied', lane: 0 },
      { distance: 1450, type: 'cwied', lane: 2 }
    ],

    // Medal thresholds
    medals: {
      bronze: { score: 1000, perfects: 0 },
      silver: { score: 1500, perfects: 3 },
      gold: { score: 2500, perfects: 7 }
    }
  },

  // Challenge 2: Speed Demon
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Maintain 200+ speed while clearing 8 IEDs',
    icon: '⚡',
    unlocked: false,
    unlocksAfter: 'basic_training',

    objectives: {
      neutralize: 8,
      minSpeed: 200, // Must maintain this speed
      maxBlueFalcons: 1,
      maxCasualties: 0
    },

    pattern: [
      { distance: 150, type: 'cwied', lane: 1 },
      { distance: 350, type: 'cwied', lane: 0 },
      { distance: 550, type: 'cwied', lane: 2 },
      { distance: 750, type: 'cwied', lane: 1 },
      { distance: 950, type: 'cwied', lane: 0 },
      { distance: 1150, type: 'cwied', lane: 2 },
      { distance: 1350, type: 'cwied', lane: 1 },
      { distance: 1550, type: 'cwied', lane: 0 }
    ],

    // Forced starting speed
    startSpeed: 200,

    medals: {
      bronze: { score: 1200, perfects: 0 },
      silver: { score: 2000, perfects: 4 },
      gold: { score: 3000, perfects: 6 }
    }
  },

  // Challenge 3: Pressure Test
  pressure_test: {
    id: 'pressure_test',
    name: 'Pressure Test',
    description: 'Master PPIEDs - slow down or die',
    icon: '🐢',
    unlocked: false,
    unlocksAfter: 'speed_demon',

    objectives: {
      neutralize: 8,
      maxBlueFalcons: 2,
      maxCasualties: 0
    },

    pattern: [
      { distance: 200, type: 'cwied', lane: 1 },
      { distance: 400, type: 'ppied', lane: 0 },
      { distance: 600, type: 'cwied', lane: 2 },
      { distance: 800, type: 'ppied', lane: 1 },
      { distance: 1000, type: 'ppied', lane: 0 },
      { distance: 1200, type: 'cwied', lane: 2 },
      { distance: 1400, type: 'ppied', lane: 1 },
      { distance: 1600, type: 'ppied', lane: 2 }
    ],

    medals: {
      bronze: { score: 1000, perfects: 0 },
      silver: { score: 1800, perfects: 3 },
      gold: { score: 2800, perfects: 5 }
    }
  },

  // Challenge 4: Signal Hunter
  signal_hunter: {
    id: 'signal_hunter',
    name: 'Signal Hunter',
    description: 'Time your scans with RCIED signals',
    icon: '📡',
    unlocked: false,
    unlocksAfter: 'pressure_test',

    objectives: {
      neutralize: 8,
      maxBlueFalcons: 2,
      maxCasualties: 0
    },

    pattern: [
      { distance: 200, type: 'cwied', lane: 1 },
      { distance: 450, type: 'rcied', lane: 0 },
      { distance: 700, type: 'rcied', lane: 2 },
      { distance: 950, type: 'cwied', lane: 1 },
      { distance: 1200, type: 'rcied', lane: 0 },
      { distance: 1450, type: 'rcied', lane: 2 },
      { distance: 1700, type: 'rcied', lane: 1 },
      { distance: 1950, type: 'cwied', lane: 0 }
    ],

    medals: {
      bronze: { score: 1000, perfects: 0 },
      silver: { score: 1800, perfects: 4 },
      gold: { score: 3000, perfects: 6 }
    }
  },

  // Challenge 5: Perfect Run
  perfect_run: {
    id: 'perfect_run',
    name: 'Perfect Run',
    description: 'Get PERFECT timing on all 6 IEDs',
    icon: '💎',
    unlocked: false,
    unlocksAfter: 'signal_hunter',

    objectives: {
      neutralize: 6,
      minPerfects: 6, // ALL must be perfect
      maxBlueFalcons: 0,
      maxCasualties: 0
    },

    pattern: [
      { distance: 300, type: 'cwied', lane: 1 },
      { distance: 600, type: 'cwied', lane: 0 },
      { distance: 900, type: 'cwied', lane: 2 },
      { distance: 1200, type: 'cwied', lane: 1 },
      { distance: 1500, type: 'cwied', lane: 0 },
      { distance: 1800, type: 'cwied', lane: 2 }
    ],

    medals: {
      bronze: { score: 1000, perfects: 4 },
      silver: { score: 1500, perfects: 5 },
      gold: { score: 2000, perfects: 6 }
    }
  },

  // Challenge 6: Gauntlet
  gauntlet: {
    id: 'gauntlet',
    name: 'The Gauntlet',
    description: 'Face all IED types in rapid succession',
    icon: '🔥',
    unlocked: false,
    unlocksAfter: 'perfect_run',

    objectives: {
      neutralize: 12,
      maxBlueFalcons: 1,
      maxCasualties: 0
    },

    pattern: [
      { distance: 150, type: 'cwied', lane: 1 },
      { distance: 300, type: 'ppied', lane: 0 },
      { distance: 450, type: 'cwied', lane: 2 },
      { distance: 600, type: 'rcied', lane: 1 },
      { distance: 750, type: 'cwied', lane: 0 },
      { distance: 900, type: 'ppied', lane: 2 },
      { distance: 1050, type: 'rcied', lane: 1 },
      { distance: 1200, type: 'cwied', lane: 0 },
      { distance: 1350, type: 'vbied', lane: 1 },
      { distance: 1600, type: 'ppied', lane: 2 },
      { distance: 1800, type: 'rcied', lane: 0 },
      { distance: 2000, type: 'vbied', lane: 1 }
    ],

    medals: {
      bronze: { score: 2000, perfects: 0 },
      silver: { score: 3500, perfects: 6 },
      gold: { score: 5000, perfects: 10 }
    }
  }
};

export const CHALLENGE_ORDER = [
  'basic_training',
  'speed_demon',
  'pressure_test',
  'signal_hunter',
  'perfect_run',
  'gauntlet'
];

// Storage key for challenge progress
export const CHALLENGE_STORAGE_KEY = 'routeClear_challenges';

// Helper to get/save challenge progress
export function getChallengeProgress() {
  try {
    const stored = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {
    completed: [],
    medals: {}, // { challengeId: 'gold'|'silver'|'bronze' }
    bestScores: {} // { challengeId: score }
  };
}

export function saveChallengeProgress(progress) {
  try {
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {}
}

export function isChallengeUnlocked(challengeId) {
  const challenge = CHALLENGES[challengeId];
  if (!challenge) return false;
  if (challenge.unlocked) return true;

  const progress = getChallengeProgress();
  if (challenge.unlocksAfter) {
    return progress.completed.includes(challenge.unlocksAfter);
  }
  return false;
}
