import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { StadiumScene } from './StadiumScene';
import { CricketPlayerModel } from './PlayerModel';
import {
  BallResult,
  CricketTeam,
  DeliveryType,
  ShotTiming,
  ShotType,
  UserShotChoice,
  WeatherCondition,
} from '../../types/cricket';
import {
  BallPhysicsState,
  ShotOutcome,
  calculateDeliveryPhysics,
  calculateShotOutcome,
} from '../../engine/physics';
import { soundEngine } from '../../audio/CricketAudioEngine';

export type CameraPreset = 'front_view' | 'batsman_view' | 'bowler_runup' | 'broadcast_tv' | 'boundary_chase' | 'hawk_eye_drs';

interface CricketCanvasProps {
  weather: WeatherCondition;
  battingTeam: CricketTeam;
  bowlingTeam: CricketTeam;
  cameraPreset: CameraPreset;
  onBallComplete: (result: BallResult) => void;
  onTimingMeterTick?: (phase: number, sweetSpot: boolean) => void;
  deliveryTriggerId: number;
  selectedDelivery: DeliveryType;
  bowlingPitchX: number;
  bowlingPitchZ: number;
  bowlingSpeedKmh: number;
  userShotChoice: UserShotChoice | null;
  isUserBatting: boolean;
  onTriggerDRS?: (result: BallResult) => void;
  batsmanX?: number;
}

type BallPhase = 'idle' | 'flight_to_batsman' | 'flight_after_shot' | 'travel_to_keeper' | 'settled';

