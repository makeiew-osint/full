import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

(() => {
  "use strict";

  const canvas = document.querySelector("#world-canvas");
  const fxToggle = document.querySelector("#fx-toggle");
  const scrollCue = document.querySelector("#scroll-cue");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const body = document.body;

  const detectWebGL = () => {
    try {
      const test = document.createElement("canvas");
      return Boolean(test.getContext("webgl2") || test.getContext("webgl"));
    } catch {
      return false;
    }
  };

  const savedQuality = localStorage.getItem("loveHubFxQuality");
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  const autoQuality = !detectWebGL()
    ? "off"
    : reduced.matches
      ? "off"
      : coarsePointer || lowMemory || window.innerWidth < 720
        ? "light"
        : "cinema";

  let quality = savedQuality || autoQuality;
  if (quality !== "off" && quality !== "light" && quality !== "cinema") quality = autoQuality;

  const labelFor = (value) => (value === "cinema" ? "эффекты: кино" : value === "light" ? "эффекты: легче" : "эффекты: выкл");

  const applyQualityClass = () => {
    body.classList.toggle("has-webgl", quality !== "off" && detectWebGL());
    body.classList.toggle("fx-light", quality === "light");
    body.classList.toggle("fx-off", quality === "off");
    fxToggle.textContent = labelFor(quality);
    fxToggle.setAttribute("aria-pressed", String(quality !== "off"));
  };
  applyQualityClass();

  const revealSections = () => {
    body.classList.add("js-reveal");
    const nodes = document.querySelectorAll(".section-block, .hero, .quick-nav, .last-words, .closing-screen, .gallery-card, .photo-strip figure, .timeline-item, .plans-grid article, .envelope");
    if (reduced.matches) {
      nodes.forEach((node) => node.classList.add("is-inview"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach((node) => io.observe(node));
  };
  revealSections();

  const hideCue = () => {
    if (!scrollCue) return;
    scrollCue.classList.toggle("is-hidden", window.scrollY > 80);
  };
  window.addEventListener("scroll", hideCue, { passive: true });
  hideCue();

  document.querySelectorAll(".gallery-card, .photo-strip figure").forEach((card) => {
    card.classList.add("frame-3d");
  });

  if (quality === "off" || !detectWebGL()) {
    fxToggle.addEventListener("click", () => {
      quality = quality === "off" ? (coarsePointer ? "light" : "cinema") : quality === "cinema" ? "light" : "off";
      localStorage.setItem("loveHubFxQuality", quality);
      location.reload();
    });
    return;
  }

  const state = {
    renderer: null,
    composer: null,
    scene: null,
    camera: null,
    clock: new THREE.Clock(),
    heart: null,
    miniHearts: [],
    flowers: [],
    spheres: [],
    floatingModels: [],
    envelopes: [],
    frames: [],
    petals: null,
    dust: null,
    finale: null,
    mouse: new THREE.Vector2(0, 0),
    targetMouse: new THREE.Vector2(0, 0),
    running: true,
    useBloom: quality === "cinema" && window.innerWidth >= 900 && !coarsePointer
  };

  const heartPoint = (t, s = 1) => {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return new THREE.Vector3(x * 0.045 * s, y * 0.045 * s, 0);
  };

  const createHeartGeometry = (scale = 1, depth = 0.42) => {
    const shape = new THREE.Shape();
    const steps = 96;
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * Math.PI * 2;
      const p = heartPoint(t, scale);
      if (i === 0) shape.moveTo(p.x, p.y);
      else shape.lineTo(p.x, p.y);
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: depth * scale,
      bevelEnabled: true,
      bevelThickness: 0.09 * scale,
      bevelSize: 0.07 * scale,
      bevelSegments: quality === "cinema" ? 8 : 3,
      curveSegments: quality === "cinema" ? 48 : 18
    });
    geo.center();
    geo.computeVertexNormals();
    return geo;
  };

  const glassHeartMaterial = () => new THREE.MeshPhysicalMaterial({
    color: 0xff8b9c,
    metalness: 0.04,
    roughness: 0.06,
    transmission: quality === "cinema" ? 0.92 : 0.55,
    thickness: 1.35,
    ior: 1.48,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    attenuationColor: new THREE.Color(0xff4466),
    attenuationDistance: 0.55,
    iridescence: 0.35,
    iridescenceIOR: 1.3,
    envMapIntensity: 1.6,
    transparent: true
  });

  const createFlower = (tint) => {
    const group = new THREE.Group();
    const petalGeo = new THREE.SphereGeometry(0.22, quality === "cinema" ? 18 : 10, 10);
    petalGeo.scale(1, 0.28, 0.62);
    const petalMat = new THREE.MeshPhysicalMaterial({
      color: tint,
      roughness: 0.28,
      metalness: 0.02,
      clearcoat: 0.7,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xffd4dc)
    });
    for (let i = 0; i < 8; i += 1) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      const a = (i / 8) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.22, 0.04, Math.sin(a) * 0.22);
      petal.rotation.set(0.4, a, 0.15);
      petal.castShadow = quality === "cinema";
      group.add(petal);
    }
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf2d38a, emissive: 0x4a3010, emissiveIntensity: 0.25, roughness: 0.4 })
    );
    center.position.y = 0.05;
    group.add(center);
    return group;
  };

  const createEnvelope = () => {
    const group = new THREE.Group();
    const paper = new THREE.MeshPhysicalMaterial({
      color: 0xf4ebe1,
      roughness: 0.55,
      metalness: 0.02,
      clearcoat: 0.2
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.78, 0.04), paper);
    body.castShadow = quality === "cinema";
    group.add(body);
    const flap = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 0.02), paper);
    flap.position.set(0, 0.38, 0.08);
    flap.rotation.x = -0.55;
    group.add(flap);
    const wax = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 0.05, 24),
      new THREE.MeshStandardMaterial({ color: 0x9a2d36, roughness: 0.35, metalness: 0.15, emissive: 0x3a0508, emissiveIntensity: 0.2 })
    );
    wax.rotation.x = Math.PI / 2;
    wax.position.set(0, 0.02, 0.05);
    group.add(wax);
    return group;
  };

  const createFrame = (map) => {
    const group = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0xcbb39a, roughness: 0.45, metalness: 0.08 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.52, 0.08), wood);
    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(1.02, 1.36),
      new THREE.MeshStandardMaterial({ map, roughness: 0.55 })
    );
    photo.position.z = 0.045;
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.04, 1.38),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.05,
        transmission: 0.7,
        thickness: 0.08,
        transparent: true,
        opacity: 0.22
      })
    );
    glass.position.z = 0.055;
    group.add(frame, photo, glass);
    return group;
  };

  const createDust = (count) => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorA = new THREE.Color(0xffd6c8);
    const colorB = new THREE.Color(0xff8da0);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      const c = colorA.clone().lerp(colorB, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geo, mat);
  };

  const createFinaleCloud = (count) => {
    const start = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const current = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      start[i * 3] = (Math.random() - 0.5) * 16;
      start[i * 3 + 1] = (Math.random() - 0.5) * 10 - 1;
      start[i * 3 + 2] = (Math.random() - 0.5) * 12;
      const t = Math.random() * Math.PI * 2;
      const p = heartPoint(t, 1.15);
      const z = (Math.random() - 0.5) * 0.55;
      target[i * 3] = p.x + (Math.random() - 0.5) * 0.08;
      target[i * 3 + 1] = p.y + (Math.random() - 0.5) * 0.08;
      target[i * 3 + 2] = z;
      current[i * 3] = start[i * 3];
      current[i * 3 + 1] = start[i * 3 + 1];
      current[i * 3 + 2] = start[i * 3 + 2];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(current, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffc1c8,
      size: 0.045,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    points.userData = { start, target, current, count };
    return points;
  };

  const init = async () => {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality === "cinema",
      alpha: true,
      powerPreference: quality === "cinema" ? "high-performance" : "low-power"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === "cinema" ? 1.75 : 1.15));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = quality === "cinema";
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.renderer = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c090b, 0.045);
    state.scene = scene;

    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 80);
    camera.position.set(0.35, 0.15, 6.2);
    state.camera = camera;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const key = new THREE.SpotLight(0xffd4c2, 38, 24, 0.55, 0.45, 1.1);
    key.position.set(4.2, 5.4, 6.5);
    key.castShadow = quality === "cinema";
    if (key.castShadow) {
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.bias = -0.0002;
    }
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x8eb6ff, 0.55);
    fill.position.set(-6, 2.2, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xff8fb0, 1.15);
    rim.position.set(-2.4, 3.2, -6);
    scene.add(rim);

    const ambient = new THREE.HemisphereLight(0xffe4d6, 0x1a0c14, 0.45);
    scene.add(ambient);

    const bounce = new THREE.PointLight(0xff6b7d, 6, 12, 1.6);
    bounce.position.set(0, -1.4, 2.2);
    scene.add(bounce);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(8, 64),
      new THREE.MeshStandardMaterial({ color: 0x12080e, roughness: 0.9, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.85;
    ground.receiveShadow = quality === "cinema";
    scene.add(ground);

    const heart = new THREE.Mesh(createHeartGeometry(1.05, 0.5), glassHeartMaterial());
    heart.castShadow = quality === "cinema";
    heart.position.set(1.15, 0.15, 0);
    scene.add(heart);
    state.heart = heart;

    const inner = new THREE.Mesh(
      createHeartGeometry(0.42, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xff3d5a, emissive: 0x7a1024, emissiveIntensity: 0.8, roughness: 0.35 })
    );
    inner.position.copy(heart.position);
    inner.position.z += 0.02;
    scene.add(inner);
    heart.userData.inner = inner;

    const miniCount = quality === "cinema" ? 7 : 4;
    for (let i = 0; i < miniCount; i += 1) {
      const mini = new THREE.Mesh(createHeartGeometry(0.18 + Math.random() * 0.12, 0.18), glassHeartMaterial());
      mini.position.set((Math.random() - 0.35) * 6, (Math.random() - 0.4) * 3.5, -1 - Math.random() * 4);
      scene.add(mini);
      state.miniHearts.push(mini);
    }

    const flowerColors = [0xff8da0, 0xf2c9c0, 0xe07a6a, 0xd8a0b0];
    const flowerCount = quality === "cinema" ? 9 : 5;
    for (let i = 0; i < flowerCount; i += 1) {
      const flower = createFlower(flowerColors[i % flowerColors.length]);
      flower.position.set(-3.4 + Math.random() * 7, -1.35 + Math.random() * 0.4, -1.5 + Math.random() * 3);
      flower.scale.setScalar(0.7 + Math.random() * 0.5);
      scene.add(flower);
      state.flowers.push(flower);
    }

    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xffdfe6,
      roughness: 0.04,
      transmission: quality === "cinema" ? 0.95 : 0.4,
      thickness: 1.1,
      ior: 1.5,
      clearcoat: 1
    });
    for (let i = 0; i < (quality === "cinema" ? 5 : 3); i += 1) {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.14, 32, 24), sphereMat);
      sphere.position.set(-2 + Math.random() * 5, 0.4 + Math.random() * 1.6, 0.6 + Math.random() * 1.4);
      scene.add(sphere);
      state.spheres.push(sphere);
    }

    // Extra sculptural 3D objects: glass planets, orbital rings and crystal forms.
    const orbitMaterials = [
      new THREE.MeshPhysicalMaterial({ color: 0xf5b5c8, metalness: 0.32, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 0.8, iridescenceIOR: 1.35 }),
      new THREE.MeshPhysicalMaterial({ color: 0xd8c4ff, metalness: 0.42, roughness: 0.2, clearcoat: 1, transmission: 0.28, thickness: 0.6 }),
      new THREE.MeshPhysicalMaterial({ color: 0xffd8bd, metalness: 0.22, roughness: 0.12, clearcoat: 1, transmission: 0.38, thickness: 0.8 })
    ];
    const modelCount = quality === "cinema" ? 10 : 5;
    for (let i = 0; i < modelCount; i += 1) {
      const group = new THREE.Group();
      const material = orbitMaterials[i % orbitMaterials.length];
      if (i % 3 === 0) {
        const planet = new THREE.Mesh(new THREE.SphereGeometry(0.22 + Math.random() * 0.13, 32, 24), material);
        group.add(planet);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36 + Math.random() * 0.08, 0.018, 12, 72), new THREE.MeshStandardMaterial({ color: 0xe9b8c5, metalness: 0.72, roughness: 0.22, emissive: 0x32101f, emissiveIntensity: 0.2 }));
        ring.rotation.set(0.8 + Math.random() * 0.5, 0.2, 0.25);
        group.add(ring);
      } else if (i % 3 === 1) {
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.28 + Math.random() * 0.18, 1), material);
        crystal.scale.set(0.8, 1.35, 0.8);
        group.add(crystal);
      } else {
        const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.2, 0.055, 96, 12, 2, 3), material);
        group.add(knot);
      }
      group.position.set(-4.1 + Math.random() * 8.2, -0.15 + Math.random() * 3.1, -2.8 + Math.random() * 2.8);
      group.rotation.set(Math.random() * 1.2, Math.random() * Math.PI, Math.random() * 0.8);
      group.scale.setScalar(0.72 + Math.random() * 0.72);
      scene.add(group);
      state.floatingModels.push(group);
    }

    for (let i = 0; i < 3; i += 1) {
      const envelope = createEnvelope();
      envelope.position.set(-2.2 + i * 1.6, -0.35, -2.4);
      envelope.rotation.y = -0.25 + i * 0.18;
      scene.add(envelope);
      state.envelopes.push(envelope);
    }

    const loader = new THREE.TextureLoader();
    const frameSources = ["assets/new-moment-11.jpg", "assets/new-moment-15.jpg", "assets/new-moment-22.jpg", "assets/together-02.png"];
    frameSources.forEach((src, index) => {
      loader.load(src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const frame = createFrame(texture);
        frame.position.set(-3.2 + index * 1.55, 0.85, -3.6);
        frame.rotation.y = -0.35 + index * 0.18;
        scene.add(frame);
        state.frames.push(frame);
      });
    });

    state.dust = createDust(quality === "cinema" ? 1200 : 420);
    scene.add(state.dust);

    const petalCount = quality === "cinema" ? 40 : 16;
    const petalGeo = new THREE.PlaneGeometry(0.12, 0.18);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xff9aaa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.4
    });
    const petals = new THREE.InstancedMesh(petalGeo, petalMat, petalCount);
    const dummy = new THREE.Object3D();
    petals.userData.seeds = [];
    for (let i = 0; i < petalCount; i += 1) {
      petals.userData.seeds.push({
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 8 - 2,
        z: (Math.random() - 0.5) * 8,
        s: 0.4 + Math.random() * 0.8,
        r: Math.random() * Math.PI
      });
      dummy.position.set(petals.userData.seeds[i].x, petals.userData.seeds[i].y, petals.userData.seeds[i].z);
      dummy.scale.setScalar(petals.userData.seeds[i].s);
      dummy.updateMatrix();
      petals.setMatrixAt(i, dummy.matrix);
    }
    scene.add(petals);
    state.petals = petals;

    state.finale = createFinaleCloud(quality === "cinema" ? 1800 : 700);
    scene.add(state.finale);

    if (state.useBloom) {
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.28, 0.7, 0.82);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
      state.composer = composer;
    }

    window.addEventListener("pointermove", (event) => {
      state.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      state.targetMouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (state.composer) state.composer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener("visibilitychange", () => {
      state.running = document.visibilityState === "visible";
      if (state.running) animate();
    });

    document.querySelector(".hero-art")?.addEventListener("click", () => {
      heart.userData.pulse = 1;
    });

    animate();
  };

  const scrollProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  };

  const closingAmount = () => {
    const closing = document.querySelector("#closing-screen");
    if (!closing) return 0;
    const rect = closing.getBoundingClientRect();
    const view = window.innerHeight;
    const start = view * 0.85;
    const end = view * 0.25;
    if (rect.top > start) return 0;
    if (rect.top < end) return 1;
    return (start - rect.top) / (start - end);
  };

  const dummy = new THREE.Object3D();

  const animate = () => {
    if (!state.running) return;
    requestAnimationFrame(animate);
    const t = state.clock.getElapsedTime();
    const p = scrollProgress();
    const finale = closingAmount();
    body.classList.toggle("is-finale", finale > 0.15);

    state.mouse.lerp(state.targetMouse, 0.045);

    if (state.heart) {
      const pulse = state.heart.userData.pulse || 0;
      state.heart.userData.pulse = Math.max(0, pulse - 0.03);
      const scale = 1 + Math.sin(t * 0.9) * 0.02 + pulse * 0.12;
      state.heart.rotation.y = t * 0.18 + state.mouse.x * 0.25;
      state.heart.rotation.x = Math.sin(t * 0.4) * 0.08 + state.mouse.y * 0.12;
      state.heart.position.y = 0.15 + Math.sin(t * 0.7) * 0.08;
      state.heart.scale.setScalar(scale * (1 - p * 0.18 + finale * 0.35));
      if (state.heart.userData.inner) {
        state.heart.userData.inner.rotation.copy(state.heart.rotation);
        state.heart.userData.inner.position.copy(state.heart.position);
        state.heart.userData.inner.scale.copy(state.heart.scale).multiplyScalar(0.42);
      }
    }

    state.miniHearts.forEach((mini, index) => {
      mini.rotation.y = t * (0.3 + index * 0.05);
      mini.position.y += Math.sin(t * 0.8 + index) * 0.002;
    });
    state.flowers.forEach((flower, index) => {
      flower.rotation.y = Math.sin(t * 0.4 + index) * 0.2;
    });
    state.spheres.forEach((sphere, index) => {
      sphere.position.y += Math.sin(t * 0.9 + index) * 0.0018;
      sphere.rotation.y = t * 0.15;
    });
    state.floatingModels.forEach((model, index) => {
      model.position.y += Math.sin(t * 0.55 + index * 1.7) * 0.0022;
      model.rotation.y += 0.0025 + index * 0.00015;
      model.rotation.x = Math.sin(t * 0.32 + index) * 0.16 + state.mouse.y * 0.035;
      model.rotation.z = Math.cos(t * 0.28 + index * 0.8) * 0.12 + state.mouse.x * 0.025;
    });
    state.envelopes.forEach((envelope, index) => {
      envelope.rotation.y = -0.2 + Math.sin(t * 0.35 + index) * 0.12 + p * 0.4;
      envelope.position.y = -0.25 + Math.sin(t * 0.6 + index) * 0.08 - p * 0.4;
    });
    state.frames.forEach((frame, index) => {
      frame.rotation.y = -0.3 + index * 0.16 + state.mouse.x * 0.08;
      frame.position.y = 0.7 + Math.sin(t * 0.5 + index) * 0.06 - p * 1.2;
    });

    if (state.dust) {
      state.dust.rotation.y = t * 0.02;
      state.dust.material.opacity = 0.22 + (1 - p) * 0.25 + finale * 0.35;
    }

    if (state.petals) {
      state.petals.userData.seeds.forEach((seed, i) => {
        const y = ((seed.y + t * 0.22 * seed.s) % 8) - 2;
        dummy.position.set(seed.x + Math.sin(t * 0.3 + i) * 0.4, y, seed.z);
        dummy.rotation.set(t * 0.4 + seed.r, t * 0.6, seed.r);
        dummy.scale.setScalar(seed.s);
        dummy.updateMatrix();
        state.petals.setMatrixAt(i, dummy.matrix);
      });
      state.petals.instanceMatrix.needsUpdate = true;
    }

    if (state.finale) {
      const { start, target, current, count } = state.finale.userData;
      const ease = finale * finale * (3 - 2 * finale);
      for (let i = 0; i < count; i += 1) {
        current[i * 3] = start[i * 3] + (target[i * 3] - start[i * 3]) * ease;
        current[i * 3 + 1] = start[i * 3 + 1] + (target[i * 3 + 1] - start[i * 3 + 1]) * ease;
        current[i * 3 + 2] = start[i * 3 + 2] + (target[i * 3 + 2] - start[i * 3 + 2]) * ease;
      }
      state.finale.geometry.attributes.position.needsUpdate = true;
      state.finale.material.opacity = Math.min(0.95, finale * 1.2);
      state.finale.rotation.y = t * 0.12;
      state.finale.position.set(0.1, 0.2 - finale * 0.1, 0);
    }

    const camX = 0.2 + state.mouse.x * 0.45 - p * 0.8;
    const camY = 0.2 + (1 - p) * 0.15 + finale * 0.1 + state.mouse.y * -0.2;
    const camZ = 6.1 - p * 1.8 - finale * 1.6;
    state.camera.position.x += (camX - state.camera.position.x) * 0.05;
    state.camera.position.y += (camY - state.camera.position.y) * 0.05;
    state.camera.position.z += (camZ - state.camera.position.z) * 0.05;
    state.camera.lookAt(0.7 - p * 0.4, 0.1 + finale * 0.15, 0);

    if (state.composer) state.composer.render();
    else state.renderer.render(state.scene, state.camera);
  };

  fxToggle.addEventListener("click", () => {
    quality = quality === "cinema" ? "light" : quality === "light" ? "off" : "cinema";
    localStorage.setItem("loveHubFxQuality", quality);
    location.reload();
  });

  const boot = () => init().catch(() => {
    quality = "off";
    applyQualityClass();
    body.classList.add("fx-off");
  });

  if (body.classList.contains("entry-locked")) {
    const enter = document.querySelector("#enter-site");
    enter?.addEventListener("click", () => window.setTimeout(boot, 480), { once: true });
  } else {
    boot();
  }
})();
