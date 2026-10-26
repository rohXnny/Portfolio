/**
 * Home: the late-night home office, rebuilt as a real 3D room.
 * - A warm lamp follows the cursor around the dark room.
 * - Scrolling raises the sun: light pours through the blinds (with real
 *   striped shadows on capable machines) while the camera dollies in.
 * - The monitor and laptop show live code; steam rises from the coffee.
 * - Point at him and he turns, waves and says hi (the #bubble element).
 */
import * as THREE from "three";
import { createStage, pointer, clamp01, lerp, damp, tier } from "./runtime";

const COLORS = {
  void: 0x070606,
  wall: 0x15131a,
  floor: 0x161210,
  desk: 0x2a211b,
  metal: 0x2b2d33,
  hoodie: 0x1c1c22,
  skin: 0x3a2a22,
  hair: 0x0d0a09,
  lamp: 0xffb46a,
  screen: 0x6f8cff,
  sunWarm: 0xffb36b,
  sunDay: 0xfff1d6,
};

const CODE: [string, string][] = [
  ['@PostMapping("/v1/orders/allocate")', "#c9a2ff"], ["public AllocationResult allocate(", "#8fa6ff"], ["    @Valid @RequestBody AllocationRequest req) {", "#b9c3d9"],
  ["  return idempotency.run(req.key(), () ->", "#b9c3d9"], ["    allocator.reserve(req.items()));", "#b9c3d9"], ["}", "#b9c3d9"], ["", ""],
  ['@router.get("/v1/payments/{id}/status")', "#c9a2ff"], ["async def payment_status(id: UUID):", "#5cc8b4"], ["    return await ledger.status(id)", "#b9c3d9"], ["", ""],
  ['@KafkaListener(topics = "fulfillment.events")', "#c9a2ff"], ["void on(FulfillmentEvent e) {", "#8fa6ff"], ["  if (seen.add(e.id())) apply(e);", "#b9c3d9"], ["}", "#b9c3d9"], ["", ""],
  ["// retry with backoff, then dead-letter", "#6d7fa3"], ['@GetMapping("/v1/courses/search")', "#c9a2ff"], ["Page<Course> search(CourseQuery q) {", "#8fa6ff"], ["  return courses.find(q);", "#b9c3d9"], ["}", "#b9c3d9"], ["", ""],
  ["POST /v1/pricing/fuel  200 OK", "#edb45a"], ["GET  /v1/shipments/42  200 OK", "#edb45a"], ["", ""],
];

function codeTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const x = c.getContext("2d")!;
  x.fillStyle = "#0d1426";
  x.fillRect(0, 0, c.width, c.height);
  x.font = '500 26px "Geist Mono Variable", ui-monospace, monospace';
  x.textBaseline = "top";
  const lh = 40;
  for (let i = 0; i * lh < c.height; i++) {
    const [t, col] = CODE[i % CODE.length];
    if (!t) continue;
    x.fillStyle = col;
    x.fillText(t, 36, 24 + i * lh);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 0.56);
  tex.anisotropy = 8;
  return tex;
}

function terminal(): { tex: THREE.CanvasTexture; tick: (t: number) => void } {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const x = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  let on = -1;
  const draw = (caret: boolean) => {
    x.fillStyle = "#0b1a10";
    x.fillRect(0, 0, 512, 320);
    x.font = '500 24px "Geist Mono Variable", ui-monospace, monospace';
    x.textBaseline = "top";
    const rows: [string, string][] = [["$ kubectl get pods", "#7cf0a3"], ["order-svc      Running", "#5bbd7c"], ["payments       Running", "#5bbd7c"], ["kafka-0        Running", "#5bbd7c"], ["$", "#7cf0a3"]];
    rows.forEach(([t, col], i) => { x.fillStyle = col; x.fillText(t, 24, 28 + i * 52); });
    if (caret) { x.fillStyle = "#7cf0a3"; x.fillRect(52, 28 + 4 * 52, 14, 26); }
    tex.needsUpdate = true;
  };
  return { tex, tick: (t) => { const c2 = Math.floor(t * 2) % 2 === 0; if (+c2 !== on) { on = +c2; draw(c2); } } };
}

