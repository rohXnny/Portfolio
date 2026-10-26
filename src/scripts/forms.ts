/**
 * Form delivery. Each submission goes two ways at once:
 *  1. Netlify Forms (stored in the Netlify dashboard), and
 *  2. an email relay that sends Rohit an email with every field.
 * A submission counts as delivered when either one succeeds.
 */
import { site } from "../data/site";

export type Fields = Record<string, string | undefined>;

const LIVE_HOST =
  /^https?:$/.test(location.protocol) &&
  !/(^|\.)claude\.(ai|site)$|claudeusercontent\.com$|^localhost$|^127\./.test(location.hostname);

const enc = (o: Fields) =>
  Object.entries(o).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? "")}`).join("&");

const LABELS: Record<string, string> = {
  name: "Name", email: "Email", company: "Company", role: "They are a", message: "Message",
  intent: "Reason", details: "Role or project", fit: "Fit", status: "Status",
  transcript: "Chat transcript", visit: "Visit details",
};

async function toNetlify(form: string, data: Fields): Promise<boolean> {
  if (!LIVE_HOST) return false;
  try {
    const r = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: enc({ "form-name": form, ...data }),
    });
    return r.ok;
  } catch { return false; }
}

async function toEmail(form: string, data: Fields): Promise<boolean> {
  if (!site.emailRelay) return false;
  const who = data.name || "a visitor";
  const what = form === "sunny" ? "Sunny chat" : "Contact form";
  const body: Record<string, string> = {
    _subject: `Portfolio · ${what} · ${who}${data.company ? ` (${data.company})` : ""}`,
    _template: "table",
    _captcha: "false",
  };
  if (data.email) body._replyto = data.email;
  for (const [k, v] of Object.entries(data)) if (v) body[LABELS[k] ?? k] = v;
  try {
    const r = await fetch(site.emailRelay, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) return false;
    const j = (await r.json().catch(() => ({}))) as { success?: string | boolean };
    return j.success === true || j.success === "true";
  } catch { return false; }
}

/** Send a submission everywhere it should go. Resolves true if it landed anywhere. */
export async function sendForm(form: string, data: Fields): Promise<boolean> {
  if (site.formEndpoint) {
    try {
      const r = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ form, ...data }),
      });
      if (r.ok) return true;
    } catch { /* fall through */ }
  }
  const [a, b] = await Promise.all([toNetlify(form, data), toEmail(form, data)]);
  return a || b;
}

/** Fire-and-forget for a visitor leaving mid-chat (only Netlify accepts beacons). */
export function beaconForm(form: string, data: Fields): boolean {
  if (!LIVE_HOST || !navigator.sendBeacon) return false;
  try {
    return navigator.sendBeacon("/", new Blob([enc({ "form-name": form, ...data })], { type: "application/x-www-form-urlencoded" }));
  } catch { return false; }
}

/* ---------- visit context ---------- */
const VISIT = { start: Date.now(), landing: location.hash || "#home", ref: document.referrer || "direct", pages: [] as string[] };
const notePage = () => {
  const h = (location.hash || "#home").split("?")[0];
  if (VISIT.pages.at(-1) !== h) VISIT.pages.push(h);
};
notePage();
addEventListener("hashchange", notePage);

export function visitText(): string {
  const secs = Math.round((Date.now() - VISIT.start) / 1000);
  let tz = "unknown";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* old browser */ }
  const mobile = matchMedia("(pointer:coarse)").matches;
  return [
    `Submitted: ${new Date().toString()}`,
    `Time on site: ${Math.floor(secs / 60)}m ${secs % 60}s`,
    `Came from: ${VISIT.ref}`,
    `Landed on: ${VISIT.landing}`,
    `Pages viewed: ${VISIT.pages.join(" → ")}`,
    `Time zone: ${tz}`,
    `Language: ${navigator.language || "unknown"}`,
    `Device: ${mobile ? "phone or tablet" : "desktop"}, screen ${screen.width}×${screen.height}`,
    `Browser: ${navigator.userAgent}`,
  ].join("\n");
}
