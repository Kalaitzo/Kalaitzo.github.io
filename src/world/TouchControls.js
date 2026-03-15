/**
 * On-screen touch controls for mobile.
 * Two arrow buttons at bottom corners + tap-to-interact prompt.
 * Only activates on touch-capable devices.
 */
export function createTouchControls() {
  // Only show on actual mobile/tablet — not laptops with touchscreen
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
  if (!isMobile) {
    return { getDirection: () => 0, onInteract: () => {}, setInteractActive: () => {}, dispose: () => {} };
  }

  let direction = 0;

  const container = document.createElement('div');
  container.className = 'touch-controls';
  container.innerHTML = `
    <button class="touch-btn touch-left" aria-label="Walk left">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
    </button>
    <button class="touch-btn touch-interact" aria-label="Interact">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    </button>
    <button class="touch-btn touch-right" aria-label="Walk right">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
    </button>
  `;
  document.body.appendChild(container);

  const leftBtn = container.querySelector('.touch-left');
  const rightBtn = container.querySelector('.touch-right');
  const interactBtn = container.querySelector('.touch-interact');

  let enterCallback = null;

  // Use pointer events for cross-device compat
  function startLeft(e) { e.preventDefault(); direction = -1; }
  function startRight(e) { e.preventDefault(); direction = 1; }
  function stop(e) { e.preventDefault(); direction = 0; }
  function interact(e) {
    e.preventDefault();
    if (enterCallback) enterCallback();
  }

  leftBtn.addEventListener('pointerdown', startLeft);
  leftBtn.addEventListener('pointerup', stop);
  leftBtn.addEventListener('pointerleave', stop);
  leftBtn.addEventListener('pointercancel', stop);

  rightBtn.addEventListener('pointerdown', startRight);
  rightBtn.addEventListener('pointerup', stop);
  rightBtn.addEventListener('pointerleave', stop);
  rightBtn.addEventListener('pointercancel', stop);

  interactBtn.addEventListener('pointerdown', interact);

  return {
    getDirection() {
      return direction;
    },

    onInteract(fn) {
      enterCallback = fn;
    },

    /** Highlight the interact button when near a station */
    setInteractActive(active) {
      interactBtn.classList.toggle('active', active);
    },

    dispose() {
      container.remove();
    },
  };
}
