import { COLOR_MAP } from './types.js';

export class Renderer {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.selectedConduit = null;
    this.onConduitClick = null;
    this.onNextLevel = null;
  }

  render(state) {
    if (!this.container) return;

    this.container.innerHTML = '';
    const { conduits, level, poweredConduits } = state;

    conduits.forEach((conduit, index) => {
      const conduitElement = this.createConduitElement(conduit, index, level.maxCores, poweredConduits[index]);
      this.container.appendChild(conduitElement);
    });

    this.updateBackgroundProgress(state.progress);
  }

  setSelectedConduit(index) {
    this.selectedConduit = index;
  }

  clearSelection() {
    this.selectedConduit = null;
  }

  animateCoreTransfer(fromIndex, toIndex, color, onComplete) {
    if (!this.container) {
      onComplete();
      return;
    }

    const conduits = Array.from(this.container.querySelectorAll('.conduit'));
    const source = conduits[fromIndex];
    const target = conduits[toIndex];

    if (!source || !target) {
      onComplete();
      return;
    }

    source.classList.add('core-moving-out');
    target.classList.add('core-moving-in');

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const travelCore = document.createElement('div');
    travelCore.className = 'flying-core';
    travelCore.style.backgroundColor = COLOR_MAP[color];

    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + 42;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + 42;

    travelCore.style.left = `${startX}px`;
    travelCore.style.top = `${startY}px`;
    travelCore.style.setProperty('--target-x', `${endX - startX}px`);
    travelCore.style.setProperty('--target-y', `${endY - startY}px`);
    document.body.appendChild(travelCore);

    requestAnimationFrame(() => {
      travelCore.classList.add('active');
    });

    window.setTimeout(() => {
      source.classList.remove('core-moving-out');
      target.classList.remove('core-moving-in');
      travelCore.remove();
      onComplete();
    }, 340);
  }

  showInvalidMove(index) {
    if (!this.container) return;
    const conduitElements = this.container.querySelectorAll('.conduit');
    const target = conduitElements[index];
    if (!target) return;

    target.classList.add('invalid-move');
    window.setTimeout(() => target.classList.remove('invalid-move'), 400);
  }

  onConduitClickCallback(callback) {
    this.onConduitClick = callback;
  }

  onNextLevelCallback(callback) {
    this.onNextLevel = callback;
  }

  updateControls(state) {
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) undoBtn.disabled = !state.canUndo;

    const movesDisplay = document.getElementById('moves-display');
    if (movesDisplay) movesDisplay.textContent = `Moves: ${state.moves}`;

    const levelName = document.getElementById('level-name');
    if (levelName) levelName.textContent = `Level ${state.levelId}`;

    const difficultyBadge = document.getElementById('difficulty-badge');
    if (difficultyBadge && state.level && state.level.difficulty) {
      const difficulty = state.level.difficulty;
      difficultyBadge.textContent = String(difficulty).toUpperCase();
      difficultyBadge.className = `difficulty-badge difficulty-${difficulty}`;
    }
  }

  showLevelComplete(data) {
    const message = data.isLastLevel
      ? `🎉 Congratulations! You completed all levels in ${data.moves} moves!`
      : `✅ Level ${data.levelId} Complete! Moves: ${data.moves}`;

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

    const closeBtn = modal.querySelector('#close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.remove());
    }

    const nextBtn = modal.querySelector('#next-level-btn');
    if (nextBtn && this.onNextLevel) {
      nextBtn.addEventListener('click', () => {
        modal.remove();
        this.onNextLevel();
      });
    }
  }

  showHintMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>💡 Hint</h2>
        <p style="margin: 20px 0; font-size: 1.1rem; color: var(--text-secondary);">${message}</p>
        <button id="close-hint-btn" class="control-btn">OK</button>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-hint-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.remove());
    }

    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.remove();
    });
  }

  createConduitElement(cores, index, maxCores, isPowered) {
    const conduitDiv = document.createElement('div');
    conduitDiv.className = 'conduit';
    conduitDiv.dataset.index = String(index);

    if (this.selectedConduit === index) {
      conduitDiv.classList.add('selected');
    }

    if (isPowered) {
      conduitDiv.classList.add('powered-up');
    }

    for (let i = 0; i < maxCores; i++) {
      const slot = document.createElement('div');
      slot.className = 'core-slot';

      if (i < cores.length) {
        const core = document.createElement('div');
        core.className = 'core';
        core.style.backgroundColor = COLOR_MAP[cores[i]];
        core.dataset.color = cores[i];
        slot.appendChild(core);
      }

      conduitDiv.appendChild(slot);
    }

    conduitDiv.addEventListener('click', () => {
      if (this.onConduitClick) this.onConduitClick(index);
    });

    return conduitDiv;
  }

  updateBackgroundProgress(progress) {
    const body = document.body;
    const cold = 0.05;
    const warm = 0.2;
    const intensity = cold + (warm - cold) * progress;
    body.style.setProperty('--progress-glow-a', `rgba(0, 217, 255, ${intensity.toFixed(3)})`);
    body.style.setProperty('--progress-glow-b', `rgba(46, 213, 115, ${(intensity * 0.8).toFixed(3)})`);
  }
}
