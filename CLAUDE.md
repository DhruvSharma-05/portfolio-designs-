# CLAUDE.md

Photographer portfolio — a dark, type-led single-page site (React 19 + Vite,
deployed on Vercel). Studio brand **Crafted & Captured**, photographer **Viraj**.

## Photos come from Google Drive (build-time sync)

Real photos are pulled from Google Drive at **build time** by
[scripts/sync-drive.mjs](scripts/sync-drive.mjs) — runs automatically before
`npm run build` (the `prebuild` script) and on demand via `npm run sync`. The
script optimizes images to WebP under `public/photos/` and writes
`src/photos.manifest.json`, which `src/data.js` reads (falling back to
`picsum.photos` placeholders when the manifest is empty). The live site is 100%
static; nothing hits Drive at runtime.

- **Client's Google account:** `craftedandcaptured01@gmail.com` — owns the
  Drive folders that hold the portfolio photos.
- **Three folders** (shared "Anyone with the link → Viewer"): **Work** →
  `FRAMES`, **Gallery** → `SHEET`, **Portrait** → `ABOUT.portrait`.
- **Auth:** a Drive-restricted **API key** (`GOOGLE_API_KEY`) — service-account
  keys are blocked on this account by the `disableServiceAccountKeyCreation`
  org policy, so we use an API key against link-shared (public) folders. This is
  fine because portfolio photos are public anyway.
- **Config** lives in `.env` (git-ignored): `GOOGLE_API_KEY` + the three
  `DRIVE_*_FOLDER_ID`s. `.env.example` is the committed template. On Vercel, the
  same vars go in Project Settings → Environment Variables; a **Deploy Hook**
  URL lets the client trigger a rebuild after changing photos.
- **Filename convention** sets captions/order — see the README "Photos from
  Google Drive" section. Work: `NN__Title__Location__Year__Role.jpg`;
  Gallery: `NN-anything.jpg`; Portrait: first image by name.

## Not yet built

A separate **private client-delivery** feature (Viraj uploads his clients'
shoots; those clients log in and download) was discussed but deferred. It needs
real auth + private storage — do **not** conflate it with the public portfolio
sync above.

## Commands

```bash
npm run dev      # local dev server (HMR)
npm run sync     # pull + optimize photos from Drive → manifest
npm run build    # prebuild sync, then vite build → dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```
