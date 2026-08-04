# CLAUDE.md

Photographer portfolio — a dark, type-led single-page site (React 19 + Vite,
deployed on Vercel). Studio brand **Crafted & Captured**, photographer **Viraj**.

## Copy rule: no filler text — this one is not negotiable

**Never add words that don't earn their place.** No decorative kickers, no
mono-caps labels that repeat the heading right below them, no taglines,
status lines ("Booking 2026"), city stamps, or numbered `01 ·` prefixes
unless the visitor genuinely needs them there.

- If a word appears twice on one screen, the second one goes.
- If removing a line costs the visitor nothing, remove it.
- A card, header or section gets its name and the one thing you can act
  on — nothing more.
- The same goes for facts (city, year, role): state them once, in the one
  place they're actually useful (footer, About, contact), never as
  atmosphere sprinkled across every section.

When in doubt, leave it out and say so — adding filler back is one line;
the client has repeatedly had to ask for it to be stripped.

## Type rule: headings lead — also not negotiable

**A heading is never dimmer than the text under it.** The site's `.mono`
label style is `var(--dim)` by default, and that default kept getting
applied to *section headings*, so the cards below out-shouted the section
they belonged to. That is backwards, everywhere, always.

- If a mono label **is** the section's heading (no `h1`/`h2` above it),
  it gets `var(--ink)` — brightness only, **never a weight bump**. The
  mono face at 11px thickens badly when bolded and reads as shouting. The
  shared list lives in the "HEADINGS LEAD" block next to `.mono` in
  [src/data.js](src/data.js) — add new section labels there, don't
  re-style them per page.
- A kicker that sits *above* a real headline (`.about-kicker`,
  `.dz-kicker`) stays dim — there the `h1` is what leads.
- Item titles under a section label sit one step back
  (`color-mix(… var(--ink) 72% …)`), so the eye reads section → items.
- Before shipping any new block, check the visual order top-down: heading
  brightest, then its items, then meta. If something below the heading
  pops harder, fix the heading — don't dim the content further.
- **The project hero frame is centred**, not hard-left. `.pj-hero` takes
  the photo's own aspect ratio, so a portrait is only about a third of the
  column — left-aligned it leaves a dead void down the right. It is
  centred via `margin-inline: auto` and must stay that way for every
  collection, portrait or landscape, existing or new.

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

- **Every collection wants at least one landscape photo.** The wide
  frames (home hero, the `/photography` hero slideshow, the collection
  cards) all pick a collection's first landscape frame via
  `projectCover` / `isLandscape` — a portrait in a ~2.4:1 banner only
  shows about a third of itself. A collection uploaded as all-portrait
  falls back to its opening frame and gets cropped; nothing in the code
  can fix that, only a wide photo in the set can.
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
- **Google Drive is used for one thing only: client photo delivery,**
  not portfolio content. `/admin` + `/client` + the `api/` serverless
  functions exist and are **client-delivery only** — see
  [CLIENT-DELIVERY-POA.md](CLIENT-DELIVERY-POA.md) and `README.md` →
  "The admin panel". Work/Gallery/Portrait/project photos are never
  touched by `/admin`; they come exclusively from Contentful, above.
  `scripts/sync-drive.mjs` (which used to pull *portfolio* photos from
  Drive) is gone — `googleapis`/`archiver`/`nodemailer` remain in deps
  only for the delivery feature.

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
