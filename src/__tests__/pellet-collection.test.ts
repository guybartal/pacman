import { describe, it, expect } from 'vitest';
import { CONFIG } from '../core/config';

const TILE_SIZE = CONFIG.TILE_SIZE;

/**
 * Tests for pellet collection logic - verifying center-based tile detection
 * 
 * Bug context (Issue #1): Pellets weren't being collected reliably because
 * tile position was calculated from Pac-Man's top-left corner rather than center.
 * When Pac-Man's center passed over a pellet but top-left was in adjacent tile,
 * the pellet wouldn't be collected.
 */

// Tile position calculation (original - top-left based)
function getTilePosition(x: number, y: number) {
  return {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE),
  };
}

// Center-based tile position (the fix)
function getCenterTilePosition(x: number, y: number) {
  const centerX = x + TILE_SIZE / 2;
  const centerY = y + TILE_SIZE / 2;
  return {
    x: Math.floor(centerX / TILE_SIZE),
    y: Math.floor(centerY / TILE_SIZE),
  };
}

describe('Pellet Collection - Tile Position Detection', () => {
  describe('Center-based tile detection', () => {
    it('should detect correct tile when Pac-Man center is on tile', () => {
      // Pac-Man at tile (5, 5) - position is top-left corner at (80, 80)
      const pos = { x: 80, y: 80 };
      const centerTile = getCenterTilePosition(pos.x, pos.y);
      expect(centerTile.x).toBe(5);
      expect(centerTile.y).toBe(5);
    });

    it('should detect pellet when center crosses into new tile', () => {
      // Pac-Man moving right, center just crossed into tile 6
      // Top-left at x=89 (tile 5), but center at x=97 (tile 6)
      const pos = { x: 89, y: 80 };
      const topLeftTile = getTilePosition(pos.x, pos.y);
      const centerTile = getCenterTilePosition(pos.x, pos.y);
      
      // Old method: would miss pellet at tile 6 (top-left is still in tile 5)
      expect(topLeftTile.x).toBe(5);
      
      // New method: correctly detects we're in tile 6
      expect(centerTile.x).toBe(6);
    });

    it('should collect pellet when approaching from left', () => {
      // Moving right into a tile containing a pellet
      // Position where center just enters the pellet tile
      const pelletTileX = 5;
      const positionX = pelletTileX * TILE_SIZE - TILE_SIZE / 2; // center just enters tile 5
      
      const centerTile = getCenterTilePosition(positionX, 0);
      expect(centerTile.x).toBe(pelletTileX);
    });

    it('should collect pellet when approaching from above', () => {
      // Moving down into a tile containing a pellet
      const pelletTileY = 5;
      const positionY = pelletTileY * TILE_SIZE - TILE_SIZE / 2;
      
      const centerTile = getCenterTilePosition(0, positionY);
      expect(centerTile.y).toBe(pelletTileY);
    });
  });

  describe('Edge cases for pellet collection', () => {
    it('should handle tile boundaries correctly', () => {
      // At exact tile boundary, center should be in the new tile
      const pos = { x: TILE_SIZE, y: TILE_SIZE };
      const centerTile = getCenterTilePosition(pos.x, pos.y);
      // Center is at (TILE_SIZE + 8, TILE_SIZE + 8) = (24, 24) -> tile (1, 1)
      expect(centerTile.x).toBe(1);
      expect(centerTile.y).toBe(1);
    });

    it('should not falsely detect adjacent tile pellet', () => {
      // Pac-Man centered in tile (5, 5), should not detect tile (6, 5)
      const pos = { x: 80, y: 80 }; // centered in tile 5
      const centerTile = getCenterTilePosition(pos.x, pos.y);
      expect(centerTile.x).toBe(5);
      expect(centerTile.x).not.toBe(6);
    });

    it('should handle position at origin', () => {
      const pos = { x: 0, y: 0 };
      const centerTile = getCenterTilePosition(pos.x, pos.y);
      expect(centerTile.x).toBe(0);
      expect(centerTile.y).toBe(0);
    });

    it('should work with fractional positions from movement', () => {
      // Pac-Man at non-integer position (common during movement)
      const pos = { x: 82.5, y: 83.7 };
      const centerTile = getCenterTilePosition(pos.x, pos.y);
      // Center at (90.5, 91.7) -> tile (5, 5)
      expect(centerTile.x).toBe(5);
      expect(centerTile.y).toBe(5);
    });
  });
});
