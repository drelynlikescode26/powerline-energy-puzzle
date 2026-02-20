import { GameState } from './gameState.js';
import { getLevel, getTotalLevels, isLevelComplete } from './levels.js';

export class GameEngine {
  constructor() {
    this.state = new GameState();
    this.currentLevelId = 1;
    this.onStateChange = null;
    this.onLevelComplete = null;
  }

  init(levelId = 1) {
    this.loadLevel(levelId);
  }

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

  move(fromIndex, toIndex) {
    const success = this.state.moveCore(fromIndex, toIndex);
    if (!success) return false;

    this.notifyStateChange();
    if (this.checkCompletion()) {
      this.handleLevelComplete();
    }
    return true;
  }

  undo() {
    const success = this.state.undo();
    if (success) this.notifyStateChange();
    return success;
  }

  restart() {
    this.state.restart();
    this.notifyStateChange();
  }

  nextLevel() {
    return this.loadLevel(this.currentLevelId + 1);
  }

  peekTopCore(index) {
    return this.state.getTopCore(index);
  }

  isValidMove(fromIndex, toIndex) {
    return this.state.canMove(fromIndex, toIndex);
  }

  findBestHintMove(depth = 2) {
    const level = this.state.getCurrentLevel();
    if (!level) return null;

    const maxCores = level.maxCores;
    const conduits = this.state.getConduits();
    const moves = this.listValidMoves(conduits, maxCores);

    if (moves.length === 0) return null;

    let bestMove = null;

    for (const move of moves) {
      const cloned = this.cloneConduits(conduits);
      this.applyMove(cloned, move.from, move.to);

      const score = this.searchScore(cloned, maxCores, depth - 1);
      if (!bestMove || score > bestMove.score) {
        bestMove = { ...move, score };
      }
    }

    return bestMove;
  }

  getState() {
    const level = this.state.getCurrentLevel();
    if (!level) {
      throw new Error('Game state accessed before initialization.');
    }

    const conduits = this.state.getConduits();
    const poweredConduits = conduits.map((conduit) => {
      if (conduit.length !== level.maxCores || conduit.length === 0) return false;
      return conduit.every((core) => core === conduit[0]);
    });

    return {
      levelId: this.currentLevelId,
      level,
      conduits,
      moves: this.state.getMoveCount(),
      canUndo: this.state.canUndo(),
      isComplete: this.checkCompletion(),
      progress: this.calculateProgress(conduits, level.maxCores),
      poweredConduits
    };
  }

  onStateChangeCallback(callback) {
    this.onStateChange = callback;
  }

  onLevelCompleteCallback(callback) {
    this.onLevelComplete = callback;
  }

  checkCompletion() {
    return isLevelComplete(this.state.getConduits());
  }

  handleLevelComplete() {
    if (!this.onLevelComplete) return;

    this.onLevelComplete({
      levelId: this.currentLevelId,
      moves: this.state.getMoveCount(),
      isLastLevel: this.currentLevelId >= getTotalLevels()
    });
  }

  notifyStateChange() {
    if (!this.onStateChange) return;
    this.onStateChange(this.getState());
  }

  calculateProgress(conduits, maxCores) {
    const filledConduits = conduits.filter((conduit) => conduit.length > 0);
    if (filledConduits.length === 0) return 0;

    const solved = filledConduits.filter((conduit) => {
      if (conduit.length !== maxCores) return false;
      return conduit.every((core) => core === conduit[0]);
    }).length;

    return Math.min(1, Math.max(0, solved / filledConduits.length));
  }

  cloneConduits(conduits) {
    return conduits.map((conduit) => [...conduit]);
  }

  listValidMoves(conduits, maxCores) {
    const validMoves = [];

    for (let from = 0; from < conduits.length; from++) {
      for (let to = 0; to < conduits.length; to++) {
        if (this.isValidMoveFor(conduits, from, to, maxCores)) {
          validMoves.push({ from, to });
        }
      }
    }

    return validMoves;
  }

  isValidMoveFor(conduits, from, to, maxCores) {
    if (from === to) return false;
    const fromConduit = conduits[from];
    const toConduit = conduits[to];

    if (fromConduit.length === 0) return false;
    if (toConduit.length >= maxCores) return false;

    const fromCore = fromConduit[fromConduit.length - 1];
    const toCore = toConduit[toConduit.length - 1] ?? null;

    if (toCore && fromCore !== toCore) return false;

    const fromUniform = fromConduit.every((core) => core === fromConduit[0]);
    if (fromUniform && fromConduit.length === maxCores && toConduit.length === 0) {
      return false;
    }

    return true;
  }

  applyMove(conduits, from, to) {
    const core = conduits[from].pop();
    if (!core) return;
    conduits[to].push(core);
  }

  searchScore(conduits, maxCores, depth) {
    const currentScore = this.evaluateConduits(conduits, maxCores);
    if (depth <= 0) return currentScore;

    const moves = this.listValidMoves(conduits, maxCores);
    if (moves.length === 0) return currentScore - 25;

    let best = Number.NEGATIVE_INFINITY;
    for (const move of moves) {
      const cloned = this.cloneConduits(conduits);
      this.applyMove(cloned, move.from, move.to);
      const nextScore = this.searchScore(cloned, maxCores, depth - 1);
      if (nextScore > best) best = nextScore;
    }

    return best;
  }

  evaluateConduits(conduits, maxCores) {
    let score = 0;

    for (const conduit of conduits) {
      if (conduit.length === 0) {
        score += 4;
        continue;
      }

      const sameAsBase = conduit.filter((core) => core === conduit[0]).length;
      score += sameAsBase * 3;

      if (conduit.length === maxCores && conduit.every((core) => core === conduit[0])) {
        score += 100;
      }
    }

    return score;
  }
}
