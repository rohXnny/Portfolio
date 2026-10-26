/**
 * Sunny's conversation.
 * - Free questions are answered from data/knowledge.ts (this portfolio only).
 * - Anything outside it is handed to Rohit: email him or leave details.
 * - "I'm hiring" / "I have a project" / "Leave my details" run a short
 *   lead flow that is delivered by forms.ts (Netlify Forms + email).
 */
import { topics, PRIVATE_KEYS, SUGGESTIONS, type Topic } from "../data/knowledge";
import { site } from "../data/site";
import { sendForm, beaconForm, visitText } from "./forms";
import { copyText } from "./contact";
import { reduce } from "./shared";

const log = document.getElementById("sn-log") as HTMLElement;
const form = document.getElementById("sn-form") as HTMLFormElement;
const input = document.getElementById("sn-in") as HTMLTextAreaElement;
const send = document.getElementById("sn-send") as HTMLButtonElement;

type Step = "chat" | "details" | "name" | "email" | "company";
type Intent = "hire" | "project" | "other" | "contact";

const S = {
  step: "chat" as Step,
  intent: "" as Intent | "",
  details: "", fit: "", name: "", email: "", company: "",
  transcript: [] as string[],
  questions: [] as string[],
  done: false, partialSent: false, busy: false,
};

const PH: Record<Step, string> = {
  chat: "Ask anything about Rohit…",
  details: "Role, team or project details",
  name: "Your name",
  email: "you@company.com",
  company: "Company name",
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
const scroll = () => (log.scrollTop = log.scrollHeight);

function bubble(who: "bot" | "me", text: string): void {
  const d = document.createElement("div");
  d.className = `sn-m ${who}`;
  d.textContent = text;
  log.append(d);
  S.transcript.push(`${who === "bot" ? "Sunny" : "Visitor"}: ${text}`);
  scroll();
}

async function say(...lines: string[]): Promise<void> {
  for (const l of lines) {
    const t = document.createElement("div");
    t.className = "sn-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    log.append(t);
    scroll();
    await wait(Math.min(1000, 380 + l.length * 7));
    t.remove();
    bubble("bot", l);
  }
}

function chips(labels: string[]): void {
  log.querySelectorAll(".sn-quick").forEach((q) => q.remove());
  if (!labels.length) return;
  const q = document.createElement("div");
  q.className = "sn-quick";
  for (const label of labels) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => { q.remove(); handle(label); });
    q.append(b);
  }
  log.append(q);
  scroll();
}

function setStep(step: Step): void {
  S.step = step;
  input.placeholder = PH[step];
  input.disabled = false;
  send.disabled = false;
  if (matchMedia("(pointer:fine)").matches) input.focus({ preventScroll: true });
}

/* ---------- understanding ---------- */
const norm = (t: string) =>
  ` ${t.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim()} `;

function hits(text: string, key: string): boolean {
  return text.includes(` ${key} `) || (key.includes(" ") && text.includes(key));
}

const SMALL_TALK = new Set(["hello", "thanks", "about"]);

function bestTopic(q: string): Topic | null {
  const t = norm(q);
  const scored = topics
    .map((topic) => {
      let s = 0;
      for (const k of topic.keys) if (hits(t, k)) s += 1 + (k.split(" ").length - 1) * 1.5 + (k.length > 6 ? 0.4 : 0);
      return { topic, s };
    })
    .filter((x) => x.s >= 1)
    .sort((a, b) => b.s - a.s);
  // Specific topics beat greetings, thanks and the general "about" answer.
  return (scored.find((x) => !SMALL_TALK.has(x.topic.id)) ?? scored[0])?.topic ?? null;
}

