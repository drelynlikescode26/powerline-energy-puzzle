import type { ConduitStack, CoreColor, GameHistory, GameMove, LevelDefinition } from './types.js';

export class GameState {
  private currentLevel: LevelDefinition | null = null;
  private conduits: ConduitStack[] = [];
  private maxCores = 0;
  private moveHistory: GameHistory = [];
  private moveCount = 0;
  private initialState: ConduitStack[] = [];

  initLevel(level: LevelDefinition): void {
    this.currentLevel = level;
    this.maxCores = level.maxCores;
    this.conduits = level.conduits.map((conduit) => [...conduit]);
    this.initialState = level.conduits.map((conduit) => [...conduit]);
    this.moveHistory = [];
    this.moveCount = 0;
  }

  getConduits(): ConduitStack[] {
    return this.conduits.map((conduit) => [...conduit]);
  }

  getTopCore(conduitIndex: number): CoreColor | null {
    const conduit = this.conduits[conduitIndex];
    if (!conduit || conduit.length === 0) return null;
    return conduit[conduit.length - 1];
  }

  isConduitFull(conduitIndex: number): boolean {
    return this.conduits[conduitIndex].length >= this.maxCores;
  }

  isConduitEmpty(conduitIndex: number): boolean {
    return this.conduits[conduitIndex].length === 0;
  }

  isConduitUniform(conduitIndex: number): boolean {
    const conduit = this.conduits[conduitIndex];
    if (conduit.length === 0) return true;
    const firstColor = conduit[0];
    return conduit.every((core) => core === firstColor);
  }

  canMove(fromIndex: number, toIndex: number): boolean {
    if (this.isConduitEmpty(fromIndex)) return false;
    if (this.isConduitFull(toIndex)) return false;
    if (fromIndex === toIndex) return false;

    const fromCore = this.getTopCore(fromIndex);
    const toCore = this.getTopCore(toIndex);

    if (!fromCore) return false;
    if (toCore !== null && toCore !== fromCore) return false;

    return true;
  }

  moveCore(fromIndex: number, toIndex: number): boolean {
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

  undo(): boolean {
    if (this.moveHistory.length === 0) return false;

    const lastMove = this.moveHistory.pop() as GameMove;
    const core = this.conduits[lastMove.to].pop();
    if (!core) return false;

    this.conduits[lastMove.from].push(core);
    this.moveCount--;
    return true;
  }

  restart(): void {
    this.conduits = this.initialState.map((conduit) => [...conduit]);
    this.moveHistory = [];
    this.moveCount = 0;
  }

  getMoveCount(): number {
    return this.moveCount;
  }

  canUndo(): boolean {
    return this.moveHistory.length > 0;
  }

  getCurrentLevel(): LevelDefinition | null {
    return this.currentLevel;
  }

  getMaxCores(): number {
    return this.maxCores;
  }
}
