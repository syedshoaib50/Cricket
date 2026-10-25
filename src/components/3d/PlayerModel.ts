import * as THREE from 'three';
import { ShotType } from '../../types/cricket';

export interface PlayerKit {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  number: number;
}

/**
 * Creates a high-fidelity composite procedural 3D cricket player
 * Composed of 10+ distinct parts with grounded pivot and smooth kinematics.
 */
export class CricketPlayerModel {
  public group: THREE.Group;
  public kit: PlayerKit;
  public isBatsman: boolean;

  // Key animated sub-parts
  private upperBody: THREE.Group;
  private head: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private batGroup: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;

  // Stance animation phase
  private stancePhase: number = 0;
  private swingProgress: number = 0;
  private isSwinging: boolean = false;
  private currentShot: ShotType = 'straight_drive';

  // Material references for dynamic team kit updates
  private jerseyMat: THREE.MeshStandardMaterial;
  private trimMat: THREE.MeshStandardMaterial;
  private trouserMat: THREE.MeshStandardMaterial;
  private helmetMat: THREE.MeshStandardMaterial;

  constructor(kit: PlayerKit, isBatsman: boolean = true) {
    this.kit = kit;
    this.isBatsman = isBatsman;
    this.group = new THREE.Group();

    // Shared materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd29a73,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.jerseyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(kit.primaryColor),
      roughness: 0.65,
      metalness: 0.1,
    });

    this.trimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(kit.secondaryColor),
      roughness: 0.45,
      metalness: 0.2,
    });

    this.trouserMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(kit.primaryColor).clone().multiplyScalar(0.95),
      roughness: 0.75,
      metalness: 0.05,
    });

    const padMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f7,
      roughness: 0.5,
      metalness: 0.1,
    });

    this.helmetMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(kit.primaryColor).clone().multiplyScalar(0.8),
      roughness: 0.35,
      metalness: 0.4,
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.2,
      metalness: 0.85,
    });

    const willowBatMat = new THREE.MeshStandardMaterial({
      color: 0xdec088, // English willow
      roughness: 0.6,
      metalness: 0.0,
    });

    const gripMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      roughness: 0.9,
      metalness: 0.0,
    });

    // 1. Root and Pelvis
    const pelvisGeo = new THREE.BoxGeometry(0.38, 0.22, 0.24);
    const pelvis = new THREE.Mesh(pelvisGeo, this.trouserMat);
    pelvis.position.y = 0.95;
    pelvis.castShadow = true;
    this.group.add(pelvis);

    // 2. Upper Body Group (torso, head, arms)
    this.upperBody = new THREE.Group();
    this.upperBody.position.y = 1.06;

    const chestGeo = new THREE.BoxGeometry(0.42, 0.45, 0.26);
    const chest = new THREE.Mesh(chestGeo, this.jerseyMat);
    chest.position.y = 0.22;
    chest.castShadow = true;
    this.upperBody.add(chest);

    // Jersey Collar/Accent stripes
    const collarGeo = new THREE.BoxGeometry(0.44, 0.08, 0.28);
    const collar = new THREE.Mesh(collarGeo, this.trimMat);
    collar.position.y = 0.42;
    this.upperBody.add(collar);

    // 3. Head & Helmet Group
    this.head = new THREE.Group();
    this.head.position.y = 0.52;

    const headGeo = new THREE.SphereGeometry(0.13, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    this.head.add(headMesh);

    // Helmet dome
    const helmetGeo = new THREE.SphereGeometry(0.145, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const helmetMesh = new THREE.Mesh(helmetGeo, this.helmetMat);
    helmetMesh.position.y = 0.03;
    helmetMesh.rotation.x = -0.1;
    this.head.add(helmetMesh);

    // Helmet Visor / Grille
    const visorGeo = new THREE.TorusGeometry(0.12, 0.012, 8, 16, Math.PI * 0.8);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.02, 0.08);
    visorMesh.rotation.x = Math.PI / 2;
    this.head.add(visorMesh);

    this.upperBody.add(this.head);

    // 4. Arms & Bat
    // Right Arm (Shoulder pivot)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.24, 0.4, 0);

    const rUpperArmGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.28, 8);
    const rUpperArm = new THREE.Mesh(rUpperArmGeo, this.jerseyMat);
    rUpperArm.position.y = -0.14;
    rUpperArm.castShadow = true;
    this.rightArmGroup.add(rUpperArm);

    const rGloveGeo = new THREE.BoxGeometry(0.09, 0.12, 0.09);
    const rGlove = new THREE.Mesh(rGloveGeo, padMat);
    rGlove.position.y = -0.32;
    this.rightArmGroup.add(rGlove);

    this.upperBody.add(this.rightArmGroup);

    // Left Arm (Shoulder pivot)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.24, 0.4, 0);

    const lUpperArmGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.28, 8);
    const lUpperArm = new THREE.Mesh(lUpperArmGeo, this.jerseyMat);
    lUpperArm.position.y = -0.14;
    lUpperArm.castShadow = true;
    this.leftArmGroup.add(lUpperArm);

    const lGloveGeo = new THREE.BoxGeometry(0.09, 0.12, 0.09);
    const lGlove = new THREE.Mesh(lGloveGeo, padMat);
    lGlove.position.y = -0.32;
    this.leftArmGroup.add(lGlove);

    this.upperBody.add(this.leftArmGroup);

    // Bat (connected to right hand)
    this.batGroup = new THREE.Group();
    this.batGroup.position.set(0, -0.32, 0);

    // Bat handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.022, 0.28, 8);
    const handle = new THREE.Mesh(handleGeo, gripMat);
    handle.position.y = -0.14;
    this.batGroup.add(handle);

    // Bat willow blade (beveled curved box)
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.68, 0.045);
    const blade = new THREE.Mesh(bladeGeo, willowBatMat);
    blade.position.set(0, -0.58, 0.01);
    blade.castShadow = true;
    this.batGroup.add(blade);

    // Red sticker strip down the back of bat
    const stickerGeo = new THREE.BoxGeometry(0.06, 0.5, 0.005);
    const sticker = new THREE.Mesh(stickerGeo, this.trimMat);
    sticker.position.set(0, -0.58, -0.024);
    this.batGroup.add(sticker);

    if (this.isBatsman) {
      this.rightArmGroup.add(this.batGroup);
    }

    this.group.add(this.upperBody);

    // 5. Legs & Cricket Pads
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.12, 0.95, 0);

    const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.48, 8);
    const lThigh = new THREE.Mesh(legGeo, this.trouserMat);
    lThigh.position.y = -0.24;
    this.leftLeg.add(lThigh);

    if (this.isBatsman) {
      // Protective Batting Pad
      const padGeo = new THREE.BoxGeometry(0.14, 0.52, 0.1);
      const lPad = new THREE.Mesh(padGeo, padMat);
      lPad.position.set(0, -0.5, 0.04);
      lPad.castShadow = true;
      this.leftLeg.add(lPad);
    }

    // Cricket Shoe
    const shoeGeo = new THREE.BoxGeometry(0.12, 0.09, 0.24);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const lShoe = new THREE.Mesh(shoeGeo, shoeMat);
    lShoe.position.set(0, -0.9, 0.05);
    this.leftLeg.add(lShoe);

    this.group.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.12, 0.95, 0);

    const rThigh = new THREE.Mesh(legGeo, this.trouserMat);
    rThigh.position.y = -0.24;
    this.rightLeg.add(rThigh);

    if (this.isBatsman) {
      const padGeo = new THREE.BoxGeometry(0.14, 0.52, 0.1);
      const rPad = new THREE.Mesh(padGeo, padMat);
      rPad.position.set(0, -0.5, 0.04);
      rPad.castShadow = true;
      this.rightLeg.add(rPad);
    }

    const rShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rShoe.position.set(0, -0.9, 0.05);
    this.rightLeg.add(rShoe);

    this.group.add(this.rightLeg);

    // Apply initial posture
    this.setInitialStance();
  }

  private setInitialStance() {
    if (this.isBatsman) {
      // Classic side-on batting stance
      this.group.rotation.y = Math.PI / 2; // facing bowler
      this.upperBody.rotation.y = 0.2;
      this.head.rotation.y = -0.3; // eyes on bowler
      this.rightArmGroup.rotation.set(-0.4, 0.2, 0.4);
      this.leftArmGroup.rotation.set(-0.6, -0.2, -0.4);
      this.batGroup.rotation.set(0.4, 0.1, -0.2); // bat tapped behind crease
    } else {
      // Bowler / Fielder relaxed alert posture
      this.group.rotation.y = 0;
    }
  }

  /**
   * Triggers a specific batting stroke animation
   */
  public triggerShot(shot: ShotType) {
    this.isSwinging = true;
    this.swingProgress = 0;
    this.currentShot = shot;
  }

  /**
   * Update kinematics loop
   */
  public update(delta: number) {
    if (this.isBatsman) {
      if (this.isSwinging) {
        this.swingProgress += delta * 3.5; // swing speed
        const t = Math.min(1.0, this.swingProgress);

        // Shot specific keyframe arcs
        if (this.currentShot === 'cover_drive') {
          // High backlift to elegant low-to-high follow-through
          this.upperBody.rotation.x = Math.sin(t * Math.PI) * 0.25;
          this.upperBody.rotation.y = 0.2 + (1 - t) * 0.4;
          this.rightArmGroup.rotation.x = -0.5 - t * 1.6;
          this.rightArmGroup.rotation.z = 0.4 + t * 0.8;
          this.batGroup.rotation.x = 0.5 - t * 2.1;
        } else if (this.currentShot === 'pull_shot') {
          // Horizontal cross-bat pull shot towards midwicket
          this.upperBody.rotation.y = 0.2 - t * 1.4;
          this.rightArmGroup.rotation.x = -1.2;
          this.rightArmGroup.rotation.z = 0.6 - t * 1.2;
          this.batGroup.rotation.z = -t * 1.8;
        } else if (this.currentShot === 'helicopter') {
          // Bottom-hand wrist flick full 360 follow-through
          this.upperBody.rotation.y = 0.2 - t * 1.8;
          this.rightArmGroup.rotation.x = -0.4 - t * 2.8;
          this.batGroup.rotation.y = t * Math.PI * 1.6;
        } else if (this.currentShot === 'dilscoop') {
          // Crouch and ramp over wicketkeeper
          this.upperBody.position.y = 1.06 - Math.sin(t * Math.PI) * 0.35;
          this.rightArmGroup.rotation.x = -1.8 + t * 0.8;
          this.batGroup.rotation.x = -1.2;
        } else {
          // Straight drive / standard stroke
          this.upperBody.rotation.x = Math.sin(t * Math.PI) * 0.2;
          this.rightArmGroup.rotation.x = -0.4 - t * 1.4;
          this.batGroup.rotation.x = 0.4 - t * 1.8;
        }

        if (this.swingProgress >= 1.0) {
          this.isSwinging = false;
          this.setInitialStance();
        }
      } else {
        // Subtle batting stance breathing / bat tap
        this.stancePhase += delta * 4;
        const tap = Math.sin(this.stancePhase);
        this.batGroup.position.y = -0.32 + Math.max(0, tap * 0.05);
        this.upperBody.position.y = 1.06 + Math.sin(this.stancePhase * 0.5) * 0.01;
      }
    }
  }

  /**
   * Bowler run-up and delivery action animation
   */
  public animateBowlingDelivery(tNormalized: number) {
    if (this.isBatsman) return;
    // tNormalized from 0 (start run up) to 1 (release & follow-through)
    if (tNormalized < 0.7) {
      // Run-up cycling
      const runCycle = tNormalized * 20;
      this.leftLeg.rotation.x = Math.sin(runCycle) * 0.6;
      this.rightLeg.rotation.x = -Math.sin(runCycle) * 0.6;
      this.leftArmGroup.rotation.x = -Math.sin(runCycle) * 0.7;
      this.rightArmGroup.rotation.x = Math.sin(runCycle) * 0.7;
      this.upperBody.rotation.x = 0.2;
    } else {
      // Bowling load-up and 360-degree arm windmill delivery
      const delT = (tNormalized - 0.7) / 0.3;
      this.rightArmGroup.rotation.x = -Math.PI * 2 * delT;
      this.leftArmGroup.rotation.x = -0.5;
      this.upperBody.rotation.x = 0.4 * delT;
    }
  }

  /**
   * Dynamically update team kit colors
   */
  public updateKit(kit: PlayerKit) {
    this.kit = kit;
    this.jerseyMat.color.set(kit.primaryColor);
    this.trouserMat.color.set(kit.primaryColor).multiplyScalar(0.95);
    this.trimMat.color.set(kit.secondaryColor);
    this.helmetMat.color.set(kit.primaryColor).multiplyScalar(0.8);
  }
}
