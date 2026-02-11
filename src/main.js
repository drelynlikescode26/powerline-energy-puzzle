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
      // First click - select source conduit
      if (!this.engine.state.isConduitEmpty(index)) {
        this.selectedConduit = index;
        this.renderer.setSelectedConduit(index);
        this.renderer.render(this.engine.getState());
      }
    } else {
      // Second click - attempt move
      if (this.selectedConduit === index) {
        // Clicked same conduit - deselect
        this.selectedConduit = null;
        this.renderer.clearSelection();
        this.renderer.render(this.engine.getState());
      } else {
        // Attempt to move
        const success = this.engine.move(this.selectedConduit, index);
        
        if (success) {
          this.selectedConduit = null;
          this.renderer.clearSelection();
        } else {
          // Move failed - provide feedback (could add visual/audio feedback here)
          console.log('Invalid move');
        }
      }
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