/* Technologies, so "does he know Kafka?" gets a direct yes or a hand-off. */
const STACK: Record<string, [string, string][]> = {
  "languages": [["java", "Java"], ["python", "Python"], ["typescript", "TypeScript"], ["javascript", "JavaScript"], ["sql", "SQL"]],
  "backend frameworks": [["spring boot", "Spring Boot"], ["spring", "Spring Boot"], ["fastapi", "FastAPI"], ["django", "Django"], ["rest", "REST"], ["grpc", "gRPC"]],
  "front-end frameworks": [["react", "React"], ["angular", "Angular"], ["vue", "Vue"]],
  "data and messaging tools": [["postgresql", "PostgreSQL"], ["postgres", "PostgreSQL"], ["redis", "Redis"], ["kafka", "Kafka"], ["rabbitmq", "RabbitMQ"]],
  "cloud and platform tools": [["aws", "AWS"], ["gcp", "GCP"], ["azure", "Azure"], ["kubernetes", "Kubernetes"], ["k8s", "Kubernetes"], ["docker", "Docker"]],
  "AI tools": [["claude code", "Claude Code"], ["cursor", "Cursor"], ["copilot", "GitHub Copilot"], ["rag", "RAG"], ["mcp", "MCP"], ["llm", "LLMs"], ["llms", "LLMs"]],
};
const OTHER_TECH: [string, string][] = [["go", "Go"], ["golang", "Go"], ["rust", "Rust"], ["php", "PHP"], ["ruby", "Ruby"], ["rails", "Rails"], ["c#", "C#"], ["net", ".NET"], ["dotnet", ".NET"], ["swift", "Swift"], ["kotlin", "Kotlin"], ["scala", "Scala"], ["flutter", "Flutter"], ["react native", "React Native"], ["svelte", "Svelte"], ["terraform", "Terraform"], ["snowflake", "Snowflake"], ["spark", "Spark"], ["mongodb", "MongoDB"], ["dynamodb", "DynamoDB"], ["cassandra", "Cassandra"], ["elasticsearch", "Elasticsearch"], ["graphql", "GraphQL"], ["nextjs", "Next.js"], ["next js", "Next.js"], ["node", "Node.js"], ["nodejs", "Node.js"]];

function techAnswer(q: string): string[] | null {
  const t = norm(q);
  for (const [cat, list] of Object.entries(STACK)) {
    const hit = list.find(([k]) => hits(t, k));
    if (hit) return [`Yes. ${hit[1]} is part of Rohit's stack, one of his ${cat}.`, "Want the full stack, or the projects he's built?"];
  }
  const other = OTHER_TECH.find(([k]) => hits(t, k));
  if (other) return [`${other[1]} isn't listed on his portfolio. Rohit adapts to whatever a team uses, so it's worth asking him directly.`, `Email ${site.email} or leave your details and he'll reach out.`];
  return null;
}

const SDE = /\b(sde|software|engineer|engineering|developer|dev|full[\s-]?stack|back[\s-]?end|front[\s-]?end|web|java|python|javascript|typescript|react|angular|node|spring|cloud|aws|azure|gcp|devops|sre|platform|api|microservices?|data|ml|ai|llm|agent|mobile|programmer|architect|tech(nical)? lead)\b/i;

function leadIntent(q: string): Intent | null {
  const t = norm(q);
  if (/ (i'm|im|i am|we're|were|we are) (hiring|recruiting|looking to hire)| hiring for | (have|got) (a|an|one) (role|position|job|opening|vacancy) | recruiter /.test(t) || / i'm hiring for a position /.test(t)) return "hire";
  if (/ (i|we) (have|need|want) (a|an)? ?(project|app|website|tool|system) | freelance | i have a project /.test(t)) return "project";
  if (/ leave my details | contact me | reach out to me | get in touch with me /.test(t)) return "contact";
  return null;
}

/* ---------- conversation ---------- */
async function answer(q: string): Promise<void> {
  S.questions.push(q);
  const lead = leadIntent(q);
  if (lead) return startLead(lead, q);
  if (/^copy email$/i.test(q.trim())) { copyText(site.email, "Email"); await say(`Copied: ${site.email}`); return chips(SUGGESTIONS); }

  const t = norm(q);
  if (PRIVATE_KEYS.some((k) => hits(t, k))) {
    await say(
      "That's something Rohit prefers to share directly.",
      `Email him at ${site.email}, or leave your details and he'll reach out to you.`,
    );
    return chips(["Leave my details", "Copy email", "Ask something else"]);
  }
  const asksAboutTech = / (know|knows|use|used|uses|work with|worked with|experience with|experience in|familiar|does he|can he|skilled|proficient) /.test(t);
  const tech = asksAboutTech ? techAnswer(q) : null;
  if (tech) { await say(...tech); return chips(["What's his tech stack?", "What projects has he built?"]); }
  const topic = bestTopic(q);
  if (!topic) {
    await say(
      "I only know what's on Rohit's portfolio, so I can't answer that one.",
      `For anything else, email him at ${site.email} or leave your details and he'll reach out.`,
    );
    return chips(["Leave my details", "Copy email", ...SUGGESTIONS.slice(0, 2)]);
  }
  await say(...topic.answer);
  chips(topic.next ?? SUGGESTIONS);
}

const FILLER = new Set(["i'm", "im", "i", "am", "we", "we're", "are", "is", "hiring", "recruiting", "looking", "to", "hire", "for", "a", "an", "the", "position", "role", "job", "opening", "have", "got", "one", "need", "want", "project", "pass", "it", "rohit", "leave", "my", "details", "contact", "me", "and", "with"]);

async function startLead(intent: Intent, said = ""): Promise<void> {
  S.intent = intent;
  // "I'm hiring a senior Java developer" already carries the role: skip asking for it.
  const extra = norm(said).trim().split(" ").filter((w) => w && !FILLER.has(w));
  if (intent !== "contact" && extra.length >= 2) {
    S.details = said;
    await say(...fitLine(said), "Who should Rohit reach out to? What's your name?");
    return setStep("name");
  }
  if (intent === "hire") await say("Great! What's the position?", "Share the job title or paste the job description.");
  else if (intent === "project") await say("Nice! Tell me about the project. What are you building, and where could Rohit help?");
  else await say("Sure. What would you like to talk to Rohit about?");
  setStep("details");
}

function fitLine(text: string): string[] {
  const sde = SDE.test(text);
  if (S.intent === "hire") {
    S.fit = sde ? "SDE match" : "other role";
    return sde
      ? ["That sounds like a great fit for Rohit!", "He's built full stack software across healthcare, banking, higher education and energy, and he'd love to hear more."]
      : ["Thanks for sharing! Rohit will take a look."];
  }
  if (S.intent === "project") { S.fit = sde ? "tech project" : "project"; return ["That sounds like something Rohit would enjoy building."]; }
  S.fit = "general";
  return ["Thanks, that's helpful context."];
}

async function onText(t: string): Promise<void> {
  if (S.step === "chat") return answer(t);
  if (S.step === "details") {
    S.details = t;
    await say(...fitLine(t), "Who should Rohit reach out to? What's your name?");
    return setStep("name");
  }
  if (S.step === "name") {
    if (t.length < 2) { await say("Could you share your full name?"); return setStep("name"); }
    S.name = t;
    await say(`Thanks, ${t.split(" ")[0]}! What's the best email to reach you?`);
    return setStep("email");
  }
  if (S.step === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) { await say("That email doesn't look quite right. Could you check it?"); return setStep("email"); }
    S.email = t;
    await say("And which company are you with?");
    chips(["Skip"]);
    return setStep("company");
  }
  if (S.step === "company") {
    S.company = /^skip$/i.test(t) ? "" : t;
    return finish();
  }
}

