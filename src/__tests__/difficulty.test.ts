/**
 * Difficulty settings tests
 * Validates that difficulty configurations have correct and distinct values.
 */
import { describe, it, expect } from 'vitest';
import { DIFFICULTY_SETTINGS } from '../core/config';
import { Difficulty } from '../core/types';

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
