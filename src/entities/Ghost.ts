/**
 * Ghost entity - base class for all ghosts
 */
import { BaseEntity } from './BaseEntity';
import { GhostMode, GhostName, Direction, Vector2, TileType } from '../core/types';
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
  private grid: number[][] | null = null;
  
  constructor(name: GhostName, x: number, y: number) {
    super(x, y, CONFIG.GHOST_SPEED);
    this.name = name;
  }
  
  setGrid(grid: number[][]): void {
    this.grid = grid;
  }
  
  update(deltaTime: number): void {
    if (this.mode === GhostMode.FRIGHTENED) {
      this.frightenedTimer -= deltaTime;
      if (this.frightenedTimer <= 0) {
        this.mode = GhostMode.CHASE;
      }
    }
    
    this.chooseDirection();
    this.move(deltaTime);
  }
  
  private chooseDirection(): void {
    if (!this.grid) return;
    
    const currentTile = this.getTilePosition();
    const centerX = currentTile.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    const centerY = currentTile.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    
    // Only recalculate direction when near the center of a tile
    const threshold = 2;
    if (Math.abs(this.position.x + 8 - centerX) > threshold || 
        Math.abs(this.position.y + 8 - centerY) > threshold) {
      return;
    }
    
    const possibleDirections = this.getValidDirections(currentTile);
    if (possibleDirections.length === 0) return;
    
    // Pick the direction that gets closest to target
    let bestDirection = possibleDirections[0];
    let bestDistance = Infinity;
    
    for (const dir of possibleDirections) {
      const nextTile = this.getNextTile(currentTile, dir);
      const distance = this.distanceToTarget(nextTile);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = dir;
      }
    }
    
    this.direction = bestDirection;
  }
  
  private getValidDirections(tile: Vector2): Direction[] {
    const directions: Direction[] = [];
    const opposite = this.getOppositeDirection();
    
    const checks: [Direction, Vector2][] = [
      [Direction.UP, { x: tile.x, y: tile.y - 1 }],
      [Direction.DOWN, { x: tile.x, y: tile.y + 1 }],
      [Direction.LEFT, { x: tile.x - 1, y: tile.y }],
      [Direction.RIGHT, { x: tile.x + 1, y: tile.y }],
    ];
    
    for (const [dir, nextTile] of checks) {
      // Ghosts cannot reverse direction (except when frightened)
      if (dir === opposite && this.mode !== GhostMode.FRIGHTENED) continue;
      if (this.isTileWalkable(nextTile)) {
        directions.push(dir);
      }
    }
    
    return directions;
  }
  
  private isTileWalkable(tile: Vector2): boolean {
    if (!this.grid) return false;
    if (tile.y < 0 || tile.y >= this.grid.length) return false;
    if (tile.x < 0 || tile.x >= this.grid[0].length) return false;
    return this.grid[tile.y][tile.x] !== TileType.WALL;
  }
  
  private getNextTile(tile: Vector2, direction: Direction): Vector2 {
    switch (direction) {
      case Direction.UP: return { x: tile.x, y: tile.y - 1 };
      case Direction.DOWN: return { x: tile.x, y: tile.y + 1 };
      case Direction.LEFT: return { x: tile.x - 1, y: tile.y };
      case Direction.RIGHT: return { x: tile.x + 1, y: tile.y };
      default: return tile;
    }
  }
  
  private distanceToTarget(tile: Vector2): number {
    const dx = tile.x - this.targetTile.x;
    const dy = tile.y - this.targetTile.y;
    return dx * dx + dy * dy; // squared distance is fine for comparison
  }
  
  private getOppositeDirection(): Direction {
    switch (this.direction) {
      case Direction.UP: return Direction.DOWN;
      case Direction.DOWN: return Direction.UP;
      case Direction.LEFT: return Direction.RIGHT;
      case Direction.RIGHT: return Direction.LEFT;
      default: return Direction.NONE;
    }
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
  
  setFrightened(duration: number, frightenedSpeed: number = CONFIG.GHOST_FRIGHTENED_SPEED): void {
    this.mode = GhostMode.FRIGHTENED;
    this.frightenedTimer = duration;
    this.speed = frightenedSpeed;
  }
  
  setMode(mode: GhostMode): void {
    this.mode = mode;
    this.speed = mode === GhostMode.FRIGHTENED 
      ? CONFIG.GHOST_FRIGHTENED_SPEED 
      : CONFIG.GHOST_SPEED;
  }
}