function payload(status: string) {
  return {
    status, intent: S.intent, details: S.details, fit: S.fit,
    name: S.name, email: S.email, company: S.company,
    transcript: S.transcript.join("\n"), visit: visitText(),
  };
}

async function finish(): Promise<void> {
  input.disabled = true; send.disabled = true; input.placeholder = "Sending…";
  const ok = await sendForm("sunny", payload("complete"));
  S.done = true;
  const first = S.name.split(" ")[0];
  if (ok) {
    await say(`All set, ${first}! Rohit will get your message and reach out to you at ${S.email} soon.`, "Anything else you'd like to know about him?");
  } else {
    await say(`Thanks, ${first}. I couldn't send that just now. Please email Rohit at ${site.email} and he'll reply.`);
  }
  S.step = "chat";
  setStep("chat");
  chips(["Copy email", ...SUGGESTIONS.slice(0, 2)]);
}

let queue: Promise<void> = Promise.resolve();
/** Messages are handled in order, even if the visitor types while Sunny is still replying. */
function handle(text: string): Promise<void> {
  queue = queue.then(() => run(text)).catch(() => {});
  return queue;
}
async function run(text: string): Promise<void> {
  S.busy = true;
  bubble("me", text);
  try {
    if (text === "Ask something else") { await say("Sure, go ahead."); chips(SUGGESTIONS); }
    else if (text === "Leave my details") await startLead("contact", text);
    else if (text === "Skip" && S.step === "company") await onText("skip");
    else await onText(text);
  } finally { S.busy = false; }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const t = input.value.trim();
  if (!t || input.disabled) return;
  input.value = "";
  input.style.height = "46px";
  log.querySelectorAll(".sn-quick").forEach((q) => q.remove());
  handle(t);
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
});
input.addEventListener("input", () => {
  input.style.height = "46px";
  input.style.height = `${Math.min(140, input.scrollHeight)}px`;
});

/* A visitor who shared details but left before finishing still reaches Rohit. */
const partial = () => {
  if (S.done || S.partialSent || !S.details) return;
  S.partialSent = beaconForm("sunny", payload("left before finishing"));
};
addEventListener("pagehide", partial);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") partial(); });

/* ---------- start ---------- */
let begun = false;
addEventListener("sunny:open", async (e) => {
  const ask = (e as CustomEvent<{ ask?: string }>).detail?.ask;
  if (!begun) {
    begun = true;
    S.busy = true;
    await say("Hi, I'm Sunny, Rohit's assistant. 👋", "Ask me anything about his work, skills or experience.");
    S.busy = false;
    setStep("chat");
    if (!ask) chips([...SUGGESTIONS, "I'm hiring for a position"]);
  }
  if (ask) handle(ask);
});
