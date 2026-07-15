# Photographer Portfolio

A dark, minimal, type-led single-page portfolio. One near-black base, one
accent at a time — the switcher in the bar swaps only the accent colour, so
the page stays calm while still feeling alive.

Built with **React 19 + Vite + React Router**, enhanced with:

- **React Router** — Home, an About page, and a per-project detail page at
  `/work/:seed`, tied together with an **aperture page transition**: an accent
  "shutter" irises closed over the screen, the route swaps while it's covered,
  then it opens onto the next page. Reimplemented in React (rather than Barba,
  which is built for non-React multi-page sites) via a small `go()` in the shell.
- **Lenis** — smooth (inertia) scrolling that smooths the *native* scroll, so
  `position: sticky` keeps working for the bar and the stacking work cards.
- **GSAP + ScrollTrigger** — scroll-driven reveals, the reading-progress bar,
  the metric count-ups, the **pinned horizontal gallery**, the aperture
  transition, and the magnetic email link. Wired through `@gsap/react`'s
  `useGSAP` hook so every animation and ScrollTrigger is torn down on
  unmount / navigation.
- **Motion (Framer Motion)** — page enter animations, the accent-chip spring
  press, and the testimonial crossfade (`AnimatePresence`).
- **Custom cursor** — a blend-mode follower that grows into a "View" label over
  the work cards. Fine-pointer + motion-allowed only; touch and reduced-motion
  keep the native cursor.
- **React Three Fiber (Three.js)** — an accent-tinted particle field behind the
  hero name, plus a **WebGL hover-ripple** on the work photos. Both **code-split**
  into a shared Three.js chunk so nothing 3D blocks first paint, and both degrade
  gracefully (the ripple keeps a real `<img>` underneath, so if WebGL or a
  texture fails the photo still shows).

## Structure

```text
src/
  main.jsx          BrowserRouter + mount
  App.jsx           shell: theme, Lenis, progress bar, aperture transition, nav, routes
  context.js        AppContext (theme + go())
  data.js           placeholder content + the full CSS + prefersReduced()
  ui.jsx            TLink (transition link), Reveal, Counter, Cursor
  HeroCanvas.jsx    code-split R3F particle hero
  DistortImage.jsx  code-split WebGL hover-ripple photo (img fallback underneath)
  pages/Home.jsx    long-scroll home + pinned horizontal gallery
  pages/WorkDetail.jsx   /work/:seed project page (prev/next)
  pages/About.jsx   /about
public/
  favicon.svg  og.svg  _redirects   (Netlify SPA fallback)
vercel.json                         (Vercel SPA fallback)
```

Every motion effect respects `prefers-reduced-motion`: Lenis is skipped (native
scroll is left untouched), the particle field renders a single static frame,
and the GSAP reveals/parallax fall back to the content's final state.

## Run

```bash
npm install
npm run dev      # local dev server (HMR)
npm run build    # production build → dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```

**Deploy note:** this is a client-routed SPA, so the host must serve
`index.html` for unknown paths (SPA fallback) or refreshing `/work/pf-01`
404s. Netlify/Vercel do this automatically; for a plain static host add a
catch-all rewrite to `/index.html`.

## Customising for the client

Content is realistic **placeholder** — search for these to swap in the real
details:

All content lives in `src/data.js`:

| Where | What to replace |
| ----- | --------------- |
| `P` | name, role, email, city |
| `FRAMES` | the work cards + detail pages (title, location, EXIF, note, year, role) |
| `ABOUT` | About-page bio, approach, timeline, portrait |
| `METRICS`, `QUOTES`, `SHOTLIST`, `TICKER` | numbers, testimonials, services |
| `img()` helper + `seed` values | currently `picsum.photos` — point at real image URLs / local assets |
| `THEMES` | the accent palette offered by the switcher |
| `index.html` | `<title>`, description, and OG/Twitter tags (marked `TODO(client)`) |
| `public/favicon.svg`, `public/og.svg` | the lens mark + social card (export `og.svg` to a 1200×630 PNG for Facebook/Twitter) |

The 3D hero lives in `src/HeroCanvas.jsx` — particle count, size, and drift
speed are all tunable constants at the top of the file.
