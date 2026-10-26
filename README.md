# Rohit Annavarapu · Portfolio

Personal site of a full stack software engineer. A cursor-lit home office, an API you can query, a live system you can try to break, projects by industry, and a short story about cars and caffeine.

**Live:** https://rohitannavarapu.netlify.app

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 5](https://astro.build), static output |
| Language | TypeScript for data, config and page scripts |
| Styling | Plain CSS with design tokens (no UI library) |
| 3D | three.js scenes per page, lazy-loaded and paused off screen |
| Motion | GSAP + ScrollTrigger + SplitText, Lenis smooth scroll, View Transitions API |
| Type | Schibsted Grotesk (display), Geist (text), Geist Mono (labels and data), self-hosted via Fontsource |
| Forms | Netlify Forms (`lead` and `sunny`) |
| Hosting | Netlify, deployed on every push to `main` |

## Run it

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview
```

## Structure

```
src/
  components/   one file per section (Home, Work, Beyond, Strengths, Contact) plus mocks and the Badge
  data/         typed content: projects, skills per project, site details
  layouts/      the HTML shell and meta tags
  scripts/      page behaviour as ES modules (router, cursor, sandbox, Sunny, …)
  styles/       tokens.css (design system) and one stylesheet per area
public/         favicon, share image, robots.txt
```

## Interaction details

- **Command menu:** Ctrl/⌘ K jumps to any page, runs a sandbox scenario, copies contact details or opens Sunny. `G` then `H/W/B/S/C` jumps between pages.
- **Sunny:** a floating assistant on every page (press `/`). It answers questions about Rohit from `src/data/knowledge.ts`, hands anything else to email or the details form, and collects hiring or project leads.
- **Motion:** split-line title reveals, staggered card entrances, mock parallax, magnetic buttons and a pointer spotlight. All of it switches off under `prefers-reduced-motion`.

## 3D

Each page has its own scene in `src/three/`, loaded on demand (three.js only downloads when WebGL is available and motion is welcome):

| Page | Scene |
| --- | --- |
| Home | `room.ts`: the home office in 3D. A lamp follows the cursor, scrolling raises the sun through the blinds, he turns and waves when you point at him |
| Break my system | `cluster.ts`: the live simulation drawn as glowing nodes with packets in flight, read from the same state as the 2D map |
| Beyond Code | `car.ts`: a sports car on a night road; the camera swings from top-down to a chase view as you scroll |
| Work, Skills, Strengths, Contact | `field.ts`: glass shards, a node network and a rolling point-wave behind the content |

`scripts/depth.ts` adds CSS 3D: tilting project cards and car tiles, and the Skills badges as a draggable globe. Scenes pause when off screen, use a lighter quality tier on phones, and are skipped entirely under `prefers-reduced-motion`, where the 2D versions remain.

## Design system

`src/styles/tokens.css` holds every colour, type size, space step and radius. One warm accent (the lamp light) runs through the whole site; each page keeps its own zone colour (teal for Projects, navy for Skills). Sections share one header pattern: a mono meta line, a display title and a lead.

## Break my system

The sandbox on Home simulates a small production system: load balancer, autoscaled app servers, cache, write queue and a three-node database cluster with leader election and quorum. Visitors can trigger a traffic spike, kill the leader, split the network or ship a bad release, and an on-call AI agent works through each incident step by step (plan, tool call, result, guardrail, done). It runs entirely in the browser.

## Forms

Every submission goes two ways: Netlify Forms (stored under **Forms** in the dashboard) and an email to Rohit through FormSubmit (`site.emailRelay` in `src/data/site.ts`), with every field in a table and Reply-To set to the visitor. Each submission includes what the visitor typed plus visit context (time on site, pages viewed, referrer, time zone, device).
