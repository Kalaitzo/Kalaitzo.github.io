import * as THREE from 'three';

/**
 * Create and configure the WebGL renderer.
 */
export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  return renderer;
}

/**
 * Add all lights to the scene. Returns references for later manipulation.
 */
export function createLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(3, 5, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 20;
  dirLight.shadow.camera.left = -5;
  dirLight.shadow.camera.right = 5;
  dirLight.shadow.camera.top = 3;
  dirLight.shadow.camera.bottom = -1;
  scene.add(dirLight);
  scene.add(dirLight.target);

  const rimLight = new THREE.DirectionalLight(0x4488ff, 0.8);
  rimLight.position.set(-2, 3, -3);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  const accentLight = new THREE.PointLight(0x00ffff, 0.8, 5);
  accentLight.position.set(0, 1.0, 1.0);
  scene.add(accentLight);

  return { dirLight, rimLight, fillLight, accentLight };
}

/**
 * Create the ground with grass terrain, a walking path, and sky background.
 */
export function createGround(scene, width = 50) {
  // ===== Sky gradient background =====
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 2;
  skyCanvas.height = 256;
  const ctx = skyCanvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#0a0a1a');    // deep dark blue at top
  gradient.addColorStop(0.3, '#0f1428');  // dark navy
  gradient.addColorStop(0.6, '#1a1a2e');  // muted indigo
  gradient.addColorStop(0.85, '#1e2a1e'); // hint of green at horizon
  gradient.addColorStop(1, '#0a120a');    // dark ground blend
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 256);

  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.magFilter = THREE.LinearFilter;
  scene.background = skyTexture;

  // ===== Grass ground plane =====
  const grassGeo = new THREE.PlaneGeometry(width, 12);
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x1a3a1a,
    roughness: 0.95,
    metalness: 0.0,
  });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  scene.add(grass);

  // ===== Walking path (lighter strip where the robot walks) =====
  const pathGeo = new THREE.PlaneGeometry(width, 0.6);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x3a3530,
    roughness: 0.85,
    metalness: 0.05,
  });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.002;
  path.receiveShadow = true;
  scene.add(path);

  // Path edges (slightly raised stone borders)
  const edgeGeo = new THREE.BoxGeometry(width, 0.015, 0.04);
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x4a4540,
    roughness: 0.8,
  });
  const edgeF = new THREE.Mesh(edgeGeo, edgeMat);
  edgeF.position.set(0, 0.008, 0.32);
  scene.add(edgeF);
  const edgeB = new THREE.Mesh(edgeGeo, edgeMat);
  edgeB.position.set(0, 0.008, -0.32);
  scene.add(edgeB);

  // ===== Grass tufts (small low-poly clumps scattered around) =====
  const tuftGeo = new THREE.ConeGeometry(0.02, 0.06, 4);
  const tuftMat = new THREE.MeshStandardMaterial({
    color: 0x2a5a2a,
    roughness: 0.9,
    flatShading: true,
  });
  const darkTuftMat = new THREE.MeshStandardMaterial({
    color: 0x1e4a1e,
    roughness: 0.9,
    flatShading: true,
  });

  for (let i = 0; i < 120; i++) {
    const x = (Math.random() - 0.5) * width * 0.7;
    const z = 0.5 + Math.random() * 4; // in front of path
    const tuft = new THREE.Mesh(tuftGeo, Math.random() > 0.5 ? tuftMat : darkTuftMat);
    tuft.position.set(x, 0.025, z);
    tuft.rotation.y = Math.random() * Math.PI;
    tuft.scale.set(0.5 + Math.random(), 0.5 + Math.random() * 0.8, 0.5 + Math.random());
    scene.add(tuft);
  }
  // Behind path too
  for (let i = 0; i < 80; i++) {
    const x = (Math.random() - 0.5) * width * 0.7;
    const z = -0.5 - Math.random() * 4;
    const tuft = new THREE.Mesh(tuftGeo, Math.random() > 0.5 ? tuftMat : darkTuftMat);
    tuft.position.set(x, 0.025, z);
    tuft.rotation.y = Math.random() * Math.PI;
    tuft.scale.set(0.5 + Math.random(), 0.5 + Math.random() * 0.8, 0.5 + Math.random());
    scene.add(tuft);
  }

  // ===== Small stars in the sky (distant point lights / sprites) =====
  const starGeo = new THREE.BufferGeometry();
  const starCount = 200;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 60;
    starPositions[i * 3 + 1] = 3 + Math.random() * 8;
    starPositions[i * 3 + 2] = -5 - Math.random() * 10;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.03,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  return { grass, path };
}
