/**
 * Ghost entity - base class for all ghosts
 */
import { BaseEntity } from './BaseEntity';
import { GhostMode, GhostName, Direction, Vector2 } from '../core/types';
import { CONFIG } from '../core/config';

const GHOST_COLORS: Record<GhostName, string> = {
  [GhostName.BLINKY]: '#FF0000', // Red
  [GhostName.PINKY]: '#FFB8FF',  // Pink
  [GhostName.INKY]: '#00FFFF',   // Cyan
  [GhostName.CLYDE]: '#FFB852',  // Orange
};

export class Ghost extends BaseEntity {
  readonly name: GhostName;
  mode: GhostMode = GhostMode.SCATTER;
  targetTile: Vector2 = { x: 0, y: 0 };
  private frightenedTimer: number = 0;
  
  constructor(name: GhostName, x: number, y: number) {
    super(x, y, CONFIG.GHOST_SPEED);
    this.name = name;
  }
  
  update(deltaTime: number): void {
    if (this.mode === GhostMode.FRIGHTENED) {
      this.frightenedTimer -= deltaTime;
      if (this.frightenedTimer <= 0) {
        this.mode = GhostMode.CHASE;
      }
    }
    
    this.move(deltaTime);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    const color = this.mode === GhostMode.FRIGHTENED 
      ? '#2121DE' 
      : GHOST_COLORS[this.name];
    
    // Ghost body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.position.x + 8, this.position.y + 6, 7, Math.PI, 0);
    ctx.lineTo(this.position.x + 15, this.position.y + 14);
    
    // Wavy bottom
    for (let i = 0; i < 3; i++) {
      const x = this.position.x + 15 - (i * 5);
      ctx.quadraticCurveTo(x - 2.5, this.position.y + 16, x - 5, this.position.y + 14);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Eyes
    if (this.mode !== GhostMode.FRIGHTENED) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(this.position.x + 5, this.position.y + 6, 2.5, 0, Math.PI * 2);
      ctx.arc(this.position.x + 11, this.position.y + 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Pupils
      const pupilOffset = this.getPupilOffset();
      ctx.fillStyle = '#0000FF';
      ctx.beginPath();
      ctx.arc(this.position.x + 5 + pupilOffset.x, this.position.y + 6 + pupilOffset.y, 1, 0, Math.PI * 2);
      ctx.arc(this.position.x + 11 + pupilOffset.x, this.position.y + 6 + pupilOffset.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  private getPupilOffset(): Vector2 {
    switch (this.direction) {
      case Direction.UP:    return { x: 0, y: -1 };
      case Direction.DOWN:  return { x: 0, y: 1 };
      case Direction.LEFT:  return { x: -1, y: 0 };
      case Direction.RIGHT: return { x: 1, y: 0 };
      default:              return { x: 0, y: 0 };
    }
  }
  
  setFrightened(duration: number): void {
    this.mode = GhostMode.FRIGHTENED;
    this.frightenedTimer = duration;
    this.speed = CONFIG.GHOST_FRIGHTENED_SPEED;
  }
  
  setMode(mode: GhostMode): void {
    this.mode = mode;
    this.speed = mode === GhostMode.FRIGHTENED 
      ? CONFIG.GHOST_FRIGHTENED_SPEED 
      : CONFIG.GHOST_SPEED;
  }
}
