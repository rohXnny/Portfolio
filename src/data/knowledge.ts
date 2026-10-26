/**
 * What Sunny knows. Every answer comes from content already on this site.
 * Anything outside it is handed back to Rohit (email or the details form).
 *
 * Each topic lists `keys`: words or short phrases that signal the question.
 * Longer phrases score higher, so "tech stack" beats a loose "stack".
 */
import { projects } from "./projects";
import { site } from "./site";

export interface Topic {
  id: string;
  keys: string[];
  answer: string[];
  /** Follow-up questions offered as chips after the answer. */
  next?: string[];
}

const proj = Object.fromEntries(projects.map((p) => [p.id, p]));
/** "Security, Observability and APIs" style list that keeps acronyms intact. */
const skillList = (id: keyof typeof proj) => {
  const names = proj[id].skills.map((s) => (/^[A-Z][a-z]/.test(s.name) ? s.name[0].toLowerCase() + s.name.slice(1) : s.name));
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
};

export const SUGGESTIONS = [
  "What does Rohit work on?",
  "What's his tech stack?",
  "Does he build with AI?",
  "Is he open to new roles?",
];

export const topics: Topic[] = [
  {
    id: "about",
    keys: ["who is", "who's rohit", "about rohit", "about him", "introduce him", "summary", "background", "overview", "profile", "rohit"],
    answer: [
      "Rohit Annavarapu is a full stack software engineer. He has built software for companies in healthcare, banking, higher education and energy.",
      "He's happiest designing the backend: the APIs, the data and the events that tie services together, built to fail safely and recover cleanly.",
    ],
    next: ["What projects has he built?", "What's his tech stack?", "What are his strengths?"],
  },
  {
    id: "experience",
    keys: ["years", "experience", "how long", "seniority", "senior", "level", "career"],
    answer: [
      "Rohit has over five years of professional software engineering experience across four industries: energy, higher education, banking and healthcare.",
      "He started on pricing and inventory systems for a fuel retail network, then worked on student registration, card payments and pharmaceutical orders.",
    ],
    next: ["What projects has he built?", "Which industries?"],
  },
  {
    id: "projects",
    keys: ["projects", "project has he", "work on", "worked on", "built", "portfolio", "what has he done", "applications", "systems he"],
    answer: [
      `He's built four main systems: ${projects.map((p) => `${p.title} (${p.industry.toLowerCase()})`).join(", ")}.`,
      "Ask me about any one of them, or open Work to see each project's skills.",
    ],
    next: ["Tell me about the payments platform", "Tell me about pharmacy order tracking", "Tell me about course registration"],
  },
  {
    id: "health",
    keys: ["pharmacy", "healthcare", "health care", "order tracking", "pharmaceutical", "hospital", "medical"],
    answer: [
      "Pharmacy Order Tracking follows every pharmaceutical order from allocation to delivery across a national supply network, so pharmacies and hospitals know what's coming and when.",
      `There he's strongest in ${skillList("health")}.`,
    ],
    next: ["Does he build with AI?", "Tell me about the payments platform"],
  },
  {
    id: "bank",
    keys: ["bank", "banking", "payments", "payment platform", "card", "fintech", "transactions", "settlement"],
    answer: [
      "Card Payments Platform moves card transactions through authorization, posting and settlement for consumers, small businesses and corporations.",
      `That work leans on ${skillList("bank")}.`,
    ],
    next: ["How does he handle security?", "Tell me about course registration"],
  },
  {
    id: "edu",
    keys: ["university", "course registration", "registration", "higher education", "students", "enroll", "college"],
    answer: [
      "Course Registration Portal lets students find courses, see live seat counts, join waitlists and enroll, even when registration opens and everyone signs in at once.",
      `Key skills there: ${skillList("edu")}.`,
    ],
    next: ["Tell me about fuel network operations", "What's his tech stack?"],
  },
  {
    id: "energy",
    keys: ["fuel", "energy", "fuel network", "inventory", "pricing", "stations", "terminals"],
    answer: [
      "Fuel Network Operations keeps fuel moving from terminals to stations, with live inventory levels for every product at every site.",
      `He worked on ${skillList("energy")}.`,
    ],
    next: ["What projects has he built?", "What's his tech stack?"],
  },
  {
    id: "industries",
    keys: ["industries", "industry", "domains", "domain", "sectors", "which companies", "clients"],
    answer: [
      "Four industries: healthcare, banking, higher education and energy. Client names stay confidential, but Rohit can talk through the work in detail.",
    ],
    next: ["What projects has he built?", "Is he open to new roles?"],
  },
  {
    id: "stack",
    keys: ["tech stack", "stack", "technologies", "languages", "frameworks", "tools", "java", "python", "react", "angular", "spring", "typescript", "sql", "kafka", "cloud", "aws", "gcp", "azure", "kubernetes", "docker", "frontend", "backend", "full stack"],
    answer: [
      "Languages: Java, Python, TypeScript and SQL.",
      "Backend: Spring Boot, FastAPI, Django, REST and gRPC. Front end: React, Angular and Vue. Data: PostgreSQL, Redis, Kafka and RabbitMQ. Cloud: AWS, GCP, Azure, Kubernetes and Docker.",
    ],
    next: ["Does he build with AI?", "What are his strengths?"],
  },
  {
    id: "ai",
    keys: ["ai", "artificial intelligence", "llm", "llms", "agents", "agent", "rag", "machine learning", "ml", "genai", "gen ai", "copilot", "claude", "cursor", "mcp", "embeddings", "vector"],
    answer: [
      "Yes. Rohit builds agents that plan and call tools, RAG over trusted documents, embeddings and vector search, and MCP servers that connect models to real systems.",
      "He ships with Claude Code, Cursor and GitHub Copilot, and keeps it safe with evals before release, guardrails on actions, cited answers and human approval for risky steps.",
    ],
    next: ["What is Break my system?", "What's his tech stack?"],
  },
  {
    id: "strengths",
    keys: ["strengths", "strong", "good at", "best at", "why hire", "why should", "stand out", "unique", "value"],
    answer: [
      "He breaks tricky problems into simple, testable steps, designs systems that grow only when they have to, and knows distributed systems: consensus, events and retries.",
      "He's moved across four industries without a reset, adapts to whatever stack a team uses, and owns his work in production end to end.",
    ],
    next: ["How does he work with teams?", "Is he open to new roles?"],
  },
  {
    id: "soft",
    keys: ["team", "teams", "collaboration", "collaborate", "communication", "leadership", "mentor", "mentoring", "agile", "stakeholders", "soft skills", "work with"],
    answer: [
      "He works directly with operations, product and business leaders to turn their problems into clear technical plans, leads design reviews and documents decisions.",
      "He mentors newer engineers through code review and pairing, and explains technical risk in plain language.",
    ],
    next: ["What are his strengths?", "Is he open to new roles?"],
  },
  {
    id: "security",
    keys: ["security", "secure", "compliance", "audit", "regulated", "pci", "hipaa", "privacy"],
    answer: [
      "Payments, prescriptions and student records taught him to design for security and compliance from the start: least-privilege access, audit trails and systems that recover on their own.",
    ],
    next: ["Tell me about the payments platform", "What are his strengths?"],
  },
  {
    id: "lab",
    keys: ["break my system", "sandbox", "lab", "system design", "distributed", "failover", "simulation", "leader election", "raft", "quorum", "canary"],
    answer: [
      "Break my system is a live sandbox on the Home page: a load balancer, autoscaled app servers, a cache, a write queue and a three-node database cluster.",
      "You can spike the traffic, kill the database leader, split the network or ship a bad release, and an on-call AI agent works through each incident step by step.",
    ],
    next: ["Does he build with AI?", "What's his tech stack?"],
  },
  {
    id: "education",
    keys: ["education", "degree", "masters", "master's", "ms", "study", "studied", "graduate", "school", "university did"],
    answer: ["Rohit has a Master of Science in Computer Science."],
    next: ["How much experience does he have?", "What's his tech stack?"],
  },
  {
    id: "open",
    keys: ["open to", "available", "availability", "looking for", "job", "jobs", "hire", "hiring", "role", "roles", "opportunity", "opportunities", "position", "full time", "contract", "notice"],
    answer: [
      "Yes, Rohit is open to software engineering roles.",
      "If you're hiring, I can take the role details and your contact, and he'll reach out to you.",
    ],
    next: ["I'm hiring for a position", "Leave my details"],
  },
  {
    id: "contact",
    keys: ["contact", "email", "phone", "reach", "call", "connect", "get in touch", "linkedin", "number"],
    answer: [`You can email Rohit at ${site.email} or call ${site.phone}. Or leave your details here and he'll reach out.`],
    next: ["Leave my details", "Copy email"],
  },
  {
    id: "resume",
    keys: ["resume", "cv", "résumé"],
    answer: ["Rohit shares his resume directly. Leave your details or email him and he'll send it over."],
    next: ["Leave my details", "Copy email"],
  },
  {
    id: "hobbies",
    keys: ["hobbies", "hobby", "free time", "outside work", "interests", "fun", "cars", "coffee", "caffeine", "beyond code", "personal"],
    answer: [
      "Outside work he drives and dreams about fast cars: BMW M5 and M8, the G-Wagen and the McLaren Senna.",
      "He runs on caffeine, new skills and new AI tools. His take: great cars and great software are built the same way.",
    ],
    next: ["What does Rohit work on?", "What are his strengths?"],
  },
  {
    id: "site",
    keys: ["this site", "this website", "portfolio built", "how was this", "built this", "astro", "website made"],
    answer: [
      "This site is built with Astro and TypeScript, styled with hand-written CSS and design tokens, animated with GSAP and Lenis, and deployed on Netlify.",
    ],
    next: ["What is Break my system?", "What's his tech stack?"],
  },
  {
    id: "sunny",
    keys: ["who are you", "what are you", "are you a bot", "are you ai", "sunny", "your name"],
    answer: ["I'm Sunny, Rohit's assistant on this site. I answer questions from his portfolio and pass messages to him."],
    next: SUGGESTIONS,
  },
  {
    id: "hello",
    keys: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "yo"],
    answer: ["Hi! Ask me anything about Rohit's work, skills or experience."],
    next: SUGGESTIONS,
  },
  {
    id: "thanks",
    keys: ["thanks", "thank you", "great", "awesome", "cool", "perfect", "ok", "okay", "bye"],
    answer: ["Happy to help. If you'd like Rohit to follow up, leave your details and he'll reach out."],
    next: ["Leave my details", "What projects has he built?"],
  },
];

/** Questions that are about Rohit but not answered on this site. */
export const PRIVATE_KEYS = [
  "salary", "pay", "compensation", "rate", "ctc", "visa", "sponsorship", "h1b", "green card", "citizen",
  "location", "where does he live", "where is he", "based", "relocate", "relocation", "remote", "onsite", "hybrid",
  "age", "how old", "married", "family", "address",
];
