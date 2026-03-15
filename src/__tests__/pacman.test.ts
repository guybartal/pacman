import { describe, it, expect, beforeEach } from 'vitest';
import { Pacman } from '../entities/Pacman';
import { Direction } from '../core/types';
import { CONFIG } from '../core/config';

describe('Pacman', () => {
  let pacman: Pacman;
  
  beforeEach(() => {
    pacman = new Pacman(100, 100);
  });
  
  it('should start at the given position', () => {
    expect(pacman.position.x).toBe(100);
    expect(pacman.position.y).toBe(100);
  });
  
  it('should start with NONE direction', () => {
    expect(pacman.direction).toBe(Direction.NONE);
  });
  
  it('should change direction when setDirection is called', () => {
    pacman.setDirection(Direction.RIGHT);
    expect(pacman.direction).toBe(Direction.RIGHT);
  });
  
  it('should not move with NONE direction', () => {
    const deltaTime = CONFIG.FRAME_TIME;
    pacman.update(deltaTime);
    expect(pacman.position.x).toBe(100);
    expect(pacman.position.y).toBe(100);
  });
  
  it('should move right when direction is RIGHT', () => {
    pacman.setDirection(Direction.RIGHT);
    const deltaTime = CONFIG.FRAME_TIME;
    pacman.update(deltaTime);
    expect(pacman.position.x).toBeGreaterThan(100);
    expect(pacman.position.y).toBe(100);
  });
  
  it('should move left when direction is LEFT', () => {
    pacman.setDirection(Direction.LEFT);
    const deltaTime = CONFIG.FRAME_TIME;
    pacman.update(deltaTime);
    expect(pacman.position.x).toBeLessThan(100);
    expect(pacman.position.y).toBe(100);
  });
  
  it('should move up when direction is UP', () => {
    pacman.setDirection(Direction.UP);
    const deltaTime = CONFIG.FRAME_TIME;
    pacman.update(deltaTime);
    expect(pacman.position.x).toBe(100);
    expect(pacman.position.y).toBeLessThan(100);
  });
  
  it('should move down when direction is DOWN', () => {
    pacman.setDirection(Direction.DOWN);
    const deltaTime = CONFIG.FRAME_TIME;
    pacman.update(deltaTime);
    expect(pacman.position.x).toBe(100);
    expect(pacman.position.y).toBeGreaterThan(100);
  });
  
  it('should move correct distance per frame', () => {
    pacman.setDirection(Direction.RIGHT);
    const deltaTime = CONFIG.FRAME_TIME;
    const expectedDistance = (CONFIG.PACMAN_SPEED * deltaTime) / 1000;
    
    pacman.update(deltaTime);
    
    expect(pacman.position.x).toBeCloseTo(100 + expectedDistance);
  });
  
  it('should accumulate movement over multiple frames', () => {
    pacman.setDirection(Direction.RIGHT);
    const deltaTime = CONFIG.FRAME_TIME;
    const expectedDistance = (CONFIG.PACMAN_SPEED * deltaTime) / 1000;
    
    pacman.update(deltaTime);
    pacman.update(deltaTime);
    pacman.update(deltaTime);
    
    expect(pacman.position.x).toBeCloseTo(100 + expectedDistance * 3);
  });
});
