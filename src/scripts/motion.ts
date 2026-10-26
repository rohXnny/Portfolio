/**
 * Motion layer: Lenis smooth scrolling + GSAP ScrollTrigger reveals.
 * Everything here is progressive: content is fully visible without it, and
 * prefers-reduced-motion turns the whole layer off.
 */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { reduce, fine, onPage } from "./shared";

gsap.registerPlugin(ScrollTrigger, SplitText);

let lenis: Lenis | null = null;

if (!reduce) {
  lenis = new Lenis({
    lerp: 0.11,
    smoothWheel: true,
    // Let nested scroll areas (chat log, agent trace, menus) scroll natively.
    prevent: (node: HTMLElement) =>
      !!node.closest?.(".sn-log, .trace, .cmdk-list, .apix-body, .apix-eps, textarea"),
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.documentElement.classList.add("lenis-on");
}

/** Stop page scrolling while an overlay owns the keyboard. */
export function lockScroll(on: boolean): void {
  if (!lenis) return;
  on ? lenis.stop() : lenis.start();
}

/* ---------- reveals ---------- */
const splits = new WeakSet<Element>();

function revealTitles(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>(".sh-title, .talk, .bio h2, .hq p, .quote p").forEach((el) => {
    if (splits.has(el)) return;
    splits.add(el);
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "ln",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.05,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onComplete: () => self.revert(),
        });
      },
    });
  });
}

function revealBlocks(scope: ParentNode): void {
  const groups: [string, number][] = [
    [".sh-lead, .sh-meta", 0.06],
    [".apix, .sx, .edu-card, .leave, .tdesc, .build-cta", 0],
    [".wall > .xt", 0.12],
    [".journey .jstop", 0.1],
    [".reasons .rs", 0.08],
    [".reach .copy, .ask-sunny", 0.08],
  ];
  for (const [sel, stagger] of groups) {
    const els = [...scope.querySelectorAll<HTMLElement>(sel)].filter((e) => !e.dataset.rv);
    if (!els.length) continue;
    els.forEach((e) => (e.dataset.rv = "1"));
    ScrollTrigger.batch(els, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.fromTo(batch, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger, overwrite: true }),
    });
    gsap.set(els, { autoAlpha: 0, y: 36 });
  }
  scope.querySelectorAll<HTMLElement>(".sh-meta .rule").forEach((r) => {
    if (r.dataset.rv) return;
    r.dataset.rv = "1";
    gsap.from(r, { scaleX: 0, transformOrigin: "left center", duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: r, start: "top 92%", once: true } });
  });
}

/* Project mocks drift slightly against the scroll for depth. */
function parallax(): void {
  document.querySelectorAll<HTMLElement>(".wall .mock").forEach((m) => {
    gsap.fromTo(m, { yPercent: 4 }, { yPercent: -4, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
  });
}

/* ---------- pointer details ---------- */
function magnetic(): void {
  if (!fine) return;
  document.querySelectorAll<HTMLElement>(".btn-primary, .sn-launch, .navbar .cmdk-btn").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.22);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

/* Cards light up under the pointer. */
function spotlight(): void {
  if (!fine) return;
  document.querySelectorAll<HTMLElement>(".xt, .rs, .leave, .apix, .sx").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", `${e.clientX - r.left}px`);
      el.style.setProperty("--py", `${e.clientY - r.top}px`);
    });
  });
}

/* The hero name assembles once on first load. */
function intro(): void {
  const name = document.querySelector<HTMLElement>("#home-name .nm > span:first-child");
  if (!name) return;
  const split = SplitText.create(name, { type: "chars", mask: "chars" });
  gsap.from(split.chars, { yPercent: 105, duration: 1.2, ease: "expo.out", stagger: 0.028, delay: 0.15, onComplete: () => split.revert() });
  gsap.from("#home-name .role-t", { autoAlpha: 0, y: 12, duration: 0.9, ease: "power3.out", delay: 0.75 });
  gsap.from(".navbar", { autoAlpha: 0, y: -14, duration: 0.9, ease: "power3.out", delay: 0.2 });
  gsap.from(".sn-launch", { autoAlpha: 0, scale: 0.6, duration: 0.8, ease: "back.out(1.8)", delay: 1.1 });
}

if (!reduce) {
  revealTitles(document);
  revealBlocks(document);
  parallax();
  magnetic();
  spotlight();
  if (!location.hash || location.hash === "#home") intro();
}

onPage(() => {
  lenis?.scrollTo(0, { immediate: true, force: true });
  if (!reduce) requestAnimationFrame(() => ScrollTrigger.refresh());
});
addEventListener("load", () => ScrollTrigger.refresh());
