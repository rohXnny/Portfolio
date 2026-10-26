/**
 * Contact page: copy buttons and the "Leave your details" form.
 */
import { site } from "../data/site";
import { sendForm, visitText } from "./forms";

const toastEl = document.getElementById("toast") as HTMLElement;
let toastTimer = 0;
export function toast(msg: string): void {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toastEl.hidden = true), 2000);
}

export function copyText(value: string, label: string, el?: Element | null): void {
  const select = () => {
    if (!el) { toast(value); return; }
    const r = document.createRange();
    r.selectNodeContents(el);
    const s = getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
    toast("Selected. Press Ctrl/⌘+C to copy");
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(() => toast(`${label} copied`), select);
  else select();
}

document.querySelectorAll<HTMLButtonElement>(".copy").forEach((b) =>
  b.addEventListener("click", () => copyText(b.dataset.v ?? "", b.dataset.l ?? "Text", b.querySelector(".v"))),
);

/* ---------- leave your details ---------- */
const form = document.getElementById("lead") as HTMLFormElement | null;
const err = document.getElementById("l-err") as HTMLElement;
const card = document.getElementById("leave") as HTMLElement;
const $ = (id: string) => document.getElementById(id) as HTMLInputElement;
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const n = $("l-name"), m = $("l-email");
  const okN = n.value.trim().length > 1;
  const okM = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.value.trim());
  n.setAttribute("aria-invalid", String(!okN));
  m.setAttribute("aria-invalid", String(!okM));
  if (!okN || !okM) {
    err.textContent = !okN ? "Add your name so I know who to reach." : "Enter a valid email, like name@company.com.";
    err.hidden = false;
    (okN ? m : n).focus();
    return;
  }
  err.hidden = true;
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  btn.disabled = true;
  btn.firstChild!.textContent = "Sending… ";

  const v = {
    name: n.value.trim(),
    email: m.value.trim(),
    company: $("l-company").value.trim(),
    role: ($("l-role") as unknown as HTMLSelectElement).value,
    message: $("l-msg").value.trim(),
  };
  const sent = await sendForm("lead", { ...v, visit: visitText() });
  const first = esc(v.name.split(" ")[0]);
  if (sent) {
    card.innerHTML = `<div class="done"><h4>Thanks, ${first}.</h4><p>Your details are with me. I'll reach out at ${esc(v.email)}.</p></div>`;
    return;
  }
  card.innerHTML = `<div class="done"><h4>That didn't go through, ${first}.</h4><p>Something blocked the send. Your details are safe to retry, or email me at ${esc(site.email)}.</p><div class="row"><button class="pillbtn primary" type="button" id="cp-mail">Copy my email</button></div></div>`;
  document.getElementById("cp-mail")?.addEventListener("click", () => copyText(site.email, "Email"));
});
