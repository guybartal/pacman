/**
 * Collision detection utilities
 */
import { Vector2, Bounds } from '../core/types';
import { CONFIG } from '../core/config';

export function checkTileCollision(position: Vector2, grid: number[][]): boolean {
  const tileX = Math.floor(position.x / CONFIG.TILE_SIZE);
  const tileY = Math.floor(position.y / CONFIG.TILE_SIZE);
  
  if (tileY < 0 || tileY >= grid.length || tileX < 0 || tileX >= grid[0].length) {
    return true; // Out of bounds = collision
  }
  
  return grid[tileY][tileX] === 1; // Wall
}

export function checkEntityCollision(a: Bounds, b: Bounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function getEntityBounds(position: Vector2, size: number = 16): Bounds {
  return {
    x: position.x,
    y: position.y,
    width: size,
    height: size,
  };
}

export function distanceBetween(a: Vector2, b: Vector2): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
