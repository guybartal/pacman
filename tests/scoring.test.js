/**
 * Scoring system tests
 * 
 * Edge cases to consider:
 * - Score overflow (unlikely but let's be paranoid)
 * - Ghost combo multipliers
 * - State consistency
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  POINTS,
  createScoreTracker,
  eatDot,
  eatPowerPellet,
  eatGhost,
  resetGhostCombo,
  getScore
} from '../src/scoring.js';

describe('Score Tracker Creation', () => {
  it('should start with zero score', () => {
    const tracker = createScoreTracker();
    expect(tracker.score).toBe(0);
  });

  it('should start with zero dots eaten', () => {
    const tracker = createScoreTracker();
    expect(tracker.dotsEaten).toBe(0);
  });

  it('should start with zero power pellets eaten', () => {
    const tracker = createScoreTracker();
    expect(tracker.powerPelletsEaten).toBe(0);
  });

  it('should start with ghost combo at zero', () => {
    const tracker = createScoreTracker();
    expect(tracker.ghostCombo).toBe(0);
  });
});

describe('Dot Scoring', () => {
  let tracker;

  beforeEach(() => {
    tracker = createScoreTracker();
  });

  it('should award 10 points for eating a dot', () => {
    const points = eatDot(tracker);
    expect(points).toBe(POINTS.DOT);
    expect(getScore(tracker)).toBe(10);
  });

  it('should increment dots eaten counter', () => {
    eatDot(tracker);
    expect(tracker.dotsEaten).toBe(1);
  });

  it('should accumulate points for multiple dots', () => {
    eatDot(tracker);
    eatDot(tracker);
    eatDot(tracker);
    expect(getScore(tracker)).toBe(30);
    expect(tracker.dotsEaten).toBe(3);
  });

  it('should handle eating many dots (240 dots in original Pac-Man)', () => {
    for (let i = 0; i < 240; i++) {
      eatDot(tracker);
    }
    expect(getScore(tracker)).toBe(2400);
    expect(tracker.dotsEaten).toBe(240);
  });
});

describe('Power Pellet Scoring', () => {
  let tracker;

  beforeEach(() => {
    tracker = createScoreTracker();
  });

  it('should award 50 points for eating a power pellet', () => {
    const points = eatPowerPellet(tracker);
    expect(points).toBe(POINTS.POWER_PELLET);
    expect(getScore(tracker)).toBe(50);
  });

  it('should increment power pellets eaten counter', () => {
    eatPowerPellet(tracker);
    expect(tracker.powerPelletsEaten).toBe(1);
  });

  it('should reset ghost combo when eating power pellet', () => {
    // Build up a ghost combo
    eatPowerPellet(tracker);
    eatGhost(tracker);
    eatGhost(tracker);
    expect(tracker.ghostCombo).toBe(2);
    
    // Eat another power pellet - combo should reset
    eatPowerPellet(tracker);
    expect(tracker.ghostCombo).toBe(0);
  });

  it('should handle all 4 power pellets', () => {
    for (let i = 0; i < 4; i++) {
      eatPowerPellet(tracker);
    }
    expect(getScore(tracker)).toBe(200);
    expect(tracker.powerPelletsEaten).toBe(4);
  });
});

describe('Ghost Scoring', () => {
  let tracker;

  beforeEach(() => {
    tracker = createScoreTracker();
    eatPowerPellet(tracker); // Need to eat power pellet first
  });

  describe('ghost combo multiplier', () => {
    it('should award 200 points for first ghost', () => {
      const points = eatGhost(tracker);
      expect(points).toBe(200);
    });

    it('should award 400 points for second ghost (2x)', () => {
      eatGhost(tracker); // 200
      const points = eatGhost(tracker);
      expect(points).toBe(400);
    });

    it('should award 800 points for third ghost (4x)', () => {
      eatGhost(tracker);
      eatGhost(tracker);
      const points = eatGhost(tracker);
      expect(points).toBe(800);
    });

    it('should award 1600 points for fourth ghost (8x)', () => {
      eatGhost(tracker);
      eatGhost(tracker);
      eatGhost(tracker);
      const points = eatGhost(tracker);
      expect(points).toBe(1600);
    });

    it('should handle all 4 ghosts in sequence correctly', () => {
      // Total: 200 + 400 + 800 + 1600 = 3000 (plus 50 for power pellet)
      eatGhost(tracker);
      eatGhost(tracker);
      eatGhost(tracker);
      eatGhost(tracker);
      expect(getScore(tracker)).toBe(50 + 200 + 400 + 800 + 1600);
    });
  });

  describe('ghost combo reset', () => {
    it('should reset combo with resetGhostCombo', () => {
      eatGhost(tracker);
      eatGhost(tracker);
      expect(tracker.ghostCombo).toBe(2);
      
      resetGhostCombo(tracker);
      expect(tracker.ghostCombo).toBe(0);
    });

    it('should start fresh combo after reset', () => {
      eatGhost(tracker);
      eatGhost(tracker);
      resetGhostCombo(tracker);
      
      const points = eatGhost(tracker);
      expect(points).toBe(200); // Back to base
    });
  });
});

describe('Score Accumulation', () => {
  it('should correctly accumulate mixed scoring events', () => {
    const tracker = createScoreTracker();
    
    // Simulate typical gameplay
    eatDot(tracker);        // 10
    eatDot(tracker);        // 10
    eatDot(tracker);        // 10
    eatPowerPellet(tracker); // 50
    eatGhost(tracker);      // 200
    eatGhost(tracker);      // 400
    eatDot(tracker);        // 10
    eatDot(tracker);        // 10
    
    expect(getScore(tracker)).toBe(700);
    expect(tracker.dotsEaten).toBe(5);
    expect(tracker.powerPelletsEaten).toBe(1);
    expect(tracker.ghostCombo).toBe(2);
  });

  it('should maintain correct state after complex sequence', () => {
    const tracker = createScoreTracker();
    
    // First power pellet phase
    eatPowerPellet(tracker);
    eatGhost(tracker);
    eatGhost(tracker);
    
    // Eat more dots
    for (let i = 0; i < 50; i++) {
      eatDot(tracker);
    }
    
    // Second power pellet phase
    eatPowerPellet(tracker);
    eatGhost(tracker);
    eatGhost(tracker);
    eatGhost(tracker);
    eatGhost(tracker);
    
    const expectedScore = 
      50 +            // First power pellet
      200 + 400 +     // First ghost sequence
      500 +           // 50 dots
      50 +            // Second power pellet
      200 + 400 + 800 + 1600; // Second ghost sequence (reset to base)
    
    expect(getScore(tracker)).toBe(expectedScore);
  });
});

describe('Point Constants', () => {
  it('should have correct point values', () => {
    expect(POINTS.DOT).toBe(10);
    expect(POINTS.POWER_PELLET).toBe(50);
    expect(POINTS.GHOST_BASE).toBe(200);
  });
});

describe('Edge Cases', () => {
  it('should handle eating ghosts without power pellet (theoretical)', () => {
    // In the real game this wouldn't happen, but the code should handle it
    const tracker = createScoreTracker();
    const points = eatGhost(tracker);
    expect(points).toBe(200); // Still works, just combo = 0 initially
  });

  it('should handle very high scores (full game simulation)', () => {
    const tracker = createScoreTracker();
    
    // Simulate a "perfect" game scenario
    // 240 dots (2400 points)
    for (let i = 0; i < 240; i++) {
      eatDot(tracker);
    }
    
    // 4 power pellets with all 4 ghosts each time
    // 4 * (50 + 200 + 400 + 800 + 1600) = 4 * 3050 = 12200
    for (let level = 0; level < 4; level++) {
      eatPowerPellet(tracker);
      eatGhost(tracker);
      eatGhost(tracker);
      eatGhost(tracker);
      eatGhost(tracker);
    }
    
    expect(getScore(tracker)).toBe(2400 + 12200);
    expect(tracker.dotsEaten).toBe(240);
    expect(tracker.powerPelletsEaten).toBe(4);
  });

  it('should handle multiple resets in a row', () => {
    const tracker = createScoreTracker();
    resetGhostCombo(tracker);
    resetGhostCombo(tracker);
    resetGhostCombo(tracker);
    expect(tracker.ghostCombo).toBe(0);
  });

  it('should return current score via getter', () => {
    const tracker = createScoreTracker();
    tracker.score = 999;
    expect(getScore(tracker)).toBe(999);
  });
});
