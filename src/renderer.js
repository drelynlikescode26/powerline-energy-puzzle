/**
 * Renderer Module
 * Handles all UI rendering and updates
 */

const COLOR_MAP = {
  'red': '#ff4757',
  'blue': '#3742fa',
  'green': '#2ed573',
  'yellow': '#ffa502',
  'purple': '#a55eea',
  'orange': '#ff6348',
  'pink': '#ff6b9d',
  'cyan': '#00d9ff'
};

export class Renderer {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.selectedConduit = null;
    this.onConduitClick = null;
  }

  /**
   * Render the game state
   * @param {Object} state - Current game state
   */
  render(state) {
    if (!this.container) return;

    this.container.innerHTML = '';

    const { conduits, level } = state;

    conduits.forEach((conduit, index) => {
      const conduitElement = this.createConduitElement(conduit, index, level.maxCores);
      this.container.appendChild(conduitElement);
    });
  }

  /**
   * Create a conduit DOM element
   * @param {Array<string>} cores - Array of core colors
   * @param {number} index - Conduit index
   * @param {number} maxCores - Maximum cores per conduit
   * @returns {HTMLElement} Conduit element
   */
  createConduitElement(cores, index, maxCores) {
    const conduitDiv = document.createElement('div');
    conduitDiv.className = 'conduit';
    conduitDiv.dataset.index = index;

    // Add selected class if this conduit is selected
    if (this.selectedConduit === index) {
      conduitDiv.classList.add('selected');
    }

    // Create slots for cores
    for (let i = 0; i < maxCores; i++) {
      const slot = document.createElement('div');
      slot.className = 'core-slot';

      // Fill slot if core exists at this position
      if (i < cores.length) {
        const core = document.createElement('div');
        core.className = 'core';
        core.style.backgroundColor = COLOR_MAP[cores[i]] || '#808080';
        core.dataset.color = cores[i];
        slot.appendChild(core);
      }

      conduitDiv.appendChild(slot);
    }

    // Add click handler
    conduitDiv.addEventListener('click', () => {
      if (this.onConduitClick) {
        this.onConduitClick(index);
      }
    });

    return conduitDiv;
  }

  /**
   * Set the selected conduit
   * @param {number|null} index - Conduit index or null to clear
   */
  setSelectedConduit(index) {
    this.selectedConduit = index;
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedConduit = null;
  }

  /**
   * Show invalid move feedback
   * @param {number} index - Conduit index
   */
  showInvalidMove(index) {
    const conduitElements = this.container.querySelectorAll('.conduit');
    if (conduitElements[index]) {
      const element = conduitElements[index];
      element.classList.add('invalid-move');
      setTimeout(() => {
        element.classList.remove('invalid-move');
      }, 400);
    }
  }

  /**
   * Register conduit click callback
   * @param {Function} callback - Function to call when conduit is clicked
   */
  onConduitClickCallback(callback) {
    this.onConduitClick = callback;
  }

  /**
   * Update UI controls
   * @param {Object} state - Current game state
   */
  updateControls(state) {
    // Update undo button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
      undoBtn.disabled = !state.canUndo;
    }

    // Update moves display
    const movesDisplay = document.getElementById('moves-display');
    if (movesDisplay) {
      movesDisplay.textContent = `Moves: ${state.moves}`;
    }

    // Update level display
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) {
      levelDisplay.textContent = `Level ${state.levelId}`;
    }
  }

  /**
   * Show level complete message
   * @param {Object} data - Completion data
   */
  showLevelComplete(data) {
    const message = data.isLastLevel 
      ? `🎉 Congratulations! You completed all levels in ${data.moves} moves!`
      : `✅ Level ${data.levelId} Complete! Moves: ${data.moves}`;

    // Create a simple modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${message}</h2>
        ${!data.isLastLevel ? '<button id="next-level-btn" class="control-btn">Next Level</button>' : ''}
        <button id="close-modal-btn" class="control-btn">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn = modal.querySelector('#close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
    }

    const nextBtn = modal.querySelector('#next-level-btn');
    if (nextBtn && this.onNextLevel) {
      nextBtn.addEventListener('click', () => {
        modal.remove();
        this.onNextLevel();
      });
    }
  }

  /**
   * Register next level callback
   * @param {Function} callback - Function to call for next level
   */
  onNextLevelCallback(callback) {
    this.onNextLevel = callback;
  }
}
