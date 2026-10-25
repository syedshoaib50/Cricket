import { DeliveryType, ShotTiming, ShotType, WeatherCondition } from '../types/cricket';

export interface BallPhysicsState {
  x: number; // Pitch axis X (left/right off-stump / leg-stump)
  y: number; // Height above ground
  z: number; // Pitch length Z (from bowler end ~20 to batsman end ~ -20)
  vx: number;
  vy: number;
  vz: number;
  hasBounced: boolean;
  isHit: boolean;
  isInAir: boolean;
  trailPoints: { x: number; y: number; z: number }[];
}

export interface ShotOutcome {
  runs: number;
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped';
  shotDistance: number;
  isBoundary4: boolean;
  isBoundary6: boolean;
  commentaryText: string;
  batQuality: 'sweet' | 'edge' | 'defensive';
  targetX: number;
  targetZ: number;
}

export const PITCH_LENGTH = 20.12; // meters in world coordinates
export const BOUNDARY_RADIUS = 68; // meters

/**
 * Calculates delivery initial velocity and spin based on type and weather
 */
export function calculateDeliveryPhysics(
  deliveryType: DeliveryType,
  pitchTargetX: number, // -1.5 (wide off) to +1.5 (wide leg)
  pitchTargetZ: number, // pitch landing length (e.g. -5 to -15)
  speedKmh: number, // 85 - 150 km/h
  weather: WeatherCondition
): { vx: number; vy: number; vz: number; swingAccX: number } {
  const speedMs = (speedKmh * 1000) / 3600; // convert to m/s (~25 - 42 m/s)
  const bowlerReleaseZ = 16.0;
  const batsmanZ = -14.0;
  const totalZDist = bowlerReleaseZ - pitchTargetZ;

  // Approximate time to pitch
  const timeToPitch = Math.max(0.35, totalZDist / (speedMs * 0.95));

  const vz = -Math.abs(speedMs * 0.92);
  const releaseY = 2.1; // bowler arm height
  const targetY = 0.05; // ground

  // vy needed under gravity (-9.8 m/s^2) to hit targetY at timeToPitch
  const vy = (targetY - releaseY + 0.5 * 9.8 * (timeToPitch * timeToPitch)) / timeToPitch;

  // vx needed to hit pitchTargetX from bowler run-up
  const bowlerReleaseX = 0.55; // right arm around over the wicket
  const vx = (pitchTargetX - bowlerReleaseX) / timeToPitch;

  // Swing acceleration modified by weather moisture and delivery type
  let swingAccX = 0;
  const swingMod = weather.swingFactor;

  switch (deliveryType) {
    case 'outswinger':
      swingAccX = -2.8 * swingMod; // swings away from right-hand batsman
      break;
    case 'inswinger':
      swingAccX = 3.2 * swingMod; // swings into right-hand batsman
      break;
    case 'yorker':
      swingAccX = 0.8 * swingMod;
      break;
    case 'bouncer':
      swingAccX = -0.5 * swingMod;
      break;
    case 'off_break':
      swingAccX = 0; // breaks off the pitch after bounce
      break;
    case 'leg_break':
      swingAccX = 0; // breaks towards off after bounce
      break;
    case 'googly':
      swingAccX = 0;
      break;
    default:
      swingAccX = 0.2 * swingMod;
      break;
  }

  return { vx, vy, vz, swingAccX };
}

/**
 * Calculates shot result based on batsman timing, shot direction angle, loft flag, and weather
 */
