import * as THREE from 'three';

/**
 * Low-poly environment that changes theme per station zone.
 *
 * Zones (matching station X positions):
 *   Home (0):     Cozy — warm-toned trees, small house, welcome vibe
 *   About (3):    Nature — pine trees, rocks, mountains in background
 *   Projects (6): Tech — geometric shapes, floating cubes, circuit-like ground details
 *   CV (9):       City — simple buildings, lamp posts, professional feel
 */
export function createEnvironment(scene) {
  const group = new THREE.Group();

  // ===== Shared materials =====
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.9 });
  const pineGreenMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8, flatShading: true });
  const darkGreenMat = new THREE.MeshStandardMaterial({ color: 0x1e4620, roughness: 0.8, flatShading: true });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x555560, roughness: 0.9, flatShading: true });
  const warmRockMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.9, flatShading: true });
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.7, metalness: 0.3 });
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x00cccc, emissive: 0x00aaaa, emissiveIntensity: 0.3 });
  const techMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.5, metalness: 0.6 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.4 });

  // ===== Helpers =====

  function createPineTree(x, z, height, color) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, height * 0.4, 6),
      treeTrunkMat,
    );
    trunk.position.y = height * 0.2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage — stacked cones
    const mat = color || pineGreenMat;
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.15 - i * 0.03, height * 0.3, 6),
        mat,
      );
      cone.position.y = height * 0.4 + i * height * 0.18;
      cone.castShadow = true;
      tree.add(cone);
    }

    return tree;
  }

  function createRock(x, z, scale) {
    const geo = new THREE.DodecahedronGeometry(0.1 * scale, 0);
    const rock = new THREE.Mesh(geo, rockMat);
    rock.position.set(x, 0.05 * scale, z);
    rock.rotation.set(Math.random() * 0.5, Math.random() * PI2, 0);
    rock.castShadow = true;
    return rock;
  }

  function createBuilding(x, z, w, h, d) {
    const bldg = new THREE.Group();
    bldg.position.set(x, 0, z);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      buildingMat,
    );
    body.position.y = h / 2;
    body.castShadow = true;
    bldg.add(body);

    // Windows
    const winGeo = new THREE.PlaneGeometry(w * 0.15, h * 0.1);
    const cols = Math.floor(w / 0.12);
    const rows = Math.floor(h / 0.15);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const win = new THREE.Mesh(winGeo, windowMat);
        win.position.set(
          -w / 2 + 0.08 + c * (w / cols),
          0.12 + r * (h / rows),
          d / 2 + 0.001,
        );
        bldg.add(win);
      }
    }

    return bldg;
  }

  function createLampPost(x, z) {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.8, 6),
      rockMat,
    );
    pole.position.y = 0.4;
    lamp.add(pole);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffdd88,
        emissive: 0xffaa44,
        emissiveIntensity: 0.6,
      }),
    );
    bulb.position.y = 0.82;
    lamp.add(bulb);

    const light = new THREE.PointLight(0xffdd88, 0.3, 2);
    light.position.y = 0.82;
    lamp.add(light);

    return lamp;
  }

  function createFloatingCube(x, y, z, size) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      techMat,
    );
    cube.position.set(x, y, z);
    cube.rotation.set(0.3, 0.5, 0.2);
    // Store for animation
    cube.userData.baseY = y;
    cube.userData.phase = Math.random() * Math.PI * 2;
    return cube;
  }

  const PI2 = Math.PI * 2;

  // ===== Zone 1: HOME (x = -2 to 1.5) — Cozy, welcoming =====
  // Warm-toned trees, small rocks
  group.add(createPineTree(-1.5, -1.2, 0.7, darkGreenMat));
  group.add(createPineTree(-0.5, -1.5, 0.9, pineGreenMat));
  group.add(createPineTree(1.0, -1.3, 0.6, darkGreenMat));
  group.add(createPineTree(-1.8, -0.8, 0.5, pineGreenMat));

  // Small rocks
  const homeRock1 = createRock(-0.8, -0.9, 0.8);
  homeRock1.material = warmRockMat;
  group.add(homeRock1);
  const homeRock2 = createRock(0.5, -1.1, 0.6);
  homeRock2.material = warmRockMat;
  group.add(homeRock2);

  // Background hills (far back)
  const hillGeo = new THREE.ConeGeometry(1.5, 0.8, 5);
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x1a3318, roughness: 0.9, flatShading: true });
  const hill1 = new THREE.Mesh(hillGeo, hillMat);
  hill1.position.set(-1, 0.3, -3);
  hill1.scale.set(1, 0.6, 0.5);
  group.add(hill1);
  const hill2 = new THREE.Mesh(hillGeo, hillMat);
  hill2.position.set(1.5, 0.25, -3.5);
  hill2.scale.set(1.3, 0.5, 0.5);
  group.add(hill2);

  // ===== Zone 2: ABOUT (x = 1.5 to 4.5) — Nature, mountains =====
  group.add(createPineTree(2.0, -1.4, 1.0, pineGreenMat));
  group.add(createPineTree(2.8, -1.0, 0.7, darkGreenMat));
  group.add(createPineTree(3.5, -1.6, 1.1, pineGreenMat));
  group.add(createPineTree(4.2, -1.2, 0.8, darkGreenMat));
  group.add(createPineTree(3.0, -1.8, 0.5, pineGreenMat));

  // Larger rocks
  group.add(createRock(2.5, -1.0, 1.2));
  group.add(createRock(3.8, -0.8, 1.5));
  group.add(createRock(4.5, -1.3, 0.9));

  // Background mountains
  const mtnMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9, flatShading: true });
  const mtnGeo = new THREE.ConeGeometry(1.0, 2.0, 5);
  const mtn1 = new THREE.Mesh(mtnGeo, mtnMat);
  mtn1.position.set(2.5, 0.8, -4);
  mtn1.scale.set(1.2, 1, 0.4);
  group.add(mtn1);
  const mtn2 = new THREE.Mesh(mtnGeo, mtnMat);
  mtn2.position.set(4.0, 0.6, -3.5);
  mtn2.scale.set(0.8, 0.8, 0.4);
  group.add(mtn2);
  // Snow cap
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xddeeff, roughness: 0.7, flatShading: true });
  const snow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 5), snowMat);
  snow.position.set(2.5, 1.55, -4);
  snow.scale.set(1.2, 1, 0.4);
  group.add(snow);

  // ===== Zone 3: PROJECTS (x = 4.5 to 7.5) — Tech, geometric =====
  // Floating cubes
  const floatingCubes = [];
  const cubePositions = [
    [5.0, 0.6, -1.5, 0.1],
    [5.8, 0.9, -1.2, 0.07],
    [6.5, 0.5, -1.8, 0.12],
    [7.0, 0.8, -1.0, 0.08],
    [5.5, 1.1, -2.0, 0.06],
    [6.8, 0.4, -1.4, 0.09],
    [7.5, 0.7, -1.6, 0.07],
  ];
  cubePositions.forEach(([x, y, z, s]) => {
    const cube = createFloatingCube(x, y, z, s);
    group.add(cube);
    floatingCubes.push(cube);
  });

  // Glowing circuit lines on ground (thin boxes)
  const circuitGeo = new THREE.BoxGeometry(0.8, 0.003, 0.01);
  for (let i = 0; i < 6; i++) {
    const line = new THREE.Mesh(circuitGeo, glowMat);
    line.position.set(5 + i * 0.5, 0.002, -0.5 - Math.random() * 0.6);
    line.rotation.y = Math.random() * 0.5 - 0.25;
    group.add(line);
  }
  // Perpendicular lines
  const circuitGeo2 = new THREE.BoxGeometry(0.01, 0.003, 0.4);
  for (let i = 0; i < 4; i++) {
    const line = new THREE.Mesh(circuitGeo2, glowMat);
    line.position.set(5.2 + i * 0.7, 0.002, -0.7);
    group.add(line);
  }

  // Tech pillars
  for (let x = 5; x <= 7.5; x += 1.2) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.6, 0.06),
      techMat,
    );
    pillar.position.set(x, 0.3, -1.8);
    pillar.castShadow = true;
    group.add(pillar);

    // Glow ring on top
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.008, 8, 16),
      glowMat,
    );
    ring.position.set(x, 0.62, -1.8);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  // ===== Zone 4: EXPERIENCE (x = 7.5 to 10.5) — City, professional =====
  group.add(createBuilding(8.0, -2.5, 0.5, 1.2, 0.4));
  group.add(createBuilding(8.8, -2.2, 0.35, 0.8, 0.35));
  group.add(createBuilding(9.5, -2.8, 0.6, 1.5, 0.5));
  group.add(createBuilding(10.2, -2.3, 0.4, 1.0, 0.4));

  group.add(createLampPost(8.0, -0.8));
  group.add(createLampPost(9.5, -0.8));

  // Bench
  const benchSeat = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.02, 0.1),
    warmRockMat,
  );
  benchSeat.position.set(9.0, 0.18, -0.7);
  group.add(benchSeat);
  for (const dx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.18, 0.08),
      rockMat,
    );
    leg.position.set(9.0 + dx, 0.09, -0.7);
    group.add(leg);
  }

  group.add(createPineTree(8.5, -1.0, 0.5, darkGreenMat));
  group.add(createPineTree(10.0, -1.0, 0.5, darkGreenMat));

  // ===== Zone 5: SKILLS (x = 10.5 to 14) — Workshop / lab feel =====
  // More tech pillars
  for (let x = 11; x <= 13; x += 1.0) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.5, 0.06),
      techMat,
    );
    pillar.position.set(x, 0.25, -1.6);
    pillar.castShadow = true;
    group.add(pillar);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.008, 8, 16),
      glowMat,
    );
    ring.position.set(x, 0.52, -1.6);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  // Buildings continuing
  group.add(createBuilding(11.5, -2.4, 0.45, 1.0, 0.4));
  group.add(createBuilding(12.5, -2.6, 0.5, 1.3, 0.45));
  group.add(createBuilding(13.2, -2.3, 0.35, 0.9, 0.35));

  group.add(createLampPost(11.5, -0.8));
  group.add(createLampPost(13.0, -0.8));

  // A few floating cubes for the skills/tech area
  const skillCubes = [
    [11.2, 0.5, -1.2, 0.08],
    [12.0, 0.7, -1.5, 0.06],
    [12.8, 0.4, -1.0, 0.09],
  ];
  skillCubes.forEach(([x, y, z, s]) => {
    const cube = createFloatingCube(x, y, z, s);
    group.add(cube);
    floatingCubes.push(cube);
  });

  // ===== FILL: Extra props between and around zones =====

  // --- Bushes (low rounded shapes) ---
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x2a5528, roughness: 0.85, flatShading: true });
  const bushDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e3e1c, roughness: 0.85, flatShading: true });

  function createBush(x, z, scale) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    for (let i = 0; i < 3; i++) {
      const s = (0.06 + Math.random() * 0.04) * scale;
      const ball = new THREE.Mesh(
        new THREE.IcosahedronGeometry(s, 1),
        Math.random() > 0.4 ? bushMat : bushDarkMat,
      );
      ball.position.set(
        (Math.random() - 0.5) * 0.06 * scale,
        s * 0.8,
        (Math.random() - 0.5) * 0.04 * scale,
      );
      ball.castShadow = true;
      g.add(ball);
    }
    return g;
  }

  // Scatter bushes along both sides of path
  const bushPositions = [
    [-1.2, 0.5, 1], [0.3, 0.6, 0.8], [1.3, 0.55, 1.1],
    [1.8, -0.6, 0.9], [2.2, 0.5, 0.7], [4.0, 0.6, 1],
    [4.6, -0.5, 0.8], [7.8, 0.5, 0.9], [8.3, 0.55, 0.7],
    [10.0, 0.6, 0.8], [10.5, -0.6, 0.9],
  ];
  bushPositions.forEach(([x, z, s]) => group.add(createBush(x, z, s)));

  // --- Flowers (small colorful cones) ---
  const flowerColors = [0xff6688, 0xffaa44, 0xdd88ff, 0x88ddff, 0xffff66];

  function createFlower(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    // Stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.08, 4),
      new THREE.MeshStandardMaterial({ color: 0x336622, roughness: 0.9 }),
    );
    stem.position.y = 0.04;
    g.add(stem);
    // Petals
    const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 6, 6),
      new THREE.MeshStandardMaterial({ color, roughness: 0.7 }),
    );
    petal.position.y = 0.085;
    g.add(petal);
    return g;
  }

  // Scatter flowers in home and about zones
  for (let i = 0; i < 15; i++) {
    const x = -1.5 + Math.random() * 5;
    const z = 0.4 + Math.random() * 0.6;
    group.add(createFlower(x, z));
  }
  for (let i = 0; i < 8; i++) {
    const x = -1 + Math.random() * 4;
    const z = -0.5 - Math.random() * 0.5;
    group.add(createFlower(x, z));
  }

  // --- Mushrooms (cute little details) ---
  const mushCapMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.7, flatShading: true });
  const mushStemMat = new THREE.MeshStandardMaterial({ color: 0xeeddcc, roughness: 0.8 });

  function createMushroom(x, z, scale) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const stemH = 0.04 * scale;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008 * scale, 0.01 * scale, stemH, 6),
      mushStemMat,
    );
    stem.position.y = stemH / 2;
    g.add(stem);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.02 * scale, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2),
      mushCapMat,
    );
    cap.position.y = stemH;
    g.add(cap);
    return g;
  }

  group.add(createMushroom(-0.3, 0.5, 1.2));
  group.add(createMushroom(1.5, 0.45, 0.9));
  group.add(createMushroom(2.8, -0.55, 1.0));
  group.add(createMushroom(3.2, 0.5, 0.8));

  // --- Wooden fence (along part of the home zone) ---
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.9, flatShading: true });
  for (let x = -1.5; x <= 0.5; x += 0.25) {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.2, 0.02),
      fenceMat,
    );
    post.position.set(x, 0.1, 0.7);
    group.add(post);
  }
  // Horizontal rails
  for (const y of [0.06, 0.15]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.012, 0.012),
      fenceMat,
    );
    rail.position.set(-0.5, y, 0.7);
    group.add(rail);
  }

  // --- Stepping stones in front of the path (home zone) ---
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x555550, roughness: 0.9, flatShading: true });
  for (const sx of [-0.8, -0.4, 0.0, 0.4]) {
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.015, 6),
      stoneMat,
    );
    stone.position.set(sx, 0.008, 0.45);
    stone.rotation.y = Math.random() * Math.PI;
    group.add(stone);
  }

  // --- More background hills for continuity ---
  const hillMat2 = new THREE.MeshStandardMaterial({ color: 0x152515, roughness: 0.9, flatShading: true });
  const hillGeo2 = new THREE.ConeGeometry(2, 1, 5);
  for (const hx of [5, 7.5, 10, 12.5]) {
    const h = new THREE.Mesh(hillGeo2, hillMat2);
    h.position.set(hx, 0.35, -4 - Math.random());
    h.scale.set(0.8 + Math.random() * 0.5, 0.4 + Math.random() * 0.3, 0.3);
    group.add(h);
  }

  // --- Foreground items (closer to camera) ---
  // Small rocks along the path edge
  for (let x = -1; x <= 13; x += 1.2 + Math.random() * 0.5) {
    const r = createRock(x + Math.random() * 0.3, 0.35 + Math.random() * 0.1, 0.3 + Math.random() * 0.3);
    group.add(r);
  }

  scene.add(group);

  // ===== Animation (floating cubes bob up and down) =====
  function updateEnvironment(elapsed) {
    floatingCubes.forEach((cube) => {
      cube.position.y = cube.userData.baseY + Math.sin(elapsed * 1.5 + cube.userData.phase) * 0.04;
      cube.rotation.y += 0.003;
      cube.rotation.x += 0.002;
    });
  }

  return { updateEnvironment };
}