function skyTexture(): { tex: THREE.CanvasTexture; paint: (p: number) => void } {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const x = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  const paint = (p: number) => {
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, mix([6, 9, 20], [118, 170, 230], p));
    g.addColorStop(0.65, mix([12, 18, 36], [255, 196, 140], p));
    g.addColorStop(1, mix([20, 24, 40], [255, 150, 90], p));
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    // the sun rises behind the blinds
    const sy = lerp(300, 150, p);
    const sg = x.createRadialGradient(150, sy, 4, 150, sy, 90);
    sg.addColorStop(0, `rgba(255,236,190,${0.95 * p})`);
    sg.addColorStop(0.25, `rgba(255,200,120,${0.6 * p})`);
    sg.addColorStop(1, "rgba(255,180,100,0)");
    x.fillStyle = sg;
    x.fillRect(0, 0, 256, 256);
    // a few far city lights at night
    x.fillStyle = `rgba(255,214,150,${0.5 * (1 - p)})`;
    for (let i = 0; i < 26; i++) x.fillRect((i * 97) % 250, 200 + ((i * 53) % 50), 2, 2);
    tex.needsUpdate = true;
  };
  return { tex, paint };
}

function steamSprite(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function mountRoom(host: HTMLElement): void {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.void);
  scene.fog = new THREE.Fog(COLORS.void, 5, 10);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 30);
  const look = new THREE.Vector3(0.05, 1.02, -0.7);

  const std = (color: number, rough = 0.85, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  };

  /* ---------- room shell ---------- */
  const wallM = std(COLORS.wall, 0.95);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), std(COLORS.floor, 0.8));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), std(0x0c0b0e));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 2.8;
  scene.add(ceiling);
  // back wall built around a window opening so sunlight only comes through the glass
  const W = { x: -1.45, y: 1.55, w: 1.1, h: 1.15 }, Z = -1.25, T = 0.12;
  box(8, W.y - W.h / 2, T, wallM, 0, (W.y - W.h / 2) / 2, Z);
  box(8, 2.8 - (W.y + W.h / 2), T, wallM, 0, (2.8 + W.y + W.h / 2) / 2, Z);
  box(4 - (-W.x + W.w / 2) + 0, W.h, T, wallM, (-4 + (W.x - W.w / 2)) / 2, W.y, Z);
  box(4 - (W.x + W.w / 2), W.h, T, wallM, (4 + W.x + W.w / 2) / 2, W.y, Z);
  const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.8), wallM);
  sideWall.position.set(-2.6, 1.4, 0.6);
  sideWall.rotation.y = Math.PI / 2;
  sideWall.receiveShadow = true;
  scene.add(sideWall);

  /* ---------- window, sky and blinds ---------- */
  const sky = skyTexture();
  sky.paint(0);
  const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(W.w, W.h), new THREE.MeshBasicMaterial({ map: sky.tex, toneMapped: false }));
  skyPlane.position.set(W.x, W.y, Z - 0.08);
  scene.add(skyPlane);
  const frameM = std(0x2a2620, 0.7);
  box(W.w + 0.08, 0.05, 0.16, frameM, W.x, W.y + W.h / 2, Z + 0.02);
  box(W.w + 0.08, 0.06, 0.2, frameM, W.x, W.y - W.h / 2, Z + 0.04);
  box(0.05, W.h, 0.16, frameM, W.x - W.w / 2, W.y, Z + 0.02);
  box(0.05, W.h, 0.16, frameM, W.x + W.w / 2, W.y, Z + 0.02);
  box(0.03, W.h, 0.1, frameM, W.x, W.y, Z + 0.01);
  const slatM = std(0xcfc7b8, 0.6);
  const slats: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const s = box(W.w - 0.04, 0.012, 0.055, slatM, W.x, W.y + W.h / 2 - 0.06 - i * 0.068, Z + 0.09);
    s.rotation.x = 0.55;
    slats.push(s);
  }

  /* ---------- desk and things on it ---------- */
  const deskM = std(COLORS.desk, 0.6);
  box(2.3, 0.05, 0.8, deskM, 0.15, 0.76, -0.62);
  for (const [lx, lz] of [[-0.95, -0.95], [1.25, -0.95], [-0.95, -0.28], [1.25, -0.28]]) box(0.05, 0.74, 0.05, std(COLORS.metal, 0.5, 0.4), lx, 0.37, lz);

  const codeTex = codeTexture();
  const monitor = new THREE.Group();
  monitor.position.set(0.3, 1.22, -0.88);
  scene.add(monitor);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.66, 0.04), std(0x0f1013, 0.4, 0.3));
  bezel.castShadow = true;
  monitor.add(bezel);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.6), new THREE.MeshBasicMaterial({ map: codeTex, toneMapped: false }));
  screen.position.z = 0.021;
  monitor.add(screen);
  box(0.06, 0.32, 0.06, std(COLORS.metal, 0.4, 0.6), 0.3, 0.93, -0.9);
  box(0.32, 0.015, 0.2, std(COLORS.metal, 0.4, 0.6), 0.3, 0.79, -0.88);
  const screenGlow = new THREE.PointLight(COLORS.screen, 5, 3.4, 1.4);
  screenGlow.position.set(0.18, 1.15, -0.55);
  scene.add(screenGlow);

  const term = terminal();
  const laptop = new THREE.Group();
  laptop.position.set(-0.72, 0.79, -0.5);
  laptop.rotation.y = 0.35;
  scene.add(laptop);
  const lb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.3), std(0x24262b, 0.4, 0.5));
  laptop.add(lb);
  const lid = new THREE.Group();
  lid.position.set(0, 0.01, -0.15);
  lid.rotation.x = -0.32;
  laptop.add(lid);
  const lidBack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.012), std(0x24262b, 0.4, 0.5));
  lidBack.position.y = 0.14;
  lid.add(lidBack);
  const tScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), new THREE.MeshBasicMaterial({ map: term.tex, toneMapped: false }));
  tScreen.position.set(0, 0.14, 0.007);
  lid.add(tScreen);
  const termGlow = new THREE.PointLight(0x5bd88a, 0.35, 1.2, 2);
  termGlow.position.set(-0.68, 0.98, -0.35);
  scene.add(termGlow);

  box(0.5, 0.02, 0.16, std(0x1d1e22, 0.5), 0.12, 0.79, -0.42); // keyboard

  // coffee
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 24), std(0x8a5a3a, 0.5));
  mug.position.set(0.98, 0.835, -0.45);
  mug.castShadow = true;
  scene.add(mug);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 16), mug.material);
  handle.position.set(1.03, 0.84, -0.45);
  handle.rotation.y = Math.PI / 2;
  scene.add(handle);
  const steamTex = steamSprite();
  const steam = Array.from({ length: tier === "high" ? 10 : 5 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.userData.o = i / 10;
    scene.add(s);
    return s;
  });

  // plant and shelf
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.2, 20), std(0x3b2f27, 0.8));
  pot.position.set(1.55, 0.88, -0.75);
  pot.castShadow = true;
  scene.add(pot);
  const leafM = new THREE.MeshStandardMaterial({ color: 0x2f5d3a, roughness: 0.7, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.36), leafM);
    leaf.position.set(1.55, 1.12, -0.75);
    leaf.rotation.set(-0.35 + Math.sin(i * 1.7) * 0.3, (i / 9) * Math.PI * 2, 0.25 * Math.cos(i * 2.3));
    leaf.translateY(0.06);
    leaf.castShadow = true;
    scene.add(leaf);
  }
  box(0.9, 0.03, 0.22, deskM, 1.35, 1.82, -1.08);
  const bookCols = [0x6f8cff, 0xf1c071, 0x3d5fe0, 0x6fd3be, 0xf29a7b, 0x9a8d7c, 0x4b4f5c];
  let bx = 0.98;
  bookCols.forEach((c, i) => {
    const h = 0.18 + ((i * 37) % 7) / 60;
    const w = 0.045 + ((i * 13) % 3) / 100;
    box(w, h, 0.17, std(c, 0.8), bx, 1.835 + h / 2, -1.08).rotation.z = i === 5 ? 0.18 : 0;
    bx += w + 0.012;
  });

  /* ---------- him, seen from behind ---------- */
  const person = new THREE.Group();
  person.position.set(-0.05, 0, 0.18);
  scene.add(person);
  const hoodie = std(COLORS.hoodie, 0.9);
  const chairM = std(0x121216, 0.7);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.5), chairM);
  seat.position.set(0, 0.5, 0.05);
  person.add(seat);
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.3, 0.04), chairM);
  chairBack.position.set(0, 0.74, 0.32);
  chairBack.castShadow = true;
  person.add(chairBack);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.34, 8, 18), hoodie);
  torso.scale.set(1.3, 1, 0.85);
  torso.position.set(0, 0.98, 0.05);
  torso.castShadow = true;
  person.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 12), std(COLORS.skin, 0.7));
  neck.position.set(0, 1.27, 0.03);
  person.add(neck);
  const head = new THREE.Group();
  head.position.set(0, 1.42, 0.02);
  person.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.115, 28, 20), std(COLORS.skin, 0.65));
  skull.scale.set(0.95, 1.05, 1);
  skull.castShadow = true;
  head.add(skull);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.12, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.62), std(COLORS.hair, 0.9));
  hair.position.set(0, 0.012, 0.008);
  hair.rotation.x = 0.25;
  head.add(hair);
  const phonesM = std(0x26272d, 0.35, 0.6);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.128, 0.011, 8, 32, Math.PI), phonesM);
  band.rotation.z = 0;
  band.position.y = 0.01;
  head.add(band);
  for (const sx of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 20), phonesM);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(sx * 0.122, -0.01, 0);
    head.add(cup);
  }
  const armM = hoodie;
  const arm = (sx: number) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(sx * 0.27, 1.16, 0.04);
    person.add(shoulder);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.24, 6, 12), armM);
    upper.position.y = -0.15;
    upper.castShadow = true;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.3;
    shoulder.add(elbow);
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 6, 12), armM);
    fore.position.y = -0.13;
    elbow.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), std(COLORS.skin, 0.7));
    hand.position.y = -0.27;
    elbow.add(hand);
    shoulder.rotation.set(-0.5, 0, sx * 0.12);
    elbow.rotation.set(-1.0, 0, 0);
    return { shoulder, elbow };
  };
  arm(-1);
  const waveArm = arm(1);

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0x9aa6c8, 0.14));
  const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x2a1a10, 0);
  scene.add(hemi);

  const lamp = new THREE.PointLight(COLORS.lamp, 10, 4.2, 1.5);
  lamp.position.set(0.6, 1.4, -0.2);
  lamp.castShadow = tier === "high";
  lamp.shadow.mapSize.set(512, 512);
  lamp.shadow.bias = -0.004;
  scene.add(lamp);

  // aim the sun through the middle of the window onto the desk
  const winC = new THREE.Vector3(W.x, W.y, Z);
  const deskSpot = new THREE.Vector3(0.0, 0.78, -0.4);
  const ray = winC.clone().sub(deskSpot);
  const sun = new THREE.SpotLight(COLORS.sunWarm, 0, 12, 0.36, 0.6, 1);
  sun.position.copy(winC).addScaledVector(ray, 2.5);
  sun.target.position.copy(deskSpot);
  sun.castShadow = tier === "high";
  sun.shadow.mapSize.set(tier === "high" ? 2048 : 512, tier === "high" ? 2048 : 512);
  sun.shadow.bias = -0.0008;
  sun.shadow.radius = 2;
  scene.add(sun, sun.target);

  // visible sun shaft through the window
  const shaftM = new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const len = ray.length() * 1.15;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.46, len, 4, 1, true), shaftM);
  shaft.position.copy(winC).addScaledVector(ray, -0.55);
  shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ray.clone().normalize());
  shaft.rotateY(Math.PI / 4);
  // scene.add(shaft); kept for tuning; the lit dust reads better without a hard cone
  void shaft;

  /* ---------- interaction state ---------- */
  const bubble = document.getElementById("bubble");
  const homeName = document.getElementById("home-name");
  const raycaster = new THREE.Raycaster();
  const lampPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.35);
  const target = new THREE.Vector3(0.6, 1.4, -0.35);
  const hit = new THREE.Vector3();
  const headWorld = new THREE.Vector3();
  let greeting = false, side = 1, turn = 0, wave = 0, lastSky = -1;
  let camZ = 4.1, camY = 1.55, px = 0, py = 0;

  const scrollP = () => clamp01(scrollY / (innerHeight * 1.1));

  const setGreet = (on: boolean, left: boolean) => {
    greeting = on;
    side = left ? -1 : 1;
    bubble?.classList.toggle("on", on);
  };
  addEventListener("scroll", () => { if (greeting && scrollY > innerHeight * 0.3) setGreet(false, false); }, { passive: true });

  const stage = createStage({
    host,
    className: "room-gl",
    shadows: true,
    active: () => document.body.dataset.page === "home" && scrollY < innerHeight * 2.4,
    onResize(w, h) {
      camera.aspect = w / h;
      // keep the desk framed on tall phones
      camera.fov = w / h < 0.8 ? 62 : w / h < 1.2 ? 50 : 40;
      camera.updateProjectionMatrix();
    },
    onFrame(t, dt) {
      const p = scrollP();
      const active = performance.now() - pointer.moved < 3000;

      // lamp: follows the cursor, drifts on its own when idle
      if (active) {
        raycaster.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);
        if (raycaster.ray.intersectPlane(lampPlane, hit)) target.set(THREE.MathUtils.clamp(hit.x, -2.2, 2.2), THREE.MathUtils.clamp(hit.y, 0.85, 2.3), -0.35);
      } else {
        target.set(0.2 + Math.sin(t * 0.35) * 1.1, 1.45 + Math.sin(t * 0.6) * 0.3, -0.35);
      }
      lamp.position.x = damp(lamp.position.x, target.x, 6, dt);
      lamp.position.y = damp(lamp.position.y, target.y, 6, dt);
      lamp.position.z = target.z;
      lamp.intensity = lerp(10, 3, p);

      // sunrise
      sun.intensity = lerp(0, 60, p);
      sun.color.setHex(COLORS.sunWarm).lerp(new THREE.Color(COLORS.sunDay), p * 0.6);
      hemi.intensity = lerp(0, 1.4, p);
      shaftM.opacity = 0.09 * p;
      if (Math.abs(p - lastSky) > 0.01) { sky.paint(p); lastSky = p; }
      (scene.background as THREE.Color).setHex(COLORS.void).lerp(new THREE.Color(0x1a1612), p);
      (scene.fog as THREE.Fog).color.copy(scene.background as THREE.Color);
      slats.forEach((s) => (s.rotation.x = lerp(0.55, 0.15, p)));

      // screens
      codeTex.offset.y = (t * 0.035) % 1;
      term.tick(t);
      screenGlow.intensity = 5 + Math.sin(t * 3.1) * 0.2;

      // steam
      steam.forEach((s) => {
        const k = (t * 0.25 + s.userData.o) % 1;
        s.position.set(0.98 + Math.sin(k * 6 + s.userData.o * 9) * 0.03, 0.9 + k * 0.32, -0.45);
        s.scale.setScalar(0.05 + k * 0.12);
        (s.material as THREE.SpriteMaterial).opacity = Math.sin(k * Math.PI) * 0.35;
      });

      // camera: dolly in with scroll, gentle parallax with the pointer
      px = damp(px, pointer.x, 2.5, dt);
      py = damp(py, pointer.y, 2.5, dt);
      camZ = damp(camZ, lerp(4.1, 3.0, p), 4, dt);
      camY = damp(camY, lerp(1.55, 1.35, p), 4, dt);
      camera.position.set(0.05 + px * 0.18, camY + py * 0.08, camZ);
      camera.lookAt(look);

      // greeting: point near him and he turns to say hi
      head.getWorldPosition(headWorld);
      const scr = headWorld.clone().project(camera);
      const hx = (scr.x * 0.5 + 0.5) * innerWidth, hy = (-scr.y * 0.5 + 0.5) * innerHeight;
      const d = Math.hypot(pointer.cx - hx, pointer.cy - hy);
      const heroVis = scrollY < innerHeight * 0.3 && document.body.dataset.page === "home";
      const left = pointer.cx < hx;
      if (active && heroVis && (greeting ? d < 300 : d < 190)) { if (!greeting || (left ? -1 : 1) !== side) setGreet(true, left); }
      else if (greeting) setGreet(false, left);

      turn = damp(turn, greeting ? side * 0.6 : THREE.MathUtils.clamp(px * 0.35, -0.3, 0.3), 5, dt);
      head.rotation.y = -turn;
      head.rotation.z = turn * 0.12;
      wave = damp(wave, greeting ? 1 : 0, 6, dt);
      waveArm.shoulder.rotation.x = lerp(-0.5, -0.2, wave);
      waveArm.shoulder.rotation.z = lerp(0.12, 1.75, wave);
      waveArm.elbow.rotation.x = lerp(-1.0, 0, wave);
      waveArm.elbow.rotation.z = wave * (1.25 + Math.sin(t * 9) * 0.35);

      if (greeting && bubble) {
        const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
        const bxp = left ? Math.max(8, hx - bw - 36) : Math.min(innerWidth - bw - 8, hx + 36);
        bubble.style.left = `${bxp}px`;
        bubble.style.top = `${Math.max(80, hy - bh - 40)}px`;
        bubble.style.borderRadius = left ? "16px 16px 4px 16px" : "16px 16px 16px 4px";
      }

      // the big name sits above the room; nudge it with the camera for depth
      if (homeName && p < 0.35) homeName.style.translate = `${-px * 10}px ${py * 6}px`;

      stage?.renderer.render(scene, camera);
    },
  });
}
