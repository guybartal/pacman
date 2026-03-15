/**
 * Renderer - Handles all canvas drawing operations
 */
import { CONFIG, DIFFICULTY_SETTINGS } from '../core/config';
import { Difficulty } from '../core/types';
import type { Renderable } from '../core/types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
  }
  
  clear(): void {
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  render(renderables: Renderable[]): void {
    for (const renderable of renderables) {
      renderable.render(this.ctx);
    }
  }
  
  drawGrid(grid: number[][]): void {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        this.drawTile(x, y, tile);
      }
    }
  }
  
  private drawTile(x: number, y: number, tileType: number): void {
    const px = x * CONFIG.TILE_SIZE;
    const py = y * CONFIG.TILE_SIZE;
    
    switch (tileType) {
      case 1: // Wall
        this.ctx.fillStyle = CONFIG.COLORS.WALL;
        this.ctx.fillRect(px, py, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        break;
      case 2: // Pellet
        this.ctx.fillStyle = CONFIG.COLORS.PELLET;
        this.ctx.beginPath();
        this.ctx.arc(px + 8, py + 8, 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 3: // Power pellet
        this.ctx.fillStyle = CONFIG.COLORS.POWER_PELLET;
        this.ctx.beginPath();
        this.ctx.arc(px + 8, py + 8, 5, 0, Math.PI * 2);
        this.ctx.fill();
        break;
    }
  }
  
  drawScore(score: number, highScore: number): void {
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`SCORE: ${score}`, 10, 15);
    this.ctx.fillText(`HIGH: ${highScore}`, CONFIG.CANVAS_WIDTH - 100, 15);
  }
  
  drawLives(lives: number): void {
    this.ctx.fillStyle = '#FFFF00';
    for (let i = 0; i < lives; i++) {
      this.ctx.beginPath();
      this.ctx.arc(20 + i * 20, CONFIG.CANVAS_HEIGHT - 15, 7, 0.25 * Math.PI, 1.75 * Math.PI);
      this.ctx.lineTo(20 + i * 20, CONFIG.CANVAS_HEIGHT - 15);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
  
  drawText(text: string, x: number, y: number, color: string = '#FFFFFF'): void {
    this.ctx.fillStyle = color;
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x, y);
    this.ctx.textAlign = 'left';
  }

  drawDifficultyMenu(selectedDifficulty: Difficulty): void {
    const cx = CONFIG.CANVAS_WIDTH / 2;
    const cy = CONFIG.CANVAS_HEIGHT / 2;

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Title
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SELECT DIFFICULTY', cx, cy - 80);

    const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD] as const;
    const itemHeight = 54;
    const startY = cy - 30;

    for (let i = 0; i < difficulties.length; i++) {
      const diff = difficulties[i];
      const settings = DIFFICULTY_SETTINGS[diff];
      const itemY = startY + i * itemHeight;
      const isSelected = diff === selectedDifficulty;

      if (isSelected) {
        // Highlight box for selected difficulty
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        this.ctx.fillRect(cx - 150, itemY - 20, 300, 44);
        this.ctx.strokeStyle = settings.color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(cx - 150, itemY - 20, 300, 44);

        // Arrow indicator
        this.ctx.fillStyle = settings.color;
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`▶ ${settings.label} ◀`, cx, itemY);
      } else {
        this.ctx.fillStyle = '#888888';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(settings.label, cx, itemY);
      }

      // Description
      this.ctx.fillStyle = isSelected ? '#CCCCCC' : '#555555';
      this.ctx.font = '11px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(settings.description, cx, itemY + 18);
    }

    // Footer instructions
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('↑ ↓ to navigate | SPACE / ENTER to confirm', cx, cy + 140);

    this.ctx.textAlign = 'left';
  }
  
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
