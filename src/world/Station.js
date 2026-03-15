import * as THREE from 'three';

const STATIONS = [
  { name: 'Home', x: 0, label: 'HOME' },
  { name: 'Education', x: 3, label: 'EDUCATION' },
  { name: 'Projects', x: 6, label: 'PROJECTS' },
  { name: 'Experience', x: 9, label: 'EXPERIENCE' },
  { name: 'Skills', x: 12, label: 'SKILLS' },
];

const INTERACT_RADIUS = 1.5;

// Shared materials
const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.85, flatShading: true });
const metalMat = new THREE.MeshStandardMaterial({ color: 0x3a3a42, roughness: 0.4, metalness: 0.6 });

function createSignTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10, 10, 10, 0.75)';
  ctx.roundRect(0, 0, 256, 96, 8);
  ctx.fill();
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;
  ctx.roundRect(3, 3, 250, 90, 6);
  ctx.stroke();
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 30px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 48);
  return new THREE.CanvasTexture(canvas);
}

/** Home: wooden welcome arch with a hanging sign */
function createHomeStation(group) {
  // Two wooden posts
  for (const dx of [-0.25, 0.25]) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.7, 0.04),
      woodMat,
    );
    post.position.set(dx, 0.35, -0.55);
    post.castShadow = true;
    group.add(post);
  }
  // Cross beam
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.04, 0.05),
    woodMat,
  );
  beam.position.set(0, 0.72, -0.55);
  group.add(beam);

  // Warm lantern
  const lantern = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.06, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xffaa22, emissiveIntensity: 0.5 }),
  );
  lantern.position.set(0, 0.65, -0.55);
  group.add(lantern);
  const warmLight = new THREE.PointLight(0xffcc44, 0.4, 2.5);
  warmLight.position.set(0, 0.6, -0.55);
  group.add(warmLight);
}

/** About: wooden notice board with pinned notes */
function createAboutStation(group) {
  // Board frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.03),
    woodMat,
  );
  frame.position.set(0, 0.55, -0.65);
  frame.castShadow = true;
  group.add(frame);

  // Cork surface
  const cork = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.34, 0.005),
    new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.95 }),
  );
  cork.position.set(0, 0.55, -0.635);
  group.add(cork);

  // Pinned notes (small colored rectangles)
  const noteColors = [0xffeeaa, 0xaaddff, 0xffccaa];
  noteColors.forEach((c, i) => {
    const note = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 0.002),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }),
    );
    note.position.set(-0.12 + i * 0.12, 0.52 + (i % 2) * 0.08, -0.63);
    note.rotation.z = (Math.random() - 0.5) * 0.15;
    group.add(note);
  });

  // Wooden post
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.55, 6),
    woodMat,
  );
  post.position.set(0, 0.275, -0.65);
  post.castShadow = true;
  group.add(post);
}

/** Projects: small terminal/monitor on a stand */
function createProjectsStation(group) {
  // Stand
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, 0.4, 8),
    metalMat,
  );
  stand.position.set(0, 0.2, -0.6);
  stand.castShadow = true;
  group.add(stand);

  // Base plate
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.015, 8),
    metalMat,
  );
  base.position.set(0, 0.01, -0.6);
  group.add(base);

  // Monitor frame
  const monitor = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.25, 0.02),
    metalMat,
  );
  monitor.position.set(0, 0.53, -0.6);
  monitor.castShadow = true;
  group.add(monitor);

  // Screen (dark with glow)
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.2, 0.005),
    new THREE.MeshStandardMaterial({
      color: 0x001a2a,
      emissive: 0x003344,
      emissiveIntensity: 0.3,
    }),
  );
  screen.position.set(0, 0.53, -0.587);
  group.add(screen);

  // Fake code lines on screen
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0x00ffaa, emissive: 0x00cc88, emissiveIntensity: 0.4,
  });
  for (let i = 0; i < 5; i++) {
    const w = 0.08 + Math.random() * 0.15;
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.012, 0.001),
      lineMat,
    );
    line.position.set(-0.06 + Math.random() * 0.04, 0.59 - i * 0.035, -0.583);
    group.add(line);
  }

  // Screen glow
  const screenLight = new THREE.PointLight(0x00ffaa, 0.2, 1.5);
  screenLight.position.set(0, 0.53, -0.4);
  group.add(screenLight);
}

