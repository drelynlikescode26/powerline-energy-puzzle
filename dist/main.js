import { GameEngine } from './gameEngine.js';
import { Renderer } from './renderer.js';

class PowerlineGame {
  constructor() {
    this.engine = new GameEngine();
    this.renderer = new Renderer('#conduits-container');
    this.selectedConduit = null;
    this.isInputLocked = false;
    this.init();
  }

  init() {
    this.engine.onStateChangeCallback((state) => {
      this.renderer.render(state);
      this.renderer.updateControls(state);
    });

    this.engine.onLevelCompleteCallback((data) => {
      this.selectedConduit = null;
      this.isInputLocked = false;
      this.renderer.clearSelection();
      this.renderer.showLevelComplete(data);
    });

    this.renderer.onConduitClickCallback((index) => {
      this.handleConduitClick(index);
    });

    this.renderer.onNextLevelCallback(() => {
      this.selectedConduit = null;
      this.isInputLocked = false;
      this.renderer.clearSelection();
      this.engine.nextLevel();
    });

    this.setupControls();
    this.engine.init(1);
  }

  setupControls() {
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        this.selectedConduit = null;
        this.isInputLocked = false;
        this.renderer.clearSelection();
        this.engine.undo();
      });
    }

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.selectedConduit = null;
        this.isInputLocked = false;
        this.renderer.clearSelection();
        this.engine.restart();
      });
    }

    const restartIconBtn = document.getElementById('restart-icon-btn');
    if (restartIconBtn) {
      restartIconBtn.addEventListener('click', () => {
        this.selectedConduit = null;
        this.isInputLocked = false;
        this.renderer.clearSelection();
        this.engine.restart();
      });
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        this.handleHint();
      });
    }
  }

  handleConduitClick(index) {
    if (this.isInputLocked) return;

    if (this.selectedConduit === null) {
      if (this.engine.state.isConduitEmpty(index)) return;
      this.selectedConduit = index;
      this.renderer.setSelectedConduit(index);
      this.renderer.render(this.engine.getState());
      this.triggerHaptic(10);
      return;
    }

    if (this.selectedConduit === index) {
      this.selectedConduit = null;
      this.renderer.clearSelection();
      this.renderer.render(this.engine.getState());
      return;
    }

    const sourceIndex = this.selectedConduit;
    const color = this.engine.peekTopCore(sourceIndex);
    const success = this.engine.move(sourceIndex, index);

    if (!success || !color) {
      this.renderer.showInvalidMove(index);
      this.triggerHaptic([50, 30, 50]);
      return;
    }

    this.selectedConduit = null;
    this.renderer.clearSelection();
    this.isInputLocked = true;

    this.renderer.animateCoreTransfer(sourceIndex, index, color, () => {
      this.isInputLocked = false;
    });
  }

  handleHint() {
    const hint = this.engine.findBestHintMove(3);
    if (!hint) {
      this.renderer.showHintMessage('No high-value move found. Try undo or restart to open a path.');
      return;
    }

    this.showHintHighlight(hint.from, hint.to);
  }

  showHintHighlight(from, to) {
    const conduitElements = document.querySelectorAll('.conduit');
    const fromElement = conduitElements[from];
    const toElement = conduitElements[to];

    if (!fromElement || !toElement) return;

    fromElement.style.animation = 'hintPulse 1s ease-in-out 2';
    toElement.style.animation = 'hintPulse 1s ease-in-out 2';

    window.setTimeout(() => {
      fromElement.style.animation = '';
      toElement.style.animation = '';
    }, 2000);
  }

  triggerHaptic(pattern) {
    if (!('vibrate' in navigator)) return;
    navigator.vibrate(pattern);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.powerlineGame = new PowerlineGame();
  });
} else {
  window.powerlineGame = new PowerlineGame();
}
