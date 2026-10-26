/**
 * Beyond Code: a sports car on a night road. The camera starts straight above
 * (matching the top-down drawing it replaces) and swings down into a chase view
 * as the visitor scrolls, while the road streams past under the headlights.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createStage, pointer, clamp01, lerp, damp, tier } from "./runtime";

function roadTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const x = c.getContext("2d")!;
  x.fillStyle = "#151517";
  x.fillRect(0, 0, 256, 512);
  // asphalt grain
  for (let i = 0; i < 2400; i++) {
    const v = 20 + Math.random() * 18;
    x.fillStyle = `rgb(${v},${v},${v + 2})`;
    x.fillRect(Math.random() * 256, Math.random() * 512, 1.5, 1.5);
  }
  x.fillStyle = "#e9e6dc";
  x.fillRect(10, 0, 5, 512);
  x.fillRect(241, 0, 5, 512);
  x.fillRect(125, 0, 6, 220); // centre dash
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 10);
  t.anisotropy = 8;
  return t;
}

function buildCar(): THREE.Group {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: 0x0f1012, metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x05070a, metalness: 0.2, roughness: 0.12, clearcoat: 0.6, envMapIntensity: 0.12 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x1a1b1f, roughness: 0.6 });

  // body from a side profile, extruded to the car's width (length along z)
  const prof = new THREE.Shape();
  const pts: [number, number][] = [[-2.25, 0.22], [-2.3, 0.48], [-2.05, 0.62], [-0.9, 0.7], [1.6, 0.66], [2.2, 0.56], [2.25, 0.3], [2.1, 0.2]];
  prof.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([a, b]) => prof.lineTo(a, b));
  prof.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(prof, { depth: 1.86, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 4, steps: 1 });
  bodyGeo.translate(0, 0, -0.93);
  bodyGeo.rotateY(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, paint);
  body.castShadow = true;
  car.add(body);

  // cabin / glasshouse
  const cab = new THREE.Shape();
  const cp: [number, number][] = [[-1.0, 0.68], [-0.35, 1.08], [0.75, 1.1], [1.45, 0.68]];
  cab.moveTo(cp[0][0], cp[0][1]);
  cp.slice(1).forEach(([a, b]) => cab.lineTo(a, b));
  cab.closePath();
  const cabGeo = new THREE.ExtrudeGeometry(cab, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 });
  cabGeo.translate(0, 0, -0.75);
  cabGeo.rotateY(Math.PI / 2);
  const cabin = new THREE.Mesh(cabGeo, glass);
  car.add(cabin);

  // wheels
  const tire = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 28);
  tire.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.3, 10);
  rimGeo.rotateZ(Math.PI / 2);
  const rimM = new THREE.MeshStandardMaterial({ color: 0x9a9da4, metalness: 0.9, roughness: 0.25 });
  const wheels: THREE.Group[] = [];
  for (const [x, z] of [[-0.93, -1.42], [0.93, -1.42], [-0.93, 1.38], [0.93, 1.38]]) {
    const w = new THREE.Group();
    w.position.set(x, 0.36, z);
    w.add(new THREE.Mesh(tire, trim), new THREE.Mesh(rimGeo, rimM));
    car.add(w);
    wheels.push(w);
  }
  car.userData.wheels = wheels;

  // lights: emissive strips the bloom-less renderer still reads as glowing
  const head = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const tail = new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false });
  for (const sx of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.04), head);
    h.position.set(sx * 0.62, 0.52, -2.3);
    h.rotation.y = sx * 0.12;
    car.add(h);
  }
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 0.04), tail);
  t.position.set(0, 0.6, 2.3);
  car.add(t);
  // rear wing
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 0.32), trim);
  wing.position.set(0, 0.98, 2.0);
  car.add(wing);
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.12), trim);
    post.position.set(sx * 0.6, 0.82, 2.0);
    car.add(post);
  }
  return car;
}

export function mountCar(stickyEl: HTMLElement, sceneEl: HTMLElement): void {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0b);
  scene.fog = new THREE.Fog(0x0a0a0b, 12, 46);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);

  const road = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 140), new THREE.MeshStandardMaterial({ map: roadTexture(), roughness: 0.92 }));
  road.rotation.x = -Math.PI / 2;
  road.position.z = -50;
  road.receiveShadow = true;
  scene.add(road);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  // roadside posts with reflectors, recycled as the road streams by
  const postGeo = new THREE.BoxGeometry(0.1, 0.9, 0.1);
  const postM = new THREE.MeshStandardMaterial({ color: 0xd8d6cf, roughness: 0.6 });
  const refl = new THREE.MeshBasicMaterial({ color: 0xff9a3c, toneMapped: false });
  const posts: THREE.Group[] = [];
  for (let i = 0; i < 24; i++) {
    const g = new THREE.Group();
    const p = new THREE.Mesh(postGeo, postM);
    p.position.y = 0.45;
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), refl);
    r.position.set(0, 0.75, 0.06);
    g.add(p, r);
    g.position.set(i % 2 ? 4.4 : -4.4, 0, -(Math.floor(i / 2) * 9));
    scene.add(g);
    posts.push(g);
  }

  const car = buildCar();
  scene.add(car);

  // lighting: moonlight, headlight cones, red glow behind
  scene.add(new THREE.HemisphereLight(0x8899bb, 0x050506, 0.35));
  const moon = new THREE.DirectionalLight(0xaabbdd, 0.8);
  moon.position.set(-6, 12, 4);
  moon.castShadow = tier === "high";
  moon.shadow.mapSize.set(1024, 1024);
  scene.add(moon);
  for (const sx of [-1, 1]) {
    const beam = new THREE.SpotLight(0xfff3dd, 60, 34, 0.38, 0.5, 1.2);
    beam.position.set(sx * 0.6, 0.6, -2.2);
    beam.target.position.set(sx * 1.2, 0, -20);
    car.add(beam, beam.target);
  }
  const tailGlow = new THREE.PointLight(0xff2a2a, 3, 4, 2);
  tailGlow.position.set(0, 0.6, 2.8);
  car.add(tailGlow);

  let pmrem: THREE.PMREMGenerator | null = null;
  const stage = createStage({
    host: stickyEl,
    className: "car-gl",
    shadows: true,
    onResize(w, h) {
      camera.aspect = w / h;
      camera.fov = w / h < 1 ? 58 : 40;
      camera.updateProjectionMatrix();
    },
    onFrame(t, dt) {
      if (!pmrem && stage) {
        pmrem = new THREE.PMREMGenerator(stage.renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environmentIntensity = 0.35;
      }
      const r = sceneEl.getBoundingClientRect();
      const a = clamp01(-r.top / Math.max(1, r.height - innerHeight));
      const e = a * a * (3 - 2 * a);

      // speed: the road and posts stream past faster as you scroll
      const speed = 6 + e * 26;
      const mat = road.material as THREE.MeshStandardMaterial;
      mat.map!.offset.y += (speed * dt) / 14;
      posts.forEach((g) => { g.position.z += speed * dt; if (g.position.z > 8) g.position.z -= 108; });
      (car.userData.wheels as THREE.Group[]).forEach((w) => (w.rotation.x -= speed * dt * 2.6));
      car.position.x = damp(car.position.x, pointer.x * 0.9, 1.5, dt);
      car.rotation.y = damp(car.rotation.y, -pointer.x * 0.06, 2, dt);
      car.position.y = Math.sin(t * 9) * 0.006;

      // camera: from top-down to a low chase view
      const top = new THREE.Vector3(0, camera.aspect < 1 ? 19 : 15, 0.5);
      const narrow = camera.aspect < 1;
      const chase = narrow ? new THREE.Vector3(1.8, 3.2, 12.5) : new THREE.Vector3(2.6, 2.1, 7.6);
      camera.position.lerpVectors(top, chase, e);
      camera.position.x += car.position.x * 0.6;
      camera.up.set(0, e, -(1 - e)).normalize();
      camera.lookAt(car.position.x * 0.5, lerp(0, 0.6, e), lerp(-0.6, -4, e));

      stage?.renderer.render(scene, camera);
    },
  });
  if (stage) sceneEl.classList.add("gl-on");
}
