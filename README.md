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
├── src/                    # Core game logic
│   ├── main.js            # Application entry point
│   ├── gameEngine.js      # Game coordination
│   ├── gameState.js       # State management
│   ├── levels.js          # Level definitions
│   └── renderer.js        # UI rendering
├── styles/                 # Stylesheets
│   └── main.css           # Main stylesheet
└── assets/                 # Icons and images
    ├── icon-192.png
    └── icon-512.png
```

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/drelynlikescode26/powerline-energy-puzzle.git
cd powerline-energy-puzzle
```

2. Start a local server:
```bash
# Using Python 3
python3 -m http.server 8000

# Or using npm
npm start
```

3. Open your browser to `http://localhost:8000`

### PWA Installation

The game can be installed as a Progressive Web App:
1. Open the game in a supported browser
2. Look for the "Install" prompt or icon in your browser
3. Click "Install" to add it to your device

## Architecture

### Modular Design

- **GameState**: Manages conduits, move history, and level state
- **GameEngine**: Coordinates state, validation, and level progression
- **Renderer**: Handles all DOM manipulation and visual updates
- **Levels**: JSON-based level definitions for easy scaling

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
