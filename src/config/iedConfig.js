// IED Types Configuration

export const IED_TYPES = {
  CWIED: {
    id: 'cwied',
    name: 'Command Wire IED',
    description: 'Detonated via command wire - look for wire extending off-road',
    hint: 'COMMAND WIRE - Look for the wire!',

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
    scanDifficulty: 1.0,

    // Scoring
    basePoints: 100,

    // Visual
    color: {
      hidden: 0x8B7355,
      warning: 0xFFAA00,
      critical: 0xFF0000
    }
  },

  PPIED: {
    id: 'ppied',
    name: 'Pressure Plate IED',
    description: 'Triggered by pressure - slow down to spot the disturbed ground',
    hint: 'PRESSURE PLATE - Slow down! No warning time.',

    // Visual cues
    visualCue: 'plate',
    plateSize: 30,

    // Timing - very short! Speed dependent
    warningDuration: 800,   // Brief flash
    criticalDuration: 400,  // Almost instant

    // Detection - must be close and SLOW
    detectionRange: 200,
    criticalRange: 80,
    scanDifficulty: 1.2,
    maxSpeedToScan: 120,  // Must be going slower than this to scan

    // Scoring - harder = more points
    basePoints: 150,

    // Visual - earth tones, disturbed ground
    color: {
      hidden: 0x8B7355,
      warning: 0xFF6600,
      critical: 0xFF0000
    }
  },

  RCIED: {
    id: 'rcied',
    name: 'Radio Controlled IED',
    description: 'Remote detonated - signal flickers, scan when visible',
    hint: 'RADIO IED - Wait for signal! Scan when antenna blinks.',

    // Visual cues
    visualCue: 'antenna',
    signalInterval: 1500,  // ms between signal flashes
    signalDuration: 800,   // ms signal is visible

    // Timing
    warningDuration: 4000,
    criticalDuration: 2000,

    // Detection - only scannable when signal is visible
    detectionRange: 350,
    criticalRange: 120,
    scanDifficulty: 1.0,
    requiresSignal: true,  // Can only scan during signal window

    // Scoring
    basePoints: 125,

    // Visual - electronics colors
    color: {
      hidden: 0x555555,
      warning: 0x00FFFF,
      critical: 0xFF00FF
    }
  },

  VBIED: {
    id: 'vbied',
    name: 'Vehicle Borne IED',
    description: 'Parked vehicle packed with explosives - big and deadly',
    hint: 'CAR BOMB - High priority! Huge blast if missed.',

    // Visual cues
    visualCue: 'vehicle',
    vehicleSize: 50,

    // Timing - longer warning but devastating if missed
    warningDuration: 4000,
    criticalDuration: 2500,

    // Detection - larger, easier to see
    detectionRange: 400,
    criticalRange: 150,
    scanDifficulty: 0.8,  // Easier to scan (bigger target)

    // Scoring - high value target
    basePoints: 200,

    // Special - causes instant game over, not just +1 casualty
    instantKill: true,
    blastRadius: 200,

    // Visual - vehicle colors
    color: {
      hidden: 0x4A4A4A,
      warning: 0xFFAA00,
      critical: 0xFF0000
    }
  }
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

  // Difficulty progression - unlock new types as distance increases
  difficultyLevels: [
    { distance: 0,    spawnRate: 0.3, types: ['cwied'], hint: true },
    { distance: 150,  spawnRate: 0.4, types: ['cwied', 'ppied'], hint: true },
    { distance: 350,  spawnRate: 0.45, types: ['cwied', 'ppied', 'rcied'], hint: true },
    { distance: 600,  spawnRate: 0.5, types: ['cwied', 'ppied', 'rcied', 'vbied'], hint: true },
    { distance: 1000, spawnRate: 0.55, types: ['cwied', 'ppied', 'rcied', 'vbied'] },
    { distance: 2000, spawnRate: 0.6, types: ['cwied', 'ppied', 'rcied', 'vbied'] },
    { distance: 3500, spawnRate: 0.7, types: ['cwied', 'ppied', 'rcied', 'vbied'] }
  ],

  // Type weights (probability when multiple types available)
  typeWeights: {
    cwied: 0.5,   // Less common once others unlock
    ppied: 1.0,   // Common when available
    rcied: 1.0,   // Common when available
    vbied: 0.7    // Slightly less common but still frequent
  },

  // Randomization
  positionVariance: 100
};
