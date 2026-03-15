import { describe, it, expect } from 'vitest';
import { Direction } from '../core/types';
import { CONFIG } from '../core/config';

// Inline implementation of the movement logic
function getVelocity(direction: Direction) {
  switch (direction) {
    case Direction.UP:    return { x: 0, y: -1 };
    case Direction.DOWN:  return { x: 0, y: 1 };
    case Direction.LEFT:  return { x: -1, y: 0 };
    case Direction.RIGHT: return { x: 1, y: 0 };
    default:              return { x: 0, y: 0 };
  }
}

function move(position: { x: number, y: number }, direction: Direction, speed: number, deltaTime: number) {
  const velocity = getVelocity(direction);
  const distance = (speed * deltaTime) / 1000;
  return {
    x: position.x + velocity.x * distance,
    y: position.y + velocity.y * distance
  };
}

describe('Movement Logic', () => {
  const speed = CONFIG.PACMAN_SPEED;
  const deltaTime = CONFIG.FRAME_TIME;
  
  it('should not move with NONE direction', () => {
    const pos = { x: 100, y: 100 };
    const newPos = move(pos, Direction.NONE, speed, deltaTime);
    expect(newPos.x).toBe(100);
    expect(newPos.y).toBe(100);
  });
  
  it('should move right with RIGHT direction', () => {
    const pos = { x: 100, y: 100 };
    const newPos = move(pos, Direction.RIGHT, speed, deltaTime);
    expect(newPos.x).toBeGreaterThan(100);
    expect(newPos.y).toBe(100);
  });
  
  it('should move left with LEFT direction', () => {
    const pos = { x: 100, y: 100 };
    const newPos = move(pos, Direction.LEFT, speed, deltaTime);
    expect(newPos.x).toBeLessThan(100);
    expect(newPos.y).toBe(100);
  });
  
  it('should move up with UP direction', () => {
    const pos = { x: 100, y: 100 };
    const newPos = move(pos, Direction.UP, speed, deltaTime);
    expect(newPos.x).toBe(100);
    expect(newPos.y).toBeLessThan(100);
  });
  
  it('should move down with DOWN direction', () => {
    const pos = { x: 100, y: 100 };
    const newPos = move(pos, Direction.DOWN, speed, deltaTime);
    expect(newPos.x).toBe(100);
    expect(newPos.y).toBeGreaterThan(100);
  });
  
  it('should move correct distance per frame', () => {
    const pos = { x: 0, y: 0 };
    const newPos = move(pos, Direction.RIGHT, speed, deltaTime);
    const expectedDistance = (speed * deltaTime) / 1000;
    expect(newPos.x).toBeCloseTo(expectedDistance);
  });
});
