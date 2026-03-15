/**
 * Core game configuration constants
 */
export const CONFIG = {
  // Canvas dimensions (classic Pac-Man: 28x31 tiles at 16px each)
  CANVAS_WIDTH: 448,
  CANVAS_HEIGHT: 496,
  
  // Tile size in pixels
  TILE_SIZE: 16,
  
  // Grid dimensions
  GRID_WIDTH: 28,
  GRID_HEIGHT: 31,
  
  // Game timing
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
  
  // Speeds (pixels per second)
  PACMAN_SPEED: 80,
  GHOST_SPEED: 75,
  GHOST_FRIGHTENED_SPEED: 50,
  
  // Gameplay
  POWER_PELLET_DURATION: 6000, // ms
  GHOST_SCORE_BASE: 200,
  
  // Colors
  COLORS: {
    BACKGROUND: '#000000',
    WALL: '#2121DE',
    PELLET: '#FFCC00',
    POWER_PELLET: '#FFCC00',
    TEXT: '#FFFFFF',
  },
} as const;

export type GameConfig = typeof CONFIG;
