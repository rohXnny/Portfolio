/**
 * Hash router for the single-page site.
 * Pages are <section class="page"> elements; the router shows one at a time,
 * runs the swap inside a View Transition where the browser supports it, keeps
 * the nav and document title in sync, and tells feature modules via emitPage.
 */
import { state, emitPage, reduce, type PageId } from "./shared";

const links = [...document.querySelectorAll<HTMLAnchorElement>("#pill a")];
const pages = [...document.querySelectorAll<HTMLElement>(".page")];
const scene = document.querySelector<HTMLElement>(".scene");
const ALIAS: Record<string, PageId> = { skills: "work", experience: "work", about: "beyond" };
const TITLES: Record<PageId, string> = {
  home: "Rohit Annavarapu · Software Engineer",
  work: "Work · Rohit Annavarapu",
  beyond: "Beyond Code · Rohit Annavarapu",
  hire: "Strengths · Rohit Annavarapu",
  contact: "Contact · Rohit Annavarapu",
};

function resolve(raw: string): PageId {
  const id = (ALIAS[raw] ?? raw) as PageId;
  return pages.some((p) => p.id === id) ? id : "home";
}

/** Body data-zone drives nav and cursor colours on the Work page's two zones. */
function zone(): void {
  if (state.current !== "work") { delete document.body.dataset.zone; return; }
  const z = [...document.querySelectorAll<HTMLElement>("#work .zone")]
    .filter((e) => e.getBoundingClientRect().top < 90)
    .pop();
  document.body.dataset.zone = z?.dataset.zone ?? "experience";
}
addEventListener("scroll", zone, { passive: true });

function swap(id: PageId): void {
  state.current = id;
  for (const p of pages) p.hidden = p.id !== id;
  for (const a of links) {
    const on = a.getAttribute("href") === `#${id}`;
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  }
  document.body.dataset.page = id;
  document.title = TITLES[id];
  if (scene) scene.style.visibility = id === "home" ? "visible" : "hidden";
  scrollTo(0, 0);
  emitPage(id);
  zone();
}

export function showPage(raw: string, push: boolean): void {
  const id = resolve(raw);
  const same = id === state.current && !pages.find((p) => p.id === id)?.hidden;
  if (same) { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); return; }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reduce && push) doc.startViewTransition(() => swap(id));
  else swap(id);
  if (push && location.hash !== `#${id}`) {
    try { history.pushState(null, "", `#${id}`); } catch { /* sandboxed frame */ }
  }
}

document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a) return;
  const raw = a.getAttribute("href")!.slice(1);
  if (pages.some((p) => p.id === (ALIAS[raw] ?? raw))) {
    e.preventDefault();
    showPage(raw, true);
  }
});
addEventListener("popstate", () => showPage(location.hash.slice(1) || "home", false));
addEventListener("hashchange", () => showPage(location.hash.slice(1) || "home", false));

// First paint: show the requested page without a transition.
state.current = "home";
for (const p of pages) p.hidden = true;
swap(resolve(location.hash.slice(1) || "home"));
