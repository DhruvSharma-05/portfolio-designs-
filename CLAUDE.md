# CLAUDE.md

Photographer portfolio — a dark, type-led single-page site (React 19 + Vite,
deployed on Vercel). Studio brand **Crafted & Captured**, photographer **Viraj**.

## Photos come from Contentful (build-time sync)

Real Work/Gallery/Portrait photos are pulled from **Contentful** at **build
time** by [scripts/sync-contentful.mjs](scripts/sync-contentful.mjs) — runs
automatically before `npm run build` (the `prebuild` script) and on demand
via `npm run sync`. The script optimizes images to WebP under
`public/photos/` and writes `src/photos.manifest.json`, which `src/data.js`
reads (falling back to `picsum.photos` placeholders when the manifest is
empty). The live site is 100% static; nothing hits Contentful at runtime.

The `collection` field also drives **photography projects**: any value
other than `work`/`gallery`/`portrait` (e.g. `wildlife`, `traditional`,
`modern`) is treated as its own project collection. The sync groups those
photos under `public/photos/projects/<slug>/`, lists them in the manifest's
`projectPhotos`, and builds one entry per collection in `photoProjects`.
`data.js` exposes them as `PHOTO_PROJECTS`, which drives the home
photography cards, the `/photography` stack + hero, and each
`/photography/:slug` gallery view (grid + roll + lightbox of that
collection). `order` controls both the collection sort and the photo sort
within it.

- **Content type:** `Photo` — fields `title`, `collection` (`work` |
  `gallery` | `portrait` | any project-collection name, e.g. `wildlife`),
  `order` (int, controls sort), `image` (media, one file).
  `location`/`year`/`role` were dropped from the model, so those detail
  rows render blank for now (the pages hide empty rows) — add the fields
  back later if wanted. The EXIF technical line (`35mm · f/8 · 1/500`) is
  still read automatically from the uploaded file, same as before.
- **Auth:** Content Delivery API only (read-only, published entries) —
  `CONTENTFUL_SPACE_ID` + `CONTENTFUL_ACCESS_TOKEN` (+ optional
  `CONTENTFUL_ENVIRONMENT`, default `master`). No Google API involved.
- **Config** lives in `.env` (git-ignored); `.env.example` is the committed
  template. On Vercel, the same vars go in Project Settings → Environment
  Variables; the existing **Deploy Hook** URL still triggers a rebuild after
  changing photos. Wire a **Contentful webhook → that Deploy Hook** to make
  publishing (new photos *and* new collections) auto-deploy — full steps in
  [PRODUCTION.md](PRODUCTION.md) → "Auto-publishing".
- **Google Drive is fully removed.** The admin panel, the `/client`
  delivery area, the entire `api/` serverless backend, and
  `scripts/sync-drive.mjs` were all deleted — the site is now a pure static
  portfolio. `googleapis` / `archiver` / `nodemailer` are gone from deps.

## Production readiness & scaling

See [PRODUCTION.md](PRODUCTION.md) for the high-traffic/scalability notes
(responsive images, three.js bundle, removing picsum/Google-Fonts runtime deps,
cache headers, Vercel plan) and the pre-launch gap list (content, SEO, contact
form, 404, analytics, deploy hook).

## Design projects (Figma prototypes)

`WEB_PROJECTS` in [src/data.js](src/data.js) holds the four design projects
(TrackHer, WingWise, MOMents, ArtAsta). Each has `embed: true` + a Figma
prototype `href`. The grid/home cards render a **live Figma preview** inside
the card (an iframe, `pointer-events: none`, so the card stays a link), and
the detail page (`/design/:slug`) embeds the **interactive** prototype via
`figmaEmbed(href)` — see `.figbox` / `.figma-embed` CSS. No screenshots are
stored; `intro`/`note`/`role`/`year` are placeholder copy awaiting the real
brief. The prototypes must be link-shared "Anyone with the link → view" for
the embeds to render.

## Commands

```bash
npm run dev      # local dev server (HMR)
npm run sync     # pull + optimize Contentful photos → manifest
npm run build    # prebuild sync, then vite build → dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```
