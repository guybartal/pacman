/**
 * InputHandler - Keyboard input management
 */
import { Direction } from '../core/types';

export type InputCallback = (direction: Direction) => void;
export type ActionCallback = () => void;
export type MenuNavigateCallback = (direction: 'UP' | 'DOWN') => void;

export class InputHandler {
  private callback: InputCallback | null = null;
  private startCallback: ActionCallback | null = null;
  private pauseCallback: ActionCallback | null = null;
  private menuNavigateCallback: MenuNavigateCallback | null = null;
  private keysPressed: Set<string> = new Set();
  
  constructor() {
    this.setupListeners();
  }
  
  private setupListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }
  
  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keysPressed.add(event.code);
    
    // Handle Space key for start/restart
    if (event.code === 'Space') {
      event.preventDefault();
      if (this.startCallback) {
        this.startCallback();
      }
      return;
    }
    
    // Handle P key for pause
    if (event.code === 'KeyP') {
      event.preventDefault();
      if (this.pauseCallback) {
        this.pauseCallback();
      }
      return;
    }

    // Handle Enter key (same as Space for menu confirmation)
    if (event.code === 'Enter') {
      event.preventDefault();
      if (this.startCallback) {
        this.startCallback();
      }
      return;
    }
    
    const direction = this.keyToDirection(event.code);
    if (direction !== Direction.NONE) {
      event.preventDefault();
      // Menu navigation takes exclusive priority for UP/DOWN keys
      if (this.menuNavigateCallback) {
        if (event.code === 'ArrowUp' || event.code === 'KeyW') {
          this.menuNavigateCallback('UP');
          return;
        } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
          this.menuNavigateCallback('DOWN');
          return;
        }
      }
      if (this.callback) {
        this.callback(direction);
      }
    }
  };
  
  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keysPressed.delete(event.code);
  };
  
  private keyToDirection(code: string): Direction {
    switch (code) {
      case 'ArrowUp':
      case 'KeyW':
        return Direction.UP;
      case 'ArrowDown':
      case 'KeyS':
        return Direction.DOWN;
      case 'ArrowLeft':
      case 'KeyA':
        return Direction.LEFT;
      case 'ArrowRight':
      case 'KeyD':
        return Direction.RIGHT;
      default:
        return Direction.NONE;
    }
  }
  
  onDirectionChange(callback: InputCallback): void {
    this.callback = callback;
  }
  
  onStart(callback: ActionCallback): void {
    this.startCallback = callback;
  }
  
  onPause(callback: ActionCallback): void {
    this.pauseCallback = callback;
  }

  onMenuNavigate(callback: MenuNavigateCallback): void {
    this.menuNavigateCallback = callback;
  }
  
  isKeyPressed(code: string): boolean {
    return this.keysPressed.has(code);
  }
  
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
