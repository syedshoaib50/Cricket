import * as THREE from 'three';
import { WeatherCondition } from '../../types/cricket';

export class StadiumScene {
  public scene: THREE.Scene;
  public turfMesh: THREE.Mesh;
  public pitchMesh: THREE.Mesh;
  public floodlights: THREE.SpotLight[] = [];
  public keyLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public rainParticles: THREE.Points | null = null;
  private rainVelocities: Float32Array | null = null;

  // Stumps and Zing Bails
  public batsmanStumpsGroup: THREE.Group;
  public bailsMeshes: THREE.Mesh[] = [];
  public areStumpsHit: boolean = false;
  private bailVelocities: { vx: number; vy: number; vz: number; rotX: number; rotY: number }[] = [];

  constructor(weather: WeatherCondition) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(weather.skyColor);
    this.scene.fog = new THREE.FogExp2(weather.fogColor, 0.007);

    // 1. Lighting Rig
    this.keyLight = new THREE.DirectionalLight(0xfffaed, weather.lightIntensity);
    this.keyLight.position.set(25, 45, 30);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 5;
    this.keyLight.shadow.camera.far = 130;
    this.keyLight.shadow.camera.left = -45;
    this.keyLight.shadow.camera.right = 45;
    this.keyLight.shadow.camera.top = 45;
    this.keyLight.shadow.camera.bottom = -45;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    this.hemiLight = new THREE.HemisphereLight(weather.skyColor, 0x1b4332, 0.6);
    this.scene.add(this.hemiLight);

    // 2. Procedural Turf & Outfield
    const turfCanvas = document.createElement('canvas');
    turfCanvas.width = 1024;
    turfCanvas.height = 1024;
    const ctx = turfCanvas.getContext('2d')!;

    // Base emerald green
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(0, 0, 1024, 1024);

    // Alternating concentric lawnmower stripes
    for (let r = 512; r > 20; r -= 24) {
      ctx.beginPath();
      ctx.arc(512, 512, r, 0, Math.PI * 2);
      ctx.fillStyle = (r / 24) % 2 === 0 ? '#347a5b' : '#2b654b';
      ctx.fill();
    }

    // Boundary rope marker
    ctx.beginPath();
    ctx.arc(512, 512, 460, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // 30-yard circle marker
    ctx.beginPath();
    ctx.arc(512, 512, 220, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 12]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();
    ctx.setLineDash([]);

    const turfTexture = new THREE.CanvasTexture(turfCanvas);
    turfTexture.colorSpace = THREE.SRGBColorSpace;
    turfTexture.wrapS = THREE.ClampToEdgeWrapping;
    turfTexture.wrapT = THREE.ClampToEdgeWrapping;

    const turfGeo = new THREE.CylinderGeometry(75, 75, 0.4, 64);
    const turfMat = new THREE.MeshStandardMaterial({
      map: turfTexture,
      roughness: 0.85,
      metalness: 0.05,
    });
    this.turfMesh = new THREE.Mesh(turfGeo, turfMat);
    this.turfMesh.position.y = -0.2;
    this.turfMesh.receiveShadow = true;
    this.scene.add(this.turfMesh);

    // 3. Realistic Cricket Pitch Strip
    const pitchCanvas = document.createElement('canvas');
    pitchCanvas.width = 512;
    pitchCanvas.height = 1024;
    const pCtx = pitchCanvas.getContext('2d')!;

    // Clay/dirt straw pitch base
    pCtx.fillStyle = '#c7ab77';
    pCtx.fillRect(0, 0, 512, 1024);

    // Subtle pitch grass patches and roller tracks
    for (let i = 0; i < 300; i++) {
      pCtx.fillStyle = Math.random() < 0.6 ? 'rgba(163, 137, 92, 0.25)' : 'rgba(92, 125, 70, 0.15)';
      pCtx.fillRect(Math.random() * 512, Math.random() * 1024, Math.random() * 40 + 10, Math.random() * 60 + 20);
    }

    // White Crease Markings
    pCtx.fillStyle = '#ffffff';
    // Batsman popping crease (Z ~ -14m)
    pCtx.fillRect(60, 160, 392, 8);
    // Batsman bowling crease (Z ~ -14.6m)
    pCtx.fillRect(100, 120, 312, 6);
    // Return creases
    pCtx.fillRect(100, 80, 6, 90);
    pCtx.fillRect(406, 80, 6, 90);

    // Bowler end popping crease
    pCtx.fillRect(60, 856, 392, 8);
    pCtx.fillRect(100, 896, 312, 6);
    pCtx.fillRect(100, 850, 6, 90);
    pCtx.fillRect(406, 850, 6, 90);

    const pitchTexture = new THREE.CanvasTexture(pitchCanvas);
    pitchTexture.colorSpace = THREE.SRGBColorSpace;

    const pitchGeo = new THREE.PlaneGeometry(3.05, 22.56);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: pitchTexture,
      roughness: 0.9,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
    this.pitchMesh.rotation.x = -Math.PI / 2;
    this.pitchMesh.position.set(0, 0.015, -4.3);
    this.pitchMesh.receiveShadow = true;
    this.scene.add(this.pitchMesh);

    // 4. Stumps & Zing Bails
    this.batsmanStumpsGroup = new THREE.Group();
    this.batsmanStumpsGroup.position.set(0, 0, -14.6);
    this.createStumpsAndBails(this.batsmanStumpsGroup);
    this.scene.add(this.batsmanStumpsGroup);

    // Bowler's end stumps
    const bowlerStumpsGroup = new THREE.Group();
    bowlerStumpsGroup.position.set(0, 0, 5.52);
    this.createStumpsAndBails(bowlerStumpsGroup, false);
    this.scene.add(bowlerStumpsGroup);

    // 5. Grandstand Stadium Architecture
    this.buildStadiumSurroundings();

    // 6. Floodlight Towers (4 pylons at 4 corners of ground)
    this.buildFloodlights(weather.id === 'night');

    // 7. Rain Particle System (if rainy)
    if (weather.id === 'rainy') {
      this.initRainParticles();
    }
  }

