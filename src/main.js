console.log("Powerline UI Loaded");

/**
 * Main Application Entry Point
 * Initializes and coordinates all game modules
 */

import { GameEngine } from './gameEngine.js';
import { Renderer } from './renderer.js';

class PowerlineGame {
  constructor() {
    this.engine = new GameEngine();
    this.renderer = new Renderer('#conduits-container');
    this.selectedConduit = null;

    this.init();
  }

  /**
   * Initialize the game
   */
  init() {
    // Set up engine callbacks
    this.engine.onStateChangeCallback((state) => {
      this.handleStateChange(state);
    });

    this.engine.onLevelCompleteCallback((data) => {
      this.handleLevelComplete(data);
    });

    // Set up renderer callbacks
    this.renderer.onConduitClickCallback((index) => {
      this.handleConduitClick(index);
    });

    this.renderer.onNextLevelCallback(() => {
      this.handleNextLevel();
    });

    // Set up UI controls
    this.setupControls();

    // Start the game
    this.engine.init(1);
  }

  /**
   * Set up button controls
   */
  setupControls() {
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        this.handleUndo();
      });
    }

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.handleRestart();
      });
    }

    const restartIconBtn = document.getElementById('restart-icon-btn');
    if (restartIconBtn) {
      restartIconBtn.addEventListener('click', () => {
        this.handleRestart();
      });
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        this.handleHint();
      });
    }
  }

  /**
   * Handle state changes
   * @param {Object} state - New game state
   */
  handleStateChange(state) {
    this.renderer.render(state);
    this.renderer.updateControls(state);
  }

  /**
   * Handle conduit clicks
   * @param {number} index - Clicked conduit index
   */
  handleConduitClick(index) {
    if (this.selectedConduit === null) {
      // First click - select source conduit (must be non-empty)
      if (!this.engine.state.isConduitEmpty(index)) {
        this.selectedConduit = index;
        this.renderer.setSelectedConduit(index);
        this.renderer.render(this.engine.getState());
        
        // Debug log
        console.log(`[Conduit Click] Selected source: conduit ${index}`);
      }
    } else {
      // Second click - attempt move
      if (this.selectedConduit === index) {
        // Clicked same conduit - deselect
        this.selectedConduit = null;
        this.renderer.clearSelection();
        this.renderer.render(this.engine.getState());
        
        console.log(`[Conduit Click] Deselected conduit ${index}`);
      } else {
        // Attempt to move (can move to empty or same-color conduit)
        const isValidMove = this.engine.isValidMove(this.selectedConduit, index);
        
        console.log(`[Move Attempt] From: ${this.selectedConduit}, To: ${index}, Valid: ${isValidMove}`);
        
        const success = this.engine.move(this.selectedConduit, index);
        
        if (success) {
          console.log(`[Move Success] Moved from conduit ${this.selectedConduit} to ${index}`);
          this.selectedConduit = null;
          this.renderer.clearSelection();
        } else {
          // Move failed - show shake animation
          console.log(`[Move Failed] Invalid move from ${this.selectedConduit} to ${index}`);
          this.renderer.showInvalidMove(index);
        }
      }
    }
  }

  /**
   * Handle hint action
   */
  handleHint() {
    // Find a valid move to suggest
    const state = this.engine.getState();
    const conduits = state.conduits;
    
    // Simple hint: find first valid move
    for (let from = 0; from < conduits.length; from++) {
      if (!this.engine.state.isConduitEmpty(from)) {
        for (let to = 0; to < conduits.length; to++) {
          if (from !== to && this.engine.isValidMove(from, to)) {
            // Highlight the hint
            this.showHintHighlight(from, to);
            return;
          }
        }
      }
    }
    
    // No valid moves found - show modal
    this.renderer.showHintMessage('No hints available. Try undoing or restarting.');
  }

  /**
   * Show hint highlight animation
   * @param {number} from - Source conduit
   * @param {number} to - Target conduit
   */
  showHintHighlight(from, to) {
    const conduitElements = document.querySelectorAll('.conduit');
    const fromElement = conduitElements[from];
    const toElement = conduitElements[to];
    
    const HINT_ANIMATION_DURATION = 1; // seconds
    const HINT_ANIMATION_ITERATIONS = 2;
    
    if (fromElement && toElement) {
      // Add highlight animation
      fromElement.style.animation = `hintPulse ${HINT_ANIMATION_DURATION}s ease-in-out ${HINT_ANIMATION_ITERATIONS}`;
      toElement.style.animation = `hintPulse ${HINT_ANIMATION_DURATION}s ease-in-out ${HINT_ANIMATION_ITERATIONS}`;
      
      setTimeout(() => {
        fromElement.style.animation = '';
        toElement.style.animation = '';
      }, HINT_ANIMATION_DURATION * HINT_ANIMATION_ITERATIONS * 1000);
    }
  }

  /**
   * Handle undo action
   */
  handleUndo() {
    this.selectedConduit = null;
    this.renderer.clearSelection();
    this.engine.undo();
  }

  /**
   * Handle restart action
   */
  handleRestart() {
    this.selectedConduit = null;
    this.renderer.clearSelection();
    this.engine.restart();
  }

  /**
   * Handle level completion
   * @param {Object} data - Completion data
   */
  handleLevelComplete(data) {
    this.selectedConduit = null;
    this.renderer.clearSelection();
    this.renderer.showLevelComplete(data);
  }

  /**
   * Handle next level action
   */
  handleNextLevel() {
    this.selectedConduit = null;
    this.renderer.clearSelection();
    this.engine.nextLevel();
  }
}

// Initialize the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.powerlineGame = new PowerlineGame();
  });
} else {
  window.powerlineGame = new PowerlineGame();
}
