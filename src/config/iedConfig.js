// IED Types Configuration

export const IED_TYPES = {
  CWIED: {
    id: 'cwied',
    name: 'Command Wire IED',
    description: 'Detonated via command wire - look for wire extending off-road',

    // Visual cues
    visualCue: 'wire',
    wireLength: 200,
    wireVisible: true,

    // Timing (milliseconds)
    warningDuration: 3000,
    criticalDuration: 1500,

    // Detection
    detectionRange: 300,
    criticalRange: 100,
    scanDifficulty: 1.0,  // Multiplier for scan success

    // Scoring
    basePoints: 100,

    // Visual
    color: {
      hidden: 0x8B7355,
      warning: 0xFFAA00,
      critical: 0xFF0000
    }
  }

  // Future IED types will be added here:
  // PPIED - Pressure Plate (no warning, careful driving)
  // RCIED - Radio Controlled (intermittent signal indicator)
  // VBIED - Vehicle Borne (parked vehicle, large blast)
};

export const IED_STATES = {
  HIDDEN: 'hidden',
  WARNING: 'warning',
  CRITICAL: 'critical',
  NEUTRALIZED: 'neutralized',
  DETONATED: 'detonated'
};

export const SPAWN_CONFIG = {
  // Initial spawn settings
  initialDelay: 3000,       // Time before first IED
  minSpacing: 400,          // Minimum pixels between IEDs

  // Difficulty progression
  difficultyLevels: [
    { distance: 0, spawnRate: 0.3, types: ['cwied'] },
    { distance: 1000, spawnRate: 0.4, types: ['cwied'] },
    { distance: 2500, spawnRate: 0.5, types: ['cwied'] },
    { distance: 5000, spawnRate: 0.6, types: ['cwied'] }
  ],

  // Randomization
  positionVariance: 100,    // Random offset from center road
  typeWeights: {
    cwied: 1.0
  }
};
