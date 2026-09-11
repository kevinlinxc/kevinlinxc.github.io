# Kevin Lin — Portfolio

Personal portfolio for Kevin Lin: engineer, digital artist, and musician. The site
is a naturally scrolling project gallery with an ethereal Three.js particle field
behind it, plus dedicated engineering and logbook sections.

## Overview

- `/` — homepage grid of projects with an All / Bad Apple filter.
- `/projects/<slug>` — a page per project.
- `/engineering` — UBC AeroDesign and UBC Rover write-ups.
- `/logbooks` — technical notes, migrated from the previous site.

The project is a React app built with [Vinext](https://www.npmjs.com/package/vinext)
(Next.js-style routing on Vite) and ships as a static export. Styling is Tailwind
CSS v4; the background field is WebGL via Three.js.

Long-form content lives as Markdown in `content/`. A small build step converts it
into the typed module `app/generatedContent.ts` and copies referenced images into
`public/assets/`, so the app can render it without a runtime Markdown dependency.

## Requirements

- Node.js >= 22.13.0
- npm

## Run locally

```bash
npm install
npm run dev
```

The dev server prints the local URL (usually <http://localhost:5173>). The content
build runs automatically first; if you change a file in `content/`, re-run it with:

```bash
npm run content
```

## Build

```bash
npm run build
```

This runs the content build and exports the static site to `dist/client/`. To
preview the production output:

```bash
npm run start
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server. |
| `npm run content` | Regenerate `app/generatedContent.ts` from `content/`. |
| `npm run build` | Content build + static production export. |
| `npm run start` | Preview the built output. |
| `npm run lint` | Lint with oxlint. |
| `npm run format` | Format with oxfmt. |

## Project structure

```
app/            Routes and UI (homepage, projects, engineering, logbooks, field)
content/        Markdown source for engineering and logbooks
scripts/        build-content.mjs — Markdown to generatedContent.ts
public/         Static assets, CNAME, .nojekyll
```

## Deployment

Pushes to `main` are built by `.github/workflows/gh-pages.yml` and published to the
`gh-pages` branch for GitHub Pages at `kevinlinxc.com`.
