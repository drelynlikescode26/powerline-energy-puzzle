export class GameState {
  constructor() {
    this.currentLevel = null;
    this.conduits = [];
    this.maxCores = 0;
    this.moveHistory = [];
    this.moveCount = 0;
    this.initialState = [];
  }

  initLevel(level) {
    this.currentLevel = level;
    this.maxCores = level.maxCores;
    this.conduits = level.conduits.map((conduit) => [...conduit]);
    this.initialState = level.conduits.map((conduit) => [...conduit]);
    this.moveHistory = [];
    this.moveCount = 0;
  }

  getConduits() {
    return this.conduits.map((conduit) => [...conduit]);
  }

  getTopCore(conduitIndex) {
    const conduit = this.conduits[conduitIndex];
    if (!conduit || conduit.length === 0) return null;
    return conduit[conduit.length - 1];
  }

  isConduitFull(conduitIndex) {
    return this.conduits[conduitIndex].length >= this.maxCores;
  }

  isConduitEmpty(conduitIndex) {
    return this.conduits[conduitIndex].length === 0;
  }

  isConduitUniform(conduitIndex) {
    const conduit = this.conduits[conduitIndex];
    if (conduit.length === 0) return true;
    const firstColor = conduit[0];
    return conduit.every((core) => core === firstColor);
  }

  canMove(fromIndex, toIndex) {
    if (this.isConduitEmpty(fromIndex)) return false;
    if (this.isConduitFull(toIndex)) return false;
    if (fromIndex === toIndex) return false;

    const fromCore = this.getTopCore(fromIndex);
    const toCore = this.getTopCore(toIndex);

    if (!fromCore) return false;
    if (toCore !== null && toCore !== fromCore) return false;

    if (this.isConduitUniform(fromIndex) && this.isConduitFull(fromIndex) && this.isConduitEmpty(toIndex)) {
      return false;
    }

    return true;
  }

  moveCore(fromIndex, toIndex) {
    if (!this.canMove(fromIndex, toIndex)) return false;

    const core = this.conduits[fromIndex].pop();
    if (!core) return false;

    if (this.conduits[toIndex].length >= this.maxCores) {
      this.conduits[fromIndex].push(core);
      return false;
    }

    this.conduits[toIndex].push(core);
    this.moveHistory.push({ from: fromIndex, to: toIndex });
    this.moveCount++;

    return true;
  }

  undo() {
    if (this.moveHistory.length === 0) return false;

    const lastMove = this.moveHistory.pop();
    const core = this.conduits[lastMove.to].pop();
    if (!core) return false;

    this.conduits[lastMove.from].push(core);
    this.moveCount--;
    return true;
  }

  restart() {
    this.conduits = this.initialState.map((conduit) => [...conduit]);
    this.moveHistory = [];
    this.moveCount = 0;
  }

  getMoveCount() {
    return this.moveCount;
  }

  canUndo() {
    return this.moveHistory.length > 0;
  }

  getCurrentLevel() {
    return this.currentLevel;
  }
}