/** CV: small desk with a document and pen */
function createCVStation(group) {
  // Desk top
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.02, 0.25),
    woodMat,
  );
  desk.position.set(0, 0.35, -0.6);
  desk.castShadow = true;
  group.add(desk);

  // Desk legs
  for (const dx of [-0.17, 0.17]) {
    for (const dz of [-0.09, 0.09]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.35, 0.025),
        woodMat,
      );
      leg.position.set(dx, 0.175, -0.6 + dz);
      group.add(leg);
    }
  }

  // Paper document
  const paper = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.002, 0.16),
    new THREE.MeshStandardMaterial({ color: 0xf0eeea, roughness: 0.9 }),
  );
  paper.position.set(-0.05, 0.362, -0.6);
  group.add(paper);

  // Text lines on paper
  const inkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
  for (let i = 0; i < 6; i++) {
    const w = 0.06 + Math.random() * 0.04;
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.001, 0.004),
      inkMat,
    );
    line.position.set(-0.05, 0.364, -0.65 + i * 0.018);
    group.add(line);
  }

  // Pen
  const pen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.1, 6),
    new THREE.MeshStandardMaterial({ color: 0x1a1a6a, roughness: 0.6 }),
  );
  pen.position.set(0.08, 0.365, -0.58);
  pen.rotation.z = 0.3;
  pen.rotation.x = Math.PI / 2;
  group.add(pen);

  // Small desk lamp
  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8),
    metalMat,
  );
  lampBase.position.set(0.12, 0.365, -0.68);
  group.add(lampBase);
  const lampArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.15, 6),
    metalMat,
  );
  lampArm.position.set(0.12, 0.44, -0.68);
  group.add(lampArm);
  const lampBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffdd88, emissive: 0xffaa44, emissiveIntensity: 0.5,
    }),
  );
  lampBulb.position.set(0.12, 0.52, -0.68);
  group.add(lampBulb);
  const deskLight = new THREE.PointLight(0xffdd88, 0.3, 1.5);
  deskLight.position.set(0.12, 0.52, -0.68);
  group.add(deskLight);
}

/** Experience: briefcase-like object */
function createExperienceStation(group) {
  // Briefcase
  const caseMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8, flatShading: true });
  const caseBody = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.08), caseMat);
  caseBody.position.set(0, 0.22, -0.6);
  caseBody.castShadow = true;
  group.add(caseBody);

  // Handle
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.04, 0.008, 6, 12, Math.PI),
    metalMat,
  );
  handle.position.set(0, 0.32, -0.6);
  group.add(handle);

  // Small stand
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.08), metalMat);
  stand.position.set(0, 0.075, -0.6);
  group.add(stand);
}

/** Skills: gear/cog shape */
function createSkillsStation(group) {
  // Gear
  const gearMat = new THREE.MeshStandardMaterial({ color: 0x4a4a55, roughness: 0.5, metalness: 0.5, flatShading: true });
  const gear = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 8), gearMat);
  gear.position.set(0, 0.35, -0.6);
  gear.rotation.x = Math.PI / 2;
  gear.castShadow = true;
  group.add(gear);

  // Center
  const center = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), gearMat);
  center.position.set(0, 0.35, -0.6);
  center.rotation.x = Math.PI / 2;
  group.add(center);

  // Stand
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.35, 6), metalMat);
  stand.position.set(0, 0.175, -0.6);
  stand.castShadow = true;
  group.add(stand);
}

const STATION_BUILDERS = {
  Home: createHomeStation,
  Education: createAboutStation,
  Projects: createProjectsStation,
  Experience: createExperienceStation,
  Skills: createSkillsStation,
};

/**
 * Create station markers in the scene.
 */
export function createStations(scene) {
  const stations = STATIONS.map((cfg) => {
    const group = new THREE.Group();
    group.position.set(cfg.x, 0, 0);

    // Small glowing ground marker (subtle, not the big circle)
    const markerGeo = new THREE.RingGeometry(0.2, 0.25, 24);
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const marker = new THREE.Mesh(markerGeo, glowMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.005;
    group.add(marker);

    // Floating sign above
    const signTexture = createSignTexture(cfg.label);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.25),
      new THREE.MeshBasicMaterial({ map: signTexture, transparent: true }),
    );
    sign.position.set(0, 1.1, -0.55);
    group.add(sign);

    // Build themed 3D object
    const builder = STATION_BUILDERS[cfg.name];
    if (builder) builder(group);

    scene.add(group);

    return { name: cfg.name, x: cfg.x, group, glowMat };
  });

  return stations;
}

/**
 * Animate station glow pulsing.
 */
export function updateStations(stations, elapsed) {
  stations.forEach((s, i) => {
    const pulse = 0.3 + Math.sin(elapsed * 2 + i * 1.5) * 0.2;
    s.glowMat.emissiveIntensity = pulse;
  });
}

export function getActiveStation(stations, robotX) {
  let closest = null;
  let closestDist = Infinity;
  for (const s of stations) {
    const dist = Math.abs(robotX - s.x);
    if (dist < INTERACT_RADIUS && dist < closestDist) {
      closest = s;
      closestDist = dist;
    }
  }
  return closest;
}

export { STATIONS, INTERACT_RADIUS };
