/**
 * GameLoop - Fixed timestep game loop with variable rendering
 * 
 * Uses a fixed update rate for deterministic physics/logic
 * while rendering as fast as possible with interpolation.
 */
import { CONFIG } from './config';

export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = (interpolation: number) => void;

export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private running: boolean = false;
  private animationFrameId: number = 0;
  
  private readonly fixedDeltaTime: number = CONFIG.FRAME_TIME;
  
  constructor(
    private readonly onUpdate: UpdateCallback,
    private readonly onRender: RenderCallback
  ) {}
  
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop();
  }
  
  stop(): void {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }
  
  private loop = (): void => {
    if (!this.running) return;
    
    const currentTime = performance.now();
    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Prevent spiral of death
    if (frameTime > 250) {
      frameTime = 250;
    }
    
    this.accumulator += frameTime;
    
    // Fixed timestep updates
    while (this.accumulator >= this.fixedDeltaTime) {
      this.onUpdate(this.fixedDeltaTime);
      this.accumulator -= this.fixedDeltaTime;
    }
    
    // Render with interpolation factor
    const interpolation = this.accumulator / this.fixedDeltaTime;
    this.onRender(interpolation);
    
    this.animationFrameId = requestAnimationFrame(this.loop);
  };
  
  isRunning(): boolean {
    return this.running;
  }
}
