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
