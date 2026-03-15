/**
 * Game - Main game controller
 * 
 * Orchestrates all game systems: rendering, input, entities, AI
 */
import { GameLoop, CONFIG, GhostName, GameState } from './core';
import { createInitialState, GlobalGameState } from './core/GameStateManager';
import { Pacman, Ghost } from './entities';
import { Renderer } from './rendering';
import { InputHandler } from './input';
import { AudioManager } from './audio';
import { SCATTER_TARGETS, calculateTargetTile } from './ai';

// Simple starting level layout
const DEMO_LEVEL: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
  [6,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,6],
  [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export class Game {
  private gameLoop: GameLoop;
  private renderer: Renderer;
  private input: InputHandler;
  readonly audio: AudioManager;
  
  private state: GlobalGameState;
  private pacman: Pacman;
  private ghosts: Ghost[] = [];
  private level: number[][];
  
  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();
    this.audio = new AudioManager();
    this.state = createInitialState();
    this.level = DEMO_LEVEL.map(row => [...row]);
    
    // Initialize Pac-Man
    this.pacman = new Pacman(14 * 16, 23 * 16);
    this.pacman.setGrid(this.level);
    
    // Initialize ghosts
    this.ghosts = [
      new Ghost(GhostName.BLINKY, 14 * 16, 11 * 16),
      new Ghost(GhostName.PINKY, 13 * 16, 14 * 16),
      new Ghost(GhostName.INKY, 14 * 16, 14 * 16),
      new Ghost(GhostName.CLYDE, 15 * 16, 14 * 16),
    ];
    for (const ghost of this.ghosts) {
      ghost.setGrid(this.level);
    }
    
    // Set up input handling
    this.input.onDirectionChange((direction) => {
      this.pacman.setDirection(direction);
    });
    
    // Set up start/restart with Space key
    this.input.onStart(() => {
      this.handleStart();
    });
    
    // Set up pause with P key
    this.input.onPause(() => {
      this.togglePause();
    });
    
    // Create game loop
    this.gameLoop = new GameLoop(
      (deltaTime) => this.update(deltaTime),
      (_interpolation) => this.render()
    );
    
    this.countPellets();
    this.state.status = GameState.MENU;  // Start in menu state, waiting for Space
  }
  
  private countPellets(): void {
    let count = 0;
    for (const row of this.level) {
      for (const tile of row) {
        if (tile === 2 || tile === 3) count++;
      }
    }
    this.state.level.pelletsRemaining = count;
    this.state.level.totalPellets = count;
  }
  
  start(): void {
    this.gameLoop.start();
  }
  
  stop(): void {
    this.gameLoop.stop();
  }
  
  private handleStart(): void {
    if (this.state.status === GameState.MENU) {
      // Start new game
      this.state.status = GameState.PLAYING;
    } else if (this.state.status === GameState.GAME_OVER || 
               this.state.status === GameState.LEVEL_COMPLETE) {
      // Restart game
      this.restartGame();
    } else if (this.state.status === GameState.PAUSED) {
      // Resume from pause
      this.state.status = GameState.PLAYING;
    }
  }
  
  private togglePause(): void {
    if (this.state.status === GameState.PLAYING) {
      this.state.status = GameState.PAUSED;
    } else if (this.state.status === GameState.PAUSED) {
      this.state.status = GameState.PLAYING;
    }
  }
  
  private restartGame(): void {
    // Reset score and lives
    this.state.score = 0;
    this.state.pacman.lives = 3;
    
    // Reset level
    this.level = DEMO_LEVEL.map(row => [...row]);
    this.countPellets();
    
    // Reset positions
    this.resetPositions();
    
    // Start playing
    this.state.status = GameState.PLAYING;
  }
  
  private update(deltaTime: number): void {
    if (this.state.status !== GameState.PLAYING) return;
    
    // Update Pac-Man
    this.pacman.update(deltaTime);
    
    // Check pellet collection
    this.checkPelletCollection();
    
    // Update ghosts
    const blinky = this.ghosts[0];
    for (const ghost of this.ghosts) {
      const target = calculateTargetTile(ghost, {
        pacmanPosition: this.pacman.getTilePosition(),
        pacmanDirection: this.pacman.direction,
        blinkyPosition: blinky.getTilePosition(),
      }, SCATTER_TARGETS[ghost.name]);
      
      ghost.targetTile = target;
      ghost.update(deltaTime);
    }
    
    // Check ghost collisions
    this.checkGhostCollisions();
    
    // Check win condition
    if (this.state.level.pelletsRemaining === 0) {
      this.state.status = GameState.LEVEL_COMPLETE;
    }
  }
  
  private checkPelletCollection(): void {
    // Use center-based tile position for reliable pellet collection
    // This ensures pellets are collected when Pac-Man's center crosses the tile
    const tile = this.pacman.getCenterTilePosition();
    if (tile.y >= 0 && tile.y < this.level.length && 
        tile.x >= 0 && tile.x < this.level[0].length) {
      const tileValue = this.level[tile.y][tile.x];
      
      if (tileValue === 2) {
        this.level[tile.y][tile.x] = 0;
        this.state.score += 10;
        this.state.level.pelletsRemaining--;
      } else if (tileValue === 3) {
        this.level[tile.y][tile.x] = 0;
        this.state.score += 50;
        this.state.level.pelletsRemaining--;
        
        // Energize - frighten all ghosts
        for (const ghost of this.ghosts) {
          ghost.setFrightened(CONFIG.POWER_PELLET_DURATION);
        }
      }
    }
  }
  
  private checkGhostCollisions(): void {
    const pacmanPos = this.pacman.position;
    
    for (const ghost of this.ghosts) {
      const distance = Math.sqrt(
        Math.pow(pacmanPos.x - ghost.position.x, 2) +
        Math.pow(pacmanPos.y - ghost.position.y, 2)
      );
      
      if (distance < 12) {
        if (ghost.mode === 'FRIGHTENED') {
          // Eat ghost
          ghost.mode = 'EATEN' as any;
          this.state.score += 200;
        } else if (ghost.mode !== 'EATEN') {
          // Pac-Man dies
          this.state.pacman.lives--;
          if (this.state.pacman.lives <= 0) {
            this.state.status = GameState.GAME_OVER;
          } else {
            this.resetPositions();
          }
        }
      }
    }
  }
  
  private resetPositions(): void {
    this.pacman = new Pacman(14 * 16, 23 * 16);
    this.pacman.setGrid(this.level);
    this.ghosts = [
      new Ghost(GhostName.BLINKY, 14 * 16, 11 * 16),
      new Ghost(GhostName.PINKY, 13 * 16, 14 * 16),
      new Ghost(GhostName.INKY, 14 * 16, 14 * 16),
      new Ghost(GhostName.CLYDE, 15 * 16, 14 * 16),
    ];
    for (const ghost of this.ghosts) {
      ghost.setGrid(this.level);
    }
    
    this.input.onDirectionChange((direction) => {
      this.pacman.setDirection(direction);
    });
  }
  
  private render(): void {
    this.renderer.clear();
    this.renderer.drawGrid(this.level);
    this.renderer.render([this.pacman, ...this.ghosts]);
    this.renderer.drawScore(this.state.score, this.state.highScore);
    this.renderer.drawLives(this.state.pacman.lives);
    
    if (this.state.status === GameState.MENU) {
      this.renderer.drawText('PRESS SPACE TO START', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, '#FFFF00');
    } else if (this.state.status === GameState.PAUSED) {
      this.renderer.drawText('PAUSED', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, '#FFFF00');
    } else if (this.state.status === GameState.GAME_OVER) {
      this.renderer.drawText('GAME OVER', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, '#FF0000');
      this.renderer.drawText('PRESS SPACE TO RESTART', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 30, '#FFFF00');
    } else if (this.state.status === GameState.LEVEL_COMPLETE) {
      this.renderer.drawText('LEVEL COMPLETE!', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, '#00FF00');
      this.renderer.drawText('PRESS SPACE TO CONTINUE', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2 + 30, '#FFFF00');
    }
  }
}
