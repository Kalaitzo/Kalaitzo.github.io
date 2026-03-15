/**
 * Tracks keyboard state for robot movement and UI actions.
 * Returns a controller object with direction queries and disposal.
 */
export function createInputController() {
  const keys = {};
  let enterPressed = false;
  let escapePressed = false;

  function onKeyDown(e) {
    keys[e.code] = true;

    if (e.code === 'Enter') enterPressed = true;
    if (e.code === 'Escape') escapePressed = true;
  }

  function onKeyUp(e) {
    keys[e.code] = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    /** Returns -1 (left), 0 (idle), or 1 (right) */
    getDirection() {
      const left = keys['ArrowLeft'] || keys['KeyA'];
      const right = keys['ArrowRight'] || keys['KeyD'];
      if (left && !right) return -1;
      if (right && !left) return 1;
      return 0;
    },

    isMoving() {
      return this.getDirection() !== 0;
    },

    /** Returns true once per press, then resets */
    consumeEnter() {
      if (enterPressed || this._simulateEnter) {
        enterPressed = false;
        this._simulateEnter = false;
        return true;
      }
      return false;
    },

    /** Returns true once per press, then resets */
    consumeEscape() {
      if (escapePressed) {
        escapePressed = false;
        return true;
      }
      return false;
    },

    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}
