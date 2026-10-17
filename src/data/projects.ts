export type Shape = "hex" | "circle" | "shield" | "sq";

export interface Skill {
  /** Full name, shown large when the badge is selected. */
  name: string;
  /** Short code drawn inside the badge. Use \n for a two-line code. */
  code: string;
}

export type Industry = "health" | "bank" | "edu" | "energy";

export interface Project {
  id: Industry;
  industry: string;
  title: string;
  /** Light cards sit on a white surface; dark cards on ink. */
  surface: "light" | "dark";
  skills: Skill[];
}

/** Badge outlines cycle in this order so neighbours never repeat. */
export const SHAPE_ORDER: Shape[] = ["hex", "circle", "shield", "sq"];

export const projects: Project[] = [
  {
    id: "health",
    industry: "Healthcare",
    title: "Pharmacy Order Tracking",
    surface: "dark",
    skills: [
      { name: "Customer collaboration", code: "CX" },
      { name: "AI agents", code: "Agent" },
      { name: "Full stack", code: "Full\nStack" },
      { name: "System design", code: "Design" },
      { name: "Observability", code: "Obs" },
      { name: "LLMs", code: "LLM" },
      { name: "AI tools", code: "AI" },
    ],
  },
  {
    id: "bank",
    industry: "Banking",
    title: "Card Payments Platform",
    surface: "light",
    skills: [
      { name: "Security", code: "Sec" },
      { name: "Observability", code: "Obs" },
      { name: "Logging and tracing", code: "Logs" },
      { name: "Compliance and audit", code: "Audit" },
      { name: "Microservices and APIs", code: "API" },
      { name: "Event streaming", code: "Event" },
      { name: "High availability", code: "HA" },
      { name: "Automated testing", code: "Test" },
    ],
  },
  {
    id: "edu",
    industry: "Higher Education",
    title: "Course Registration Portal",
    surface: "light",
    skills: [
      { name: "Full stack", code: "Full\nStack" },
      { name: "Scaling for peak traffic", code: "Scale" },
      { name: "Single sign-on", code: "SSO" },
      { name: "Accessibility", code: "A11y" },
      { name: "User experience", code: "UX" },
      { name: "Data integration", code: "Data" },
      { name: "Stakeholder collaboration", code: "Team" },
    ],
  },
  {
    id: "energy",
    industry: "Energy",
    title: "Fuel Network Operations",
    surface: "dark",
    skills: [
      { name: "Full stack", code: "Full\nStack" },
      { name: "Real-time inventory", code: "Live" },
      { name: "Pricing systems", code: "Price" },
      { name: "System integrations", code: "Sync" },
      { name: "APIs", code: "API" },
      { name: "Databases", code: "SQL" },
      { name: "Dashboards and reporting", code: "BI" },
    ],
  },
];

/** Career order, oldest first, for the Strengths timeline. */
export const careerOrder: Industry[] = ["energy", "edu", "bank", "health"];
