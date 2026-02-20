export const COLOR_MAP = {
  red: '#ff4757',
  blue: '#3742fa',
  green: '#2ed573',
  yellow: '#ffa502',
  purple: '#a55eea',
  orange: '#ff6348',
  pink: '#ff6b9d',
  cyan: '#00d9ff'
} as const;

export type CoreColor = keyof typeof COLOR_MAP;
export type ConduitStack = CoreColor[];

export interface GameMove {
  from: number;
  to: number;
}

export type GameHistory = GameMove[];

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface LevelDefinition {
  id: number;
  name: string;
  conduits: ConduitStack[];
  maxCores: number;
  difficulty: Difficulty;
}

export interface GameStateSnapshot {
  levelId: number;
  level: LevelDefinition;
  conduits: ConduitStack[];
  moves: number;
  canUndo: boolean;
  isComplete: boolean;
  progress: number;
  poweredConduits: boolean[];
}

export interface LevelCompleteData {
  levelId: number;
  moves: number;
  isLastLevel: boolean;
}

export interface HintMove {
  from: number;
  to: number;
  score: number;
}
