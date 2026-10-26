/**
 * Ambient 3D backdrops, one per page zone, drawn behind the content:
 * - "shards":  slow-tumbling glass polyhedra (Projects, on teal)
 * - "network": a drifting constellation of nodes and links (Skills, on navy)
 * - "wave":    a field of points rolling like a quiet sea (Strengths, Contact)
 * Each reacts to the pointer and to scroll, and pauses when off screen.
 */
import * as THREE from "three";
import { createStage, pointer, damp, tier } from "./runtime";

export type FieldKind = "shards" | "network" | "wave";

export function mountField(host: HTMLElement, kind: FieldKind, color: number): void {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 14);
  const group = new THREE.Group();
  scene.add(group);
  const low = tier === "low";

  let tick: (t: number, dt: number) => void = () => {};

  if (kind === "shards") {
    scene.add(new THREE.HemisphereLight(0xffffff, 0x0f6f7c, 1.6));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2);
    dl.position.set(4, 6, 8);
    scene.add(dl);
    const geos = [new THREE.IcosahedronGeometry(1, 0), new THREE.OctahedronGeometry(1, 0), new THREE.TetrahedronGeometry(1, 0), new THREE.DodecahedronGeometry(1, 0)];
    const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.2, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.38, flatShading: true, depthWrite: false });
    const edgeM = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    const items: { m: THREE.Group; s: THREE.Vector3; d: number }[] = [];
    const n = low ? 9 : 16;
    for (let i = 0; i < n; i++) {
      const g = geos[i % geos.length];
      const holder = new THREE.Group();
      holder.add(new THREE.Mesh(g, mat), new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeM));
      const sc = 0.4 + ((i * 37) % 10) / 10;
      holder.scale.setScalar(sc);
      holder.position.set(((i * 53) % 26) - 13, ((i * 29) % 18) - 9, -((i * 17) % 10));
      group.add(holder);
      items.push({ m: holder, s: new THREE.Vector3(0.1 + (i % 3) * 0.05, 0.08 + (i % 4) * 0.04, 0), d: (i % 5) * 0.4 });
    }
    tick = (t, dt) => {
      items.forEach(({ m, s, d }) => {
        m.rotation.x += s.x * dt;
        m.rotation.y += s.y * dt;
        m.position.y += Math.sin(t * 0.4 + d) * 0.002;
      });
    };
  }

  if (kind === "network") {
    const N = low ? 70 : 140;
    const pts = Array.from({ length: N }, () => new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10));
    const vel = pts.map(() => new THREE.Vector3((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25, 0));
    const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const dots = new THREE.Points(pGeo, new THREE.PointsMaterial({ color, size: 0.09, transparent: true, opacity: 0.9, sizeAttenuation: true }));
    group.add(dots);
    const maxL = N * 4;
    const lPos = new Float32Array(maxL * 6);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    const lines = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 }));
    group.add(lines);
    tick = (_t, dt) => {
      const pos = pGeo.attributes.position as THREE.BufferAttribute;
      pts.forEach((p, i) => {
        p.addScaledVector(vel[i], dt);
        if (Math.abs(p.x) > 15) vel[i].x *= -1;
        if (Math.abs(p.y) > 9) vel[i].y *= -1;
        pos.setXYZ(i, p.x, p.y, p.z);
      });
      pos.needsUpdate = true;
      let k = 0;
      for (let i = 0; i < N && k < maxL; i++) for (let j = i + 1; j < N && k < maxL; j++) {
        if (pts[i].distanceToSquared(pts[j]) < 7) {
          lPos.set([pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z], k * 6);
          k++;
        }
      }
      lGeo.setDrawRange(0, k * 2);
      (lGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    };
  }

  if (kind === "wave") {
    const cols = low ? 70 : 120, rows = low ? 34 : 56;
    const count = cols * rows;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const k = (i * rows + j) * 3;
      pos[k] = (i / (cols - 1) - 0.5) * 40;
      pos[k + 1] = 0;
      pos[k + 2] = (j / (rows - 1) - 0.5) * 22;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.55, sizeAttenuation: true }));
    pts.position.set(0, -5, -4);
    pts.rotation.x = 0.18;
    group.add(pts);
    tick = (t) => {
      const a = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const x = a.getX(i), z = a.getZ(i);
        a.setY(i, Math.sin(x * 0.35 + t * 0.8) * 0.55 + Math.cos(z * 0.45 + t * 0.6) * 0.45);
      }
      a.needsUpdate = true;
    };
  }

  let rx = 0, ry = 0;
  const stage = createStage({
    host,
    className: "field-gl",
    alpha: true,
    onResize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    onFrame(t, dt) {
      tick(t, dt);
      const r = host.getBoundingClientRect();
      const scroll = -r.top / Math.max(1, r.height);
      ry = damp(ry, pointer.x * 0.18, 2, dt);
      rx = damp(rx, -pointer.y * 0.1, 2, dt);
      group.rotation.set(rx, ry, 0);
      group.position.y = scroll * 4;
      stage?.renderer.render(scene, camera);
    },
  });
}
