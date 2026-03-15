/**
 * GameState - Central state management for the game
 * 
 * Single source of truth for all game state.
 * Other systems read from and write to this state.
 */
import { GameState, GhostMode, Direction, Vector2 } from './types';

export interface PacmanState {
  position: Vector2;
  direction: Direction;
  nextDirection: Direction;
  lives: number;
  isEnergized: boolean;
  energizedTimer: number;
}

export interface GhostState {
  position: Vector2;
  direction: Direction;
  mode: GhostMode;
  targetTile: Vector2;
  isInHouse: boolean;
}

export interface LevelState {
  number: number;
  pelletsRemaining: number;
  totalPellets: number;
  grid: number[][];
}

export interface GlobalGameState {
  status: GameState;
  score: number;
  highScore: number;
  pacman: PacmanState;
  ghosts: Map<string, GhostState>;
  level: LevelState;
  ghostModeTimer: number;
  currentGhostMode: GhostMode;
}

export function createInitialState(): GlobalGameState {
  return {
    status: GameState.LOADING,
    score: 0,
    highScore: 0,
    pacman: {
      position: { x: 14 * 16, y: 23 * 16 },
      direction: Direction.NONE,
      nextDirection: Direction.NONE,
      lives: 3,
      isEnergized: false,
      energizedTimer: 0,
    },
    ghosts: new Map(),
    level: {
      number: 1,
      pelletsRemaining: 0,
      totalPellets: 0,
      grid: [],
    },
    ghostModeTimer: 0,
    currentGhostMode: GhostMode.SCATTER,
  };
}