export function calculateShotOutcome(
  shotType: ShotType,
  timing: ShotTiming,
  shotAngleRad: number, // 0 to 2*PI, where 0 is straight down the ground
  isLofted: boolean,
  batsmanSkill: number,
  deliveryType: DeliveryType,
  weather: WeatherCondition,
  isWideOrNoBall: boolean
): ShotOutcome {
  if (isWideOrNoBall) {
    return {
      runs: 1,
      isWicket: false,
      shotDistance: 0,
      isBoundary4: false,
      isBoundary6: false,
      commentaryText: 'Umpire signals wide ball! Extra run gifted to the batting side.',
      batQuality: 'defensive',
      targetX: 0,
      targetZ: -14,
    };
  }

  // Handle Complete Miss
  if (timing === 'miss') {
    // Check if bowled or safe
    const isBowled = Math.random() < 0.45;
    return {
      runs: 0,
      isWicket: isBowled,
      wicketType: isBowled ? 'bowled' : undefined,
      shotDistance: 0,
      isBoundary4: false,
      isBoundary6: false,
      commentaryText: isBowled
        ? 'CLEAN BOWLED! Timber! The stumps are shattered into pieces!'
        : 'Beaten all ends up! Past the outside edge and into keeper gloves.',
      batQuality: 'defensive',
      targetX: 0,
      targetZ: -16,
    };
  }

  // Timing Multiplier
  let powerMultiplier = 1.0;
  let batQuality: 'sweet' | 'edge' | 'defensive' = 'sweet';

  if (timing === 'perfect') {
    powerMultiplier = 1.25;
    batQuality = 'sweet';
  } else if (timing === 'good') {
    powerMultiplier = 0.95;
    batQuality = 'sweet';
  } else if (timing === 'early' || timing === 'late') {
    powerMultiplier = 0.65;
    batQuality = Math.random() < 0.5 ? 'edge' : 'defensive';
  }

  // Skill factor
  const skillMult = batsmanSkill / 85;

  // Wet outfield dampens ground distance
  const groundFrictionMod = weather.pitchFriction;

  // Shot specific base power
  let baseDistance = 45;
  if (shotType === 'helicopter') baseDistance = 88;
  else if (shotType === 'pull_shot') baseDistance = 82;
  else if (shotType === 'cover_drive') baseDistance = 72;
  else if (shotType === 'straight_drive') baseDistance = 75;
  else if (shotType === 'dilscoop') baseDistance = 68;
  else if (shotType === 'late_cut') baseDistance = 58;
  else if (shotType === 'defensive') baseDistance = 8;

  let totalDistance = baseDistance * powerMultiplier * skillMult;

  if (isLofted) {
    totalDistance *= 1.25;
  } else {
    totalDistance *= 0.85 / groundFrictionMod;
  }

  // Random variance
  totalDistance += (Math.random() * 8 - 4);
  totalDistance = Math.max(4, totalDistance);

  // Determine Boundaries and Runs
  let runs = 0;
  let isBoundary4 = false;
  let isBoundary6 = false;
  let isWicket = false;
  let wicketType: 'caught' | 'bowled' | 'lbw' | undefined = undefined;

  // Edge risk
  if (batQuality === 'edge') {
    const catchChance = 0.42;
    if (Math.random() < catchChance) {
      isWicket = true;
      wicketType = 'caught';
    }
  } else if (isLofted && (timing === 'early' || timing === 'late')) {
    // Mistimed lofted shot risk
    if (Math.random() < 0.55) {
      isWicket = true;
      wicketType = 'caught';
    }
  }

  if (isWicket) {
    runs = 0;
    return {
      runs: 0,
      isWicket: true,
      wicketType: 'caught',
      shotDistance: Math.min(totalDistance, 55),
      isBoundary4: false,
      isBoundary6: false,
      commentaryText: 'IN THE AIR... AND TAKEN! A brilliant catch in the deep!',
      batQuality: 'edge',
      targetX: Math.sin(shotAngleRad) * 45,
      targetZ: -14 + Math.cos(shotAngleRad) * 45,
    };
  }

  if (shotType === 'defensive') {
    runs = 0;
    return {
      runs: 0,
      isWicket: false,
      shotDistance: totalDistance,
      isBoundary4: false,
      isBoundary6: false,
      commentaryText: 'Solid front-foot defense. No run taken.',
      batQuality: 'defensive',
      targetX: Math.sin(shotAngleRad) * 10,
      targetZ: -14 + Math.cos(shotAngleRad) * 10,
    };
  }

  if (isLofted && totalDistance >= BOUNDARY_RADIUS) {
    isBoundary6 = true;
    runs = 6;
  } else if (!isLofted && totalDistance >= BOUNDARY_RADIUS * 0.92) {
    isBoundary4 = true;
    runs = 4;
  } else if (totalDistance > 50) {
    runs = 3;
  } else if (totalDistance > 30) {
    runs = 2;
  } else if (totalDistance > 12) {
    runs = 1;
  } else {
    runs = 0;
  }

  // Calculate landing target coordinates on 3D field
  const targetX = Math.sin(shotAngleRad) * Math.min(totalDistance, BOUNDARY_RADIUS + 4);
  const targetZ = -14 + Math.cos(shotAngleRad) * Math.min(totalDistance, BOUNDARY_RADIUS + 4);

  // Generate commentary description
  let commentaryText = '';
  if (isBoundary6) {
    const distText = Math.round(totalDistance + 15);
    commentaryText = `MONSTROUS HIT! That is outta here! A towering ${distText}m SIX!`;
  } else if (isBoundary4) {
    commentaryText = 'Crack! Pierces the gap between fielders and races to the rope for FOUR!';
  } else if (runs === 2 || runs === 3) {
    commentaryText = `Well placed in the deep, batsmen scamper back quickly for ${runs} runs!`;
  } else if (runs === 1) {
    commentaryText = 'Pushed into the ring for a comfortable single to rotate the strike.';
  } else {
    commentaryText = 'Driven straight to the inner circle fielder. Dot ball!';
  }

  return {
    runs,
    isWicket: false,
    shotDistance: Math.round(totalDistance),
    isBoundary4,
    isBoundary6,
    commentaryText,
    batQuality,
    targetX,
    targetZ,
  };
}
