/**
 * Game State Management
 * Handles the game's state including conduits, move history, and level tracking
 */

export class GameState {
  constructor() {
    this.currentLevel = null;
    this.conduits = [];
    this.maxCores = 0;
    this.moveHistory = [];
    this.moveCount = 0;
    this.initialState = null;
  }

  /**
   * Initialize game state with a level
   * @param {Object} level - Level configuration
   */
  initLevel(level) {
    this.currentLevel = level;
    this.maxCores = level.maxCores;
    // Deep clone the conduits to avoid reference issues
    this.conduits = level.conduits.map(conduit => [...conduit]);
    // Store initial state for restart functionality
    this.initialState = level.conduits.map(conduit => [...conduit]);
    this.moveHistory = [];
    this.moveCount = 0;
  }

  /**
   * Get current conduits state
   * @returns {Array<Array<string>>} Current conduits
   */
  getConduits() {
    return this.conduits;
  }

  /**
   * Get top core from a conduit
   * @param {number} conduitIndex - Index of the conduit
   * @returns {string|null} Color of top core or null if empty
   */
  getTopCore(conduitIndex) {
    const conduit = this.conduits[conduitIndex];
    if (!conduit || conduit.length === 0) return null;
    return conduit[conduit.length - 1];
  }

  /**
   * Check if a conduit is full
   * @param {number} conduitIndex - Index of the conduit
   * @returns {boolean} True if conduit is full
   */
  isConduitFull(conduitIndex) {
    return this.conduits[conduitIndex].length >= this.maxCores;
  }

  /**
   * Check if a conduit is empty
   * @param {number} conduitIndex - Index of the conduit
   * @returns {boolean} True if conduit is empty
   */
  isConduitEmpty(conduitIndex) {
    return this.conduits[conduitIndex].length === 0;
  }

  /**
   * Check if all cores in a conduit are the same color
   * @param {number} conduitIndex - Index of the conduit
   * @returns {boolean} True if all cores are same color or conduit is empty
   */
  isConduitUniform(conduitIndex) {
    const conduit = this.conduits[conduitIndex];
    if (conduit.length === 0) return true;
    
    const firstColor = conduit[0];
    return conduit.every(core => core === firstColor);
  }

  /**
   * Move a core from one conduit to another
   * @param {number} fromIndex - Source conduit index
   * @param {number} toIndex - Target conduit index
   * @returns {boolean} True if move was successful
   */
  moveCore(fromIndex, toIndex) {
    // Can't move from empty conduit
    if (this.isConduitEmpty(fromIndex)) {
      return false;
    }

    // Can't move to full conduit
    if (this.isConduitFull(toIndex)) {
      return false;
    }

    // Can't move to same conduit
    if (fromIndex === toIndex) {
      return false;
    }

    const fromCore = this.getTopCore(fromIndex);
    const toCore = this.getTopCore(toIndex);

    // If target conduit is not empty, core colors must match
    if (toCore !== null && toCore !== fromCore) {
      return false;
    }

    // Don't allow moving from a complete uniform conduit to an empty conduit
    // (this is a common puzzle game rule to prevent trivial moves)
    if (this.isConduitUniform(fromIndex) && 
        this.isConduitFull(fromIndex) && 
        this.isConduitEmpty(toIndex)) {
      return false;
    }

    // Perform the move
    const core = this.conduits[fromIndex].pop();
    this.conduits[toIndex].push(core);

    // Record the move in history
    this.moveHistory.push({ from: fromIndex, to: toIndex });
    this.moveCount++;

    return true;
  }

  /**
   * Undo the last move
   * @returns {boolean} True if undo was successful
   */
  undo() {
    if (this.moveHistory.length === 0) {
      return false;
    }

    const lastMove = this.moveHistory.pop();
    
    // Reverse the move
    const core = this.conduits[lastMove.to].pop();
    this.conduits[lastMove.from].push(core);
    
    this.moveCount--;

    return true;
  }

  /**
   * Restart the current level
   */
  restart() {
    if (!this.initialState) {
      return;
    }

    // Reset to initial state
    this.conduits = this.initialState.map(conduit => [...conduit]);
    this.moveHistory = [];
    this.moveCount = 0;
  }

  /**
   * Get current move count
   * @returns {number} Number of moves made
   */
  getMoveCount() {
    return this.moveCount;
  }

  /**
   * Check if undo is available
   * @returns {boolean} True if there are moves to undo
   */
  canUndo() {
    return this.moveHistory.length > 0;
  }

  /**
   * Get current level info
   * @returns {Object|null} Current level object
   */
  getCurrentLevel() {
    return this.currentLevel;
  }
}
