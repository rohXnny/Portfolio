# Day 5: redesign + move to Astro

This push replaces the plain HTML files with an Astro + TypeScript project and the refined design. Netlify will build it automatically (`netlify.toml` tells it to run `npm run build` and publish `dist`).

All commands are for **PowerShell**.

## 1. Unzip

Unzip `portfolio-v3.zip` into `C:\Resumes`. Find the folder:

```powershell
Get-ChildItem -Path "C:\Resumes" -Recurse -Directory -Filter "portfolio-v3" -ErrorAction SilentlyContinue | Select-Object FullName
```

Use the **longer** path if two are printed. The steps below assume `C:\Resumes\portfolio-v3\portfolio-v3`.

## 2. Remove the old static files

```powershell
cd C:\Resumes\Portfolio
git pull
git rm -r -q css js index.html 404.html favicon.svg og-image.png robots.txt
git commit -m "chore: remove the static v1 build ahead of the Astro migration"
```

## 3. Copy the new project in

```powershell
Copy-Item -Path "C:\Resumes\portfolio-v3\portfolio-v3\*" -Destination . -Recurse -Force
Copy-Item -Path "C:\Resumes\portfolio-v3\portfolio-v3\.gitignore" -Destination . -Force
git status
```

## 4. Commit in steps

```powershell
git add package.json package-lock.json astro.config.mjs tsconfig.json netlify.toml .gitignore
git commit -m "build: scaffold Astro + TypeScript project with Netlify config"

git add src/styles/tokens.css src/styles/base.css
git commit -m "feat(design): add design tokens, type scale, layout grid and base components"

git add src/data src/layouts src/pages src/components
git commit -m "refactor: rebuild pages as Astro components driven by typed content"

git add src/scripts
git commit -m "refactor: port page behaviour to TypeScript modules with a page event bus"

git add src/styles
git commit -m "style: refine Home, Work, Beyond Code, Strengths and Contact"

git add public README.md
git commit -m "docs: refresh README, favicon and share image"

git status
git push
```

`git status` before the push should say **nothing to commit, working tree clean** (the guide file itself can be left out or deleted).

## 5. Check the deploy

1. Open Netlify → **Deploys**. The new deploy now runs a build (about a minute). It should end in **Published**.
2. Open https://rohitannavarapu.netlify.app and press **Ctrl+Shift+R**.
3. Netlify → **Forms**: you should still see **lead** and **sunny**.

If the deploy fails, open the deploy log and send me the red lines.

## Optional: run it on your computer

Needs Node.js 20 or newer (https://nodejs.org).

```powershell
npm install
npm run dev
```

Then open http://localhost:4321.
