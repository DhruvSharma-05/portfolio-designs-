# Production Readiness & Scaling Notes

Status of the portfolio (React 19 + Vite, static on Vercel). Public
Work/Gallery/Portrait photos sync from **Contentful** at build time
(`scripts/sync-contentful.mjs`); Google Drive is used only for `/admin`-authored
project metadata and the private client-delivery folders (`scripts/sync-drive.mjs`,
`api/`). Two parts: **scaling under high traffic** (technical) and **pre-launch
gaps** (content/SEO/ops). Mirrors the working todo list.

---

## High-traffic / scalability (technical)

**Headline: the architecture already scales.** It's a static site on Vercel's
CDN — no server, no database, no per-request compute (the one exception is
`/api/download`, the client-delivery ZIP endpoint, which is genuinely
per-request — see its own section below). Traffic hits cached edge files; the
Contentful/Drive syncs run at build time, never in the page request path.

Done:

1. **Responsive images.** Every real `<img src={img(...)}>` call site now also
   ships `srcSet`/`sizes` (`src/data.js`'s `srcSet(seed)` sits next to `img()`),
   so phones fetch the `sm` WebP variant instead of always the desktop size.
2. **Three.js chunk gated before fetch, not after.** `HeroCanvas` and
   `DistortImage` were already code-split, but were fetched for every visitor
   regardless of device and only decided *after* loading whether to render.
   `heavyVisualsAllowed()` (`src/data.js`, next to `prefersReduced`) is now
   checked at the call site in `Home.jsx`/`Photography.jsx` *before* the lazy
   `import()` runs — touch devices, `prefers-reduced-motion`, and viewports
   under 768px never request the chunk (881 KB / 234 KB gzip, the largest in
   the app) at all.
3. **Self-hosted fonts.** Inter + IBM Plex Mono are `@fontsource` packages
   imported in `src/main.jsx`, not a render-blocking `@import` to
   `fonts.googleapis.com`.
4. **Cache-Control for `/photos`.** `vercel.json` sets
   `public, max-age=86400, stale-while-revalidate=604800` — same-day repeat
   visits are instant. Not a full year + `immutable`: filenames are seed-keyed,
   not content-hashed, so a photo swapped under the same seed needs to become
   visible again within a day, not a year.
5. **404 route + app-level error boundary.** `App.jsx` has a catch-all
   `path="*"` → `src/pages/NotFound.jsx`, and `src/ErrorBoundary.jsx` wraps the
   routed content — a render error or a failed lazy-chunk load (e.g. a stale
   chunk URL after a redeploy) now shows a "reload" screen instead of a blank
   page. Keyed on the route so navigating away also recovers it.

Not done / narrower than it looks:

6. **`picsum.photos` is mostly gone from the hot path, but not entirely.**
   Work, Gallery, Photography, and the About portrait are all real synced
   photos now. The one remaining live picsum path is `/design` and
   `/design/:slug` — their placeholder cover/screenshot images
   (`WEB_PROJECTS_FALLBACK` in `src/data.js`), because no real web projects
   have been published from `/admin` yet. Resolves itself once real projects
   are published; not worth building throwaway local placeholder assets for
   content that's explicitly temporary.
7. **Vercel plan / bandwidth.** Hobby (free) caps ~100 GB/month; unoptimized
   images + high traffic will throttle or bill. High traffic ⇒ Pro plan, or
   put Cloudflare in front. `api/download.js`'s `maxDuration: 60` in
   `vercel.json` also needs a plan that actually allows 60s functions — check
   this before relying on it for a large real-world shoot.

> Where scale *would* actually add real capacity-planning work: the
> client-delivery ZIP endpoint (`api/download.js`) is a genuine per-request
> serverless function, not a static file — see its own caps
> (`DOWNLOAD_MAX_FILES`/`DOWNLOAD_MAX_MB` in `.env.example`) and the risks
> noted in `README.md`'s "Client downloads" section.

---

## Pre-launch gaps (content / SEO / ops)

### 🔴 Launch blockers
- **Placeholder content** throughout `src/data.js`: `email: hello@yourstudio.com`,
  `city: "Your City"`, placeholder `QUOTES`/`METRICS`, lorem-ish notes/bios.
- **No real contact method** — everything is a `mailto:` link. Add a booking/
  enquiry form (Formspree or a Vercel serverless endpoint).
- **Social preview broken** — `public/og.svg` is SVG; social platforms need a
  1200×630 **PNG/JPG**. OG/title tags still generic.

### 🟠 Important (discoverability + trust)
- **Per-route SEO meta** — one static `<title>` in `index.html`; all routes share
  it. Add dynamic `<title>`/description + canonical + JSON-LD (Photographer).
- **`robots.txt` + `sitemap.xml`** — none in `public/`.
- **Analytics** — none (Vercel Analytics or Plausible).
- **Auto-update** — the Vercel Deploy Hook (`VERCEL_DEPLOY_HOOK_URL`) triggers a
  rebuild; wiring a Contentful webhook straight to it makes photo publishing
  fully automatic (see `CLAUDE.md`).

### 🟡 Polish / later
- Real web design projects published from `/admin` (closes gap #6 above).
- Privacy policy / cookie notice — required once analytics or a form is added.
- Accessibility pass (gallery images are decorative `alt=""`; run Lighthouse).
