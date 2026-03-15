import * as THREE from 'three';

const RAIL_Y = 1.5;
const BOARD_REST_BOTTOM = 0.35;
const FLOOR_CLAMP = 0.1;        // hard floor — board bottom never below this

// Physics — tuned for visible free-fall, 2-3 bounces, no floor penetration
const GRAVITY = 4.0;
const STRING_STIFFNESS = 80;   // stiff string — catches quickly, small overshoot
const STRING_DAMPING = 3.5;    // moderate damping — 2-3 bounces then settles
const RETRACT_FORCE = 6.0;

// Canvas resolution — very high for crisp text on 3D planes
const DPI = 900;

export function createContentDisplays(scene, stations) {
  const displays = stations.map((station) => {
    const group = new THREE.Group();
    group.position.set(station.x + 0.8, 0, 0.25);

    const renderer = CONTENT_RENDERERS[station.name] || defaultContent;
    const { canvas, boardW, boardH } = renderer(station.name);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = 4;

    const boardGeo = new THREE.PlaneGeometry(boardW, boardH);
    const boardMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    // Hidden position: board top is just at rail level (center = RAIL_Y - boardH/2)
    const hiddenY = RAIL_Y - boardH / 2;

    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = hiddenY;
    board.visible = false;
    group.add(board);

    // Cable — base height 1.0 so scale.y maps directly to world units
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x999999, metalness: 0.1, roughness: 0.8,
    });
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 1.0, 6),
      cableMat,
    );
    cable.visible = false;
    group.add(cable);

    // Clip
    const clip = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.025, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x3a3a42, metalness: 0.6, roughness: 0.35 }),
    );
    clip.position.y = RAIL_Y;
    clip.visible = false;
    group.add(clip);

    scene.add(group);

    // String length per board — board bottom rests at BOARD_REST_BOTTOM
    const restY = BOARD_REST_BOTTOM + boardH / 2; // board center Y at rest
    const stringLen = RAIL_Y - (restY + boardH / 2); // rail to board-top at rest

    // Home board starts deployed (visible on load)
    const isHome = station.name === 'Home';

    return {
      name: station.name, group, board, cable, clip,
      boardH, stringLen, hiddenY,
      y: isHome ? (BOARD_REST_BOTTOM + boardH / 2) : hiddenY,
      vel: 0,
      deployed: isHome,
      held: !isHome,
    };
  });

  function setDeployed(name, deploy) {
    const d = displays.find((dd) => dd.name === name);
    if (!d) return;
    d.deployed = deploy;
    if (deploy) { d.held = false; d.vel = 0; }
  }

  function updateDisplays(delta) {
    displays.forEach((d) => {
      if (d.held) {
        d.y = d.hiddenY;
        d.vel = 0;
        d.board.position.y = d.y;
        d.board.visible = false;
        d.cable.visible = false;
        d.clip.visible = false;
        return;
      }

      d.board.visible = true;

      const boardTop = d.y + d.boardH / 2;
      const extension = RAIL_Y - boardTop;
      const stretch = extension - d.stringLen;

      let force = -GRAVITY;

      if (stretch > 0) {
        force += STRING_STIFFNESS * stretch;
        force -= STRING_DAMPING * d.vel;
      }

      if (!d.deployed) {
        force += RETRACT_FORCE;
        force -= d.vel * 3.0;
      }

      d.vel += force * delta;
      d.y += d.vel * delta;

      // Safety floor only — the string should stop the board well above this
      const floorY = FLOOR_CLAMP + d.boardH / 2;
      if (d.y < floorY) { d.y = floorY; d.vel = Math.max(0, d.vel); }
      if (!d.deployed && d.y >= d.hiddenY - 0.02 && d.vel >= 0) {
        d.held = true; d.y = d.hiddenY; d.vel = 0;
      }
      if (d.y > d.hiddenY) { d.y = d.hiddenY; d.vel = Math.min(0, d.vel); }

      d.board.position.y = d.y;

      const cableBot = d.y + d.boardH / 2;
      const cableLen = RAIL_Y - cableBot;
      const visible = d.y < d.hiddenY - 0.01;
      d.cable.visible = visible;
      d.clip.visible = visible;
      if (visible && cableLen > 0.01) {
        d.cable.scale.y = cableLen;
        d.cable.position.y = cableBot + cableLen / 2;
      }
    });
  }

  return { setDeployed, updateDisplays };
}

// ===== Canvas helpers =====

function makeCanvas(wUnits, hUnits) {
  const w = Math.round(wUnits * DPI);
  const h = Math.round(hUnits * DPI);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { canvas: c, ctx: c.getContext('2d'), w, h };
}

// ===== Pastel color palette =====
const COL = {
  bg1: 'rgba(18,20,35,0.94)',
  bg2: 'rgba(14,16,28,0.96)',
  border: 'rgba(160,190,220,0.18)',
  borderInner: 'rgba(160,190,220,0.07)',
  heading: '#a8d8ea',        // soft sky blue
  label: '#89c4c9',          // muted teal
  body: '#c5ccd6',           // light gray-blue
  muted: '#8a92a4',          // subdued
  dim: '#6b7388',            // faded
  chipBg: 'rgba(168,216,234,0.10)',
  chipBorder: 'rgba(168,216,234,0.18)',
  chipText: '#9cc5d4',       // soft teal
  cardBg: 'rgba(255,255,255,0.025)',
  accent: '#b8d8e8',         // pastel accent
  divider: 'rgba(160,190,220,0.12)',
  hint: 'rgba(168,216,234,0.45)',
};

