const { sin, PI, min, max, cos, exp, acos } = Math;

// ===== Leg geometry (must match Robot.js) =====
const HIP_OFFSET = 0.015;
const UPPER_LEG = 0.22;   // hip → knee
const LOWER_LEG = 0.22;   // knee → ankle
const FOOT_HALF = 0.004;

// ===== Gait parameters =====
const HIP_MAX = 0.40;      // ±23° hip swing
const KNEE_STANCE = 0.04;  // slight mid-stance flex
const KNEE_SWING = 0.50;   // ~29° peak swing knee flex
const ANKLE_DORSI = -0.15; // dorsiflexion during swing
const GROUND_CLEARANCE = 0.008; // 8mm minimum foot clearance above ground

// ===== Derived stride (movement speed synced to gait) =====
const STRIDE_PER_STEP = 2 * UPPER_LEG * sin(HIP_MAX);
const STRIDE_PER_CYCLE = 2 * STRIDE_PER_STEP;
export const WALK_SPEED = 7.0;
export const MOVE_SPEED = STRIDE_PER_CYCLE * WALK_SPEED / (2 * PI);

// Neutral torso Y (all angles zero)
const NEUTRAL_Y = HIP_OFFSET + UPPER_LEG + LOWER_LEG + FOOT_HALF;

/**
 * FK: torso Y needed for a leg's foot to sit at ground (Y=0).
 */
function requiredTorsoY(hip, knee) {
  return HIP_OFFSET + UPPER_LEG * cos(hip) + LOWER_LEG * cos(hip + knee) + FOOT_HALF;
}

/**
 * FK: compute foot bottom Y position given torso Y and leg angles.
 */
function footY(torsoY, hip, knee) {
  return torsoY - HIP_OFFSET - UPPER_LEG * cos(hip) - LOWER_LEG * cos(hip + knee) - FOOT_HALF;
}

/**
 * Stance foot forward offset from directly under the hip.
 */
function footFwdOffset(hip, knee) {
  return UPPER_LEG * sin(hip) + LOWER_LEG * sin(hip + knee);
}

/**
 * Gaussian bump for smooth swing-phase activation.
 */
function gaussBump(p, center, sigma) {
  let d = p - center;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return exp(-(d * d) / (2 * sigma * sigma));
}

/**
 * Ground constraint: if a foot would penetrate the ground,
 * increase the knee angle until the foot clears.
 * This is how a real robot's controller enforces floor contact.
 *
 * @param {object} leg - { hip, knee, ankle } — mutated in place
 * @param {number} torsoY - current torso height
 */
function enforceGroundConstraint(leg, torsoY) {
  const fY = footY(torsoY, leg.hip, leg.knee);

  if (fY < GROUND_CLEARANCE) {
    // Solve for minimum knee angle that keeps foot at GROUND_CLEARANCE:
    // torsoY - HIP_OFFSET - UPPER*cos(hip) - LOWER*cos(hip+knee) - FOOT_HALF = clearance
    // cos(hip+knee) = (torsoY - HIP_OFFSET - UPPER*cos(hip) - FOOT_HALF - clearance) / LOWER
    const available = torsoY - HIP_OFFSET - UPPER_LEG * cos(leg.hip) - FOOT_HALF - GROUND_CLEARANCE;
    const cosTarget = available / LOWER_LEG;

    if (cosTarget > -1 && cosTarget < 1) {
      const requiredKnee = acos(cosTarget) - leg.hip;
      if (requiredKnee > leg.knee) {
        leg.knee = requiredKnee;
      }
    }
  }
}

/**
 * Compute gait pose using smooth continuous functions + ground physics.
 *
 * Pipeline:
 *   1. Compute joint angles from smooth functions (no discontinuities)
 *   2. Determine torso Y from ground contact (max of both legs → no penetration)
 *   3. Enforce ground constraint on each leg (IK knee adjustment)
 *   4. Compute ankle: flat-foot in stance, dorsiflex in swing
 */
