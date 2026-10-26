/**
 * Command menu: a keyboard-first way around the site.
 * Ctrl/⌘ K opens it; arrows move; Enter runs; Esc closes.
 */
import { site } from "../data/site";
import { reduce } from "./shared";

interface Command {
  group: string;
  label: string;
  hint?: string;
  run: () => void;
}

const root = document.getElementById("cmdk") as HTMLElement;
const input = document.getElementById("cmdk-input") as HTMLInputElement;
const list = document.getElementById("cmdk-list") as HTMLUListElement;

const go = (hash: string) => () => {
  const a = document.querySelector<HTMLAnchorElement>(`#pill a[href="${hash}"]`);
  a?.click();
};
const copy = (value: string, label: string) => () => {
  navigator.clipboard?.writeText(value).then(
    () => toast(`${label} copied`),
    () => toast(value),
  );
};
const scenario = (key: string) => () => {
  go("#home")();
  setTimeout(() => {
    const sys = document.getElementById("sx");
    sys?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    setTimeout(() => document.querySelector<HTMLButtonElement>(`.sxb[data-x="${key}"]`)?.click(), reduce ? 0 : 700);
  }, 120);
};

function toast(msg: string): void {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  setTimeout(() => (t.hidden = true), 1800);
}

const commands: Command[] = [
  { group: "Go to", label: "Home", hint: "G H", run: go("#home") },
  { group: "Go to", label: "Work: projects and skills", hint: "G W", run: go("#work") },
  { group: "Go to", label: "Beyond code", hint: "G B", run: go("#beyond") },
  { group: "Go to", label: "Strengths", hint: "G S", run: go("#hire") },
  { group: "Go to", label: "Contact", hint: "G C", run: go("#contact") },
  { group: "Break my system", label: "Run a 10× traffic spike", run: scenario("spike") },
  { group: "Break my system", label: "Kill the database leader", run: scenario("kill") },
  { group: "Break my system", label: "Split the network", run: scenario("split") },
  { group: "Break my system", label: "Ship a bad release", run: scenario("deploy") },
  { group: "Get in touch", label: "Chat with Sunny", hint: "/", run: () => dispatchEvent(new CustomEvent("sunny:request")) },
  { group: "Get in touch", label: "Copy email address", run: copy(site.email, "Email") },
  { group: "Get in touch", label: "Copy phone number", run: copy(site.phone, "Phone") },
];

let shown: Command[] = commands;
let active = 0;

/** Subsequence match with a small bonus for word starts. */
function score(q: string, text: string): number {
  if (!q) return 1;
  const t = text.toLowerCase();
  let i = 0, s = 0, prev = -2;
  for (const ch of q.toLowerCase()) {
    const j = t.indexOf(ch, i);
    if (j < 0) return 0;
    s += j === prev + 1 ? 3 : 1;
    if (j === 0 || t[j - 1] === " ") s += 2;
    prev = j; i = j + 1;
  }
  return s;
}

function render(): void {
  const q = input.value.trim();
  shown = commands
    .map((c) => ({ c, s: score(q, `${c.group} ${c.label}`) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => (q ? b.s - a.s : 0))
    .map((x) => x.c);
  active = Math.min(active, Math.max(0, shown.length - 1));
  list.innerHTML = "";
  if (!shown.length) {
    const li = document.createElement("li");
    li.className = "cmdk-empty";
    li.textContent = "No matches. Try “work” or “leader”.";
    list.append(li);
    return;
  }
  let group = "";
  shown.forEach((c, i) => {
    if (!q && c.group !== group) {
      group = c.group;
      const h = document.createElement("li");
      h.className = "cmdk-group";
      h.setAttribute("role", "presentation");
      h.textContent = group;
      list.append(h);
    }
    const li = document.createElement("li");
    li.className = "cmdk-item" + (i === active ? " on" : "");
    li.id = `cmdk-${i}`;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", String(i === active));
    li.innerHTML = `<span></span>${c.hint ? `<span class="kbd">${c.hint}</span>` : ""}`;
    (li.firstChild as HTMLElement).textContent = c.label;
    li.addEventListener("pointermove", () => { if (active !== i) { active = i; paint(); } });
    li.addEventListener("click", () => run(i));
    list.append(li);
  });
  input.setAttribute("aria-activedescendant", `cmdk-${active}`);
}

function paint(): void {
  list.querySelectorAll<HTMLElement>(".cmdk-item").forEach((el) => {
    const on = el.id === `cmdk-${active}`;
    el.classList.toggle("on", on);
    el.setAttribute("aria-selected", String(on));
    if (on) el.scrollIntoView({ block: "nearest" });
  });
  input.setAttribute("aria-activedescendant", `cmdk-${active}`);
}

function run(i: number): void {
  const c = shown[i];
  if (!c) return;
  close();
  c.run();
}

let lastFocus: HTMLElement | null = null;
export function open(): void {
  lastFocus = document.activeElement as HTMLElement | null;
  root.hidden = false;
  requestAnimationFrame(() => root.classList.add("in"));
  input.value = "";
  active = 0;
  render();
  input.focus();
  document.documentElement.classList.add("cmdk-open");
}
export function close(): void {
  root.classList.remove("in");
  document.documentElement.classList.remove("cmdk-open");
  setTimeout(() => (root.hidden = true), reduce ? 0 : 180);
  lastFocus?.focus?.({ preventScroll: true });
}

input.addEventListener("input", () => { active = 0; render(); });
input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % Math.max(1, shown.length); paint(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + shown.length) % Math.max(1, shown.length); paint(); }
  else if (e.key === "Enter") { e.preventDefault(); run(active); }
  else if (e.key === "Escape") { e.preventDefault(); close(); }
  else if (e.key === "Tab") { e.preventDefault(); }
});
root.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("[data-cmdk-close]")) close(); });
document.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("[data-cmdk-open]")) { e.preventDefault(); open(); } });
addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    root.hidden ? open() : close();
  }
});

// "G then letter" shortcuts, the way many apps do it.
let gAt = 0;
addEventListener("keydown", (e) => {
  const typing = (e.target as HTMLElement).closest("input, textarea, select, [contenteditable]");
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === "g") { gAt = performance.now(); return; }
  if (performance.now() - gAt < 900) {
    const map: Record<string, string> = { h: "#home", w: "#work", b: "#beyond", s: "#hire", c: "#contact" };
    if (map[k]) { e.preventDefault(); go(map[k])(); }
    gAt = 0;
  }
});

// Show the right modifier key for the visitor's platform.
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
document.querySelectorAll(".cmdk-btn .kbd").forEach((k) => (k.textContent = isMac ? "⌘ K" : "Ctrl K"));