export const CricketCanvas: React.FC<CricketCanvasProps> = ({
  weather,
  battingTeam,
  bowlingTeam,
  cameraPreset,
  onBallComplete,
  onTimingMeterTick,
  deliveryTriggerId,
  selectedDelivery,
  bowlingPitchX,
  bowlingPitchZ,
  bowlingSpeedKmh,
  userShotChoice,
  isUserBatting,
  onTriggerDRS,
  batsmanX = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    weather,
    battingTeam,
    bowlingTeam,
    cameraPreset,
    selectedDelivery,
    bowlingPitchX,
    bowlingPitchZ,
    bowlingSpeedKmh,
    userShotChoice,
    isUserBatting,
    deliveryTriggerId,
    batsmanX,
  });

  stateRef.current = {
    weather,
    battingTeam,
    bowlingTeam,
    cameraPreset,
    selectedDelivery,
    bowlingPitchX,
    bowlingPitchZ,
    bowlingSpeedKmh,
    userShotChoice,
    isUserBatting,
    deliveryTriggerId,
    batsmanX,
  };

  const ballStateRef = useRef<BallPhysicsState>({
    x: 0.55,
    y: 2.1,
    z: 16.0,
    vx: 0,
    vy: 0,
    vz: 0,
    hasBounced: false,
    isHit: false,
    isInAir: false,
    trailPoints: [],
  });

  const ballPhaseRef = useRef<BallPhase>('idle');
  const postShotTimerRef = useRef<number>(0);
  const sceneInstanceRef = useRef<StadiumScene | null>(null);
  const batsmanModelRef = useRef<CricketPlayerModel | null>(null);
  const bowlerModelRef = useRef<CricketPlayerModel | null>(null);
  const keeperModelRef = useRef<CricketPlayerModel | null>(null);
  const fielderModelsRef = useRef<CricketPlayerModel[]>([]);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const pitchSpotMarkerRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentCameraTargetRef = useRef(new THREE.Vector3(0, 1.2, -14));

  // Initialize Three.js scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as instructed by Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(renderer.domElement);

    // Studio Environment Reflection via RoomEnvironment
    const stadium = new StadiumScene(stateRef.current.weather);
    sceneInstanceRef.current = stadium;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    stadium.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 350);
    cameraRef.current = camera;
    if (stateRef.current.cameraPreset === 'front_view') {
      camera.position.set(0.0, 2.3, 8.5);
      camera.lookAt(0.0, 1.25, -14.0);
    } else {
      camera.position.set(0, 2.5, -19.5);
      camera.lookAt(0, 1.2, 5);
    }

    // Batsman Model
    const batsman = new CricketPlayerModel(
      {
        primaryColor: stateRef.current.battingTeam.primaryColor,
        secondaryColor: stateRef.current.battingTeam.secondaryColor,
        accentColor: stateRef.current.battingTeam.accentColor,
        number: 18,
      },
      true
    );
    batsman.group.position.set(0, 0, -14.0);
    stadium.scene.add(batsman.group);
    batsmanModelRef.current = batsman;

    // Bowler Model
    const bowler = new CricketPlayerModel(
      {
        primaryColor: stateRef.current.bowlingTeam.primaryColor,
        secondaryColor: stateRef.current.bowlingTeam.secondaryColor,
        accentColor: stateRef.current.bowlingTeam.accentColor,
        number: 93,
      },
      false
    );
    bowler.group.position.set(0.6, 0, 17.5);
    stadium.scene.add(bowler.group);
    bowlerModelRef.current = bowler;

    // Wicketkeeper Model
    const keeper = new CricketPlayerModel(
      {
        primaryColor: stateRef.current.bowlingTeam.primaryColor,
        secondaryColor: stateRef.current.bowlingTeam.secondaryColor,
        accentColor: stateRef.current.bowlingTeam.accentColor,
        number: 1,
      },
      false
    );
    keeper.group.position.set(0, 0, -17.5);
    stadium.scene.add(keeper.group);
    keeperModelRef.current = keeper;

    // Non-striker batsman
    const nonStriker = new CricketPlayerModel(
      {
        primaryColor: stateRef.current.battingTeam.primaryColor,
        secondaryColor: stateRef.current.battingTeam.secondaryColor,
        accentColor: stateRef.current.battingTeam.accentColor,
        number: 45,
      },
      true
    );
    nonStriker.group.position.set(-1.2, 0, 6.2);
    stadium.scene.add(nonStriker.group);

    // 7 Fielders
    const fielderPositions = [
      { x: 3.5, z: -17, name: 'First Slip' },
      { x: 26, z: -8, name: 'Point' },
      { x: 22, z: 2, name: 'Cover' },
      { x: -20, z: 4, name: 'Mid Wicket' },
      { x: -24, z: -10, name: 'Square Leg' },
      { x: 38, z: 32, name: 'Deep Extra Cover' },
      { x: -35, z: 35, name: 'Long On' },
    ];
    fielderModelsRef.current = [];
    fielderPositions.forEach((pos, idx) => {
      const fielder = new CricketPlayerModel(
        {
          primaryColor: stateRef.current.bowlingTeam.primaryColor,
          secondaryColor: stateRef.current.bowlingTeam.secondaryColor,
          accentColor: stateRef.current.bowlingTeam.accentColor,
          number: 20 + idx,
        },
        false
      );
      fielder.group.position.set(pos.x, 0, pos.z);
      fielder.group.lookAt(0, 0, -14);
      stadium.scene.add(fielder.group);
      fielderModelsRef.current.push(fielder);
    });

    // Umpires
    const umpireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const uHatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const bUmpireGroup = new THREE.Group();
    bUmpireGroup.position.set(0, 0, 8.2);
    const uBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.7, 8), umpireMat);
    uBody.position.y = 0.85;
    const uHat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), uHatMat);
    uHat.position.y = 1.75;
    bUmpireGroup.add(uBody);
    bUmpireGroup.add(uHat);
    stadium.scene.add(bUmpireGroup);

    // 3D Cricket Ball
    const isNight = stateRef.current.weather.id === 'night';
    const ballGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      color: isNight ? 0xf5f5f5 : 0xcc2936,
      roughness: 0.35,
      metalness: 0.15,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.castShadow = true;
    ballMesh.position.set(0.55, 2.1, 16.0);
    stadium.scene.add(ballMesh);
    ballMeshRef.current = ballMesh;

    // Pitch Landing Spot Target Ring
    const ringGeo = new THREE.RingGeometry(0.2, 0.35, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const pitchSpot = new THREE.Mesh(ringGeo, ringMat);
    pitchSpot.rotation.x = -Math.PI / 2;
    pitchSpot.position.set(stateRef.current.bowlingPitchX, 0.03, stateRef.current.bowlingPitchZ);
    stadium.scene.add(pitchSpot);
    pitchSpotMarkerRef.current = pitchSpot;

    // 3D Neon Ball Trajectory Trail (Hawk-Eye visualizer)
    const TRAIL_LENGTH = 50;
    const trailPositions = new Float32Array(TRAIL_LENGTH * 3);
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      trailPositions[i * 3] = 0.55;
      trailPositions[i * 3 + 1] = 2.1;
      trailPositions[i * 3 + 2] = 16.0;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.85,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    stadium.scene.add(trailLine);

    // Batting Crease Footwork Visualizer (Unity-style Ground Marker)
    const creaseGuideGroup = new THREE.Group();
    creaseGuideGroup.position.set(0, 0.02, -14.0);

    // Popping crease line
    const creaseLine = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 })
    );
    creaseLine.rotation.x = -Math.PI / 2;
    creaseGuideGroup.add(creaseLine);

    // Stump marker indicators (Leg, Middle, Off)
    [-0.12, 0, 0.12].forEach((stumpX) => {
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.035, 12),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 })
      );
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(stumpX, 0.005, -0.15);
      creaseGuideGroup.add(dot);
    });

    // Batsman Crease Foot Shadow Marker (Dynamic tracker)
    const footMarker = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 })
    );
    footMarker.rotation.x = -Math.PI / 2;
    footMarker.position.set(0, 0.008, 0);
    creaseGuideGroup.add(footMarker);
    stadium.scene.add(creaseGuideGroup);

    // Animation render loop
    let frameId: number = 0;
    const clock = new THREE.Clock();

    const renderTick = () => {
      const delta = Math.min(0.1, clock.getDelta());

      // Update stadium and players
      stadium.update(delta);
      if (batsmanModelRef.current) {
        batsmanModelRef.current.update(delta);

        // Smoothly interpolate batsman left & right along crease
        const targetX = stateRef.current.batsmanX ?? 0;
        batsmanModelRef.current.group.position.x = THREE.MathUtils.damp(
          batsmanModelRef.current.group.position.x,
          targetX,
          14,
          delta
        );
        footMarker.position.x = batsmanModelRef.current.group.position.x;
      }

      // Update pitch target marker position
      if (pitchSpotMarkerRef.current) {
        pitchSpotMarkerRef.current.position.x = stateRef.current.bowlingPitchX;
        pitchSpotMarkerRef.current.position.z = stateRef.current.bowlingPitchZ;
      }

      // Ball Physics Simulation
      const b = ballStateRef.current;
      const currentPhase = ballPhaseRef.current;

      // Update 3D Trajectory Trail
      if (currentPhase === 'flight_to_batsman' || currentPhase === 'flight_after_shot' || currentPhase === 'travel_to_keeper') {
        const posAttr = trailGeo.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
          arr[i * 3] = arr[(i - 1) * 3];
          arr[i * 3 + 1] = arr[(i - 1) * 3 + 1];
          arr[i * 3 + 2] = arr[(i - 1) * 3 + 2];
        }
        arr[0] = b.x;
        arr[1] = b.y;
        arr[2] = b.z;
        posAttr.needsUpdate = true;
      }

      if (currentPhase === 'flight_to_batsman' && ballMeshRef.current) {
        // Ball travelling from bowler to batsman
        b.x += b.vx * delta;
        b.y += b.vy * delta;
        b.z += b.vz * delta;
        b.vy -= 9.8 * delta;

        // Pitch Bounce check
        if (b.y <= 0.065 && !b.hasBounced && b.z > -14.2) {
          b.y = 0.065;
          b.vy = -b.vy * stateRef.current.weather.pitchBounce * 0.72;
          b.vx *= 0.92;
          b.vz *= 0.94;
          b.hasBounced = true;
          soundEngine.playBallBounce();
        }

        // Timing meter tick for UI feedback while ball approaches
        if (b.z > -14.0 && b.z < 6.0 && onTimingMeterTick) {
          const normZ = (6.0 - b.z) / 20.0;
          const isSweet = b.z < -10.5 && b.z > -13.2;
          onTimingMeterTick(normZ, isSweet);
        }

        // Batsman impact zone (around z = -13.8)
        if (b.z <= -13.8) {
          let chosenShot: ShotType = 'straight_drive';
          let chosenTiming: ShotTiming = 'good';
          let chosenLoft = false;
          let chosenAngle = 0;
          let playerDidSwing = false;

          if (stateRef.current.isUserBatting) {
            const userShot = stateRef.current.userShotChoice;
            if (userShot && userShot.deliveryId === stateRef.current.deliveryTriggerId) {
              // Player actively executed a shot!
              playerDidSwing = true;
              chosenShot = userShot.shotType;
              chosenTiming = userShot.timing;
              chosenLoft = userShot.isLofted;
              chosenAngle = userShot.shotAngleRad;
            } else {
              // Player offered NO shot / left the ball
              playerDidSwing = false;
            }
          } else {
            // AI Batsman reacting to User's Bowling!
            playerDidSwing = true;
            const pZ = stateRef.current.bowlingPitchZ;
            const pX = stateRef.current.bowlingPitchX;

            if (pZ < -13.0 && Math.abs(pX) < 0.25) {
              // Yorker
              if (Math.random() < 0.38) {
                chosenTiming = 'miss';
                chosenShot = 'defensive';
              } else {
                chosenTiming = 'early';
                chosenShot = 'defensive';
              }
            } else if (pZ > -9.5) {
              // Bouncer
              if (Math.random() < 0.35) {
                chosenTiming = 'early';
                chosenShot = 'pull_shot';
                chosenLoft = true;
              } else {
                chosenTiming = 'good';
                chosenShot = 'pull_shot';
              }
            } else if (Math.abs(pX) > 0.45) {
              // Wide outside off
              if (Math.random() < 0.4) {
                chosenTiming = 'early';
                chosenShot = 'late_cut';
              } else {
                chosenTiming = 'good';
                chosenShot = 'cover_drive';
              }
            } else {
              // Standard good length delivery
              chosenTiming = Math.random() < 0.5 ? 'good' : Math.random() < 0.75 ? 'perfect' : 'early';
              chosenShot = Math.random() < 0.5 ? 'cover_drive' : 'straight_drive';
              chosenLoft = Math.random() < 0.35;
            }

            chosenAngle = chosenShot === 'cover_drive' ? 0.6 : chosenShot === 'pull_shot' ? -0.85 : 0;
          }

          if (playerDidSwing) {
            // Animate batsman swing
            if (batsmanModelRef.current) {
              batsmanModelRef.current.triggerShot(chosenShot);
            }

            const outcome: ShotOutcome = calculateShotOutcome(
              chosenShot,
              chosenTiming,
              chosenAngle,
              chosenLoft,
              88,
              stateRef.current.selectedDelivery,
              stateRef.current.weather,
              false
            );

            if (chosenTiming === 'miss') {
              soundEngine.playCrowdOoh();
              ballPhaseRef.current = 'travel_to_keeper';

              if (outcome.isWicket && outcome.wicketType === 'bowled') {
                soundEngine.playWicketShatter();
                stadium.triggerWicketDislodge();
              }
            } else {
              // Ball was hit! Launch trajectory
              soundEngine.playBatHit(outcome.batQuality);
              if (outcome.isBoundary4 || outcome.isBoundary6) {
                soundEngine.playCrowdCheer('huge');
                soundEngine.playBuzzer();
              } else if (outcome.runs > 0) {
                soundEngine.playCrowdCheer('medium');
              }

              b.isHit = true;
              b.isInAir = chosenLoft;
              const hitSpeed = outcome.shotDistance * 0.72;
              b.vx = Math.sin(chosenAngle) * hitSpeed;
              b.vz = Math.cos(chosenAngle) * hitSpeed;
              b.vy = chosenLoft ? 12.5 : 1.5;
              ballPhaseRef.current = 'flight_after_shot';
              postShotTimerRef.current = 0;
            }

            // Settle outcome after flight
            setTimeout(() => {
              const ballRes: BallResult = {
                overNumber: 0,
                ballNumber: 0,
                runsScored: outcome.runs,
                isExtra: false,
                isWicket: outcome.isWicket,
                wicketType: outcome.wicketType,
                shotType: chosenShot,
                shotTiming: chosenTiming,
                shotDistance: outcome.shotDistance,
                commentaryText: outcome.commentaryText,
                isBoundary4: outcome.isBoundary4,
                isBoundary6: outcome.isBoundary6,
                bowlerName: 'Bowler',
                batsmanName: 'Striker',
              };

              ballPhaseRef.current = 'settled';
              onBallComplete(ballRes);

              if (outcome.isWicket && (outcome.wicketType === 'lbw' || outcome.wicketType === 'caught') && onTriggerDRS) {
                onTriggerDRS(ballRes);
              }
            }, 2200);
          } else {
            // No shot offered / left alone!
            const isHittingStumps = Math.abs(b.x) < 0.18 && b.y < 0.72;
            ballPhaseRef.current = 'travel_to_keeper';

            if (isHittingStumps) {
              soundEngine.playWicketShatter();
              stadium.triggerWicketDislodge();
            } else {
              soundEngine.playBallBounce();
            }

            setTimeout(() => {
              const ballRes: BallResult = {
                overNumber: 0,
                ballNumber: 0,
                runsScored: 0,
                isExtra: false,
                isWicket: isHittingStumps,
                wicketType: isHittingStumps ? 'bowled' : undefined,
                shotDistance: 0,
                commentaryText: isHittingStumps
                  ? 'BOWLED HIM! Offered no shot, and the off-stump is knocked out of the ground!'
                  : 'Left alone outside the off stump. Straight into the wicketkeeper gloves.',
                bowlerName: 'Bowler',
                batsmanName: 'Striker',
              };

              ballPhaseRef.current = 'settled';
              onBallComplete(ballRes);
            }, 1800);
          }
        }

        ballMeshRef.current.position.set(b.x, b.y, b.z);
      } else if (currentPhase === 'flight_after_shot' && ballMeshRef.current) {
        // Ball flying after bat strike
        postShotTimerRef.current += delta;
        b.x += b.vx * delta;
        b.y += b.vy * delta;
        b.z += b.vz * delta;
        b.vy -= 9.8 * delta;

        // Turf ground collision
        if (b.y <= 0.065) {
          b.y = 0.065;
          b.vy = -b.vy * 0.45;
          b.vx *= 0.94;
          b.vz *= 0.94;
        }

        ballMeshRef.current.position.set(b.x, b.y, b.z);
      } else if (currentPhase === 'travel_to_keeper' && ballMeshRef.current) {
        // Ball continuing past batsman to keeper
        b.z += b.vz * delta;
        b.y += b.vy * delta;
        b.vy -= 9.8 * delta;
        if (b.z < -17.5) {
          b.z = -17.5;
        }
        if (b.y < 0.065) b.y = 0.065;
        ballMeshRef.current.position.set(b.x, b.y, b.z);
      }

      // Smooth Camera Choreography
      if (cameraRef.current) {
        const cam = cameraRef.current;
        const targetPos = new THREE.Vector3();
        const lookTarget = currentCameraTargetRef.current;

        const preset = stateRef.current.cameraPreset;
        const bPos = ballMeshRef.current?.position || new THREE.Vector3(0, 0, 0);

        if (preset === 'front_view') {
          if (currentPhase === 'flight_after_shot') {
            // Dynamic 3D Chase tracking the ball soaring across stadium
            targetPos.set(bPos.x * 0.5, Math.max(4.0, bPos.y + 3.0), Math.min(24, bPos.z + 8.5));
            lookTarget.copy(bPos);
          } else {
            // Direct Front View: looking straight down the pitch at the batsman from bowler end!
            targetPos.set(0.0, 2.3, 8.5);
            lookTarget.set(0.0, 1.25, -14.0);
          }
        } else if (preset === 'batsman_view') {
          if (currentPhase === 'flight_after_shot') {
            // Locked 3D Chase Camera tracking ball across stadium
            targetPos.set(bPos.x * 0.55, Math.max(4.0, bPos.y + 3.0), bPos.z - 9.0);
            lookTarget.copy(bPos);
          } else {
            // Locked 3D Pro Batting View right behind batsman crease
            targetPos.set(0.35, 2.35, -18.2);
            lookTarget.set(0.1, 1.25, 8.0);
          }
        } else if (preset === 'bowler_runup') {
          if (currentPhase === 'flight_after_shot') {
            targetPos.set(bPos.x * 0.6, Math.max(5.0, bPos.y + 3.5), bPos.z + 9.0);
            lookTarget.copy(bPos);
          } else {
            // Locked Bowler Run-up perspective
            const ballZ = bPos.z || 16;
            targetPos.set(0.55, 2.7, Math.min(22, ballZ + 3.8));
            lookTarget.set(0, 1.05, -14.2);
          }
        } else if (preset === 'broadcast_tv') {
          targetPos.set(42, 28, -6);
          lookTarget.set(bPos.x * 0.4, 1.0, bPos.z * 0.5);
        } else if (preset === 'boundary_chase') {
          targetPos.set(bPos.x * 0.7, 4.5, bPos.z - 8);
          lookTarget.copy(bPos);
        } else if (preset === 'hawk_eye_drs') {
          targetPos.set(0, 1.2, 8);
          lookTarget.set(0, 0.7, -14.6);
        }

        cam.position.x = THREE.MathUtils.damp(cam.position.x, targetPos.x, 4.5, delta);
        cam.position.y = THREE.MathUtils.damp(cam.position.y, targetPos.y, 4.5, delta);
        cam.position.z = THREE.MathUtils.damp(cam.position.z, targetPos.z, 4.5, delta);
        cam.lookAt(lookTarget);
      }

      renderer.render(stadium.scene, camera);
      frameId = requestAnimationFrame(renderTick);
    };

    frameId = requestAnimationFrame(renderTick);

    const handleResize = () => {
      if (!container || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update weather dynamically
  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.setWeather(weather);
      soundEngine.updateAmbientWeather(weather.id === 'rainy');
    }
  }, [weather]);

  // Update team kits when teams change
  useEffect(() => {
    if (batsmanModelRef.current) {
      batsmanModelRef.current.updateKit({
        primaryColor: battingTeam.primaryColor,
        secondaryColor: battingTeam.secondaryColor,
        accentColor: battingTeam.accentColor,
        number: 18,
      });
    }
    if (bowlerModelRef.current) {
      bowlerModelRef.current.updateKit({
        primaryColor: bowlingTeam.primaryColor,
        secondaryColor: bowlingTeam.secondaryColor,
        accentColor: bowlingTeam.accentColor,
        number: 93,
      });
    }
    if (keeperModelRef.current) {
      keeperModelRef.current.updateKit({
        primaryColor: bowlingTeam.primaryColor,
        secondaryColor: bowlingTeam.secondaryColor,
        accentColor: bowlingTeam.accentColor,
        number: 1,
      });
    }
    fielderModelsRef.current.forEach((fielder, idx) => {
      fielder.updateKit({
        primaryColor: bowlingTeam.primaryColor,
        secondaryColor: bowlingTeam.secondaryColor,
        accentColor: bowlingTeam.accentColor,
        number: 20 + idx,
      });
    });
  }, [battingTeam.id, bowlingTeam.id]);

  // Delivery Trigger: start delivery run-up and trajectory
  useEffect(() => {
    if (deliveryTriggerId === 0) return;

    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.resetWicket();
    }

    if (bowlerModelRef.current) {
      bowlerModelRef.current.animateBowlingDelivery(0.85);
    }

    const { vx, vy, vz } = calculateDeliveryPhysics(
      selectedDelivery,
      bowlingPitchX,
      bowlingPitchZ,
      bowlingSpeedKmh,
      weather
    );

    ballStateRef.current = {
      x: 0.55,
      y: 2.1,
      z: 16.0,
      vx,
      vy,
      vz,
      hasBounced: false,
      isHit: false,
      isInAir: false,
      trailPoints: [],
    };

    if (ballMeshRef.current) {
      ballMeshRef.current.position.set(0.55, 2.1, 16.0);
    }

    ballPhaseRef.current = 'flight_to_batsman';
  }, [deliveryTriggerId]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-auto bg-slate-950"
    />
  );
};