  private createStumpsAndBails(parentGroup: THREE.Group, isInteractive: boolean = true) {
    const stumpMat = new THREE.MeshStandardMaterial({
      color: 0xedd6ae,
      roughness: 0.5,
      metalness: 0.05,
    });

    const zingLedMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.2,
    });

    // 3 Stumps (Off, Middle, Leg)
    const stumpOffsets = [-0.11, 0, 0.11];
    stumpOffsets.forEach((offsetX) => {
      const stumpGeo = new THREE.CylinderGeometry(0.018, 0.02, 0.71, 12);
      const stump = new THREE.Mesh(stumpGeo, stumpMat);
      stump.position.set(offsetX, 0.355, 0);
      stump.castShadow = true;
      parentGroup.add(stump);

      // Zing LED band in middle stump
      const ledGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.06, 12);
      const led = new THREE.Mesh(ledGeo, zingLedMat);
      led.position.set(offsetX, 0.45, 0);
      parentGroup.add(led);
    });

    // 2 Bails resting on top
    const bailOffsets = [-0.055, 0.055];
    bailOffsets.forEach((bX) => {
      const bailGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.11, 8);
      const bail = new THREE.Mesh(bailGeo, stumpMat);
      bail.rotation.z = Math.PI / 2;
      bail.position.set(bX, 0.72, 0);
      parentGroup.add(bail);

      if (isInteractive) {
        this.bailsMeshes.push(bail);
        this.bailVelocities.push({
          vx: (Math.random() - 0.5) * 6,
          vy: 5 + Math.random() * 4,
          vz: -Math.random() * 8,
          rotX: Math.random() * 15,
          rotY: Math.random() * 15,
        });
      }
    });
  }

  public triggerWicketDislodge() {
    this.areStumpsHit = true;
    // Light up Zing LED stumps in bright red/orange
    this.batsmanStumpsGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.emissive = new THREE.Color(0xff2a1a);
        mat.emissiveIntensity = 2.0;
      }
    });
  }

  public resetWicket() {
    this.areStumpsHit = false;
    this.bailsMeshes.forEach((bail, idx) => {
      bail.position.set(idx === 0 ? -0.055 : 0.055, 0.72, 0);
      bail.rotation.set(0, 0, Math.PI / 2);
    });
    this.batsmanStumpsGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0;
      }
    });
  }

  private buildStadiumSurroundings() {
    // Grandstand ring structure
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x3a404a,
      roughness: 0.8,
      metalness: 0.2,
    });

    const standLowerGeo = new THREE.CylinderGeometry(90, 80, 8, 48, 1, true);
    const standLower = new THREE.Mesh(standLowerGeo, standMat);
    standLower.position.y = 4;
    this.scene.add(standLower);

    const standUpperGeo = new THREE.CylinderGeometry(105, 92, 12, 48, 1, true);
    const standUpper = new THREE.Mesh(standUpperGeo, standMat);
    standUpper.position.y = 14;
    this.scene.add(standUpper);

    // Stadium Canopy Roof
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x22262c,
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide,
    });
    const roofGeo = new THREE.RingGeometry(95, 115, 48);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = Math.PI / 2;
    roof.position.y = 21;
    this.scene.add(roof);

    // Colorful Crowd Stand Rows (Procedural Texture)
    const crowdCanvas = document.createElement('canvas');
    crowdCanvas.width = 512;
    crowdCanvas.height = 128;
    const cCtx = crowdCanvas.getContext('2d')!;
    const crowdColors = ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#ffb703', '#fb8500'];
    for (let x = 0; x < 512; x += 6) {
      for (let y = 0; y < 128; y += 8) {
        cCtx.fillStyle = crowdColors[Math.floor(Math.random() * crowdColors.length)];
        cCtx.beginPath();
        cCtx.arc(x + 3, y + 4, 2.5, 0, Math.PI * 2);
        cCtx.fill();
      }
    }
    const crowdTex = new THREE.CanvasTexture(crowdCanvas);
    crowdTex.colorSpace = THREE.SRGBColorSpace;
    crowdTex.wrapS = THREE.RepeatWrapping;
    crowdTex.repeat.set(16, 1);

    const crowdMat = new THREE.MeshBasicMaterial({ map: crowdTex, side: THREE.DoubleSide });
    const crowdTierGeo = new THREE.CylinderGeometry(89.5, 80.5, 7.8, 48, 1, true);
    const crowdMesh = new THREE.Mesh(crowdTierGeo, crowdMat);
    crowdMesh.position.y = 4;
    this.scene.add(crowdMesh);

    // Electronic Video Screen LED scoreboard behind straight boundary
    const screenGeo = new THREE.BoxGeometry(16, 9, 0.5);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 16, -92);
    this.scene.add(screenMesh);
  }

  private buildFloodlights(isNight: boolean) {
    const towerPositions = [
      { x: -70, z: -70 },
      { x: 70, z: -70 },
      { x: -70, z: 70 },
      { x: 70, z: 70 },
    ];

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x555e6d,
      roughness: 0.4,
      metalness: 0.8,
    });

    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: isNight ? 0xffffff : 0x888888,
      emissiveIntensity: isNight ? 3.0 : 0.5,
    });

    towerPositions.forEach((pos) => {
      // Lattice tower pillar
      const towerGeo = new THREE.CylinderGeometry(0.8, 1.6, 42, 6);
      const tower = new THREE.Mesh(towerGeo, metalMat);
      tower.position.set(pos.x, 21, pos.z);
      this.scene.add(tower);

      // Light head rack
      const rackGeo = new THREE.BoxGeometry(8, 5, 1.2);
      const rack = new THREE.Mesh(rackGeo, metalMat);
      rack.position.set(pos.x, 42, pos.z);
      rack.lookAt(0, 0, 0);
      this.scene.add(rack);

      // Halogen light bulbs
      const bulbGeo = new THREE.BoxGeometry(7.2, 4.2, 0.2);
      const bulb = new THREE.Mesh(bulbGeo, lampMat);
      bulb.position.set(0, 0, 0.65);
      rack.add(bulb);

      // Spot Light casting down onto the pitch
      const spot = new THREE.SpotLight(0xfff5ea, isNight ? 2.8 : 0.6);
      spot.position.set(pos.x, 42, pos.z);
      spot.target.position.set(0, 0, -5);
      spot.angle = 0.55;
      spot.penumbra = 0.7;
      spot.distance = 160;
      spot.castShadow = false;
      this.scene.add(spot);
      this.scene.add(spot.target);
      this.floodlights.push(spot);
    });
  }

  private initRainParticles() {
    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    this.rainVelocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
      this.rainVelocities[i] = 25 + Math.random() * 15;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x90caf9,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.scene.add(this.rainParticles);
  }

  public update(delta: number) {
    // 1. Update Rain drops if active
    if (this.rainParticles && this.rainVelocities) {
      const posAttr = this.rainParticles.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] -= this.rainVelocities[i] * delta;
        positions[i * 3] += 4 * delta; // wind drift
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 42;
          positions[i * 3] = (Math.random() - 0.5) * 120;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Animate Bails flying if wicket dislodged
    if (this.areStumpsHit && this.bailsMeshes.length > 0) {
      this.bailsMeshes.forEach((bail, idx) => {
        const vel = this.bailVelocities[idx];
        bail.position.x += vel.vx * delta;
        bail.position.y += vel.vy * delta;
        bail.position.z += vel.vz * delta;
        vel.vy -= 9.8 * delta; // gravity

        bail.rotation.x += vel.rotX * delta;
        bail.rotation.y += vel.rotY * delta;

        // Ground floor clamp
        if (bail.position.y < 0.05) {
          bail.position.y = 0.05;
          vel.vy = -vel.vy * 0.4;
          vel.vx *= 0.6;
          vel.vz *= 0.6;
        }
      });
    }
  }

  public setWeather(weather: WeatherCondition) {
    this.scene.background = new THREE.Color(weather.skyColor);
    this.scene.fog = new THREE.FogExp2(weather.fogColor, 0.007);
    this.keyLight.intensity = weather.lightIntensity;

    const isNight = weather.id === 'night';
    this.floodlights.forEach((spot) => {
      spot.intensity = isNight ? 2.8 : 0.6;
    });

    if (weather.id === 'rainy' && !this.rainParticles) {
      this.initRainParticles();
    } else if (weather.id !== 'rainy' && this.rainParticles) {
      this.scene.remove(this.rainParticles);
      this.rainParticles = null;
    }
  }
}
