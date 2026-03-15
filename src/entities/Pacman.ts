/**
 * Pac-Man entity
 */
import { BaseEntity } from './BaseEntity';
import { Direction, TileType } from '../core/types';
import { CONFIG } from '../core/config';

export class Pacman extends BaseEntity {
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private mouthOpen: boolean = true;
  private grid: number[][] | null = null;
  
  constructor(x: number, y: number) {
    super(x, y, CONFIG.PACMAN_SPEED);
  }
  
  setGrid(grid: number[][]): void {
    this.grid = grid;
  }
  
  update(deltaTime: number): void {
    this.moveWithCollision(deltaTime);
    this.updateAnimation(deltaTime);
  }
  
  private moveWithCollision(deltaTime: number): void {
    if (this.direction === Direction.NONE || !this.grid) {
      return;
    }
    
    const velocity = this.getDirectionVelocity();
    const distance = (this.speed * deltaTime) / 1000;
    
    const newX = this.position.x + velocity.x * distance;
    const newY = this.position.y + velocity.y * distance;
    
    // Check if the new position would collide with a wall
    if (!this.wouldCollideWithWall(newX, newY)) {
      this.position.x = newX;
      this.position.y = newY;
    }
  }
  
  private getDirectionVelocity(): { x: number; y: number } {
    switch (this.direction) {
      case Direction.UP:    return { x: 0, y: -1 };
      case Direction.DOWN:  return { x: 0, y: 1 };
      case Direction.LEFT:  return { x: -1, y: 0 };
      case Direction.RIGHT: return { x: 1, y: 0 };
      default:              return { x: 0, y: 0 };
    }
  }
  
  private wouldCollideWithWall(x: number, y: number): boolean {
    if (!this.grid) return false;
    
    // Check all four corners of Pac-Man's bounding box (slightly inset for better feel)
    const margin = 2;
    const size = CONFIG.TILE_SIZE - margin * 2;
    
    const corners = [
      { x: x + margin, y: y + margin },                 // top-left
      { x: x + margin + size, y: y + margin },          // top-right
      { x: x + margin, y: y + margin + size },          // bottom-left
      { x: x + margin + size, y: y + margin + size },   // bottom-right
    ];
    
    for (const corner of corners) {
      const tileX = Math.floor(corner.x / CONFIG.TILE_SIZE);
      const tileY = Math.floor(corner.y / CONFIG.TILE_SIZE);
      
      // Out of bounds check
      if (tileY < 0 || tileY >= this.grid.length || tileX < 0 || tileX >= this.grid[0].length) {
        continue; // Allow movement in tunnel areas (out of bounds)
      }
      
      const tileValue = this.grid[tileY][tileX];
      if (tileValue === TileType.WALL) {
        return true;
      }
    }
    
    return false;
  }
  
  private updateAnimation(deltaTime: number): void {
    this.animationTimer += deltaTime;
    if (this.animationTimer >= 100) {
      this.animationTimer = 0;
      this.mouthOpen = !this.mouthOpen;
      this.animationFrame = (this.animationFrame + 1) % 3;
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x + 8, this.position.y + 8);
    
    // Rotate based on direction
    const rotation = this.getRotation();
    ctx.rotate(rotation);
    
    // Draw Pac-Man
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    const mouthAngle = this.mouthOpen ? 0.25 : 0.05;
    ctx.arc(0, 0, 7, Math.PI * mouthAngle, Math.PI * (2 - mouthAngle));
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
  
  private getRotation(): number {
    switch (this.direction) {
      case Direction.UP:    return -Math.PI / 2;
      case Direction.DOWN:  return Math.PI / 2;
      case Direction.LEFT:  return Math.PI;
      case Direction.RIGHT: return 0;
      default:              return 0;
    }
  }
  
  setDirection(direction: Direction): void {
    this.direction = direction;
  }
}