function drawBoardBg(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, COL.bg1);
  grad.addColorStop(1, COL.bg2);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 28);
  ctx.fill();

  ctx.strokeStyle = COL.border;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(6, 6, w - 12, h - 12, 24);
  ctx.stroke();

  ctx.strokeStyle = COL.borderInner;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(14, 14, w - 28, h - 28, 18);
  ctx.stroke();
}

function drawHeading(ctx, text, x, y, size) {
  const s = size || 56;
  ctx.fillStyle = COL.heading;
  ctx.font = `600 ${s}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = COL.divider;
  ctx.fillRect(x - tw * 0.3, y + 14, tw * 0.6, 2);
}

function drawLabel(ctx, text, x, y, size) {
  ctx.fillStyle = COL.label;
  ctx.font = `600 ${size || 34}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(text, x, y);
}

function drawBody(ctx, lines, x, y, size, color) {
  const s = size || 28;
  ctx.fillStyle = color || COL.body;
  ctx.font = `${s}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * (s + 8));
  });
}

function drawChip(ctx, text, x, y) {
  ctx.font = '24px Inter, system-ui, sans-serif';
  const tw = ctx.measureText(text).width + 28;
  ctx.fillStyle = COL.chipBg;
  ctx.beginPath();
  ctx.roundRect(x, y - 18, tw, 36, 18);
  ctx.fill();
  ctx.strokeStyle = COL.chipBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y - 18, tw, 36, 18);
  ctx.stroke();
  ctx.fillStyle = COL.chipText;
  ctx.textAlign = 'left';
  ctx.fillText(text, x + 14, y + 7);
  return tw + 8;
}

function drawDivider(ctx, x, y, w) {
  ctx.fillStyle = COL.divider;
  ctx.fillRect(x, y, w, 2);
}

// ===== Content renderers =====

const CONTENT_RENDERERS = {
  Home(name) {
    const bW = 0.95, bH = 0.65;
    const { canvas, ctx, w, h } = makeCanvas(bW, bH);
    const P = 55; // padding
    drawBoardBg(ctx, w, h);
    drawHeading(ctx, 'Welcome', w / 2, 85);

    drawBody(ctx, [
      'I\'m Vasileios Kalaitzopoulos',
    ], P, 155, 38, COL.accent);

    drawBody(ctx, [
      'Robotics & Computer Vision Engineer',
      'with a passion for bridging intelligent',
      'algorithms and physical systems.',
      '',
      'Walk through my world to discover',
      'my education, projects, and skills.',
    ], P, 220, 26);

    ctx.fillStyle = COL.hint;
    ctx.font = '26px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('← →  Use arrow keys to explore', w / 2, h - 45);

    return { canvas, boardW: bW, boardH: bH };
  },

  Education(name) {
    const bW = 0.95, bH = 0.6;
    const { canvas, ctx, w, h } = makeCanvas(bW, bH);
    const P = 50;
    drawBoardBg(ctx, w, h);
    drawHeading(ctx, 'Education', w / 2, 75);

    let y = 130;
    drawBody(ctx, ['MEng Electrical & Computer Engineering'], P, y, 30, COL.accent);
    y += 42;
    drawBody(ctx, ['University of Patras · 2018–2025 · GPA 7.22'], P, y, 22, COL.muted);
    y += 38;
    drawBody(ctx, ['Thesis: Biped Robot Walking via'], P, y, 24, COL.body);
    y += 34;
    drawBody(ctx, ['Reinforcement Learning — Grade: 10/10'], P, y, 24, COL.body);

    y += 52;
    drawDivider(ctx, P, y, w - P * 2);
    y += 36;
    drawBody(ctx, ['Coursework'], P, y, 22, COL.label);
    y += 40;
    let tx = P;
    ['Robotics', 'ML', '3D Vision', 'AI', 'Control'].forEach((c) => { tx += drawChip(ctx, c, tx, y); });

    return { canvas, boardW: bW, boardH: bH };
  },

  Experience(name) {
    const bW = 1.0, bH = 0.65;
    const { canvas, ctx, w, h } = makeCanvas(bW, bH);
    const P = 50;
    drawBoardBg(ctx, w, h);
    drawHeading(ctx, 'Experience', w / 2, 75);

    let y = 130;
    drawBody(ctx, ['Software Engineer — Book Scanner'], P, y, 28, COL.accent);
    y += 36;
    drawBody(ctx, ['Jan 2026 – Present'], P, y, 20, COL.muted);
    y += 30;
    drawBody(ctx, ['TTS research · PyQt desktop apps · OpenVPN'], P, y, 22, COL.body);

    y += 50;
    drawDivider(ctx, P, y, w - P * 2);
    y += 30;

    drawBody(ctx, ['Network & Comms Intern — EU-LISA'], P, y, 28, COL.accent);
    y += 36;
    drawBody(ctx, ['Strasbourg · Nov 2024 – Nov 2025'], P, y, 20, COL.muted);
    y += 30;
    drawBody(ctx, ['Cisco · Check Point · Network architecture · ITIL'], P, y, 22, COL.body);
    y += 44;
    let tx = P;
    ['CCNA', 'Fortinet'].forEach((c) => { tx += drawChip(ctx, c, tx, y); });

    return { canvas, boardW: bW, boardH: bH };
  },

  Projects(name) {
    // Board sized to fit 6 cards with generous spacing
    // Card = 100px, gap = 14px, heading area = 100px, bottom margin = 50px
    // Total: 100 + 6*100 + 5*14 + 50 = 820px at 900 DPI = 0.91 units
    // 2-column grid: 3 rows × 2 cols — much more compact
    const bW = 1.35, bH = 0.65;
    const { canvas, ctx, w, h } = makeCanvas(bW, bH);
    const P = 45;
    drawBoardBg(ctx, w, h);
    drawHeading(ctx, 'Projects', w / 2, 65);

    const projects = [
      { title: 'Biped Robot via RL', desc: 'SAC · Real robot + sim', tags: ['RL', 'Arduino'] },
      { title: 'Robots Learn to Act', desc: 'RL framework · AI praises', tags: ['RL', 'Research'] },
      { title: '3D Scene Segmentation', desc: 'Point clouds · Ball Pivot', tags: ['CV', '3D'] },
      { title: 'FlyMonitoring — IoT', desc: 'Room monitoring · Lead', tags: ['IoT', 'Web'] },
      { title: 'Kernels-Clustering', desc: 'Gaussian Kernel · K-means', tags: ['ML'] },
      { title: 'Inpainting & Upscaling', desc: 'GAN · MNIST restoration', tags: ['DL', 'GANs'] },
    ];

    const cols = 2;
    const colGap = 16;
    const colW = (w - P * 2 - colGap) / cols;
    const cardH = 108;
    const rowGap = 12;
    const inner = 14;
    const startY = 100;

    projects.forEach((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = P + col * (colW + colGap);
      const cy = startY + row * (cardH + rowGap);

      ctx.fillStyle = COL.cardBg;
      ctx.beginPath();
      ctx.roundRect(cx, cy, colW, cardH, 10);
      ctx.fill();

      ctx.fillStyle = COL.accent;
      ctx.font = 'bold 24px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(p.title, cx + inner, cy + inner + 16);

      ctx.fillStyle = COL.muted;
      ctx.font = '20px Inter, system-ui, sans-serif';
      ctx.fillText(p.desc, cx + inner, cy + inner + 44);

      let tx = cx + inner;
      const chipY = cy + cardH - 22;
      p.tags.forEach((t) => { tx += drawChip(ctx, t, tx, chipY); });
    });

    return { canvas, boardW: bW, boardH: bH };
  },

  Skills(name) {
    const bW = 1.0, bH = 0.85;
    const { canvas, ctx, w, h } = makeCanvas(bW, bH);
    const P = 50;
    drawBoardBg(ctx, w, h);
    drawHeading(ctx, 'Skills', w / 2, 75);

    const skills = [
      { group: 'ML / AI', items: ['ML', 'RL', 'CV', 'PyTorch'] },
      { group: 'Robotics', items: ['Arduino', 'MATLAB', 'Simulation'] },
      { group: 'Code', items: ['Python', 'C/C++', 'JS', 'OOP'] },
      { group: 'Network', items: ['Cisco', 'Check Point', 'Fortinet'] },
      { group: 'Tools', items: ['Git', 'Linux', 'Docker', 'VS Code'] },
    ];

    const labelCol = P;
    const chipCol = 210;
    const rowH = 58;
    let y = 140;

    skills.forEach((s) => {
      drawLabel(ctx, s.group, labelCol, y, 24);
      let tx = chipCol;
      s.items.forEach((item) => { tx += drawChip(ctx, item, tx, y); });
      y += rowH;
    });

    y += 20;
    drawDivider(ctx, P, y, w - P * 2);

    y += 44;
    drawLabel(ctx, 'Languages', labelCol, y, 24);
    let tx = chipCol;
    ['Greek', 'English', 'Italian', 'French'].forEach((l) => { tx += drawChip(ctx, l, tx, y); });

    y += rowH + 14;
    drawLabel(ctx, 'Interests', labelCol, y, 24);
    let tx2 = chipCol;
    ['Vinyl', 'Music', 'Travel'].forEach((i) => { tx2 += drawChip(ctx, i, tx2, y); });

    return { canvas, boardW: bW, boardH: bH };
  },
};

function defaultContent(name) {
  const bW = 0.7, bH = 0.4;
  const { canvas, ctx, w, h } = makeCanvas(bW, bH);
  drawBoardBg(ctx, w, h);
  drawHeading(ctx, name, w / 2, h / 2 + 10);
  return { canvas, boardW: bW, boardH: bH };
}
