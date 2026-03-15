/**
 * Ghost AI - Implements the four ghost personalities
 * 
 * Each ghost has a unique targeting behavior:
 * - Blinky: Direct chase - targets Pac-Man's current tile
 * - Pinky: Ambush - targets 4 tiles ahead of Pac-Man
 * - Inky: Unpredictable - uses Blinky's position in calculation
 * - Clyde: Shy - chases until close, then scatters
 */
import { GhostName, Direction, Vector2, GhostMode } from '../core/types';
import { Ghost } from '../entities/Ghost';

export interface GhostAIInput {
  pacmanPosition: Vector2;
  pacmanDirection: Direction;
  blinkyPosition: Vector2;
}

export function calculateTargetTile(
  ghost: Ghost,
  input: GhostAIInput,
  scatterTarget: Vector2
): Vector2 {
  if (ghost.mode === GhostMode.SCATTER) {
    return scatterTarget;
  }
  
  if (ghost.mode === GhostMode.FRIGHTENED) {
    // Random movement - pick a random valid direction
    return {
      x: Math.floor(Math.random() * 28),
      y: Math.floor(Math.random() * 31),
    };
  }
  
  // Chase mode - each ghost has unique behavior
  switch (ghost.name) {
    case GhostName.BLINKY:
      return targetBlinky(input);
    case GhostName.PINKY:
      return targetPinky(input);
    case GhostName.INKY:
      return targetInky(ghost, input);
    case GhostName.CLYDE:
      return targetClyde(ghost, input, scatterTarget);
    default:
      return input.pacmanPosition;
  }
}

// Blinky targets Pac-Man directly
function targetBlinky(input: GhostAIInput): Vector2 {
  return { ...input.pacmanPosition };
}

// Pinky targets 4 tiles ahead of Pac-Man
function targetPinky(input: GhostAIInput): Vector2 {
  const offset = getDirectionOffset(input.pacmanDirection, 4);
  return {
    x: input.pacmanPosition.x + offset.x,
    y: input.pacmanPosition.y + offset.y,
  };
}

// Inky uses a complex calculation involving Blinky
function targetInky(_ghost: Ghost, input: GhostAIInput): Vector2 {
  const offset = getDirectionOffset(input.pacmanDirection, 2);
  const pivot = {
    x: input.pacmanPosition.x + offset.x,
    y: input.pacmanPosition.y + offset.y,
  };
  
  // Double the vector from Blinky to the pivot point
  return {
    x: pivot.x + (pivot.x - input.blinkyPosition.x),
    y: pivot.y + (pivot.y - input.blinkyPosition.y),
  };
}

// Clyde chases until within 8 tiles, then scatters
function targetClyde(
  ghost: Ghost,
  input: GhostAIInput,
  scatterTarget: Vector2
): Vector2 {
  const distance = Math.sqrt(
    Math.pow(ghost.position.x - input.pacmanPosition.x, 2) +
    Math.pow(ghost.position.y - input.pacmanPosition.y, 2)
  );
  
  // If within 8 tiles, scatter
  if (distance < 8 * 16) {
    return scatterTarget;
  }
  
  return { ...input.pacmanPosition };
}

function getDirectionOffset(direction: Direction, tiles: number): Vector2 {
  const distance = tiles * 16;
  switch (direction) {
    case Direction.UP:    return { x: 0, y: -distance };
    case Direction.DOWN:  return { x: 0, y: distance };
    case Direction.LEFT:  return { x: -distance, y: 0 };
    case Direction.RIGHT: return { x: distance, y: 0 };
    default:              return { x: 0, y: 0 };
  }
}

// Scatter targets - corners of the maze
export const SCATTER_TARGETS: Record<GhostName, Vector2> = {
  [GhostName.BLINKY]: { x: 25, y: 0 },   // Top right
  [GhostName.PINKY]: { x: 2, y: 0 },     // Top left
  [GhostName.INKY]: { x: 27, y: 30 },    // Bottom right
  [GhostName.CLYDE]: { x: 0, y: 30 },    // Bottom left
};
