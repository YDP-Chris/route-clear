// Route Clear - Game Constants

export const COLORS = {
  // Background layers
  SKY: 0x87CEEB,
  MOUNTAINS: 0x8B7355,
  DESERT: 0xC4A76C,
  ROAD: 0x4A4A4A,
  ROAD_MARKING: 0xFFFFFF,

  // Vehicle
  HUSKY_BODY: 0x4A5D23,      // Olive drab
  HUSKY_COCKPIT: 0x2F3B16,   // Darker olive
  HUSKY_WINDOW: 0x87CEEB,    // Light blue

  // IED states
  IED_HIDDEN: 0x8B7355,      // Blends with terrain
  IED_WARNING: 0xFFAA00,     // Amber
  IED_CRITICAL: 0xFF0000,    // Red
  WIRE: 0xCC8800,            // Command wire amber

  // UI
  HUD_BACKGROUND: 0x000000,
  HUD_TEXT: 0xFFFFFF,
  THREAT_SAFE: 0x00FF00,
  THREAT_WARNING: 0xFFAA00,
  THREAT_CRITICAL: 0xFF0000,

  // Effects
  EXPLOSION: 0xFF4400,
  SCAN_PULSE: 0x00FFFF
};

export const SPEEDS = {
  // Husky speeds (pixels per second)
  MIN: 50,
  CRUISE: 150,
  MAX: 250,
  ACCELERATION: 100,  // Speed change per second
  BRAKE_POWER: 150    // Deceleration per second
};

export const TIMING = {
  // IED detection windows (milliseconds)
  CWIED_WARNING: 3000,    // Time in warning state before critical
  CWIED_CRITICAL: 1500,   // Time in critical state before detonation

  // Scan action
  SCAN_DURATION: 500,     // Visual feedback duration
  SCAN_COOLDOWN: 1000,    // Minimum time between scans

  // Detection ranges (pixels from IED center)
  DETECTION_FAR: 300,     // Start warning
  DETECTION_NEAR: 100,    // Critical zone
  SCAN_RANGE: 150,        // Effective scan range

  // Game flow
  IED_SPAWN_MIN: 2000,    // Minimum ms between IEDs
  IED_SPAWN_MAX: 5000,    // Maximum ms between IEDs
  DIFFICULTY_INCREASE: 30000  // Time before difficulty bump
};

export const SCORING = {
  IED_NEUTRALIZED: 100,
  SPEED_BONUS_MULTIPLIER: 0.5,  // Extra points for high speed neutralization
  DISTANCE_POINTS: 1,           // Points per 10 pixels traveled
  STREAK_MULTIPLIER: 0.25       // Bonus per consecutive neutralization
};

export const LAYOUT = {
  // Screen regions (percentages)
  HUD_HEIGHT: 0.1,
  GAME_AREA_HEIGHT: 0.75,
  CONTROLS_HEIGHT: 0.15,

  // Touch zones (thirds of screen width)
  LEFT_ZONE: 0.33,
  CENTER_ZONE: 0.66,

  // Husky position
  HUSKY_X_PERCENT: 0.2,   // 20% from left edge
  HUSKY_Y_PERCENT: 0.6    // 60% down game area
};

export const LANES = {
  COUNT: 3,
  // Lane positions as percentage of road width (centered on screen)
  POSITIONS: [0.35, 0.5, 0.65],  // Left, Center, Right
  DEFAULT_LANE: 1,               // Start in center lane
  SWITCH_DURATION: 200,          // ms to switch lanes
  // Road boundaries
  ROAD_LEFT: 0.25,
  ROAD_RIGHT: 0.75
};

export const PARALLAX = {
  // Scroll speed multipliers (relative to road)
  SKY: 0.1,
  MOUNTAINS: 0.3,
  DESERT: 0.6,
  ROAD: 1.0
};

export const GAME = {
  STARTING_DISTANCE: 0,
  TARGET_DISTANCE: 5000,    // Meters to "win" a run (endless mode ignores)
  MAX_CASUALTIES: 1,        // Game over after this many
  INITIAL_LIVES: 1
};
