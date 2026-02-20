# Powerline - Energy Puzzle Game

Powerline is a color-sorting puzzle game where players route energy cores through conduits. Move cores only onto matching colors and strategically clear each level.

## Features

- 🎮 **Core Gameplay**: Sort colored energy cores into matching conduits
- ↩️ **Undo System**: Reverse moves with full move history tracking
- 🔄 **Restart Capability**: Reset any level to its initial state
- 📱 **PWA Support**: Install and play offline on any device
- 🎯 **Progressive Difficulty**: 5 levels implemented with room for 100+ levels
- 📐 **Responsive Design**: Fully optimized for desktop and mobile

## Game Rules

1. Click a conduit to select it, then click another to move the top core
2. Cores can only be moved onto empty conduits or conduits with matching color on top
3. Complete conduits (full and uniform) cannot be moved to empty conduits
4. Level is complete when all conduits contain only one color each

## Project Structure

```
powerline-energy-puzzle/
├── index.html              # Main entry point
├── package.json            # Project configuration
├── public/                 # PWA assets
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Offline support
├── src/                    # Core game logic (TypeScript)
│   ├── main.ts            # Application entry point
│   ├── gameEngine.ts      # Game coordination + hint search
│   ├── gameState.ts       # Strict state management
│   ├── levels.ts          # 100-level definitions/generator
│   ├── renderer.ts        # UI rendering + animation states
│   └── types.ts           # Core types and interfaces
├── dist/                   # Compiled browser-ready JavaScript
├── styles/                 # Stylesheets
│   └── main.css           # Main stylesheet
└── assets/                 # Icons and images
    ├── icon-192.png
    └── icon-512.png
```

## Getting Started

### Prerequisites

- A web browser with PWA support
- A local HTTP server (Python 3, Node.js, or any other)

**Note**: The PWA icons (`assets/icon-192.png` and `assets/icon-512.png`) are currently placeholders. Replace them with actual PNG images for full PWA functionality.

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/drelynlikescode26/powerline-energy-puzzle.git
cd powerline-energy-puzzle
```

2. Install dependencies and build:
```bash
npm install
npm run build
```

3. Start a local server:
```bash
# Using Python 3
python3 -m http.server 8000

# Or using npm
npm start
```

4. Open your browser to `http://localhost:8000`

### PWA Installation

The game can be installed as a Progressive Web App:
1. Open the game in a supported browser
2. Look for the "Install" prompt or icon in your browser
3. Click "Install" to add it to your device

## Architecture

### Modular Design

- **GameState**: Manages conduits, move history, and level state with strict typing
- **GameEngine**: Coordinates state, validation, level progression, and intelligent hint scoring
- **Renderer**: Handles DOM updates, conduit ignition states, and animated core transfer effects
- **Levels**: Hybrid handcrafted + generated level definitions (100 total)

### State Management

- Deterministic state updates ensure reliability
- Deep cloning prevents reference issues
- Move history enables undo functionality
- Initial state preserved for restart capability

### Move Validation

The game enforces strict rules:
- Source conduit must not be empty
- Target conduit must not be full
- Colors must match (if target not empty)
- Complete uniform conduits locked from trivial moves

## Future Enhancements

Phase 2+ may include:
- 100 levels with progressive difficulty
- Animations and visual effects
- Sound effects and music
- Hint system
- Level editor
- Achievement system
- Leaderboards

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

## License

MIT License
