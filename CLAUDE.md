# CLAUDE.md

Photographer portfolio — a dark, type-led single-page site (React 19 + Vite,
deployed on Vercel). Studio brand **Crafted & Captured**, photographer **Viraj**.

## Photos come from Contentful (build-time sync)

Real Work/Gallery/Portrait photos are pulled from **Contentful** at **build
time** by [scripts/sync-contentful.mjs](scripts/sync-contentful.mjs) — runs
automatically before `npm run build` (the `prebuild` script, alongside
`sync-drive.mjs`) and on demand via `npm run sync`. The script optimizes
images to WebP under `public/photos/` and writes `src/photos.manifest.json`,
which `src/data.js` reads (falling back to `picsum.photos` placeholders when
the manifest is empty). The live site is 100% static; nothing hits Contentful
at runtime.

- **Content type:** `Photo` — fields `title`, `collection` (`work` | `gallery`
  | `portrait`), `order` (int, controls sort), `image` (media, one file).
  `location`/`year`/`role` were dropped from the model, so those Work-detail
  rows render blank for now — add the fields back later if wanted. The EXIF
  technical line (`35mm · f/8 · 1/500`) is still read automatically from the
  uploaded file, same as before.
- **Auth:** Content Delivery API only (read-only, published entries) —
  `CONTENTFUL_SPACE_ID` + `CONTENTFUL_ACCESS_TOKEN` (+ optional
  `CONTENTFUL_ENVIRONMENT`, default `master`). No Google API involved.
- **Config** lives in `.env` (git-ignored); `.env.example` is the committed
  template. On Vercel, the same vars go in Project Settings → Environment
  Variables; the existing **Deploy Hook** URL still triggers a rebuild after
  changing photos.
- **Drive is not gone** — it still backs `/admin`-authored project metadata
  (`content.json`) and the private client-delivery folder sharing, via
  `scripts/sync-drive.mjs` and `api/`. Only the public Work/Gallery/Portrait
  photo source moved off Drive.

## Production readiness & scaling

See [PRODUCTION.md](PRODUCTION.md) for the high-traffic/scalability notes
(responsive images, three.js bundle, removing picsum/Google-Fonts runtime deps,
cache headers, Vercel plan) and the pre-launch gap list (content, SEO, contact
form, 404, analytics, deploy hook).

## Not yet built

A separate **private client-delivery** feature (Viraj uploads his clients'
shoots; those clients log in and download) was discussed but deferred. It needs
real auth + private storage — do **not** conflate it with the public portfolio
sync above.

## Commands

```bash
npm run dev      # local dev server (HMR)
npm run sync     # pull + optimize photos (Contentful) and admin projects (Drive) → manifest
npm run build    # prebuild sync, then vite build → dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```
