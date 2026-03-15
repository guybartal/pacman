# Project Context

- **Owner:** Guy Bertental
- **Project:** Pac-Man style arcade game
- **Stack:** TBD (game engine, language, and tools to be decided)
- **Created:** 2026-03-15

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-03-15: Rendering System Established

**Stack:** HTML5 Canvas with ES6 modules, pure JavaScript (no framework)

**Key Files:**
- `src/rendering/Renderer.js` - Main orchestrator, caches static maze for performance
- `src/rendering/MazeRenderer.js` - Walls (blue lines), dots, power pellets
- `src/rendering/EntityRenderer.js` - Pac-Man (animated mouth), ghosts (with eyes/states)
- `src/rendering/UIRenderer.js` - Score, lives, overlays (ready/gameover/start screens)
- `src/rendering/index.js` - Barrel export
- `src/styles/game.css` - CRT aesthetic, centered black background, arcade font

**Color Palette (canonical):**
- Background: `#000000`
- Walls: `#2121DE` (highlight: `#4242FF`)
- Pac-Man: `#FFFF00`
- Dots: `#FFCCAA`
- Ghosts: Blinky `#FF0000`, Pinky `#FFB8FF`, Inky `#00FFFF`, Clyde `#FFB852`
- Vulnerable ghost: `#2121DE` with `#FFFFFF` flash

**Tile Types (TILE constant):**
- 0: EMPTY, 1: WALL, 2: DOT, 3: POWER_PELLET, 4: GHOST_HOUSE, 5: GATE

**Animation System:**
- Frame-based animations via `frameCount` parameter
- Pac-Man mouth: sine wave at 0.3 speed, max 0.4 radians
- Power pellet: pulsing at 0.15 speed
- Ghost skirt: wobble at 0.2 speed

**Rendering Pattern:**
- Static maze cached to offscreen canvas via `cacheMaze()`
- Entities/collectibles rendered fresh each frame
- UI overlays on top with semi-transparent backgrounds for state screens
