/**
 * Level Definitions
 * Each level defines:
 * - conduits: Array of conduit states, each containing cores (colored energy)
 * - maxCores: Maximum cores per conduit
 * - colors: Available colors in the level
 */

export const LEVELS = [
  // Level 1 - Simple introduction
  {
    id: 1,
    name: "Getting Started",
    conduits: [
      ['green', 'green'],
      ['blue', 'blue'],
      [],
      []
    ],
    maxCores: 2,
    difficulty: 'easy'
  },
  
  // Level 2 - Basic sorting
  {
    id: 2,
    name: "Color Separation",
    conduits: [
      ['red', 'blue'],
      ['blue', 'red'],
      [],
      []
    ],
    maxCores: 2,
    difficulty: 'easy'
  },
  
  // Level 3 - Three colors
  {
    id: 3,
    name: "Triple Threat",
    conduits: [
      ['red', 'blue', 'green'],
      ['green', 'red', 'blue'],
      [],
      []
    ],
    maxCores: 3,
    difficulty: 'easy'
  },
  
  // Level 4 - More complex
  {
    id: 4,
    name: "Careful Planning",
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
  
  // Level 5 - Full conduits
  {
    id: 5,
    name: "No Room for Error",
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

/**
 * Get level by ID
 * @param {number} levelId - The level ID
 * @returns {Object|null} The level object or null if not found
 */
export function getLevel(levelId) {
  return LEVELS.find(level => level.id === levelId) || null;
}

/**
 * Get total number of levels
 * @returns {number} Total levels available
 */
export function getTotalLevels() {
  return LEVELS.length;
}

/**
 * Validate level completion
 * @param {Array<Array<string>>} conduits - Current conduit state
 * @returns {boolean} True if level is complete
 */
export function isLevelComplete(conduits) {
  for (const conduit of conduits) {
    // Skip empty conduits
    if (conduit.length === 0) continue;
    
    // Check if all cores in this conduit are the same color
    const firstColor = conduit[0];
    const allSame = conduit.every(core => core === firstColor);
    
    if (!allSame) {
      return false;
    }
  }
  
  return true;
}