function computeGaitPose(phase) {
  const t = ((phase % (2 * PI)) + 2 * PI) % (2 * PI) / (2 * PI);
  const leftP = t;
  const rightP = (t + 0.5) % 1.0;

  function rawLegAngles(p) {
    const a = p * 2 * PI;

    // Hip: cosine pendulum (smooth, natural)
    const hip = HIP_MAX * cos(a);

    // Knee: Gaussian bump centered at mid-swing
    const kneeBump = gaussBump(p, 0.72, 0.12);
    const knee = KNEE_STANCE + (KNEE_SWING - KNEE_STANCE) * kneeBump;

    return { hip, knee, ankle: 0 };
  }

  const left = rawLegAngles(leftP);
  const right = rawLegAngles(rightP);

  // --- Step 2: Torso Y from ground contact ---
  // Use the max of what each leg requires → neither foot goes below ground
  const leftReqY = requiredTorsoY(left.hip, left.knee);
  const rightReqY = requiredTorsoY(right.hip, right.knee);
  const torsoY = max(leftReqY, rightReqY);

  // --- Step 3: Ground constraint (IK knee correction) ---
  // If either foot is below ground (can happen at transitions),
  // bend that knee more until the foot clears
  enforceGroundConstraint(left, torsoY);
  enforceGroundConstraint(right, torsoY);

  // --- Step 4: Ankle ---
  // Compute each foot's Y position to determine if it's on the ground
  function computeAnkle(leg) {
    const fY = footY(torsoY, leg.hip, leg.knee);
    const onGround = fY < 0.015; // foot is at or very near ground

    // Flat-foot compensation: ankle = -(hip + knee) keeps foot parallel to ground
    const ankleFlat = -(leg.hip + leg.knee);

    if (onGround) {
      // Foot on ground: keep it flat
      return ankleFlat;
    } else {
      // Foot in air: blend toward dorsiflex based on height
      const liftAmount = min(1, fY / 0.06); // 0→1 over first 6cm of lift
      const ankleFree = ANKLE_DORSI;
      return ankleFlat * (1 - liftAmount) + ankleFree * liftAmount;
    }
  }

  left.ankle = computeAnkle(left);
  right.ankle = computeAnkle(right);

  // --- Foot-plant correction (root motion) ---
  // Weighted by stance likelihood (inverse of swing bump)
  const leftSwing = gaussBump(leftP, 0.72, 0.12);
  const rightSwing = gaussBump(rightP, 0.72, 0.12);
  const leftW = 1 - leftSwing;
  const rightW = 1 - rightSwing;
  const wTotal = leftW + rightW;
  const stanceFootFwd = (footFwdOffset(left.hip, left.knee) * leftW +
                         footFwdOffset(right.hip, right.knee) * rightW) / wTotal;

  // Lateral sway
  const torsoSway = sin(phase) * 0.012;

  return {
    leftHip: left.hip, rightHip: right.hip,
    leftKnee: left.knee, rightKnee: right.knee,
    leftAnkle: left.ankle, rightAnkle: right.ankle,
    torsoY, torsoSway, stanceFootFwd,
  };
}

/**
 * Walk controller with smooth blending, ground physics, and root motion.
 */
export function createWalkController() {
  const joints = {
    leftHip: 0, rightHip: 0,
    leftKnee: 0, rightKnee: 0,
    leftAnkle: 0, rightAnkle: 0,
    torsoY: NEUTRAL_Y, torsoSway: 0,
    stanceFootFwd: 0,
  };

  let walkPhase = 0;
  let walkBlend = 0;
  let wasMoving = false;

  const BLEND_IN = 2.5;
  const BLEND_OUT = 2.0;
  const JOINT_LERP = 5.0;

  function update(parts, delta, moving) {
    if (moving && !wasMoving) walkPhase = 0;
    wasMoving = moving;

    if (moving) {
      walkBlend = min(1, walkBlend + BLEND_IN * delta);
      walkPhase += WALK_SPEED * delta;
    } else {
      walkBlend = max(0, walkBlend - BLEND_OUT * delta);
    }

    const target = computeGaitPose(walkPhase);

    // Blend with idle
    const blended = {
      leftHip: target.leftHip * walkBlend,
      rightHip: target.rightHip * walkBlend,
      leftKnee: target.leftKnee * walkBlend,
      rightKnee: target.rightKnee * walkBlend,
      leftAnkle: target.leftAnkle * walkBlend,
      rightAnkle: target.rightAnkle * walkBlend,
      torsoY: NEUTRAL_Y + (target.torsoY - NEUTRAL_Y) * walkBlend,
      torsoSway: target.torsoSway * walkBlend,
      stanceFootFwd: target.stanceFootFwd * walkBlend,
    };

    // Smooth spring tracking
    const rate = min(1, JOINT_LERP * delta);
    for (const key in joints) {
      joints[key] += (blended[key] - joints[key]) * rate;
    }

    // Apply
    parts.leftLeg.rotation.x = joints.leftHip;
    parts.rightLeg.rotation.x = joints.rightHip;
    parts.leftShin.rotation.x = joints.leftKnee;
    parts.rightShin.rotation.x = joints.rightKnee;
    parts.leftFoot.rotation.x = joints.leftAnkle;
    parts.rightFoot.rotation.x = joints.rightAnkle;
    parts.torso.position.y = joints.torsoY;
    parts.torso.rotation.z = joints.torsoSway;

    return { footPlantCorrection: -joints.stanceFootFwd };
  }

  return { update };
}
