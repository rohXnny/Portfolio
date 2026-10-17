# Portfolio

Personal portfolio of **Rohit Annavarapu**, Full Stack Software Engineer, covering healthcare, banking, higher education and energy.

**Pages:** Home (with live demos) · Work · Beyond Code · Strengths · Contact

## Tech
- Plain HTML, CSS and JavaScript with no framework and no build step
- Interactive demos: idempotent payments, self-healing order stream, concurrency-safe registration, guarded AI assistant
- Hand-drawn SVG illustrations and scroll-driven animations
- Responsive, keyboard friendly, respects reduced-motion settings
- Deployed on Vercel

## Project structure
```
index.html          page markup
css/base.css        tokens, layout, navigation, cursor
css/<page>.css      one stylesheet per page
js/core.js          shared settings, custom cursor, nav blur, scroll indicator
js/<page>.js        page behaviour
js/main.js          page router
favicon.svg, og-image.png, 404.html, robots.txt
```

## Run locally
Open `index.html` in a browser, or run `npx serve .`

## Contact form and Sunny
Both the **Leave your details** form and **Sunny**, the chat assistant on the Contact page, submit to Netlify Forms (forms named `lead` and `sunny`). Submissions appear under Forms in the Netlify dashboard, and email alerts are set under Project configuration > Notifications. Each submission includes what the visitor typed plus visit context (time on site, pages viewed, referrer, time zone, device).
