import type { ConduitStack, CoreColor, LevelDefinition } from './types.js';

const PALETTE: CoreColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

const BASE_LEVELS: LevelDefinition[] = [
  {
    id: 1,
    name: 'Getting Started',
    conduits: [
      ['red', 'red'],
      ['blue', 'blue'],
      [],
      []
    ],
    maxCores: 2,
    difficulty: 'easy'
  },
  {
    id: 2,
    name: 'Color Separation',
    conduits: [
      ['red', 'blue'],
      ['blue', 'red'],
      [],
      []
    ],
    maxCores: 2,
    difficulty: 'easy'
  },
  {
    id: 3,
    name: 'Triple Threat',
    conduits: [
      ['red', 'blue', 'green'],
      ['green', 'red', 'blue'],
      [],
      []
    ],
    maxCores: 3,
    difficulty: 'easy'
  },
  {
    id: 4,
    name: 'Careful Planning',
    conduits: [
      ['red', 'blue', 'red'],
      ['green', 'blue', 'green'],
      ['blue', 'red', 'green'],
      [],
      []
    ],
    maxCores: 3,
    difficulty: 'medium'
  },
  {
    id: 5,
    name: 'No Room for Error',
    conduits: [
      ['red', 'red', 'blue', 'blue'],
      ['green', 'green', 'yellow', 'yellow'],
      ['blue', 'blue', 'red', 'red'],
      ['yellow', 'yellow', 'green', 'green'],
      [],
      []
    ],
    maxCores: 4,
    difficulty: 'medium'
  }
];

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const clone = [...values];
  for (let index = clone.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function generateLevel(levelId: number): LevelDefinition {
  const random = mulberry32(levelId * 1013);
  const colorCount = Math.min(3 + Math.floor(levelId / 10), 6);
  const maxCores = levelId < 30 ? 4 : 5;
  const colors = PALETTE.slice(0, colorCount);
  const conduitCount = colorCount + 2;

  const corePool: CoreColor[] = [];
  colors.forEach((color) => {
    for (let count = 0; count < maxCores; count++) {
      corePool.push(color);
    }
  });

  const shuffled = shuffle(corePool, random);
  const conduits: ConduitStack[] = [];

  for (let conduitIndex = 0; conduitIndex < colorCount; conduitIndex++) {
    const conduit = shuffled.slice(conduitIndex * maxCores, (conduitIndex + 1) * maxCores);
    conduits.push(conduit);
  }

  while (conduits.length < conduitCount) {
    conduits.push([]);
  }

  const difficulty = levelId < 25 ? 'medium' : levelId < 60 ? 'hard' : 'expert';

  return {
    id: levelId,
    name: `Gridlock ${levelId}`,
    conduits,
    maxCores,
    difficulty
  };
}

const GENERATED_LEVELS = Array.from({ length: 95 }, (_, index) => generateLevel(index + 6));

export const LEVELS: LevelDefinition[] = [...BASE_LEVELS, ...GENERATED_LEVELS];

export function getLevel(levelId: number): LevelDefinition | null {
  return LEVELS.find((level) => level.id === levelId) ?? null;
}

export function getTotalLevels(): number {
  return LEVELS.length;
}

export function isLevelComplete(conduits: ConduitStack[]): boolean {
  for (const conduit of conduits) {
    if (conduit.length === 0) continue;
    const firstColor = conduit[0];
    const allSame = conduit.every((core) => core === firstColor);
    if (!allSame) return false;
  }
  return true;
}
