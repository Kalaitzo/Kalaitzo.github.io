/**
 * Creates the HUD overlay: welcome screen, station prompts, progress bar.
 * Returns { showWelcome, hideWelcome, showPrompt, hidePrompt, updateProgress, dispose }
 */
export function createHUD(stations) {
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.innerHTML = `
    <div class="hud-welcome">
      <h1 class="hud-name">Vasileios Kalaitzopoulos</h1>
      <p class="hud-subtitle">Robotics | Computer Vision | Software Engineering</p>
      <p class="hud-hint">${'ontouchstart' in window ? 'Tap arrows to explore' : 'Use arrow keys to explore'}</p>
    </div>
    <div class="hud-prompt" aria-hidden="true">
      <span class="hud-prompt-text">Press Enter to open</span>
    </div>
    <div class="hud-progress">
      <div class="hud-progress-track">
        <div class="hud-progress-dot hud-robot-dot"></div>
      </div>
    </div>
  `;
  document.body.appendChild(hud);

  const welcome = hud.querySelector('.hud-welcome');
  const prompt = hud.querySelector('.hud-prompt');
  const promptText = hud.querySelector('.hud-prompt-text');
  const track = hud.querySelector('.hud-progress-track');
  const robotDot = hud.querySelector('.hud-robot-dot');

  // Create station dots on the progress bar
  const minX = -3;
  const maxX = 15;
  const range = maxX - minX;

  stations.forEach((s) => {
    const dot = document.createElement('div');
    dot.className = 'hud-station-dot';
    dot.title = s.name;
    dot.style.left = `${((s.x - minX) / range) * 100}%`;

    const label = document.createElement('span');
    label.className = 'hud-station-label';
    label.textContent = s.name;
    dot.appendChild(label);

    track.appendChild(dot);
  });

  return {
    showWelcome() {
      welcome.classList.remove('hidden');
    },

    hideWelcome() {
      welcome.classList.add('hidden');
    },

    showPrompt(stationName) {
      const action = 'ontouchstart' in window ? 'Tap ✓' : 'Press Enter';
      promptText.textContent = `${action} — ${stationName}`;
      prompt.classList.add('visible');
    },

    hidePrompt() {
      prompt.classList.remove('visible');
    },

    updateProgress(robotX) {
      const pct = ((robotX - minX) / range) * 100;
      robotDot.style.left = `${pct}%`;
    },

    dispose() {
      hud.remove();
    },
  };
}
