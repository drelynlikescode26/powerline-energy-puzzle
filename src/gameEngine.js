/**
 * Game Engine
 * Coordinates game state, level management, and validation
 */

import { GameState } from './gameState.js';
import { getLevel, isLevelComplete, getTotalLevels } from './levels.js';

export class GameEngine {
  constructor() {
    this.state = new GameState();
    this.currentLevelId = 1;
    this.onStateChange = null;
    this.onLevelComplete = null;
  }

  /**
   * Initialize the game
   * @param {number} levelId - Starting level ID (default: 1)
   */
  init(levelId = 1) {
    this.loadLevel(levelId);
  }

  /**
   * Load a specific level
   * @param {number} levelId - Level ID to load
   * @returns {boolean} True if level loaded successfully
   */
  loadLevel(levelId) {
    const level = getLevel(levelId);
    
    if (!level) {
      console.error(`Level ${levelId} not found`);
      return false;
    }

    this.currentLevelId = levelId;
    this.state.initLevel(level);
    this.notifyStateChange();
    
    return true;
  }

  /**
   * Attempt to move a core
   * @param {number} fromIndex - Source conduit index
   * @param {number} toIndex - Target conduit index
   * @returns {boolean} True if move was valid and executed
   */
  move(fromIndex, toIndex) {
    const success = this.state.moveCore(fromIndex, toIndex);
    
    if (success) {
      this.notifyStateChange();
      
      // Check if level is complete
      if (this.checkCompletion()) {
        this.handleLevelComplete();
      }
    }
    
    return success;
  }

  /**
   * Undo the last move
   * @returns {boolean} True if undo was successful
   */
  undo() {
    const success = this.state.undo();
    
    if (success) {
      this.notifyStateChange();
    }
    
    return success;
  }

  /**
   * Restart the current level
   */
  restart() {
    this.state.restart();
    this.notifyStateChange();
  }

  /**
   * Check if current level is complete
   * @returns {boolean} True if level is complete
   */
  checkCompletion() {
    return isLevelComplete(this.state.getConduits());
  }

  /**
   * Handle level completion
   */
  handleLevelComplete() {
    if (this.onLevelComplete) {
      const totalLevels = getTotalLevels();
      const isLastLevel = this.currentLevelId >= totalLevels;
      
      this.onLevelComplete({
        levelId: this.currentLevelId,
        moves: this.state.getMoveCount(),
        isLastLevel
      });
    }
  }

  /**
   * Load next level
   * @returns {boolean} True if next level exists and was loaded
   */
  nextLevel() {
    const nextLevelId = this.currentLevelId + 1;
    return this.loadLevel(nextLevelId);
  }

  /**
   * Get current game state
   * @returns {Object} Current state information
   */
  getState() {
    return {
      levelId: this.currentLevelId,
      level: this.state.getCurrentLevel(),
      conduits: this.state.getConduits(),
      moves: this.state.getMoveCount(),
      canUndo: this.state.canUndo(),
      isComplete: this.checkCompletion()
    };
  }

  /**
   * Register state change callback
   * @param {Function} callback - Function to call when state changes
   */
  onStateChangeCallback(callback) {
    this.onStateChange = callback;
  }

  /**
   * Register level complete callback
   * @param {Function} callback - Function to call when level is complete
   */
  onLevelCompleteCallback(callback) {
    this.onLevelComplete = callback;
  }

  /**
   * Notify observers of state change
   */
  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  /**
   * Validate if a move would be legal
   * @param {number} fromIndex - Source conduit index
   * @param {number} toIndex - Target conduit index
   * @returns {boolean} True if move would be valid
   */
  isValidMove(fromIndex, toIndex) {
    // Check basic conditions without actually moving
    if (this.state.isConduitEmpty(fromIndex)) return false;
    if (this.state.isConduitFull(toIndex)) return false;
    if (fromIndex === toIndex) return false;

    const fromCore = this.state.getTopCore(fromIndex);
    const toCore = this.state.getTopCore(toIndex);

    // Colors must match if target is not empty
    if (toCore !== null && toCore !== fromCore) return false;

    return true;
  }
}
