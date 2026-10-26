/**
 * Shared WebGL runtime: one place that decides whether 3D runs at all, picks a
 * quality tier, sizes canvases, and only renders scenes that are on screen.
 *
 * Every scene falls back to the existing 2D version when WebGL is missing or the
 * visitor prefers reduced motion, so content never depends on 3D.
 */
import * as THREE from "three";

import { enabled, tier } from "./support";
export { enabled, tier };

export interface Stage {
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  /** True while the canvas is visible on screen and its page is showing. */
  readonly visible: boolean;
  dispose(): void;
}

export interface StageOptions {
  host: HTMLElement;
  className?: string;
  alpha?: boolean;
  shadows?: boolean;
  onResize: (w: number, h: number) => void;
  onFrame: (t: number, dt: number) => void;
  /** Extra condition for rendering, e.g. only while its page is showing. */
  active?: () => boolean;
}

/**
 * Create a canvas in `host`, keep it sized to the host, and drive `onFrame`
 * only while it is visible. Returns null when 3D is off.
 */
export function createStage(o: StageOptions): Stage | null {
  if (!enabled) return null;
  const canvas = document.createElement("canvas");
  canvas.className = `gl ${o.className ?? ""}`.trim();
  canvas.setAttribute("aria-hidden", "true");
  o.host.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: tier === "high",
    alpha: o.alpha ?? false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, tier === "high" ? 2 : 1.4));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  if (o.shadows && tier === "high") {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  let visible = false;
  let raf = 0;
  let last = performance.now();

  const resize = () => {
    const r = o.host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    o.onResize(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(o.host);
  resize();

  const loop = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (o.active && !o.active()) { raf = requestAnimationFrame(loop); return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    o.onFrame(now / 1000, dt);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };

  const io = new IntersectionObserver((es) => {
    visible = es.some((e) => e.isIntersecting);
    if (visible) start();
  });
  io.observe(o.host);
  document.addEventListener("visibilitychange", start);

  return {
    renderer,
    canvas,
    get visible() { return visible; },
    dispose() {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      renderer.dispose();
      canvas.remove();
    },
  };
}

/** Pointer position in -1..1, smoothed by each scene as it likes. */
export const pointer = { x: 0, y: 0, cx: innerWidth / 2, cy: innerHeight / 2, moved: 0 };
addEventListener(
  "pointermove",
  (e) => {
    pointer.cx = e.clientX;
    pointer.cy = e.clientY;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / innerHeight) * 2 - 1);
    pointer.moved = performance.now();
  },
  { passive: true },
);

/** A crisp text label as a sprite, for node names in 3D scenes. */
export function textSprite(text: string, opts: { size?: number; color?: string; weight?: number; font?: string } = {}): THREE.Sprite {
  const size = opts.size ?? 28;
  const font = `${opts.weight ?? 500} ${size}px ${opts.font ?? '"Geist Mono Variable", ui-monospace, monospace'}`;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 16;
  const h = Math.ceil(size * 1.5);
  c.width = w * 2;
  c.height = h * 2;
  ctx.scale(2, 2);
  ctx.font = font;
  ctx.fillStyle = opts.color ?? "#e8e8e6";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 8, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.userData.aspect = w / h;
  return sprite;
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));
