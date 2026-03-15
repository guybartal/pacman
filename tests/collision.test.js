/**
 * Collision detection tests
 * 
 * Clyde's testing philosophy: The edge cases are where bugs live.
 * What happens at boundaries? What about pixel-perfect collisions?
 */

import { describe, it, expect } from 'vitest';
import { 
  TILE_SIZE,
  checkWallCollision,
  checkDotCollision,
  checkBoundary
} from '../src/collision.js';

// Test maze layout:
// 1 = wall, 0 = path
// ┌───┬───┐
// │   │   │
// │ ┌─┴─┐ │
// │ │   │ │
// └─┴───┴─┘
const testMaze = [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1]
];

describe('Wall Collision', () => {
  describe('basic wall detection', () => {
    it('should detect collision with wall tile', () => {
      // Top-left corner is a wall
      expect(checkWallCollision(0, 0, testMaze)).toBe(true);
    });

    it('should not detect collision on open path', () => {
      // Position (1,1) in tiles = (16,16) in pixels is open
      expect(checkWallCollision(TILE_SIZE, TILE_SIZE, testMaze)).toBe(false);
    });

    it('should detect center wall', () => {
      // Position (2,1) is a wall
      expect(checkWallCollision(TILE_SIZE * 2, TILE_SIZE, testMaze)).toBe(true);
    });
  });

  describe('boundary edge cases', () => {
    it('should treat negative X as wall (out of bounds)', () => {
      expect(checkWallCollision(-1, TILE_SIZE, testMaze)).toBe(true);
    });

    it('should treat negative Y as wall (out of bounds)', () => {
      expect(checkWallCollision(TILE_SIZE, -1, testMaze)).toBe(true);
    });

    it('should treat position beyond maze width as wall', () => {
      const beyondWidth = testMaze[0].length * TILE_SIZE + 10;
      expect(checkWallCollision(beyondWidth, TILE_SIZE, testMaze)).toBe(true);
    });

    it('should treat position beyond maze height as wall', () => {
      const beyondHeight = testMaze.length * TILE_SIZE + 10;
      expect(checkWallCollision(TILE_SIZE, beyondHeight, testMaze)).toBe(true);
    });
  });

  describe('sub-tile positions (between grid lines)', () => {
    it('should check tile at floor of position', () => {
      // Position 17 pixels = tile 1 (floor(17/16) = 1)
      // Tile (1,1) is open
      expect(checkWallCollision(17, TILE_SIZE, testMaze)).toBe(false);
    });

    it('should detect wall when any part of player in wall tile', () => {
      // Position just inside tile (2,1) which is a wall
      expect(checkWallCollision(TILE_SIZE * 2 + 1, TILE_SIZE, testMaze)).toBe(true);
    });

    it('should handle position at exact tile boundary', () => {
      // Exactly at tile (1,1) boundary
      expect(checkWallCollision(TILE_SIZE, TILE_SIZE, testMaze)).toBe(false);
    });
  });

  describe('corner cases (literally)', () => {
    it('should detect all four outer corners as walls', () => {
      const width = testMaze[0].length * TILE_SIZE;
      const height = testMaze.length * TILE_SIZE;
      
      expect(checkWallCollision(0, 0, testMaze)).toBe(true); // top-left
      expect(checkWallCollision(width - 1, 0, testMaze)).toBe(true); // top-right
      expect(checkWallCollision(0, height - 1, testMaze)).toBe(true); // bottom-left
      expect(checkWallCollision(width - 1, height - 1, testMaze)).toBe(true); // bottom-right
    });

    it('should handle L-shaped corridor navigation', () => {
      // Path from (1,1) -> (1,2) -> (2,2) -> (3,2) -> (3,1) should all be open
      expect(checkWallCollision(TILE_SIZE, TILE_SIZE, testMaze)).toBe(false);
      expect(checkWallCollision(TILE_SIZE, TILE_SIZE * 2, testMaze)).toBe(false);
      expect(checkWallCollision(TILE_SIZE * 2, TILE_SIZE * 2, testMaze)).toBe(false);
      expect(checkWallCollision(TILE_SIZE * 3, TILE_SIZE * 2, testMaze)).toBe(false);
      expect(checkWallCollision(TILE_SIZE * 3, TILE_SIZE, testMaze)).toBe(false);
    });
  });
});

