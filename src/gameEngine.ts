import { GameState } from './gameState.js';
import { getLevel, getTotalLevels, isLevelComplete } from './levels.js';
import type { ConduitStack, CoreColor, GameStateSnapshot, HintMove, LevelCompleteData } from './types.js';

type StateChangeCallback = (state: GameStateSnapshot) => void;
type LevelCompleteCallback = (data: LevelCompleteData) => void;

export class GameEngine {
  state = new GameState();
  private currentLevelId = 1;
  private onStateChange: StateChangeCallback | null = null;
  private onLevelComplete: LevelCompleteCallback | null = null;

  init(levelId = 1): void {
    this.loadLevel(levelId);
  }

  loadLevel(levelId: number): boolean {
    const level = getLevel(levelId);
    if (!level) {
      console.error(`Level ${levelId} not found`);
      return false;
    }

    this.currentLevelId = levelId;
    this.state.initLevel(level);
    this.notifyStateChange();
    if (this.checkCompletion()) {
      this.handleLevelComplete();
    }
    return true;
  }

  move(fromIndex: number, toIndex: number): boolean {
    const success = this.state.moveCore(fromIndex, toIndex);
    if (!success) return false;

    this.notifyStateChange();
    if (this.checkCompletion()) {
      this.handleLevelComplete();
    }
    return true;
  }

  undo(): boolean {
    const success = this.state.undo();
    if (success) this.notifyStateChange();
    return success;
  }

  restart(): void {
    this.state.restart();
    this.notifyStateChange();
  }

  nextLevel(): boolean {
    return this.loadLevel(this.currentLevelId + 1);
  }

  peekTopCore(index: number): CoreColor | null {
    return this.state.getTopCore(index);
  }

  isValidMove(fromIndex: number, toIndex: number): boolean {
    return this.state.canMove(fromIndex, toIndex);
  }

  findBestHintMove(depth = 2): HintMove | null {
    const level = this.state.getCurrentLevel();
    if (!level) return null;

    const maxCores = level.maxCores;
    const conduits = this.state.getConduits();
    const moves = this.listValidMoves(conduits, maxCores);

    if (moves.length === 0) return null;

    let bestMove: HintMove | null = null;

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

  getState(): GameStateSnapshot {
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

  onStateChangeCallback(callback: StateChangeCallback): void {
    this.onStateChange = callback;
  }

  onLevelCompleteCallback(callback: LevelCompleteCallback): void {
    this.onLevelComplete = callback;
  }

  private checkCompletion(): boolean {
    return isLevelComplete(this.state.getConduits());
  }

  private handleLevelComplete(): void {
    if (!this.onLevelComplete) return;

    this.onLevelComplete({
      levelId: this.currentLevelId,
      moves: this.state.getMoveCount(),
      isLastLevel: this.currentLevelId >= getTotalLevels()
    });
  }

  private notifyStateChange(): void {
    if (!this.onStateChange) return;
    this.onStateChange(this.getState());
  }

  private calculateProgress(conduits: ConduitStack[], maxCores: number): number {
    const filledConduits = conduits.filter((conduit) => conduit.length > 0);
    if (filledConduits.length === 0) return 0;

    const solved = filledConduits.filter((conduit) => {
      if (conduit.length !== maxCores) return false;
      return conduit.every((core) => core === conduit[0]);
    }).length;

    return Math.min(1, Math.max(0, solved / filledConduits.length));
  }

  private cloneConduits(conduits: ConduitStack[]): ConduitStack[] {
    return conduits.map((conduit) => [...conduit]);
  }

  private listValidMoves(conduits: ConduitStack[], maxCores: number): Array<{ from: number; to: number }> {
    const validMoves: Array<{ from: number; to: number }> = [];

    for (let from = 0; from < conduits.length; from++) {
      for (let to = 0; to < conduits.length; to++) {
        if (this.isValidMoveFor(conduits, from, to, maxCores)) {
          validMoves.push({ from, to });
        }
      }
    }

    return validMoves;
  }

  private isValidMoveFor(conduits: ConduitStack[], from: number, to: number, maxCores: number): boolean {
    if (from === to) return false;
    const fromConduit = conduits[from];
    const toConduit = conduits[to];

    if (fromConduit.length === 0) return false;
    if (toConduit.length >= maxCores) return false;

    const fromCore = fromConduit[fromConduit.length - 1];
    const toCore = toConduit[toConduit.length - 1] ?? null;

    if (toCore && fromCore !== toCore) return false;

    return true;
  }

  private applyMove(conduits: ConduitStack[], from: number, to: number): void {
    const core = conduits[from].pop();
    if (!core) return;
    conduits[to].push(core);
  }

  private searchScore(conduits: ConduitStack[], maxCores: number, depth: number): number {
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

  private evaluateConduits(conduits: ConduitStack[], maxCores: number): number {
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
