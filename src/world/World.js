import * as THREE from 'three';
import { createRenderer, createLights, createGround } from '../robot/sceneSetup.js';
import { createRobot } from '../robot/Robot.js';
import { createWalkController, MOVE_SPEED } from '../robot/walkCycle.js';
import { createRail } from './Rail.js';
import { createStations, updateStations, getActiveStation } from './Station.js';
import { createInputController } from './InputController.js';
import { createTouchControls } from './TouchControls.js';
import { createEnvironment } from './Environment.js';
import { createContentDisplays } from './ContentDisplay.js';

// MOVE_SPEED is imported from walkCycle.js — derived from stride length and animation speed
// so the robot's movement always matches the gait (no foot sliding)
const WORLD_MIN_X = -3;
const WORLD_MAX_X = 15;

/**
 * Initialise the side-scroller world.
 * Returns { dispose, navigateTo, getState } for external wiring.
 */
export function initWorld(canvas) {
  // --- Core ---
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.85, 3.5);

  const lights = createLights(scene);
  createGround(scene, 50);

  // --- Robot ---
  const robot = createRobot();
  scene.add(robot);

  // --- Walk controller (physics-based blending) ---
  const walkCtrl = createWalkController();

  // --- Rail (finite — clip clamps at ends) ---
  const { updateConnector, RAIL_START, RAIL_END } = createRail(scene);

  // --- Stations ---
  const stations = createStations(scene);

  // --- Environment (low-poly scenery) ---
  const { updateEnvironment } = createEnvironment(scene);

  // --- Content displays (drop from rail on approach) ---
  const contentDisplays = createContentDisplays(scene, stations);

  // --- Input ---
  const input = createInputController();
  const touch = createTouchControls();

  // Touch interact button → simulate Enter key
  touch.onInteract(() => {
    input._simulateEnter = true;
  });

  // --- State ---
  const state = {
    robotX: 0,
    facing: 1, // 1 = right, -1 = left
    activeStation: null,
    deployedStation: 'Home', // Home board starts deployed
    autoPilot: null, // { targetX }
    firstInput: false,
  };

  // --- Event callbacks (set externally) ---
  const callbacks = {
    onStationEnter: null,
    onStationLeave: null,
    onContentDeploy: null,
    onContentRetract: null,
    onFirstInput: null,
  };

  // --- Clock ---
  let prevTime = performance.now();

  // --- Resize ---
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();

  // --- Animation loop ---
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - prevTime) / 1000, 0.1);
    prevTime = now;
    const elapsed = now / 1000;

    // --- Input / auto-pilot ---
    // Merge keyboard and touch input (either can drive movement)
    let direction = input.getDirection() || touch.getDirection();

    // First input detection
    if (!state.firstInput && direction !== 0) {
      state.firstInput = true;
      if (callbacks.onFirstInput) callbacks.onFirstInput();
    }

    // User input cancels auto-pilot
    if (direction !== 0 && state.autoPilot) {
      state.autoPilot = null;
    }

    // Auto-pilot
    if (state.autoPilot) {
      const diff = state.autoPilot.targetX - state.robotX;
      if (Math.abs(diff) < 0.15) {
        state.autoPilot = null;
        direction = 0;
      } else {
        direction = diff > 0 ? 1 : -1;
      }
    }

    // --- Movement ---
    const moving = direction !== 0;
    if (moving) {
      state.robotX += direction * MOVE_SPEED * delta;
      state.robotX = Math.max(WORLD_MIN_X, Math.min(WORLD_MAX_X, state.robotX));
      state.facing = direction;
    }

    // --- Walk animation (3-joint IK + root motion) ---
    const { footPlantCorrection } = walkCtrl.update(robot.parts, delta, moving);

    // --- Robot position & facing ---
    // Apply foot-plant correction so the stance foot doesn't slide.
    // The correction shifts the body forward/back so the planted foot
    // stays at a fixed world position (inverted pendulum effect).
    robot.position.x = state.robotX + footPlantCorrection * state.facing;
    const targetRotY = state.facing === 1 ? -Math.PI / 2 : Math.PI / 2;
    robot.rotation.y += (targetRotY - robot.rotation.y) * 0.1;

    // --- String follows robot (pendulum + catenary) ---
    const { stringTaut } = updateConnector(robot.position.x, robot.parts.torso.position.y, delta);

    // If string is taut (robot beyond rail on either side), pull it back
    if (stringTaut) {
      if (state.robotX > RAIL_END) {
        state.robotX -= 0.5 * delta;
      } else if (state.robotX < RAIL_START) {
        state.robotX += 0.5 * delta;
      }
    }

    // --- Camera follow ---
    camera.position.x += (state.robotX - camera.position.x) * 0.05;
    camera.position.y = 0.85;
    camera.position.z = 3.5;
    camera.lookAt(
      camera.position.x + (state.robotX - camera.position.x) * 0.3,
      0.65,
      0,
    );

    // --- Shadow tracking ---
    lights.dirLight.position.x = state.robotX + 3;
    lights.dirLight.target.position.x = state.robotX;

    // --- Accent light follows ---
    lights.accentLight.position.x = state.robotX;

    // --- Enter / Escape for content displays ---
    function toggleContent() {
      if (!state.activeStation) return;
      const d = state.deployedStation;
      if (d === state.activeStation.name) {
        contentDisplays.setDeployed(d, false);
        state.deployedStation = null;
        if (callbacks.onContentRetract) callbacks.onContentRetract();
      } else {
        if (d) contentDisplays.setDeployed(d, false);
        contentDisplays.setDeployed(state.activeStation.name, true);
        state.deployedStation = state.activeStation.name;
        if (callbacks.onContentDeploy) callbacks.onContentDeploy(state.activeStation.name);
      }
    }

    if (input.consumeEnter()) toggleContent();
    if (input.consumeEscape() && state.deployedStation) {
      contentDisplays.setDeployed(state.deployedStation, false);
      state.deployedStation = null;
      if (callbacks.onContentRetract) callbacks.onContentRetract();
    }

    // --- Station proximity ---
    const active = getActiveStation(stations, state.robotX);
    if (active !== state.activeStation) {
      if (active) {
        if (callbacks.onStationEnter) callbacks.onStationEnter(active.name);
      } else {
        // Walked away — retract any deployed content
        if (state.deployedStation) {
          contentDisplays.setDeployed(state.deployedStation, false);
          state.deployedStation = null;
          if (callbacks.onContentRetract) callbacks.onContentRetract();
        }
        if (callbacks.onStationLeave) callbacks.onStationLeave();
      }
      state.activeStation = active;
    }

    // --- Animate content boards (descent/ascent) ---
    contentDisplays.updateDisplays(delta);

    // --- Station glow animation ---
    updateStations(stations, elapsed);

    // --- Environment animation (floating cubes etc) ---
    updateEnvironment(elapsed);

    // --- Render ---
    renderer.render(scene, camera);
  }

  animate();

  // --- Public API ---
  return {
    dispose() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      input.dispose();
      touch.dispose();
      renderer.dispose();
    },

    retractContent() {
      if (state.deployedStation) {
        contentDisplays.setDeployed(state.deployedStation, false);
        state.deployedStation = null;
      }
    },

    navigateTo(stationName) {
      const station = stations.find((s) => s.name === stationName);
      if (station) {
        state.autoPilot = { targetX: station.x };
      }
    },

    getState() {
      return state;
    },

    on(event, fn) {
      if (event in callbacks) callbacks[event] = fn;
    },

    getInput() {
      return input;
    },

    getStations() {
      return stations;
    },
  };
}
