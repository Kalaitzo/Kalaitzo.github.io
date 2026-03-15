import * as THREE from 'three';

const RAIL_Y = 1.5;
const ROBOT_TOP_OFFSET = 0.13;

// Rail physical extent — the clip cannot go beyond these
const RAIL_START = -1;
const RAIL_END = 13;

export function createRail(scene) {
  const railGroup = new THREE.Group();
  const railLen = RAIL_END - RAIL_START;
  const railCenter = (RAIL_START + RAIL_END) / 2;

  const railMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a42,
    metalness: 0.6,
    roughness: 0.35,
  });

  const columnMat = new THREE.MeshStandardMaterial({
    color: 0x2e2e36,
    metalness: 0.5,
    roughness: 0.4,
  });

  // Horizontal rail bars — finite length
  const railGeo = new THREE.CylinderGeometry(0.025, 0.025, railLen, 12);
  const rail = new THREE.Mesh(railGeo, railMat);
  rail.rotation.z = Math.PI / 2;
  rail.position.set(railCenter, RAIL_Y, 0);
  rail.castShadow = true;
  railGroup.add(rail);

  const rail2 = rail.clone();
  rail2.position.z = 0.15;
  railGroup.add(rail2);

  // End caps (small blockers at each end of the rail)
  const endCapGeo = new THREE.BoxGeometry(0.06, 0.08, 0.22);
  const endCapL = new THREE.Mesh(endCapGeo, railMat);
  endCapL.position.set(RAIL_START, RAIL_Y, 0.075);
  railGroup.add(endCapL);
  const endCapR = new THREE.Mesh(endCapGeo, railMat);
  endCapR.position.set(RAIL_END, RAIL_Y, 0.075);
  railGroup.add(endCapR);

  // Cross-beams
  const crossGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8);
  for (let x = RAIL_START; x <= RAIL_END; x += 1.5) {
    const cross = new THREE.Mesh(crossGeo, columnMat);
    cross.rotation.x = Math.PI / 2;
    cross.position.set(x, RAIL_Y, 0.075);
    railGroup.add(cross);
  }

  // Vertical support columns — only at ends and every 3 units
  for (let x = RAIL_START; x <= RAIL_END; x += 3) {
    const colGeo = new THREE.CylinderGeometry(0.03, 0.035, RAIL_Y + 0.5, 8);
    const col = new THREE.Mesh(colGeo, columnMat);
    col.position.set(x, (RAIL_Y + 0.5) / 2 - 0.25, -0.3);
    col.castShadow = true;
    railGroup.add(col);

    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 0.25),
      railMat,
    );
    bracket.position.set(x, RAIL_Y, 0.0);
    railGroup.add(bracket);
  }

  scene.add(railGroup);

  // ===== Hanging string =====
  const connectorGroup = new THREE.Group();

  const stringMat = new THREE.MeshStandardMaterial({
    color: 0x999999,
    metalness: 0.05,
    roughness: 0.9,
  });

  // Rail clip
  const CLIP_H = 0.03;
  const clip = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, CLIP_H, 0.05),
    railMat,
  );
  clip.position.y = RAIL_Y;
  connectorGroup.add(clip);

  // Load cell
  const SENSOR_H = 0.03;
  const sensorMat = new THREE.MeshStandardMaterial({
    color: 0x555560, metalness: 0.4, roughness: 0.5,
  });
  const sensor = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, SENSOR_H, 0.025),
    sensorMat,
  );
  const sensorY = RAIL_Y - CLIP_H / 2 - SENSOR_H / 2;
  sensor.position.y = sensorY;
  connectorGroup.add(sensor);

  // LED
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.005, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0x00ff44, emissive: 0x00ff44, emissiveIntensity: 0.5,
    }),
  );
  led.position.set(0.018, sensorY, 0.01);
  connectorGroup.add(led);

  // String mesh
  const initCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, RAIL_Y - 0.045, 0),
    new THREE.Vector3(0, RAIL_Y - 0.3, 0),
    new THREE.Vector3(0, 0.7, 0),
    new THREE.Vector3(0, 0.6, 0),
  );
  let stringGeo = new THREE.TubeGeometry(initCurve, 20, 0.003, 5, false);
  const stringMesh = new THREE.Mesh(stringGeo, stringMat);
  connectorGroup.add(stringMesh);

  scene.add(connectorGroup);

  // String top Y
  const TOP_ATTACH_Y = RAIL_Y - CLIP_H / 2 - SENSOR_H;
  const STRING_REST_LENGTH = 1.0;

  // Clip dynamics
  let clipX = 0;
  let clipVelX = 0;
  const CLIP_SPRING = 15.0;
  const CLIP_DAMPING = 6.0;

  function updateConnector(robotX, robotY, delta) {
    // Spring physics for clip
    const displacement = robotX - clipX;
    const springForce = CLIP_SPRING * displacement;
    const dampingForce = -CLIP_DAMPING * clipVelX;
    clipVelX += (springForce + dampingForce) * delta;
    clipX += clipVelX * delta;

    // Clamp clip to rail extent — it can't go beyond the end caps
    clipX = Math.max(RAIL_START + 0.04, Math.min(RAIL_END - 0.04, clipX));

    connectorGroup.position.x = clipX;

    const bottomOffsetX = robotX - clipX;
    const botTopY = robotY + ROBOT_TOP_OFFSET;
    const dx = bottomOffsetX;
    const dy = TOP_ATTACH_Y - botTopY;
    const straightDist = Math.sqrt(dx * dx + dy * dy);
    const slack = Math.max(0, STRING_REST_LENGTH - straightDist);
    const sag = slack * 0.35;

    const sagDir = dx > 0 ? -1 : 1;
    const topPt = new THREE.Vector3(0, TOP_ATTACH_Y, 0);
    const cp1 = new THREE.Vector3(
      dx * 0.3 + sagDir * sag * 0.3,
      TOP_ATTACH_Y - dy * 0.35,
      -sag * 0.2,
    );
    const cp2 = new THREE.Vector3(
      dx * 0.7 + sagDir * sag * 0.2,
      botTopY + dy * 0.35,
      -sag * 0.15,
    );
    const botPt = new THREE.Vector3(dx, botTopY, 0);

    const newCurve = new THREE.CubicBezierCurve3(topPt, cp1, cp2, botPt);
    const newGeo = new THREE.TubeGeometry(newCurve, 20, 0.003, 5, false);
    stringMesh.geometry.dispose();
    stringMesh.geometry = newGeo;

    // Return whether the string is taut (robot beyond rail)
    // World.js can use this to slow down or stop the robot
    return { stringTaut: straightDist >= STRING_REST_LENGTH * 0.98 };
  }

  return { railGroup, updateConnector, RAIL_START, RAIL_END };
}

export const RAIL_HEIGHT = RAIL_Y;
