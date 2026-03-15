/**
 * Entity base class - all game objects inherit from this
 */
import { Vector2, Direction, Entity, Renderable } from '../core/types';

export abstract class BaseEntity implements Entity, Renderable {
  position: Vector2;
  direction: Direction;
  speed: number;
  
  constructor(x: number, y: number, speed: number) {
    this.position = { x, y };
    this.direction = Direction.NONE;
    this.speed = speed;
  }
  
  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
  
  protected move(deltaTime: number): void {
    const velocity = this.getVelocity();
    const distance = (this.speed * deltaTime) / 1000;
    
    this.position.x += velocity.x * distance;
    this.position.y += velocity.y * distance;
  }
  
  private getVelocity(): Vector2 {
    switch (this.direction) {
      case Direction.UP:    return { x: 0, y: -1 };
      case Direction.DOWN:  return { x: 0, y: 1 };
      case Direction.LEFT:  return { x: -1, y: 0 };
      case Direction.RIGHT: return { x: 1, y: 0 };
      default:              return { x: 0, y: 0 };
    }
  }
  
  getTilePosition(): Vector2 {
    return {
      x: Math.floor(this.position.x / 16),
      y: Math.floor(this.position.y / 16),
    };
  }
}