describe('Dot Collision', () => {
  const testDots = [
    { x: 24, y: 24 },   // Dot at tile (1.5, 1.5)
    { x: 56, y: 24 },   // Dot at tile (3.5, 1.5)
    { x: 40, y: 40 }    // Dot at center
  ];

  describe('basic dot pickup', () => {
    it('should detect collision when player touches dot', () => {
      const index = checkDotCollision(24, 24, testDots);
      expect(index).toBe(0);
    });

    it('should return -1 when no dot nearby', () => {
      const index = checkDotCollision(100, 100, testDots);
      expect(index).toBe(-1);
    });

    it('should return correct index for different dots', () => {
      expect(checkDotCollision(56, 24, testDots)).toBe(1);
      expect(checkDotCollision(40, 40, testDots)).toBe(2);
    });
  });

  describe('collision radius edge cases', () => {
    it('should detect dot at edge of default collision radius', () => {
      // Default radius is TILE_SIZE/2 = 8
      // Dot at (24, 24), player at (24 + 7, 24) = distance 7, should collide
      expect(checkDotCollision(31, 24, testDots)).toBe(0);
    });

    it('should not detect dot just outside collision radius', () => {
      // Player at (24 + 9, 24) = distance 9, outside radius 8
      expect(checkDotCollision(33, 24, testDots)).toBe(-1);
    });

    it('should work with custom collision radius', () => {
      // With radius 4, distance of 7 should NOT collide
      expect(checkDotCollision(31, 24, testDots, 4)).toBe(-1);
      // With radius 4, distance of 3 should collide
      expect(checkDotCollision(27, 24, testDots, 4)).toBe(0);
    });

    it('should handle diagonal approach', () => {
      // Diagonal distance: sqrt(5^2 + 5^2) = ~7.07, within radius 8
      expect(checkDotCollision(29, 29, testDots)).toBe(0);
    });
  });

  describe('empty dot array', () => {
    it('should return -1 for empty dot array', () => {
      expect(checkDotCollision(24, 24, [])).toBe(-1);
    });
  });

  describe('multiple dots close together', () => {
    it('should return first matching dot (order matters)', () => {
      const closeDots = [
        { x: 20, y: 20 },
        { x: 22, y: 22 }  // Both within collision range of (20, 20)
      ];
      // Should return 0 since it's checked first
      expect(checkDotCollision(20, 20, closeDots)).toBe(0);
    });
  });
});

describe('Boundary Detection', () => {
  const mazeWidth = 224;  // Standard Pac-Man width
  const mazeHeight = 288; // Standard Pac-Man height

  describe('basic boundary detection', () => {
    it('should detect left boundary', () => {
      const result = checkBoundary(0, 100, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(true);
      expect(result.side).toBe('left');
    });

    it('should detect right boundary', () => {
      const result = checkBoundary(mazeWidth, 100, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(true);
      expect(result.side).toBe('right');
    });

    it('should detect top boundary', () => {
      const result = checkBoundary(100, 0, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(true);
      expect(result.side).toBe('top');
    });

    it('should detect bottom boundary', () => {
      const result = checkBoundary(100, mazeHeight, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(true);
      expect(result.side).toBe('bottom');
    });

    it('should not flag interior positions', () => {
      const result = checkBoundary(112, 144, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(false);
      expect(result.side).toBe(null);
    });
  });

  describe('corner boundaries', () => {
    it('should prioritize left over top at top-left corner', () => {
      const result = checkBoundary(0, 0, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(true);
      expect(result.side).toBe('left'); // Due to check order
    });

    it('should prioritize right over bottom at bottom-right corner', () => {
      const result = checkBoundary(mazeWidth, mazeHeight, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(true);
      expect(result.side).toBe('right');
    });
  });

  describe('negative positions', () => {
    it('should detect negative X as left boundary', () => {
      const result = checkBoundary(-10, 100, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(true);
      expect(result.side).toBe('left');
    });

    it('should detect negative Y as top boundary', () => {
      const result = checkBoundary(100, -10, mazeWidth, mazeHeight);
      expect(result.atBoundary).toBe(true);
      expect(result.side).toBe('top');
    });
  });
});
