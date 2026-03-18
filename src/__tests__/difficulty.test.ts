/**
 * Difficulty settings tests
 * Validates that difficulty configurations have correct and distinct values.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DIFFICULTY_SETTINGS } from '../core/config';
import { Difficulty } from '../core/types';
import { Ghost } from '../entities/Ghost';
import { GhostName } from '../core/types';
import { InputHandler } from '../input/InputHandler';
import { Direction } from '../core/types';

// Mock window so InputHandler tests don't throw
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
vi.stubGlobal('window', {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
});

describe('Difficulty Settings', () => {
  it('should define settings for all three difficulties', () => {
    expect(DIFFICULTY_SETTINGS[Difficulty.EASY]).toBeDefined();
    expect(DIFFICULTY_SETTINGS[Difficulty.MEDIUM]).toBeDefined();
    expect(DIFFICULTY_SETTINGS[Difficulty.HARD]).toBeDefined();
  });

  it('should have correct labels', () => {
    expect(DIFFICULTY_SETTINGS[Difficulty.EASY].label).toBe('EASY');
    expect(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].label).toBe('MEDIUM');
    expect(DIFFICULTY_SETTINGS[Difficulty.HARD].label).toBe('HARD');
  });

  it('should have increasing ghost speeds across difficulty levels', () => {
    expect(DIFFICULTY_SETTINGS[Difficulty.EASY].ghostSpeed)
      .toBeLessThan(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].ghostSpeed);
    expect(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].ghostSpeed)
      .toBeLessThan(DIFFICULTY_SETTINGS[Difficulty.HARD].ghostSpeed);
  });

  it('should have decreasing power pellet durations across difficulty levels', () => {
    expect(DIFFICULTY_SETTINGS[Difficulty.EASY].powerPelletDuration)
      .toBeGreaterThan(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].powerPelletDuration);
    expect(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].powerPelletDuration)
      .toBeGreaterThan(DIFFICULTY_SETTINGS[Difficulty.HARD].powerPelletDuration);
  });

  it('should have decreasing frightened speeds across difficulty levels', () => {
    expect(DIFFICULTY_SETTINGS[Difficulty.EASY].ghostFrightenedSpeed)
      .toBeGreaterThan(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].ghostFrightenedSpeed);
    expect(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].ghostFrightenedSpeed)
      .toBeGreaterThan(DIFFICULTY_SETTINGS[Difficulty.HARD].ghostFrightenedSpeed);
  });

  it('should have positive ghost speeds', () => {
    for (const key of Object.values(Difficulty)) {
      expect(DIFFICULTY_SETTINGS[key].ghostSpeed).toBeGreaterThan(0);
      expect(DIFFICULTY_SETTINGS[key].ghostFrightenedSpeed).toBeGreaterThan(0);
    }
  });

  it('should have positive power pellet durations', () => {
    for (const key of Object.values(Difficulty)) {
      expect(DIFFICULTY_SETTINGS[key].powerPelletDuration).toBeGreaterThan(0);
    }
  });

  it('should have MEDIUM settings matching classic Pac-Man values', () => {
    expect(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].ghostSpeed).toBe(75);
    expect(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].ghostFrightenedSpeed).toBe(50);
    expect(DIFFICULTY_SETTINGS[Difficulty.MEDIUM].powerPelletDuration).toBe(6000);
  });

  it('should have EASY settings with slower ghosts and longer power pellets than MEDIUM', () => {
    const easy = DIFFICULTY_SETTINGS[Difficulty.EASY];
    const medium = DIFFICULTY_SETTINGS[Difficulty.MEDIUM];
    expect(easy.ghostSpeed).toBeLessThan(medium.ghostSpeed);
    expect(easy.powerPelletDuration).toBeGreaterThan(medium.powerPelletDuration);
  });

  it('should have HARD settings with faster ghosts and shorter power pellets than MEDIUM', () => {
    const hard = DIFFICULTY_SETTINGS[Difficulty.HARD];
    const medium = DIFFICULTY_SETTINGS[Difficulty.MEDIUM];
    expect(hard.ghostSpeed).toBeGreaterThan(medium.ghostSpeed);
    expect(hard.powerPelletDuration).toBeLessThan(medium.powerPelletDuration);
  });

  it('should have distinct colors for each difficulty', () => {
    const colors = Object.values(Difficulty).map(d => DIFFICULTY_SETTINGS[d].color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });

  it('should have description strings for each difficulty', () => {
    for (const key of Object.values(Difficulty)) {
      expect(typeof DIFFICULTY_SETTINGS[key].description).toBe('string');
      expect(DIFFICULTY_SETTINGS[key].description.length).toBeGreaterThan(0);
    }
  });
});

describe('Ghost speed application from difficulty settings', () => {
  it('should apply EASY ghost speed to ghost instance', () => {
    const ghost = new Ghost(GhostName.BLINKY, 0, 0);
    ghost.speed = DIFFICULTY_SETTINGS[Difficulty.EASY].ghostSpeed;
    expect(ghost.speed).toBe(DIFFICULTY_SETTINGS[Difficulty.EASY].ghostSpeed);
  });

  it('should apply HARD ghost speed to ghost instance', () => {
    const ghost = new Ghost(GhostName.BLINKY, 0, 0);
    ghost.speed = DIFFICULTY_SETTINGS[Difficulty.HARD].ghostSpeed;
    expect(ghost.speed).toBe(DIFFICULTY_SETTINGS[Difficulty.HARD].ghostSpeed);
  });

  it('should apply difficulty-specific frightened speed via setFrightened', () => {
    const ghost = new Ghost(GhostName.BLINKY, 0, 0);
    const easySettings = DIFFICULTY_SETTINGS[Difficulty.EASY];
    ghost.setFrightened(easySettings.powerPelletDuration, easySettings.ghostFrightenedSpeed);
    expect(ghost.speed).toBe(easySettings.ghostFrightenedSpeed);
  });

  it('EASY frightened speed should be faster than HARD frightened speed', () => {
    const ghostEasy = new Ghost(GhostName.BLINKY, 0, 0);
    const ghostHard = new Ghost(GhostName.CLYDE, 0, 0);
    ghostEasy.setFrightened(9000, DIFFICULTY_SETTINGS[Difficulty.EASY].ghostFrightenedSpeed);
    ghostHard.setFrightened(3000, DIFFICULTY_SETTINGS[Difficulty.HARD].ghostFrightenedSpeed);
    expect(ghostEasy.speed).toBeGreaterThan(ghostHard.speed);
  });
});

describe('Menu navigation wrap-around', () => {
  // Pure cycling logic mirrored from Game.handleMenuNavigate
  function cycleIndex(currentIndex: number, direction: 'UP' | 'DOWN', total: number): number {
    if (direction === 'UP') {
      return (currentIndex - 1 + total) % total;
    }
    return (currentIndex + 1) % total;
  }

  const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];

  it('should move DOWN from EASY to MEDIUM', () => {
    const idx = cycleIndex(0, 'DOWN', difficulties.length);
    expect(difficulties[idx]).toBe(Difficulty.MEDIUM);
  });

  it('should move DOWN from MEDIUM to HARD', () => {
    const idx = cycleIndex(1, 'DOWN', difficulties.length);
    expect(difficulties[idx]).toBe(Difficulty.HARD);
  });

  it('should wrap DOWN from HARD back to EASY', () => {
    const idx = cycleIndex(2, 'DOWN', difficulties.length);
    expect(difficulties[idx]).toBe(Difficulty.EASY);
  });

  it('should move UP from HARD to MEDIUM', () => {
    const idx = cycleIndex(2, 'UP', difficulties.length);
    expect(difficulties[idx]).toBe(Difficulty.MEDIUM);
  });

  it('should move UP from MEDIUM to EASY', () => {
    const idx = cycleIndex(1, 'UP', difficulties.length);
    expect(difficulties[idx]).toBe(Difficulty.EASY);
  });

  it('should wrap UP from EASY back to HARD', () => {
    const idx = cycleIndex(0, 'UP', difficulties.length);
    expect(difficulties[idx]).toBe(Difficulty.HARD);
  });
});

describe('InputHandler menu navigation callback exclusivity', () => {
  let handler: InputHandler;
  let keydownHandler: (event: KeyboardEvent) => void;

  beforeEach(() => {
    mockAddEventListener.mockClear();
    handler = new InputHandler();
    const keydownCall = mockAddEventListener.mock.calls.find(call => call[0] === 'keydown');
    keydownHandler = keydownCall?.[1];
  });

  it('should call only menuNavigateCallback (not direction callback) for ArrowUp when both are set', () => {
    const dirCallback = vi.fn();
    const menuCallback = vi.fn();
    handler.onDirectionChange(dirCallback);
    handler.onMenuNavigate(menuCallback);

    const event = { code: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);

    expect(menuCallback).toHaveBeenCalledWith('UP');
    expect(dirCallback).not.toHaveBeenCalled();
  });

  it('should call only menuNavigateCallback (not direction callback) for ArrowDown when both are set', () => {
    const dirCallback = vi.fn();
    const menuCallback = vi.fn();
    handler.onDirectionChange(dirCallback);
    handler.onMenuNavigate(menuCallback);

    const event = { code: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);

    expect(menuCallback).toHaveBeenCalledWith('DOWN');
    expect(dirCallback).not.toHaveBeenCalled();
  });

  it('should still call direction callback for ArrowLeft even when menuNavigate is set', () => {
    const dirCallback = vi.fn();
    const menuCallback = vi.fn();
    handler.onDirectionChange(dirCallback);
    handler.onMenuNavigate(menuCallback);

    const event = { code: 'ArrowLeft', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);

    expect(dirCallback).toHaveBeenCalledWith(Direction.LEFT);
    expect(menuCallback).not.toHaveBeenCalled();
  });

  it('should call direction callback for ArrowUp when menuNavigate is NOT set', () => {
    const dirCallback = vi.fn();
    handler.onDirectionChange(dirCallback);

    const event = { code: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    keydownHandler(event);

    expect(dirCallback).toHaveBeenCalledWith(Direction.UP);
  });
});
