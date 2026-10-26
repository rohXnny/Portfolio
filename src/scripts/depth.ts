/**
 * CSS 3D layer for DOM content (stays accessible and selectable):
 * - project cards and car tiles tilt toward the pointer with a parallax mock
 * - the Skills badges become a slowly turning 3D globe you can drag
 */
import { reduce, fine } from "./shared";

/* ---------- tilt ---------- */
function tilt(el: HTMLElement, inner: HTMLElement | null, max = 7): void {
  let raf = 0, rx = 0, ry = 0, tx = 0, ty = 0;
  const apply = () => {
    raf = 0;
    rx += (tx - rx) * 0.18;
    ry += (ty - ry) * 0.18;
    el.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    if (inner) inner.style.transform = `translate3d(${(ry * 1.6).toFixed(1)}px, ${(-rx * 1.6).toFixed(1)}px, 0)`;
    if (Math.abs(tx - rx) > 0.02 || Math.abs(ty - ry) > 0.02) raf = requestAnimationFrame(apply);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(apply); };
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ty = px * max * 2;
    tx = -py * max * 2;
    kick();
  });
  el.addEventListener("pointerleave", () => { tx = 0; ty = 0; kick(); });
}

if (!reduce && fine) {
  document.querySelectorAll<HTMLElement>(".wall .xt").forEach((c) => tilt(c, c.querySelector(".mock"), 6));
  document.querySelectorAll<HTMLElement>("#cars-scene .tile").forEach((c) => tilt(c, c.querySelector("svg"), 5));
  document.querySelectorAll<HTMLElement>(".rs, .edu-card, .leave").forEach((c) => tilt(c, null, 3));
}

/* ---------- skills globe ---------- */
const icons = document.getElementById("icons");
const wide = matchMedia("(min-width: 900px)");

function globe(): void {
  if (!icons || reduce || !fine || !wide.matches) return;
  const items = [...icons.querySelectorAll<HTMLElement>(".ic")];
  if (!items.length) return;
  icons.classList.add("globe");
  const n = items.length;
  // Fibonacci sphere: even spacing for any number of badges
  const base = items.map((_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r };
  });
  let ax = -0.25, ay = 0, vx = 0, vy = 0.0035, drag = false, lx = 0, ly = 0, hover = false, visible = false;
  const R = () => Math.min(icons.clientWidth, 560) * 0.42;

  const frame = () => {
    if (!visible) return;
    if (!drag) { ay += hover ? vy * 0.15 : vy; ax += vx; vx *= 0.94; vy += (0.0035 - vy) * 0.02; }
    const rad = R();
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    items.forEach((el, i) => {
      const p = base[i];
      const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
      const y2 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;
      const depth = (z2 + 1) / 2; // 0 back .. 1 front
      const s = 0.55 + depth * 0.55;
      el.style.transform = `translate3d(${(x1 * rad).toFixed(1)}px, ${(y2 * rad).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      el.style.opacity = (0.25 + depth * 0.75).toFixed(2);
      el.style.zIndex = String(Math.round(depth * 100));
      el.style.filter = depth < 0.35 ? "blur(1px)" : "";
    });
    requestAnimationFrame(frame);
  };
  new IntersectionObserver((es) => {
    const was = visible;
    visible = es.some((e) => e.isIntersecting);
    if (visible && !was) requestAnimationFrame(frame);
  }).observe(icons);

  icons.addEventListener("pointerdown", (e) => { drag = true; lx = e.clientX; ly = e.clientY; });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    vy = (e.clientX - lx) * 0.004; vx = (e.clientY - ly) * 0.004;
    ay += vy; ax += vx; lx = e.clientX; ly = e.clientY;
  });
  const end = () => { drag = false; };
  addEventListener("pointerup", end);
  addEventListener("pointercancel", end);
  icons.addEventListener("pointerenter", () => (hover = true));
  icons.addEventListener("pointerleave", () => (hover = false));
}
globe();
