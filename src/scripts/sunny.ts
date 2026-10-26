/**
 * Floating Sunny launcher: open/close, keyboard shortcut, teaser and unread badge.
 * The conversation itself starts on the first "sunny:open" event (see contact.ts).
 */
import { reduce } from "./shared";

const dock = document.getElementById("sunny-dock") as HTMLElement;
const panel = document.getElementById("sunny") as HTMLElement;
const launch = document.getElementById("sn-launch") as HTMLButtonElement;
const closeBtn = document.getElementById("sn-close") as HTMLButtonElement;
const teaser = document.getElementById("sn-teaser") as HTMLElement;
const teaserX = document.getElementById("sn-teaser-x") as HTMLButtonElement;
const badge = document.getElementById("sn-badge") as HTMLElement;

const store = {
  get(k: string) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { sessionStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

let open = false;
let lastFocus: HTMLElement | null = null;

export function openSunny(ask?: string): void {
  if (open) { if (ask) dispatchEvent(new CustomEvent("sunny:open", { detail: { ask } })); return; }
  open = true;
  lastFocus = document.activeElement as HTMLElement | null;
  panel.hidden = false;
  dock.classList.add("open");
  launch.setAttribute("aria-expanded", "true");
  hideTeaser(true);
  badge.hidden = true;
  requestAnimationFrame(() => panel.classList.add("in"));
  dispatchEvent(new CustomEvent("sunny:open", { detail: { ask } }));
  // Focus the first quick reply or the input once Sunny has spoken.
  setTimeout(() => {
    const target = panel.querySelector<HTMLElement>("#sn-in:not([disabled])");
    (target ?? closeBtn).focus({ preventScroll: true });
  }, reduce ? 0 : 1200);
}

export function closeSunny(): void {
  if (!open) return;
  open = false;
  panel.classList.remove("in");
  dock.classList.remove("open");
  launch.setAttribute("aria-expanded", "false");
  setTimeout(() => { if (!open) panel.hidden = true; }, reduce ? 0 : 260);
  lastFocus?.focus?.({ preventScroll: true });
}

function hideTeaser(remember: boolean): void {
  teaser.classList.remove("in");
  setTimeout(() => (teaser.hidden = true), 250);
  if (remember) store.set("sunny-teaser", "1");
}

launch.addEventListener("click", () => (open ? closeSunny() : openSunny()));
closeBtn.addEventListener("click", closeSunny);
teaserX.addEventListener("click", (e) => { e.stopPropagation(); hideTeaser(true); });
teaser.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-ask]");
  openSunny(b?.dataset.ask);
});
document.addEventListener("click", (e) => {
  const t = (e.target as HTMLElement).closest("[data-open-sunny]");
  if (t) { e.preventDefault(); openSunny((t as HTMLElement).dataset.ask); }
});

addEventListener("keydown", (e) => {
  const el = e.target as HTMLElement;
  const typing = el.closest("input, textarea, select, [contenteditable]");
  if (e.key === "Escape" && open) { e.preventDefault(); closeSunny(); }
  else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openSunny(); }
});

// Prompt popups shortly after arrival, until the visitor opens Sunny or dismisses them.
if (!store.get("sunny-teaser")) {
  setTimeout(() => {
    if (open || store.get("sunny-teaser")) return;
    teaser.hidden = false;
    requestAnimationFrame(() => teaser.classList.add("in"));
  }, 4500);
} else {
  badge.hidden = true;
}

addEventListener("sunny:request", () => openSunny());
