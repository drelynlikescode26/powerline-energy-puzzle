const PALETTE = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

const BASE_LEVELS = [
  {
    id: 1,
    name: 'First Sparks',
    conduits: [['red', 'blue'], ['blue', 'red'], [], []],
    maxCores: 2,
    difficulty: 'easy'
  },
  {
    id: 2,
    name: 'Color Separation',
    conduits: [['red', 'blue', 'green'], ['green', 'red', 'blue'], ['blue', 'green', 'red'], [], []],
    maxCores: 3,
    difficulty: 'easy'
  },
  {
    id: 3,
    name: 'Triple Threat',
    conduits: [
      ['red', 'blue', 'green'],
      ['yellow', 'red', 'blue'],
      ['green', 'yellow', 'red'],
      ['blue', 'green', 'yellow'],
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
      ['red', 'blue', 'green', 'yellow'],
      ['yellow', 'red', 'blue', 'green'],
      ['green', 'yellow', 'red', 'blue'],
      ['blue', 'green', 'yellow', 'red'],
      [],
      []
    ],
    maxCores: 4,
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

function mulberry32(seed) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values, random) {
  const clone = [...values];
  for (let index = clone.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function generateLevel(levelId) {
  const random = mulberry32(levelId * 1013);
  const colorCount = Math.min(3 + Math.floor(levelId / 10), 6);
  const maxCores = levelId < 30 ? 4 : 5;
  const colors = PALETTE.slice(0, colorCount);
  const conduitCount = colorCount + 2;

  const corePool = [];
  colors.forEach((color) => {
    for (let count = 0; count < maxCores; count++) {
      corePool.push(color);
    }
  });

  const shuffled = shuffle(corePool, random);
  const conduits = [];

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

export const LEVELS = [...BASE_LEVELS, ...GENERATED_LEVELS];

export function getLevel(levelId) {
  return LEVELS.find((level) => level.id === levelId) ?? null;
}

export function getTotalLevels() {
  return LEVELS.length;
}

export function isLevelComplete(conduits) {
  for (const conduit of conduits) {
    if (conduit.length === 0) continue;
    const firstColor = conduit[0];
    const allSame = conduit.every((core) => core === firstColor);
    if (!allSame) return false;
  }
  return true;
}
