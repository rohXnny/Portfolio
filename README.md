# Rohit Annavarapu · Portfolio

Personal site of a full stack software engineer. A cursor-lit home office, an API you can query, a live system you can try to break, projects by industry, and a short story about cars and caffeine.

**Live:** https://rohitannavarapu.netlify.app

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 5](https://astro.build), static output |
| Language | TypeScript for data, config and page scripts |
| Styling | Plain CSS with design tokens (no UI library) |
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

## Design system

`src/styles/tokens.css` holds every colour, type size, space step and radius. One warm accent (the lamp light) runs through the whole site; each page keeps its own zone colour (teal for Projects, navy for Skills). Sections share one header pattern: a mono meta line, a display title and a lead.

## Break my system

The sandbox on Home simulates a small production system: load balancer, autoscaled app servers, cache, write queue and a three-node database cluster with leader election and quorum. Visitors can trigger a traffic spike, kill the leader, split the network or ship a bad release, and an on-call AI agent works through each incident step by step (plan, tool call, result, guardrail, done). It runs entirely in the browser.

## Forms

Both forms post to Netlify Forms. Submissions appear under **Forms** in the Netlify dashboard; email alerts are set in **Project configuration → Notifications**. Each submission includes what the visitor typed plus visit context (time on site, pages viewed, referrer, time zone, device).
