# Project Context

- **Owner:** Guy Bertental
- **Project:** Pac-Man style arcade game
- **Stack:** TBD (game engine, language, and tools to be decided)
- **Created:** 2026-03-15

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-03-15: Core Game Architecture Established

**Stack Decision:** Vanilla JS with ES6 modules, Canvas2D rendering. No build step required.

**Architecture:**
- **Fixed-timestep game loop** at 60 FPS with accumulator pattern prevents physics drift
- **State machine** for game modes: INIT → READY → PLAYING ↔ PAUSED → LEVEL_COMPLETE → GAME_OVER
- **Grid-based movement** - Player moves tile-to-tile (16px tiles), queued direction changes applied at tile boundaries

**Key Files:**
- `src/game/Game.js` - Main loop, state management, rendering orchestration
- `src/game/Player.js` - Pac-Man entity with tile-aligned movement
- `src/game/Level.js` - 2D tile array (28x31 classic maze), dot tracking
- `src/game/Input.js` - Keyboard handling with direction queue
- `src/game/Collision.js` - Tile-based collision utilities
- `src/index.js` - Entry point, game initialization

**Patterns:**
- Separate update/render phases for clean game loop
- Direction queuing: player can pre-buffer next turn
- Pixel position interpolation for smooth rendering between fixed updates
- Power mode tracked with timer countdown

### 2026-03-17: Fixed Spacebar Start Bug

**Problem:** Game didn't start when pressing Space - it auto-started immediately on load with no way to restart after game over.

**Root Cause:**
- `InputHandler.ts` only handled arrow keys/WASD for movement directions
- `Game.ts` constructor set `GameState.PLAYING` immediately - no waiting for user input
- No Space key listener existed despite UI saying "Space to restart"

**Fix Applied:**
- Added `onStart()` and `onPause()` callbacks to `InputHandler.ts`
- Space key now triggers start/restart callback
- P key triggers pause callback
- Game now starts in `GameState.MENU` state, showing "PRESS SPACE TO START"
- `handleStart()` method handles state transitions: MENU→PLAYING, GAME_OVER→restart, PAUSED→resume
- Added `restartGame()` method to reset score, lives, level grid, and positions

**Key Files Modified:**
- `src/input/InputHandler.ts` - Added Space and P key handling
- `src/Game.ts` - Added handleStart(), togglePause(), restartGame(), updated render() for state messages

### 2026-03-17: Movement Bug Investigation

**Problem Reported:** After spacebar fix, Pac-Man still doesn't move when pressing arrow keys.

**Investigation:**
- Traced entire input-to-render pipeline
- Created unit tests for Pacman, InputHandler, and movement logic - all 23 tests pass
- Verified direction mapping: ArrowUp/KeyW → UP, ArrowDown/KeyS → DOWN, etc.
- Verified velocity calculation: direction → velocity vector (±1,0 or 0,±1)
- Verified position update: position += velocity * (speed * deltaTime / 1000)
- Movement per frame at 60 FPS: ~1.33 pixels/frame (80 px/s speed)

**Fix Applied:**
- Added canvas dimension initialization in `Renderer.ts` constructor:
  ```typescript
  canvas.width = CONFIG.CANVAS_WIDTH;
  canvas.height = CONFIG.CANVAS_HEIGHT;
  ```
  Without explicit dimensions, canvas defaults to 300x150 which could cause rendering issues.

**Unit Tests Added:**
- `src/__tests__/pacman.test.ts` - 10 tests verifying direction setting and movement
- `src/__tests__/input.test.ts` - 7 tests verifying keyboard input handling
- `src/__tests__/movement.test.ts` - 6 tests verifying movement math

**Key Files:**
- `src/rendering/Renderer.ts` - Added canvas dimension initialization
- `src/entities/BaseEntity.ts` - Contains `move()` method with velocity * distance calculation
- `src/entities/Pacman.ts` - Contains `setDirection()` and `update()` methods
