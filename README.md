# 🕹️ Pac-Man

A classic Pac-Man arcade game built with TypeScript and HTML5 Canvas.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

This is a faithful recreation of the classic Pac-Man arcade game, featuring:

- **Classic Gameplay** — Navigate the maze, eat pellets, avoid ghosts
- **Authentic Ghost AI** — Each ghost has unique targeting behavior:
  - 🔴 **Blinky** — Direct pursuer, always chases Pac-Man
  - 🩷 **Pinky** — Ambusher, targets 4 tiles ahead of Pac-Man
  - 🩵 **Inky** — Unpredictable, uses Blinky's position for targeting
  - 🟠 **Clyde** — Shy, switches between chase and scatter
- **Power Pellets** — Eat them to turn the tables on ghosts
- **Smooth Rendering** — Fixed timestep game loop at 60 FPS

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/guybartal/pacman.git
cd pacman

# Install dependencies
npm install
```

### Running the Game

```bash
# Start development server
npm run dev
```

Open your browser to `http://localhost:5173` and start playing!

### Building for Production

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move Pac-Man |
| P | Pause / Resume |
| Space | Start / Restart |

## Project Structure

```
src/
├── main.ts          # Entry point
├── Game.ts          # Main game orchestrator
├── core/            # Game loop, config, types, state management
├── entities/        # Pac-Man and Ghost classes
├── ai/              # Ghost targeting algorithms
├── rendering/       # Canvas renderer
├── input/           # Keyboard input handler
├── audio/           # Sound management
└── utils/           # Collision detection utilities
```

## Tech Stack

- **TypeScript** — Type-safe game logic
- **Vite** — Fast development and optimized builds
- **HTML5 Canvas** — 2D rendering
- **Vitest** — Testing framework

## Development

```bash
# Run type checking
npm run typecheck

# Run tests
npm run test
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and passes type checking.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the original Pac-Man created by Toru Iwatani at Namco (1980)
- Ghost AI behaviors based on the classic game's algorithms
