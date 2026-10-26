/**
 * Break my system, in 3D. The simulation in scripts/demos.ts stays the single
 * source of truth (window.__sx); this module only draws it: nodes as glowing
 * blocks on a grid, links that rewire when the topology changes, and every
 * request as a packet travelling the same path the 2D map uses.
 */
import * as THREE from "three";
import { createStage, pointer, damp, textSprite, tier } from "./runtime";

type XY = [number, number];
interface Packet { pts: XY[]; seg: number; t: number; kind: "read" | "write" | "rep" | "err" }
interface Sim {
  S: { apps: number; canary: number; leader: number; up: number[]; iso: number; cand: number; mode: string; q: number; term: number };
  P: Packet[];
  appPos: (i: number) => XY;
  DB: XY[]; LB: XY; CACHE: XY; QUEUE: XY; USERS: XY[];
}

const C = {
  edge: 0x3a3d45, lb: 0xe8e8e6, app: 0x9db1ff, canary: 0xf1c071, cache: 0x6fe3a5,
  queue: 0xf1c071, leader: 0x6fd3be, follower: 0x8a8d94, down: 0xff7b72, cand: 0xf1c071, user: 0x9db1ff,
  read: 0x9db1ff, write: 0xf1c071, rep: 0x6fd3be, err: 0xff7b72,
};

const W = (p: XY) => new THREE.Vector3((p[0] - 380) / 62, 0, (p[1] - 206) / 62);

