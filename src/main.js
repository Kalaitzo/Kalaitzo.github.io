import './style.css';
import { initWorld } from './world/World.js';
import { createContentPanel } from './ui/ContentPanel.js';
import { createHUD } from './ui/HUD.js';

// --- Init world ---
const canvas = document.getElementById('robot-canvas');
const world = initWorld(canvas);

// --- Init UI ---
const panel = createContentPanel();
const hud = createHUD(world.getStations());

// --- Wire up events ---

world.on('onStationEnter', (name) => {
  if (!panel.isVisible()) {
    hud.showPrompt(name);
  }
});

world.on('onStationLeave', () => {
  hud.hidePrompt();
});

world.on('onContentDeploy', () => {
  hud.hidePrompt();
});

world.on('onContentRetract', () => {
  const state = world.getState();
  if (state.activeStation) {
    hud.showPrompt(state.activeStation.name);
  }
});

world.on('onFirstInput', () => {
  hud.hideWelcome();
  const state = world.getState();
  if (state.activeStation) {
    hud.showPrompt(state.activeStation.name);
  }
});

// Hamburger menu → open full CV panel
document.getElementById('menu-btn').addEventListener('click', () => {
  hud.hideWelcome();
  if (panel.isVisible()) {
    panel.hide();
  } else {
    panel.show();
  }
});

// Nav links → auto-pilot robot to station
document.querySelectorAll('[data-station]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    hud.hideWelcome();
    world.navigateTo(link.dataset.station);
    world.retractContent();
    if (panel.isVisible()) panel.hide();
  });
});

// Progress bar update
function updateHUD() {
  requestAnimationFrame(updateHUD);
  hud.updateProgress(world.getState().robotX);
}
updateHUD();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    world.dispose();
    panel.dispose();
    hud.dispose();
  });
}
