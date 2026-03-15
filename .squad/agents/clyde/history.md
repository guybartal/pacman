# Project Context

- **Owner:** Guy Bertental
- **Project:** Pac-Man style arcade game
- **Stack:** TBD (game engine, language, and tools to be decided)
- **Created:** 2026-03-15

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### Test Framework Setup (2026-03-15)
- **Test framework**: Vitest (`npm test` runs tests, `npm run test:watch` for watch mode)
- **Module format**: ES modules required (package.json has `"type": "module"`)
- **Test files**: `tests/*.test.js` - collision, player, scoring
- **Source files**: `src/collision.js`, `src/player.js`, `src/scoring.js`

### Key Test Patterns
- Use `beforeEach` to reset state between tests (especially score trackers)
- Grid alignment tests: TILE_SIZE = 16, positions must be divisible by 16 to be aligned
- Collision radius for dots: TILE_SIZE / 2 = 8 pixels
- Maze coordinates: `maze[y][x]` (row-major, Y first!)

### Edge Cases Found
- **Wall collision**: Out-of-bounds treated as wall (prevents going off-map)
- **Direction buffering**: Player stores `nextDirection` when trying to turn mid-tile
- **Tunnel wrapping**: Only horizontal (X axis), player must reach < 0 or >= mazeWidth
- **Ghost scoring**: Doubles per ghost (200 → 400 → 800 → 1600), resets on new power pellet
- **Corner check priority**: Left/right boundaries checked before top/bottom

### Bug Hunt Results (2026-03-15)

#### BUG #1: Tests Can't Find Source Files (CRITICAL)
- **Location**: `tests/collision.test.js:9`, `tests/player.test.js:11`, `tests/scoring.test.js:11`
- **What's wrong**: Tests import from `../src/collision.js`, `../src/player.js`, `../src/scoring.js` but these files don't exist. Source was refactored to TypeScript with different structure (`src/core/`, `src/entities/`, etc.)
- **How to reproduce**: Run `npm test` - all 3 test files fail to import
- **Suggested fix**: Either (a) create the missing JS files that re-export from TS modules, or (b) rewrite tests to import from TypeScript source structure

#### BUG #2: Canvas Has No Dimensions (CRITICAL)
- **Location**: `index.html:49`
- **What's wrong**: `<canvas id="game-canvas">` has no width/height attributes, and `src/rendering/Renderer.ts` never sets them. Canvas defaults to 300x150 pixels.
- **How to reproduce**: Open game in browser - canvas is tiny (300x150) instead of 448x496
- **Suggested fix**: In `Renderer.ts` constructor, add:
  ```ts
  this.canvas.width = CONFIG.CANVAS_WIDTH;
  this.canvas.height = CONFIG.CANVAS_HEIGHT;
  ```

#### BUG #3: Ghost Mode String Comparison (MEDIUM)
- **Location**: `src/Game.ts:176-180`
- **What's wrong**: Compares `ghost.mode === 'FRIGHTENED'` (string) but `ghost.mode` is type `GhostMode` (enum). Also sets `ghost.mode = 'EATEN' as any` - using `as any` is a red flag.
- **How to reproduce**: Eat a power pellet, touch a ghost - ghost collision logic may not trigger correctly
- **Suggested fix**: Use `GhostMode.FRIGHTENED` and `GhostMode.EATEN` instead of string literals

#### BUG #4: Ghost Scoring Doesn't Stack (LOW)
- **Location**: `src/Game.ts:179`
- **What's wrong**: Always awards flat 200 points for eating a ghost. Original Pac-Man doubles the score per ghost (200→400→800→1600). The test files expect this doubling behavior.
- **Suggested fix**: Track ghost combo counter, multiply by 2^(ghostsEaten-1)

#### Patterns Noticed
- Tests were written for a JS module structure, but source was rebuilt in TypeScript - classic parallel development desync
- `as any` type casts in Game.ts indicate rushed integration between modules
- TypeScript passes but runtime behavior may differ due to enum vs string comparisons

---

### Bug Fix: Pellet Collection (2026-03-15) - Issue #1

#### Problem
Pac-Man doesn't eat coins all the time - sometimes passes over them without collecting.

#### Root Cause
`checkPelletCollection()` in `Game.ts` used `pacman.getTilePosition()` which calculates tile based on entity's **top-left corner** (`Math.floor(position.x / 16)`). When Pac-Man moves, its center can be over a pellet tile while the top-left corner is still in the previous tile, causing the pellet to be missed.

#### The Fix
1. Added `getCenterTilePosition()` to `BaseEntity.ts` - calculates tile based on entity center (position + 8 pixels)
2. Changed `checkPelletCollection()` to use `getCenterTilePosition()` instead of `getTilePosition()`

This ensures pellets are collected when Pac-Man's **center** crosses into the tile, which aligns with visual expectation.

#### Test Added
Created `src/__tests__/pellet-collection.test.ts` with 8 test cases:
- Center-based tile detection accuracy
- Edge case: tile boundaries
- Edge case: fractional positions from movement
- Regression test: approaching pellet from different directions

#### Commit
`b0997de` - "Fix pellet collection using center-based tile detection - Fixes #1"
