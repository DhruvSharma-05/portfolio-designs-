# Production Readiness & Scaling Notes

Status of the portfolio (React 19 + Vite, static on Vercel, build-time Google
Drive photo sync). Two parts: **scaling under high traffic** (technical) and
**pre-launch gaps** (content/SEO/ops). Mirrors the working todo list.

---

## High-traffic / scalability (technical)

**Headline: the architecture already scales.** It's a static site on Vercel's
CDN — no server, no database, no per-request compute. Traffic hits cached edge
files; the Drive sync runs at build time, never in the request path. So high
traffic is about **per-visitor weight, bandwidth cost, and external deps** — not
server capacity. Ranked by impact:

1. **Responsive images (`srcset`/`sizes` + AVIF).** Every `<img>` ships a single
   `src` (no `srcset`), so phones download desktop-sized files. We already emit
   `sm`/`lg` WebP variants — wire them into `srcset`/`sizes` (or use Vercel Image
   Optimization + AVIF). Biggest bandwidth win at scale.
2. **Trim/gate the three.js bundle.** `react-three-fiber` is ~881 KB (234 KB
   gzip) + a ~535 KB main bundle, downloaded and parsed by every visitor. Drop or
   disable the 3D hero + per-card WebGL on mobile/low-end; lazy-load harder.
3. **Remove `picsum.photos` from the production hot path.** Any seed that doesn't
   resolve to a synced photo falls back to picsum (`src/data.js` `img()`) — e.g.
   the About portrait (Portrait folder empty) and likely design/web covers. A
   third-party host can rate-limit under load. All prod images must be local.
4. **Self-host Google Fonts.** `src/data.js` loads fonts via a render-blocking
   CSS `@import` to `fonts.googleapis.com` — an external request on every visit.
   Self-host for speed + reliability.
5. **Error boundary + chunk-load retry + 404 catch-all.** A CDN hiccup that fails
   a lazy chunk, or an unknown URL, currently blanks the whole SPA (`App.jsx` has
   no `*` route). Add a boundary + retry.
6. **Cache-Control for `/photos`.** Hashed JS/CSS get immutable long-cache
   automatically; the image files don't have an explicit header. Add a long-TTL
   `Cache-Control` in `vercel.json` to maximize CDN hit rate.
7. **Vercel plan / bandwidth.** Hobby (free) caps ~100 GB/month; unoptimized
   images + high traffic will throttle or bill. High traffic ⇒ Pro plan, or put
   Cloudflare in front.

> Where scale *would* actually hurt: the deferred **client photo-delivery +
> download** feature (real backend, storage, ZIP downloads). That needs genuine
> capacity planning; the portfolio itself does not.

---

## Pre-launch gaps (content / SEO / ops)

### 🔴 Launch blockers
- **Placeholder content** throughout `src/data.js`: `email: hello@yourstudio.com`,
  `city: "Your City"`, placeholder `QUOTES`/`METRICS`, lorem-ish notes/bios.
- **No real contact method** — everything is a `mailto:` link. Add a booking/
  enquiry form (Formspree or a Vercel serverless endpoint).
- **Social preview broken** — `public/og.svg` is SVG; social platforms need a
  1200×630 **PNG/JPG**. OG/title tags still generic.
- **No 404 page** — `App.jsx` has no catch-all `*` route.
- **Viraj's portrait** missing (Portrait Drive folder empty → placeholder).

### 🟠 Important (discoverability + trust)
- **Per-route SEO meta** — one static `<title>` in `index.html`; all routes share
  it. Add dynamic `<title>`/description + canonical + JSON-LD (Photographer).
- **`robots.txt` + `sitemap.xml`** — none in `public/`.
- **Analytics** — none (Vercel Analytics or Plausible).
- **Auto-update** — set up the Vercel Deploy Hook (+ prod env vars:
  `GOOGLE_API_KEY` and the 3 `DRIVE_*_FOLDER_ID`s) so the client can refresh
  photos and the deployed build actually pulls from Drive.

### 🟡 Polish / later
- Bundle-size trimming (see scaling #2).
- Privacy policy / cookie notice — required once analytics or a form is added.
- Accessibility pass (gallery images are decorative `alt=""`; run Lighthouse).
- Client photo-delivery + download feature (deferred business requirement).
