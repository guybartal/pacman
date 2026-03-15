/**
 * Player movement tests
 * 
 * Key edge cases:
 * - Can you change direction mid-tile? (No - must be grid aligned)
 * - What if you buffer a direction change?
 * - Tunnel wrapping - exact pixel positions matter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPlayer,
  isGridAligned,
  getTilePosition,
  changeDirection,
  movePlayer,
  handleTunnelWrap
} from '../src/player.js';
import { TILE_SIZE } from '../src/collision.js';

// Simple test maze
const testMaze = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

describe('Player Creation', () => {
  it('should create player at specified position', () => {
    const player = createPlayer(100, 200);
    expect(player.x).toBe(100);
    expect(player.y).toBe(200);
  });

  it('should initialize with no direction', () => {
    const player = createPlayer(100, 200);
    expect(player.direction).toBe('none');
    expect(player.nextDirection).toBe('none');
  });

  it('should have default speed', () => {
    const player = createPlayer(100, 200);
    expect(player.speed).toBe(2);
  });
});

describe('Grid Alignment', () => {
  describe('alignment detection', () => {
    it('should detect grid-aligned position', () => {
      const player = createPlayer(TILE_SIZE * 2, TILE_SIZE * 3);
      expect(isGridAligned(player)).toBe(true);
    });

    it('should detect non-aligned X position', () => {
      const player = createPlayer(TILE_SIZE * 2 + 5, TILE_SIZE * 3);
      expect(isGridAligned(player)).toBe(false);
    });

    it('should detect non-aligned Y position', () => {
      const player = createPlayer(TILE_SIZE * 2, TILE_SIZE * 3 + 5);
      expect(isGridAligned(player)).toBe(false);
    });

    it('should detect non-aligned both positions', () => {
      const player = createPlayer(TILE_SIZE * 2 + 1, TILE_SIZE * 3 + 1);
      expect(isGridAligned(player)).toBe(false);
    });

    it('should handle position (0, 0) as aligned', () => {
      const player = createPlayer(0, 0);
      expect(isGridAligned(player)).toBe(true);
    });
  });

  describe('tile position calculation', () => {
    it('should return correct tile for grid-aligned position', () => {
      const player = createPlayer(TILE_SIZE * 3, TILE_SIZE * 2);
      const pos = getTilePosition(player);
      expect(pos.tileX).toBe(3);
      expect(pos.tileY).toBe(2);
    });

    it('should floor to nearest tile for non-aligned position', () => {
      const player = createPlayer(TILE_SIZE * 3 + 10, TILE_SIZE * 2 + 15);
      const pos = getTilePosition(player);
      expect(pos.tileX).toBe(3);
      expect(pos.tileY).toBe(2);
    });

    it('should handle origin', () => {
      const player = createPlayer(0, 0);
      const pos = getTilePosition(player);
      expect(pos.tileX).toBe(0);
      expect(pos.tileY).toBe(0);
    });
  });
});

describe('Direction Changes', () => {
  let player;

  beforeEach(() => {
    // Start at an open tile (1, 1) in the maze
    player = createPlayer(TILE_SIZE, TILE_SIZE);
  });

  describe('when grid-aligned', () => {
    it('should allow direction change into open path', () => {
      // Tile (2, 1) is open, so moving right should work
      const success = changeDirection(player, 'right', testMaze);
      expect(success).toBe(true);
      expect(player.direction).toBe('right');
    });

    it('should deny direction change into wall', () => {
      // Tile (0, 1) is wall, so moving left from (1,1) should fail
      // Wait, (0,1) is wall. Let me check - row 1: [1, 0, 0, 0, 0, 0, 1]
      // So tile (0,1) = 1 (wall). Can't go left.
      const success = changeDirection(player, 'left', testMaze);
      expect(success).toBe(false);
      expect(player.direction).toBe('none'); // Unchanged
    });

    it('should deny direction change into wall above', () => {
      // Tile (1, 0) is wall
      const success = changeDirection(player, 'up', testMaze);
      expect(success).toBe(false);
    });

    it('should allow moving down into open path', () => {
      // Tile (1, 2) is open
      const success = changeDirection(player, 'down', testMaze);
      expect(success).toBe(true);
      expect(player.direction).toBe('down');
    });
  });

  describe('when NOT grid-aligned', () => {
    it('should buffer direction change for later', () => {
      player.x = TILE_SIZE + 5; // Not aligned
      const success = changeDirection(player, 'right', testMaze);
      expect(success).toBe(false);
      expect(player.direction).toBe('none');
      expect(player.nextDirection).toBe('right'); // Buffered!
    });

    it('should replace buffered direction', () => {
      player.x = TILE_SIZE + 5;
      changeDirection(player, 'right', testMaze);
      changeDirection(player, 'down', testMaze);
      expect(player.nextDirection).toBe('down');
    });
  });

  describe('invalid directions', () => {
    it('should reject invalid direction string', () => {
      const success = changeDirection(player, 'diagonal', testMaze);
      expect(success).toBe(false);
    });

    it('should reject empty direction', () => {
      const success = changeDirection(player, '', testMaze);
      expect(success).toBe(false);
    });
  });

  describe('boundary direction changes', () => {
    it('should deny moving outside maze bounds', () => {
      // Player at tile (1, 1), trying to move beyond top row
      const success = changeDirection(player, 'up', testMaze);
      expect(success).toBe(false);
    });
  });
});

describe('Player Movement', () => {
  let player;

  beforeEach(() => {
    player = createPlayer(TILE_SIZE, TILE_SIZE);
    player.speed = 2;
  });

  describe('basic movement', () => {
    it('should not move without direction', () => {
      const moved = movePlayer(player, testMaze);
      expect(moved).toBe(false);
      expect(player.x).toBe(TILE_SIZE);
      expect(player.y).toBe(TILE_SIZE);
    });

    it('should move right by speed amount', () => {
      player.direction = 'right';
      movePlayer(player, testMaze);
      expect(player.x).toBe(TILE_SIZE + 2);
    });

    it('should move left by speed amount', () => {
      // Start at tile (2, 1) so we can move left
      player.x = TILE_SIZE * 2;
      player.direction = 'left';
      movePlayer(player, testMaze);
      expect(player.x).toBe(TILE_SIZE * 2 - 2);
    });

    it('should move down by speed amount', () => {
      player.direction = 'down';
      movePlayer(player, testMaze);
      expect(player.y).toBe(TILE_SIZE + 2);
    });

    it('should move up by speed amount', () => {
      // Start at tile (1, 2) so we can move up
      player.y = TILE_SIZE * 2;
      player.direction = 'up';
      movePlayer(player, testMaze);
      expect(player.y).toBe(TILE_SIZE * 2 - 2);
    });
  });

  describe('wall collision during movement', () => {
    it('should stop when hitting wall', () => {
      // At tile (1, 1), moving left would hit wall at tile (0, 1)
      player.direction = 'left';
      const moved = movePlayer(player, testMaze);
      expect(moved).toBe(false);
      expect(player.x).toBe(TILE_SIZE); // Unchanged
    });

    it('should allow movement until wall', () => {
      // Move right from (1,1) until we reach the wall
      player.direction = 'right';
      player.x = TILE_SIZE;
      
      // Should be able to move through open tiles
      const moved = movePlayer(player, testMaze);
      expect(moved).toBe(true);
    });
  });

  describe('speed variations', () => {
    it('should respect custom speed', () => {
      player.speed = 4;
      player.direction = 'right';
      movePlayer(player, testMaze);
      expect(player.x).toBe(TILE_SIZE + 4);
    });

    it('should handle speed of 1', () => {
      player.speed = 1;
      player.direction = 'right';
      movePlayer(player, testMaze);
      expect(player.x).toBe(TILE_SIZE + 1);
    });
  });
});

describe('Tunnel Wrapping', () => {
  const mazeWidth = TILE_SIZE * 7; // 112 pixels for our 7-wide maze

  describe('wrap from left to right', () => {
    it('should wrap when X goes negative', () => {
      const player = createPlayer(-1, TILE_SIZE);
      const wrapped = handleTunnelWrap(player, mazeWidth);
      expect(wrapped).toBe(true);
      expect(player.x).toBe(mazeWidth - TILE_SIZE);
    });

    it('should wrap at exactly 0', () => {
      // Position 0 is still valid, but -1 wraps
      const player = createPlayer(0, TILE_SIZE);
      const wrapped = handleTunnelWrap(player, mazeWidth);
      expect(wrapped).toBe(false);
    });
  });

  describe('wrap from right to left', () => {
    it('should wrap when X exceeds maze width', () => {
      const player = createPlayer(mazeWidth, TILE_SIZE);
      const wrapped = handleTunnelWrap(player, mazeWidth);
      expect(wrapped).toBe(true);
      expect(player.x).toBe(0);
    });

    it('should not wrap at width - 1', () => {
      const player = createPlayer(mazeWidth - 1, TILE_SIZE);
      const wrapped = handleTunnelWrap(player, mazeWidth);
      expect(wrapped).toBe(false);
    });
  });

  describe('Y position preservation', () => {
    it('should preserve Y position during horizontal wrap', () => {
      const player = createPlayer(-1, TILE_SIZE * 2);
      handleTunnelWrap(player, mazeWidth);
      expect(player.y).toBe(TILE_SIZE * 2);
    });
  });

  describe('no vertical wrapping', () => {
    it('should not wrap vertically', () => {
      // handleTunnelWrap only handles X axis (horizontal tunnels)
      const player = createPlayer(TILE_SIZE, -1);
      const wrapped = handleTunnelWrap(player, mazeWidth);
      expect(wrapped).toBe(false);
      expect(player.y).toBe(-1); // Unchanged
    });
  });
});

describe('Edge Case: Between Grid Positions', () => {
  it('player between tiles should not be able to change direction', () => {
    // This is crucial for Pac-Man feel - you can only turn at intersections
    const player = createPlayer(TILE_SIZE + 8, TILE_SIZE);
    const success = changeDirection(player, 'down', testMaze);
    expect(success).toBe(false);
    expect(player.nextDirection).toBe('down'); // Should buffer
  });

  it('should handle player at exactly half-tile offset', () => {
    const player = createPlayer(TILE_SIZE + TILE_SIZE/2, TILE_SIZE);
    expect(isGridAligned(player)).toBe(false);
  });
});

describe('Edge Case: Rapid Direction Changes', () => {
  it('should allow 180-degree turn when aligned', () => {
    const player = createPlayer(TILE_SIZE * 2, TILE_SIZE);
    player.direction = 'right';
    
    // Try to turn around
    const success = changeDirection(player, 'left', testMaze);
    expect(success).toBe(true);
    expect(player.direction).toBe('left');
  });
});

describe('Edge Case: Corner Navigation', () => {
  it('should buffer direction for corner turn', () => {
    // Player moving right, wants to turn down at next intersection
    const player = createPlayer(TILE_SIZE + 5, TILE_SIZE);
    player.direction = 'right';
    
    changeDirection(player, 'down', testMaze);
    expect(player.nextDirection).toBe('down');
    expect(player.direction).toBe('right'); // Still moving right
  });
});
