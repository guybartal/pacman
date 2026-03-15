/**
 * Core type definitions for the game
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE',
}

export enum GameState {
  LOADING = 'LOADING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
}

export enum GhostMode {
  SCATTER = 'SCATTER',
  CHASE = 'CHASE',
  FRIGHTENED = 'FRIGHTENED',
  EATEN = 'EATEN',
}

export enum GhostName {
  BLINKY = 'BLINKY', // Red - direct chaser
  PINKY = 'PINKY',   // Pink - ambusher
  INKY = 'INKY',     // Cyan - unpredictable
  CLYDE = 'CLYDE',   // Orange - random/shy
}

export enum TileType {
  EMPTY = 0,
  WALL = 1,
  PELLET = 2,
  POWER_PELLET = 3,
  GHOST_HOUSE = 4,
  GHOST_DOOR = 5,
  TUNNEL = 6,
}

export interface Entity {
  position: Vector2;
  direction: Direction;
  speed: number;
  update(deltaTime: number): void;
}

export interface Renderable {
  render(ctx: CanvasRenderingContext2D): void;
}
