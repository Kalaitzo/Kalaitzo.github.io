import * as THREE from 'three';

/**
 * 6-DOF biped robot modelled after the thesis robot:
 * dark metal servo brackets, visible servo motors, flat plate feet,
 * open-frame construction with an Arduino/electronics platform on top.
 */
export function createRobot() {
  const robot = new THREE.Group();

  // --- Materials ---
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a42,
    metalness: 0.6,
    roughness: 0.35,
  });

  const servoMat = new THREE.MeshStandardMaterial({
    color: 0x444450,
    metalness: 0.5,
    roughness: 0.4,
  });

  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x303038,
    metalness: 0.55,
    roughness: 0.3,
  });

  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x0a5e2a,
    metalness: 0.3,
    roughness: 0.6,
  });

  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xcc4400,
    metalness: 0.2,
    roughness: 0.5,
  });

  const arucoMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.9,
  });

  const arucoDarkMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.0,
    roughness: 0.9,
  });

  const screwMat = new THREE.MeshStandardMaterial({
    color: 0x888890,
    metalness: 0.8,
    roughness: 0.3,
  });

  // --- Helper: create a U-bracket (servo bracket) ---
  function createBracket(width, height, depth, thickness) {
    const group = new THREE.Group();

    // Back plate
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, thickness),
      bracketMat,
    );
    back.castShadow = true;
    group.add(back);

    // Side plates
    const sideGeo = new THREE.BoxGeometry(thickness, height, depth);
    const leftSide = new THREE.Mesh(sideGeo, bracketMat);
    leftSide.position.set(-width / 2 + thickness / 2, 0, depth / 2);
    leftSide.castShadow = true;
    group.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, bracketMat);
    rightSide.position.set(width / 2 - thickness / 2, 0, depth / 2);
    rightSide.castShadow = true;
    group.add(rightSide);

    // Add small screw details on the sides
    const screwGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.005, 8);
    for (const sx of [-1, 1]) {
      for (const sy of [-0.3, 0.3]) {
        const screw = new THREE.Mesh(screwGeo, screwMat);
        screw.rotation.z = Math.PI / 2;
        screw.position.set(
          sx * (width / 2),
          sy * height,
          depth / 2,
        );
        group.add(screw);
      }
    }

    return group;
  }

  // --- Helper: create a servo motor block ---
  function createServo() {
    const group = new THREE.Group();

    // Main servo body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.08, 0.04),
      servoMat,
    );
    body.castShadow = true;
    group.add(body);

    // Servo horn (output shaft side)
    const horn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.008, 12),
      screwMat,
    );
    horn.position.y = 0.044;
    group.add(horn);

    return group;
  }

  // --- Top Platform (body) ---
  const topPlatform = new THREE.Group();
  topPlatform.name = 'torso';

  // Main plate
  const mainPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.015, 0.18),
    plateMat,
  );
  mainPlate.castShadow = true;
  topPlatform.add(mainPlate);

  // Arduino PCB
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.012, 0.10),
    pcbMat,
  );
  pcb.position.set(0, 0.014, -0.01);
  topPlatform.add(pcb);

  // Small components on PCB
  const chipGeo = new THREE.BoxGeometry(0.03, 0.008, 0.03);
  const chip = new THREE.Mesh(chipGeo, servoMat);
  chip.position.set(0.02, 0.022, -0.01);
  topPlatform.add(chip);

  const chip2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.006, 0.015),
    servoMat,
  );
  chip2.position.set(-0.03, 0.020, 0.01);
  topPlatform.add(chip2);

  // USB port detail
  const usb = new THREE.Mesh(
    new THREE.BoxGeometry(0.015, 0.008, 0.01),
    screwMat,
  );
  usb.position.set(-0.07, 0.018, -0.01);
  topPlatform.add(usb);

  // ArUco marker stand (vertical)
  const markerPole = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.12, 0.008),
    screwMat,
  );
  markerPole.position.set(0, 0.07, -0.06);
  topPlatform.add(markerPole);

  // ArUco marker plate
  const markerBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.002, 0.12),
    arucoMat,
  );
  markerBase.position.set(0, 0.13, -0.06);
  topPlatform.add(markerBase);

  // ArUco pattern (simplified dark squares)
  const sq = new THREE.BoxGeometry(0.025, 0.003, 0.025);
  const positions = [
    [-0.03, 0, -0.03], [0.03, 0, -0.03],
    [0, 0, 0], [-0.03, 0, 0.03], [0.03, 0, 0.03],
  ];
  positions.forEach(([x, , z]) => {
    const block = new THREE.Mesh(sq, arucoDarkMat);
    block.position.set(x, 0.132, z - 0.06);
    topPlatform.add(block);
  });

  // Wires (a few dangling cables for realism)
  function addWire(startX, startZ, midY, endX, endZ, mat) {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(startX, 0.01, startZ),
      new THREE.Vector3((startX + endX) / 2, midY, (startZ + endZ) / 2 + 0.05),
      new THREE.Vector3(endX, -0.06, endZ),
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.004, 6, false);
    const wire = new THREE.Mesh(tubeGeo, mat);
    topPlatform.add(wire);
  }

  addWire(-0.08, 0, -0.04, -0.1, 0.05, wireMat);
  addWire(0.08, 0.02, -0.03, 0.1, 0.04, wireMat);
  addWire(0.02, -0.05, -0.05, 0.05, -0.08, new THREE.MeshStandardMaterial({
    color: 0x2244aa, metalness: 0.2, roughness: 0.5,
  }));

  robot.add(topPlatform);

  // --- Legs ---
  function createLeg(side) {
    const sign = side === 'left' ? 1 : -1;

    // Hip pivot group — attaches to torso
    const hipGroup = new THREE.Group();
    hipGroup.name = side + 'Hip';
    hipGroup.position.set(sign * 0.10, -0.015, 0);

    // Hip servo
    const hipServo = createServo();
    hipServo.position.y = -0.04;
    hipGroup.add(hipServo);

    // Upper leg group (thigh) — pivots at hip
    const legGroup = new THREE.Group();
    legGroup.name = side + 'Leg';

    // Upper bracket
    const upperBracket = createBracket(0.07, 0.12, 0.04, 0.005);
    upperBracket.position.y = -0.14;
    upperBracket.rotation.y = Math.PI;
    legGroup.add(upperBracket);

    // Knee servo
    const kneeServo = createServo();
    kneeServo.position.y = -0.22;
    legGroup.add(kneeServo);

    // Shin group — pivots at knee
    const shinGroup = new THREE.Group();
    shinGroup.name = side + 'Shin';
    shinGroup.position.y = -0.22;

    // Lower bracket
    const lowerBracket = createBracket(0.07, 0.10, 0.04, 0.005);
    lowerBracket.position.y = -0.10;
    lowerBracket.rotation.y = Math.PI;
    shinGroup.add(lowerBracket);

    // Ankle servo
    const ankleServo = createServo();
    ankleServo.position.y = -0.18;
    shinGroup.add(ankleServo);

    // Foot — flat metal plate with holes
    const footGroup = new THREE.Group();
    footGroup.name = side + 'Foot';
    footGroup.position.y = -0.22;

    const footPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.008, 0.16),
      plateMat,
    );
    footPlate.castShadow = true;
    footPlate.receiveShadow = true;
    footGroup.add(footPlate);

    // Foot holes (decorative circles)
    const holeGeo = new THREE.RingGeometry(0.008, 0.012, 12);
    const holeMat = new THREE.MeshStandardMaterial({
      color: 0x333340,
      metalness: 0.5,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });
    const holePositions = [
      [-0.04, 0.05], [0.04, 0.05],
      [-0.04, -0.05], [0.04, -0.05],
    ];
    holePositions.forEach(([x, z]) => {
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.rotation.x = -Math.PI / 2;
      hole.position.set(x, 0.005, z);
      footGroup.add(hole);
    });

    shinGroup.add(footGroup);
    legGroup.add(shinGroup);
    hipGroup.add(legGroup);

    return hipGroup;
  }

  const leftHip = createLeg('left');
  topPlatform.add(leftHip);

  const rightHip = createLeg('right');
  topPlatform.add(rightHip);

  // Position robot so feet touch ground
  // Exact height set by walkCycle.js NEUTRAL_HEIGHT (0.459)
  // Initial value here; walkController overrides each frame
  topPlatform.position.y = 0.459;

  // Store references for animation
  // Hierarchy per leg: hipGroup → legGroup (thigh) → shinGroup (calf) → footGroup (foot)
  robot.parts = {
    torso: topPlatform,
    head: markerPole,
    leftLeg: leftHip.children[1],  // legGroup — hip rotation
    rightLeg: rightHip.children[1],
    leftShin: leftHip.children[1].getObjectByName('leftShin'),   // shinGroup — knee rotation
    rightShin: rightHip.children[1].getObjectByName('rightShin'),
    leftFoot: leftHip.children[1].getObjectByName('leftShin').getObjectByName('leftFoot'),   // footGroup — ankle rotation
    rightFoot: rightHip.children[1].getObjectByName('rightShin').getObjectByName('rightFoot'), // footGroup — ankle rotation
  };

  return robot;
}
