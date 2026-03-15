# Project Context

- **Owner:** Guy Bertental
- **Project:** Pac-Man style arcade game
- **Stack:** TypeScript + Vite + HTML5 Canvas
- **Created:** 2026-03-15

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-03-15 — Initial Architecture

**Structure:**
- `src/core/` — GameLoop (fixed timestep), types, config, state management
- `src/entities/` — BaseEntity, Pacman, Ghost classes
- `src/rendering/` — Canvas Renderer
- `src/input/` — InputHandler (keyboard)
- `src/ai/` — Ghost targeting algorithms (Blinky/Pinky/Inky/Clyde behaviors)
- `src/audio/` — AudioManager
- `src/utils/` — Collision detection

**Key Files:**
- `src/Game.ts` — Main orchestrator, ties all systems together
- `src/main.ts` — Entry point
- `src/core/types.ts` — All game enums and interfaces
- `src/core/config.ts` — Game constants (speeds, dimensions, colors)

**Patterns:**
- Fixed timestep game loop (60 FPS target, prevents spiral of death)
- Centralized state via GlobalGameState
- Ghost AI uses classic targeting: Blinky direct-chases, Pinky ambushes, Inky uses Blinky's position, Clyde is shy

**Canvas:** 448x496 (28x31 tiles × 16px)

### 2026-03-XX — Fixed Ghost Movement (Issue #2)

**Problem:** Ghosts rendered but never moved.

**Root Cause:**
1. Ghost.direction defaulted to `Direction.NONE` (inherited from BaseEntity)
2. Ghost had no grid reference to check wall collisions
3. Ghost.update() called move() but with no direction, velocity was zero
4. GhostAI calculated `targetTile` but Ghost never used it to pick a direction

**Fix:**
- Added `Ghost.setGrid()` method (mirrors Pacman's pattern)
- Added `Ghost.chooseDirection()` AI logic:
  - Only recalculates at tile centers (avoids jitter)
  - Gets valid directions (non-wall, non-reverse except when frightened)
  - Picks direction that minimizes distance to targetTile
- Called `ghost.setGrid(this.level)` in Game constructor and resetPositions()

**Commit:** aeb9210 — "Fix ghost movement - add setGrid() and AI direction choosing"

### 2026-03-15 — Added README Documentation (Issue #3)

**Task:** Create comprehensive README.md covering project overview, setup, and contribution guidelines.

**Key sections added:**
- Feature overview with ghost AI behavior descriptions
- Prerequisites: Node.js v18+
- Setup: `npm install` then `npm run dev` (port 5173)
- Scripts: `dev`, `build`, `preview`, `typecheck`, `test`
- Controls table: Arrow/WASD, P (pause), Space (start/restart)
- Project structure documentation
- Contributing guidelines (fork → branch → PR)
- MIT License

**PR:** #4 — Closes #3

### 2026-03-15 — Code Review: Difficulty Selection (PR #8)

**Feature:** Adds difficulty selection menu (EASY/MEDIUM/HARD) before starting a game.

**Architecture Review:**
- State flow: MENU → DIFFICULTY_SELECT → PLAYING works correctly
- Clean separation between config constants (DIFFICULTY_SETTINGS) and runtime state
- Ghost.setFrightened() properly extended to accept optional speed parameter

**Code Quality Issues Found:**
1. **Input Handler Coupling:** InputHandler calls both menuNavigateCallback AND directionChangeCallback for up/down keys, regardless of game state. Harmless but sloppy—callbacks should be state-aware or mutually exclusive.
2. **Wasteful applyDifficultySettings():** Called in startNewGame() before resetPositions(), which creates new ghosts. The first call is wasted; only the call inside resetPositions() matters.
3. **Build Artifacts in PR:** dist/ and node_modules/.vite/ files committed. Root issue: .gitignore missing standard entries (dist/, node_modules/).

**Test Coverage Gaps:**
- Tests only validate DIFFICULTY_SETTINGS constants
- Missing: state transition tests, ghost speed application tests, menu navigation tests

**Verdict:** REQUEST CHANGES — fix input handler and remove build artifacts before merge.
