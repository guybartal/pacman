/**
 * Pac-Man Game Entry Point
 */
import { Game } from './Game';

function main(): void {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  const game = new Game(canvas);
  game.start();
  
  // Debug: expose game to window for testing
  (window as any).game = game;
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
