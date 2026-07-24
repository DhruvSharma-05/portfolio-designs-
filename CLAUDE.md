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
- **Drive is not gone** — it backs the private client-delivery system only:
  `content.json`'s `clients` list + per-folder link sharing, via `api/` and
  `/admin` ([src/pages/Admin.jsx](src/pages/Admin.jsx)). `/admin` is
  **client-delivery only** now — it does not manage portfolio projects; the
  public Work/Gallery/Portrait photo source moved fully off Drive onto
  Contentful. `scripts/sync-drive.mjs` still reads `content.json`'s
  `photoProjects`/`webProjects` keys for backward compatibility, but nothing
  writes to them anymore — they're frozen at whatever they already were.

## Production readiness & scaling

See [PRODUCTION.md](PRODUCTION.md) for the high-traffic/scalability notes
(responsive images, three.js bundle, removing picsum/Google-Fonts runtime deps,
cache headers, Vercel plan) and the pre-launch gap list (content, SEO, contact
form, 404, analytics, deploy hook).

## Client delivery is built, not deferred

Viraj uploads a finished shoot to Drive, then in `/admin` creates/picks the
delivery folder, shares it, and sends the client a code (WhatsApp copy-paste
or SMTP email). The client opens `/client/<code>` to download a ZIP or open
the folder in Drive directly. Lookups (`api/client.js`, `api/download.js`)
read Drive live at request time — no rebuild needed for any of this. See
`README.md`'s "The admin panel" and "Client downloads" sections for the full
flow and security model.

## Commands

```bash
npm run dev      # local dev server (HMR)
npm run sync     # pull + optimize photos (Contentful) and admin projects (Drive) → manifest
npm run build    # prebuild sync, then vite build → dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```