export function mountCluster(map: HTMLElement): void {
  const sim = (window as unknown as { __sx?: Sim }).__sx;
  const svg = map.querySelector<SVGSVGElement>("#sx-svg");
  if (!sim || !svg) return;

  // A wrapper the same size as the 2D map, so layout never changes.
  const wrap = document.createElement("div");
  wrap.className = "sx-gl";
  svg.before(wrap);
  wrap.append(svg);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 2, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xc8d4ff, 0x0a0a0c, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 9, 6);
  scene.add(key);

  const grid = new THREE.GridHelper(16, 32, 0x2a2c33, 0x17181c);
  grid.position.y = -0.26;
  scene.add(grid);

  /* ---------- node factory: dark body, coloured edges, soft glow ---------- */
  interface Node { group: THREE.Group; body: THREE.Mesh; edges: THREE.LineSegments; label?: THREE.Sprite; color: THREE.Color }
  const makeNode = (geo: THREE.BufferGeometry, color: number, label?: string, sub?: string): Node => {
    const group = new THREE.Group();
    const col = new THREE.Color(color);
    const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x131419, roughness: 0.45, metalness: 0.2, emissive: col, emissiveIntensity: 0.12 }));
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.95 }));
    group.add(body, edges);
    let sprite: THREE.Sprite | undefined;
    if (label) {
      sprite = textSprite(label, { size: 26, color: "#e8e8e6" });
      const h = 0.34;
      sprite.scale.set(h * sprite.userData.aspect, h, 1);
      sprite.position.y = 0.62;
      group.add(sprite);
      if (sub) {
        const s2 = textSprite(sub, { size: 22, color: "#8d8d8d" });
        s2.scale.set(0.26 * s2.userData.aspect, 0.26, 1);
        s2.position.y = 0.36;
        s2.name = "sub";
        group.add(s2);
      }
    }
    scene.add(group);
    return { group, body, edges, label: sprite, color: col };
  };
  const setColor = (n: Node, hex: number, glow = 0.12) => {
    n.color.setHex(hex);
    (n.edges.material as THREE.LineBasicMaterial).color.setHex(hex);
    const m = n.body.material as THREE.MeshStandardMaterial;
    m.emissive.setHex(hex);
    m.emissiveIntensity = glow;
  };

  const users = sim.USERS.map((u) => {
    const n = makeNode(new THREE.SphereGeometry(0.2, 18, 12), C.user);
    n.group.position.copy(W(u)).setY(0.0);
    return n;
  });
  const usersLabel = textSprite("users", { size: 22, color: "#8d8d8d" });
  usersLabel.scale.set(0.26 * usersLabel.userData.aspect, 0.26, 1);
  usersLabel.position.copy(W([60, 330]));
  scene.add(usersLabel);

  const lb = makeNode(new THREE.BoxGeometry(1.5, 0.42, 0.72), C.lb, "load balancer");
  lb.group.position.copy(W(sim.LB));
  const cache = makeNode(new THREE.CylinderGeometry(0.5, 0.5, 0.42, 6), C.cache, "cache");
  cache.group.position.copy(W(sim.CACHE));
  const queue = makeNode(new THREE.BoxGeometry(1.5, 0.42, 0.62), C.queue, "queue");
  queue.group.position.copy(W(sim.QUEUE));
  const qFill = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.5), new THREE.MeshBasicMaterial({ color: C.queue, transparent: true, opacity: 0.85 }));
  qFill.position.y = -0.17;
  queue.group.add(qFill);

  const dbs = sim.DB.map((d, i) => {
    const n = makeNode(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 28), C.follower, `db-${i + 1}`, "follower");
    n.group.position.copy(W(d));
    return n;
  });
  const isoRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.025, 8, 64), new THREE.MeshBasicMaterial({ color: C.down }));
  isoRing.rotation.x = Math.PI / 2;
  isoRing.visible = false;
  scene.add(isoRing);

  let apps: Node[] = [];

  /* ---------- links ---------- */
  const links = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55 }));
  links.position.y = -0.05;
  scene.add(links);

  let sig = "";
  const rebuild = () => {
    const { S } = sim;
    apps.forEach((a) => scene.remove(a.group));
    apps = Array.from({ length: S.apps }, (_, i) => {
      const can = i === S.canary;
      const n = makeNode(new THREE.BoxGeometry(1.1, 0.34, 0.46), can ? C.canary : C.app, `app-${i + 1}`, can ? "v2.4 canary" : undefined);
      n.group.position.copy(W(sim.appPos(i)));
      n.group.scale.setScalar(0.01);
      n.group.userData.grow = true;
      return n;
    });
    const pos: number[] = [], col: number[] = [];
    const add = (a: XY, b: XY, hex: number) => {
      const va = W(a), vb = W(b);
      pos.push(va.x, 0, va.z, vb.x, 0, vb.z);
      const c = new THREE.Color(hex);
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    };
    sim.USERS.forEach((u) => add(u, sim.LB, 0x3a3d45));
    for (let i = 0; i < S.apps; i++) {
      const a = sim.appPos(i);
      add(sim.LB, a, 0x3a3d45); add(a, sim.CACHE, 0x2f4f42); add(a, sim.QUEUE, 0x4f4430);
    }
    if (S.leader >= 0) {
      add(sim.QUEUE, sim.DB[S.leader], 0x7a6136);
      sim.DB.forEach((d, i) => { if (i !== S.leader && S.up[i] && S.iso !== i) add(sim.DB[S.leader], d, 0x2f6a5f); });
    }
    links.geometry.dispose();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    links.geometry = g;
  };

  /* ---------- packets ---------- */
  const MAX = 120;
  const packets = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), MAX);
  packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(packets);
  const m4 = new THREE.Matrix4();
  const tmpC = new THREE.Color();

  /* ---------- camera ---------- */
  let az = 0, el = 0;
  const camTarget = new THREE.Vector3(0.2, 0, 0.1);

  const stage = createStage({
    host: wrap,
    className: "sx-canvas",
    alpha: true,
    onResize(w, h) {
      camera.aspect = w / h;
      camera.fov = w / h < 1.2 ? 52 : 34;
      camera.updateProjectionMatrix();
    },
    onFrame(t, dt) {
      const { S, P } = sim;
      const s = `${S.apps}|${S.canary}|${S.leader}|${S.up.join("")}|${S.iso}|${S.cand}|${S.mode}`;
      if (s !== sig) { sig = s; rebuild(); }

      // node states
      apps.forEach((a) => { if (a.group.userData.grow) { const k = damp(a.group.scale.x, 1, 8, dt); a.group.scale.setScalar(k); if (k > 0.99) a.group.userData.grow = false; } });
      setColor(cache, C.cache, S.mode === "spike" ? 0.35 + Math.sin(t * 6) * 0.1 : 0.12);
      dbs.forEach((n, i) => {
        const up = S.up[i], L = i === S.leader, Cd = i === S.cand;
        const hex = !up ? C.down : L ? C.leader : Cd ? C.cand : C.follower;
        setColor(n, hex, L ? 0.3 + Math.sin(t * 3) * 0.08 : !up ? 0.05 : 0.1);
        n.group.position.y = damp(n.group.position.y, !up ? -0.18 : L ? 0.12 : 0, 6, dt);
        const sub = n.group.getObjectByName("sub") as THREE.Sprite | undefined;
        const word = !up ? "down" : L ? `leader · term ${S.term}` : Cd ? "candidate" : S.iso === i ? "read-only" : "follower";
        if (sub && sub.userData.word !== word) {
          const fresh = textSprite(word, { size: 22, color: !up ? "#ff8a82" : L ? "#6fd3be" : Cd ? "#f1c071" : "#8d8d8d" });
          sub.material.map?.dispose();
          sub.material = fresh.material;
          sub.scale.set(0.26 * fresh.userData.aspect, 0.26, 1);
          sub.userData.word = word;
        }
      });
      isoRing.visible = S.iso >= 0;
      if (S.iso >= 0) { isoRing.position.copy(W(sim.DB[S.iso])); isoRing.rotation.z = t; }
      qFill.scale.x = Math.max(0.001, S.q);
      qFill.position.x = -0.7 + 0.7 * S.q;

      // packets
      let n = 0;
      for (const p of P) {
        if (n >= MAX) break;
        const a = p.pts[p.seg], b = p.pts[p.seg + 1];
        if (!a || !b) continue;
        const x = a[0] + (b[0] - a[0]) * p.t, y = a[1] + (b[1] - a[1]) * p.t;
        const v = W([x, y]);
        m4.makeTranslation(v.x, 0.08 + Math.sin(p.t * Math.PI) * 0.12, v.z);
        packets.setMatrixAt(n, m4);
        packets.setColorAt(n, tmpC.setHex(C[p.kind]));
        n++;
      }
      packets.count = n;
      packets.instanceMatrix.needsUpdate = true;
      if (packets.instanceColor) packets.instanceColor.needsUpdate = true;

      // camera: an angled control-room view that follows the pointer a little
      az = damp(az, pointer.x * 0.28 + Math.sin(t * 0.15) * 0.06, 2, dt);
      el = damp(el, pointer.y * 0.08, 2, dt);
      const r = camera.aspect < 1.2 ? 15 : 11.2;
      camera.position.set(Math.sin(az) * r * 0.55, r * (0.62 + el), Math.cos(az) * r * 0.62);
      camera.lookAt(camTarget);
      stage?.renderer.render(scene, camera);
    },
  });
  if (stage) map.classList.add("gl-on");
  if (tier === "low") grid.visible = true;
}
