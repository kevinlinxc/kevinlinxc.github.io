# Kevin Lin - Portfolio

Personal portfolio for Kevin Lin: engineer, digital artist, and musician. The site
is a naturally scrolling project gallery with an ethereal Three.js particle field
behind it, plus dedicated engineering and writing sections.

## Overview

- `/` - homepage grid of projects with an All / Bad Apple filter. Cards link out to
  the work itself; only the card's action link is clickable (the rest is 3D-mode drag
  space), and there are no per-project pages.
- `/engineering` - UBC AeroDesign and UBC Rover write-ups.
- `/writing` - technical notes, migrated from the previous site.

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
| `npm run start` | Build and preview the static export with Wrangler. |
| `npm run deploy` | Build and deploy static assets to Cloudflare. |
| `npm run lint` | Lint with oxlint. |
| `npm run format` | Format with oxfmt. |

## Project structure

```
app/            Routes and UI (homepage, engineering, writing, field)
content/        Markdown source for engineering and writing
scripts/        build-content.ts - Markdown to generatedContent.ts
public/         Static assets, CNAME, .nojekyll
```

## Deployment

Cloudflare deployment uses the root `wrangler.static.jsonc` to build and upload only
`dist/client/`. Authenticate once with `npx wrangler login`, then deploy with:

```bash
npm run deploy
```

Wrangler runs `npm run build` automatically. To validate without publishing:

```bash
npm run deploy -- --dry-run
```

Keep `output: 'export'` in `next.config.ts` and `vinext()` in `vite.config.ts`.
This static deployment does not need `@vinext/cloudflare`, a Worker `main`
entrypoint, KV namespaces, or an Images binding. Keep the non-default filename:
Vinext beta.5 treats a root `wrangler.jsonc` as a server deployment even for static
exports. The npm scripts select `wrangler.static.jsonc` explicitly. Do not use a server deployment
initializer for this site. The generated `dist/server` directory is not deployed.

The existing `.github/workflows/gh-pages.yml` still publishes pushes to `main`
to GitHub Pages. Disable that workflow when completing the domain migration.
