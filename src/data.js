/* ==================================================================
   DATA + STYLES — pure constants (no React components), so this file
   stays HMR-clean and is safe to import anywhere.

   PLACEHOLDER CONTENT: swap these for the client's real details.
   ================================================================== */

import manifest from "./photos.manifest.json";
import webCovers from "./web-covers.json";

/* Read the motion preference live so an OS change is respected on the
   next mount. Single source of truth, shared by every animated piece. */
export const prefersReduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Is a precise pointer available at all? `any-pointer`, not `pointer`:
   `pointer` describes the *primary* input, and a Windows laptop with a
   touchscreen reports that as coarse even with a mouse plugged in — so
   testing `pointer: fine` silently switches cursor-driven effects off on
   an ordinary desktop. `any-pointer` asks the question we actually mean. */
export const finePointer = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(any-pointer: fine)").matches &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Gate for the three.js-backed effects (DistortImage, ParticleSphere) —
   checked BEFORE the lazy import() is triggered, not after, so touch
   devices, reduced-motion, and narrow viewports never fetch the chunk
   (the single largest in the app) at all, rather than fetching it and
   then declining to render. Same pointer question as above, plus a width
   floor so phones and small tablets are excluded regardless. */
export const heavyVisualsAllowed = () =>
  finePointer() && matchMedia("(min-width: 768px)").matches;

export const P = {
  name: "Crafted & Captured",   // the studio, shown in the masthead bar
  photographer: "Viraj Mehta",  // the person the home page is about
  photoBrand: "Lensofviraj",    // the photography practice — /photography
  designBrand: "Design & Build",// the web practice — /design
  role: "Photographer & Designer",
  email: "virajmehta@outlook.in",
  email2: "virajmehta227@gmail.com", // secondary contact
  phone: "+1 (672) 968-9680",
  city: "Vancouver",
  region: "British Columbia, Canada",
  socials: [
    { k: "Instagram", v: "@lensofviraj", href: "https://www.instagram.com/lensofviraj/" },
    { k: "Instagram (personal)", v: "@virajmehtaxo", href: "https://www.instagram.com/virajmehtaxo/" },
    { k: "LinkedIn", v: "virajmehtaa", href: "https://www.linkedin.com/in/virajmehtaa" },
  ],
};

/* ==================================================================
   INTRO — the home page introduces the person, not one of the crafts.

   Viraj runs two practices in parallel: photography as Lenzofviraj,
   and web design & build. A visitor landing cold should learn who he
   is, what he does, and what they walk away with — then choose a
   door. Each craft keeps its own page.

   PLACEHOLDER COPY: replace with Viraj's own words.
   ================================================================== */
export const INTRO = {
  lead: "Engineering taught him how things work. Design and photography taught him how they feel.",
  body: [
    "Viraj Mehta is a designer and photographer based in Vancouver. With a background in Computer Engineering and Web & Mobile Application Design, he blends technology, creativity and storytelling — designing intuitive digital products and capturing moments through photography.",
    "Two practices, one pair of hands. Under Lensofviraj he shoots portraits, events and visual stories; as a designer he draws and ships the sites and apps those pictures end up on — so nothing gets cropped, re-shot, or lost in a handover between two strangers.",
  ],
  /* the two doors — the practice cards under the home hero */
  does: [
    {
      k: "Photography",
      brand: "Lensofviraj",
      to: "/photography",
      v: "Portraits, events and visual stories. Shot, selected and graded as one body of work.",
    },
    {
      k: "Web design & build",
      brand: "Design & Build",
      to: "/design",
      v: "Apps and sites designed and shipped end to end — UI/UX through to a live, fast, editable page.",
    },
  ],
  /* what a client actually walks away with */
  offer: [
    { k: "A finished set", v: "Graded, consistent, delivered in web and print sizes. Not a folder of raws." },
    { k: "A site that ships", v: "Designed, built and deployed — not a mockup you then have to find a developer for." },
    { k: "One point of contact", v: "The person who shot it is the person who built it. No handover, no translation loss." },
    { k: "Something you can edit", v: "You leave with the source file and a way to change the words yourself." },
  ],
};

/* --- real photos (from the Contentful sync) -------------------------
   scripts/sync-contentful.mjs writes photos.manifest.json at build time.
   Every synced photo is keyed by seed → { sm, lg } local WebP URLs.
   When the manifest is empty (no credentials / fresh clone) we fall
   back to seeded picsum placeholders so the site still renders. */
const PHOTOS = new Map();
for (const p of manifest.work || []) PHOTOS.set(p.seed, p);
for (const p of manifest.gallery || []) PHOTOS.set(p.seed, p);
/* legacy: photos that were placed into projects by hand — kept so any
   existing manifest entries still resolve. Normally empty. */
for (const p of manifest.projectPhotos || []) PHOTOS.set(p.seed, p);
if (manifest.portrait) PHOTOS.set(manifest.portrait.seed, manifest.portrait);
/* design-project cover screenshots (scripts/shoot-figma.mjs). Kept in its
   own file so the Contentful sync, which rewrites the manifest, never
   clobbers them. Empty [] until `npm run shoot` has been run — the design
   cards fall back to the live Figma embed while it is. */
for (const p of webCovers) PHOTOS.set(p.seed, p);

/* img(seed, w, h): resolves a seed to a local optimized image. Picks the
   small variant for thumbnail widths, the large one otherwise. Unknown
   seeds fall through to a picsum placeholder of the requested size. */
export const img = (s, w = 1200, h = 800) => {
  const p = PHOTOS.get(s);
  if (p) return w <= 640 ? p.sm : p.lg;
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
};

/* srcSet(seed): the sm+lg pair as a srcset descriptor, so <img> can ship
   the resolution that actually matches the viewport instead of always
   whatever fixed width img() was called with. Falls back to two picsum
   widths for not-yet-synced placeholder seeds so the attribute stays
   valid (only ever hit before real content is published). */
export const srcSet = (s) => {
  const p = PHOTOS.get(s);
  if (p) return `${p.sm} 640w, ${p.lg} 2000w`;
  return `https://picsum.photos/seed/${s}/640/640 640w, https://picsum.photos/seed/${s}/2000/2000 2000w`;
};

/* ratio(seed, fw, fh): CSS aspect-ratio for a seed — the synced photo's
   real dimensions when the manifest has them, the placeholder's requested
   size otherwise. Lets free-flowing grids reserve space before the image
   loads, so lazy loading doesn't shift the layout. */
export const ratio = (s, fw = 3, fh = 2) => {
  const p = PHOTOS.get(s);
  return p?.w && p?.h ? `${p.w} / ${p.h}` : `${fw} / ${fh}`;
};

/* Near-black base. Dark, quiet room; the work is the only bright thing. */
const BASE = {
  bg: "#0A0A0B",
  panel: "#111114",
  ink: "#ECECEC",
  dim: "#82828B",
  rule: "#1E1E22",
  filter: "saturate(0.92) brightness(0.96)",
};

/* One fixed palette. The accent switcher was removed at the client's
   request, so the accent is a constant — every var(--accent) rule in
   the CSS keeps working, it just never changes. */
export const THEME = { ...BASE, accent: "#E4E4E7" };

const FRAMES_FALLBACK = [
  { seed: "pf-01", t: "Selected Work 01", loc: "Location, XX", exif: "35mm · f/8 · 1/500", kind: "Photography",
    note: "Short description of the project. Replace with your own — what it was, why it mattered, what shipped.",
    year: "2025", role: "Photography · Grade" },
  { seed: "pf-02", t: "Selected Work 02", loc: "Location, XX", exif: "50mm · f/1.4 · 1/60", kind: "Photography",
    note: "One line about the shoot and the outcome. Keep it plain; let the picture carry the weight.",
    year: "2025", role: "Portrait · Available light" },
  { seed: "pf-03", t: "Selected Work 03", loc: "Web · Framer", exif: "12 col · 1440px · 68ms LCP", kind: "Web Design",
    note: "A build note. Designed and shipped end to end, so nothing got cropped to fit a template.",
    year: "2024", role: "Design · Build" },
  { seed: "pf-04", t: "Selected Work 04", loc: "Location, XX", exif: "85mm · f/2 · 1/250", kind: "Photography",
    note: "A portrait series or campaign. Say who it was for and what the brief asked for.",
    year: "2024", role: "Campaign · Art direction" },
  { seed: "pf-05", t: "Selected Work 05", loc: "Web · React", exif: "Editorial CMS · 340 issues", kind: "Web Design",
    note: "An editorial build where the photograph sets the grid, not the other way round.",
    year: "2023", role: "Editorial · React" },
];

/* Prefer real synced photos; fall back to placeholders when the manifest
   is empty. FRAMES drives the work cards + /work/:seed pages. (SHEET,
   which fed the marquee strip, went with it when the strip was removed.) */
export const FRAMES = manifest.work?.length ? manifest.work : FRAMES_FALLBACK;

/* The old captioned "Gallery" grid (category tabs) was replaced by the
   per-collection photography cards — see PHOTO_PROJECTS below and
   PhotoProjects in Home.jsx. Photos are now organised by their
   `collection` (wildlife / traditional / …), each opening its own
   /photography/:slug gallery. */

/* Real design projects now ship in WEB_PROJECTS, so the Work-page design
   section shows the cards (not the old reserved-room placeholder). */
export const HAS_REAL_WEB = true;

/* ==================================================================
   PHOTOGRAPHY — /photography and /photography/:slug

   FEATURED drives the hero slideshow; PHOTO_PROJECTS drives the sticky
   stack below it and every project page. Each project owns its own set
   of frames, so a project page can show a grid and a lightbox.

   PLACEHOLDER CONTENT — swap titles, notes and seeds for the real
   shoots. Seeds resolve through img(): a synced photo if the Drive
   manifest has one, a seeded placeholder otherwise.
   ================================================================== */

const photoSeeds = (slug, n) => Array.from({ length: n }, (_, i) => `${slug}-${i + 1}`);

const PHOTO_PROJECTS_FALLBACK = [
  {
    slug: "after-hours",
    t: "After Hours",
    kind: "Editorial",
    loc: "Location, XX",
    year: "2025",
    exif: "35mm · f/1.8 · 1/125",
    role: "Photography · Grade",
    note: "A night series shot entirely on available light. Replace this with the real brief — who it was for and what the pictures had to carry.",
    intro: "Two nights, one lens, no flash. The city did the lighting.",
    photos: photoSeeds("after-hours", 9),
  },
  {
    slug: "salt-and-light",
    t: "Salt & Light",
    kind: "Landscape",
    loc: "Location, XX",
    year: "2025",
    exif: "24mm · f/11 · 1/250",
    role: "Photography · Art direction",
    note: "A coastal set made across one week of weather. Say what the trip was for and what came out of it.",
    intro: "Early light, long lenses, and a lot of waiting for the sky to commit.",
    photos: photoSeeds("salt-and-light", 8),
  },
  {
    slug: "faces",
    t: "Faces",
    kind: "Portraits",
    loc: "Studio, XX",
    year: "2024",
    exif: "85mm · f/2 · 1/200",
    role: "Portrait · One light",
    note: "A portrait series shot over a single afternoon. One light, one backdrop, twelve people.",
    intro: "One light, moved twice. Everything else is the person.",
    photos: photoSeeds("faces", 10),
  },
  {
    slug: "the-long-table",
    t: "The Long Table",
    kind: "Events",
    loc: "Location, XX",
    year: "2024",
    exif: "50mm · f/1.4 · 1/60",
    role: "Event · Documentary",
    note: "A full-day event covered documentary-style. Describe the day and what the client used the set for.",
    intro: "Documentary coverage — nobody looked at the camera on purpose.",
    photos: photoSeeds("the-long-table", 8),
  },
];

/* When the Drive sync has real photos, deal them out across the
   projects in order so the pages fill with actual work; otherwise the
   placeholder seeds stand in. */
function withSyncedPhotos(projects) {
  const pool = [...(manifest.work || []), ...(manifest.gallery || [])].map((p) => p.seed);
  if (!pool.length) return projects;
  const per = Math.max(4, Math.floor(pool.length / projects.length));
  return projects.map((p, i) => {
    const slice = pool.slice(i * per, (i + 1) * per);
    return slice.length ? { ...p, photos: slice } : p;
  });
}

/* Any projects already in the manifest win outright; otherwise we deal
   the synced Contentful photos across the placeholder projects, and
   failing that the placeholders stand alone — so a fresh clone with no
   photos still renders a complete site. */
export const PHOTO_PROJECTS = manifest.photoProjects?.length
  ? manifest.photoProjects
  : withSyncedPhotos(PHOTO_PROJECTS_FALLBACK);

/* The home hero is a wide, full-bleed frame, so a portrait photo would be
   cropped down to a vertical sliver of itself — landscape only. */
const isLandscape = (seed) => {
  const p = PHOTOS.get(seed);
  return !!(p?.w && p?.h && p.w > p.h);
};

/* A hand-picked run rather than one frame per collection: two wildlife,
   one modern, one traditional, interleaved so no two neighbours come
   from the same set. `seed` names a specific picture where the choice
   matters; without one, the next unused landscape frame in that
   collection is taken, so repeats never show the same photo twice. */
const HERO_RECIPE = [
  { slug: "wildlife", seed: "wildlife-bighorn" },
  { slug: "modern" },
  { slug: "wildlife", seed: "wildlife-cheetah" },
  { slug: "traditional" },
];

const heroByRecipe = (() => {
  const taken = new Set();
  return HERO_RECIPE.map(({ slug, seed }) => {
    const proj = PHOTO_PROJECTS.find((p) => p.slug === slug);
    if (!proj) return null;
    const pool = (proj.photos || []).filter((s) => isLandscape(s) && !taken.has(s));
    // a named seed that has gone from the collection falls back to the pool
    const pick = (seed && pool.includes(seed) && seed) || pool[0];
    if (!pick) return null;
    taken.add(pick);
    return { seed: pick, t: proj.t, slug: proj.slug, kind: proj.kind };
  }).filter(Boolean);
})();

/* A fresh clone with no synced photos runs on the placeholder projects,
   whose slugs the recipe knows nothing about — fall back to one opening
   frame per collection there so the hero still has something to show. */
export const HERO_FRAMES = heroByRecipe.length
  ? heroByRecipe
  : PHOTO_PROJECTS
    .map((p) => ({
      seed: (p.photos || []).find(isLandscape) || p.photos?.[0],
      t: p.t,
      slug: p.slug,
      kind: p.kind,
    }))
    .filter((f) => f.seed);

/* Hero slideshow: the opening frame of each project, so the hero doubles
   as a table of contents. */
export const FEATURED = PHOTO_PROJECTS.map((p) => ({
  seed: p.photos[0],
  t: p.t,
  slug: p.slug,
  kind: p.kind,
  loc: p.loc,
  year: p.year,
}));

/* A flat pool of every project photo, round-robin interleaved across the
   projects — so a home-page grid mixes the collections (one wildlife, one
   traditional, one modern, …) instead of showing one whole set then the
   next. Drives the "selected frames" grid on the home page. */
export const PHOTO_POOL = (() => {
  const lists = PHOTO_PROJECTS.map((p) => p.photos || []);
  const out = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const l of lists) if (l[i]) out.push(l[i]);
  }
  return out;
})();

/* ==================================================================
   WEB DESIGN — /design and /design/:slug

   Real projects: interactive Figma prototypes. Each carries `href`
   (the Figma prototype link) and `embed: true`, which makes the detail
   page render the live prototype in an iframe instead of screenshots —
   so visitors click through the real design, no mock images needed.

   PLACEHOLDER COPY: `intro`/`note`/`role`/`year` are Viraj's to fill in
   with the real brief. `shots` is empty on purpose (the embed is the
   visual); add real screen seeds later for a static gallery too. */
const WEB_PROJECTS_FALLBACK = [
  {
    slug: "trackher",
    t: "TrackHer",
    tag: "Product design · Prototype",
    year: "",
    role: "UX/UI · Interactive prototype",
    intro: "An interactive Figma prototype — click through the full product flow.",
    note: "Add the real brief here: what TrackHer is, who it's for, the problem it solves, and your role on the team.",
    tool: "Figma",
    href: "https://www.figma.com/proto/8OtvqxlfWmw36HoDlRMTMa/Final-Presentation---Prototype?node-id=2-1928&page-id=0%3A1&starting-point-node-id=2%3A1917",
    live: "",
    embed: true,
    stack: ["Figma", "Prototype"],
    cover: "web-trackher",
    shots: [],
    specs: [
      { k: "Type", v: "Product design · Interactive prototype" },
      { k: "Tool", v: "Figma" },
    ],
  },
  {
    slug: "wingwise",
    t: "WingWise",
    tag: "Product design · Prototype",
    year: "",
    role: "UX/UI · Interactive prototype",
    intro: "An interactive Figma prototype — click through the full product flow.",
    note: "Add the real brief here: what WingWise is, who it's for, and your role on Team Yuva.",
    tool: "Figma",
    href: "https://www.figma.com/proto/5ucSXSWGvoeBuQraNImByn/Team-Yuva?node-id=3280-10661&page-id=1408%3A17032&starting-point-node-id=3280%3A10661",
    live: "",
    embed: true,
    stack: ["Figma", "Prototype"],
    cover: "web-wingwise",
    shots: [],
    specs: [
      { k: "Type", v: "Product design · Interactive prototype" },
      { k: "Tool", v: "Figma" },
    ],
  },
  {
    slug: "moments",
    t: "MOMents",
    tag: "Product design · Prototype",
    year: "",
    role: "UX/UI · Interactive prototype",
    intro: "An interactive Figma prototype — click through the full product flow.",
    note: "Add the real brief here: what MOMents is, who it's for, and your role on team Spark.",
    tool: "Figma",
    href: "https://www.figma.com/proto/I4AYMtK2LPSuUrbMnd8vy9/MOMents-by-team-Spark?node-id=1909-5686&page-id=1902%3A3830&starting-point-node-id=1909%3A5686",
    live: "",
    embed: true,
    stack: ["Figma", "Prototype"],
    cover: "web-moments",
    shots: [],
    specs: [
      { k: "Type", v: "Product design · Interactive prototype" },
      { k: "Tool", v: "Figma" },
    ],
  },
  {
    slug: "artasta",
    t: "ArtAsta",
    tag: "Product design · Prototype",
    year: "",
    role: "UX/UI · Interactive prototype",
    intro: "An interactive Figma prototype — click through the full product flow.",
    note: "Add the real brief here: what ArtAsta is, who it's for, and your role on the project.",
    tool: "Figma",
    href: "https://www.figma.com/proto/XDD143AWWhkegVelp4z8sC/Art-Asta-Design?node-id=10153-950&page-id=1%3A43&starting-point-node-id=10490%3A3702&scaling=scale-down&content-scaling=fixed",
    live: "",
    embed: true,
    stack: ["Figma", "Prototype"],
    cover: "web-artasta",
    shots: [],
    specs: [
      { k: "Type", v: "Product design · Interactive prototype" },
      { k: "Tool", v: "Figma" },
    ],
  },
];

/* Manifest content first, the real project set otherwise. */
export const WEB_PROJECTS = manifest.webProjects?.length
  ? manifest.webProjects
  : WEB_PROJECTS_FALLBACK;

/* A Figma prototype URL → its embeddable iframe src. */
export const figmaEmbed = (url) =>
  `https://www.figma.com/embed?embed_host=lensofviraj&url=${encodeURIComponent(url)}`;

/* True — real design projects exist, so /design and the home teaser show
   them (was gated on the removed admin/manifest publishing flow). */
export const hasPhoto = (s) => PHOTOS.has(s);

export const METRICS = [
  { v: 68, s: "", k: "Projects delivered" },
  { v: 92, s: "%", k: "Clients who returned" },
  { v: 10, s: "+", k: "Years behind a lens" },
  { v: 4, s: "wks", k: "Shoot to live site" },
];

export const SHOTLIST = [
  { k: "Editorial & campaign", v: "Shoot, select, grade, deliver. Usually two weeks." },
  { k: "Events & nightlife", v: "Available light. No flash unless you ask twice." },
  { k: "Portraits", v: "Studio or location. One light, mostly." },
  { k: "Art direction", v: "For when the pictures exist but nothing holds them together." },
  { k: "Design & build", v: "Framer, Webflow, or React. I ship what I design." },
  { k: "Colour grading", v: "Yours or mine. Consistent across a set, not just pretty alone." },
];

/* Viraj's real bio — condensed from his own words. */
export const ABOUT = {
  portrait: manifest.portrait?.seed ?? "pf-about",
  lead: "I create meaningful visual experiences — digital products designed with intent, and moments captured through a lens.",
  body: [
    "My creative journey started with technology. While studying Computer Science Engineering I built a foundation in programming and problem-solving, working as a developer and building solutions through code. But I kept being drawn to the creative side of technology — not just how things work, but how they look, feel and connect with people. That curiosity led me into UI/UX design, and to designing applications and websites that pair functionality with meaningful experiences.",
    "Photography has run alongside all of it. In 2014 I held my first point-and-shoot camera, and what started as simple curiosity grew into a passion for visual storytelling. In 2018 I bought my first DSLR and went deeper — eventually sharing what I'd learned by teaching others, and leading a photography group in college: organising shoots, collaborating with fellow creators, and helping people find their own perspective.",
    "Today, based in Vancouver, I bring engineering, design and photography together — creating digital experiences and capturing visual stories that connect technology with human emotion.",
  ],
  approach: [
    { k: "Logic meets creativity", v: "An engineer's problem-solving applied to design and photographs — analytical where it helps, intuitive where it matters." },
    { k: "One pair of hands", v: "Shot, designed and built by the same person, so nothing gets lost in a handover." },
    { k: "Technology with emotion", v: "Products people can use without thinking; pictures people feel before they think." },
  ],
  timeline: [
    { y: "2014", t: "First point-and-shoot camera. Curiosity becomes a habit." },
    { y: "2018", t: "First DSLR. Photography turns serious — and he starts teaching it." },
    { y: "2019", t: "Leads the college photography group: shoots, collabs, mentoring." },
    { y: "2026", t: "Vancouver. Designing digital products, shooting as Lensofviraj." },
  ],
};

/* Inter + IBM Plex Mono are self-hosted via @fontsource (see main.jsx) —
   no render-blocking request to fonts.googleapis.com. */
export const CSS = `
.pf, .pf *, .pf *::before, .pf *::after { box-sizing: border-box; margin: 0; }
.pf { background: var(--bg); color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif; font-weight: 400;
  -webkit-font-smoothing: antialiased; letter-spacing: -0.01em;
  transition: color .5s ease; position: relative; min-height: 100vh;
  /* clip, not hidden: hidden would compute overflow-y to auto and turn
     .pf into a scroll container, which silently kills every position:sticky
     inside it (the bar, .card, .sec-label). clip contains the same
     horizontal overflow without creating a scrollport. */
  overflow-x: clip; }
.pf a { color: inherit; text-decoration: none; }
.pf button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
.pf img { display: block; width: 100%; height: 100%; object-fit: cover;
  filter: var(--filter); transition: filter .6s ease, transform 1.1s cubic-bezier(.2,.8,.2,1); }
.pf ::selection { background: var(--accent); color: var(--bg); }
.pf :focus-visible { outline: 1px solid var(--accent); outline-offset: 4px; }

/* keyboard skip link — off-screen until focused */
.skip { position: fixed; top: 10px; left: 50%; transform: translate(-50%, -140%);
  z-index: 200; background: var(--accent); color: var(--bg); padding: 10px 18px;
  border-radius: 4px; font-family: 'IBM Plex Mono', monospace; font-size: 12px;
  letter-spacing: .1em; text-transform: uppercase; transition: transform .25s ease; }
.skip:focus-visible { transform: translate(-50%, 0); outline: none; }

.wrap { max-width: 1180px; margin: 0 auto; padding: 0 28px; }
.mono { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--dim); }
.rule { height: 1px; background: var(--rule); border: 0; }

/* --- aperture page transition ---
   A single accent circle scaled up to cover the screen (shutter closing)
   then back down (opening), revealing the next page from the edges in.
   The box-shadow guarantees the corners are covered at full scale. */
.iris { position: fixed; inset: 0; z-index: 500; display: grid; place-items: center;
  pointer-events: none; overflow: hidden; }
.iris-lens { width: 100vmax; height: 100vmax; border-radius: 50%; transform: scale(0);
  background: radial-gradient(circle at 50% 50%,
    color-mix(in srgb, var(--accent) 78%, #fff) 0%, var(--accent) 46%,
    color-mix(in srgb, var(--accent) 70%, #000) 100%);
  box-shadow: 0 0 0 100vmax var(--accent); }

/* --- appear (GSAP-driven; see Reveal) --- */
.rv { will-change: opacity, transform; }

/* --- bar --- */
/* Always on screen — it never hides on scroll, on any route, so navigation
   is one click away from anywhere including the bottom of a long gallery.
   Sticky (not fixed) so it keeps its place in flow and needs no spacer;
   this relies on .pf using overflow-x: clip rather than hidden. */
.bar { position: sticky; top: 0; z-index: 80;
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: blur(16px); border-bottom: 1px solid var(--rule);
  transform: none !important; }
.bar-in { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 28px; max-width: 1180px; margin: 0 auto; }
.brand { color: var(--ink); }
/* the masthead CTA — sits where the city/booking line used to, and is
   the one way into the enquiry form from anywhere on the site. Stays
   visible at every width: on a phone it is the primary action. */
/* Quiet by default — a hairline pill in the bar's own rule colour, led by
   a small accent dot standing in for the "booking" note it replaced. A
   full accent-filled button here would have shouted over the nav; the
   accent only arrives on hover. */
.pf .barcta { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 9px;
  border: 1px solid var(--rule); border-radius: 100px; color: var(--ink);
  padding: 9px 17px; white-space: nowrap;
  background: color-mix(in srgb, var(--ink) 4%, transparent);
  transition: border-color .35s ease, color .35s ease, background-color .35s ease; }
.pf .barcta::before { content: ""; width: 5px; height: 5px; border-radius: 50%;
  background: var(--accent); flex: 0 0 auto;
  transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease; }
.pf .barcta:hover { color: var(--accent); border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 9%, transparent); }
.pf .barcta:hover::before { transform: scale(1.35);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 22%, transparent); }
@media (max-width: 560px) {
  .pf .barcta { padding: 8px 14px; gap: 7px; letter-spacing: .1em; }
}
.prog { position: absolute; left: 0; bottom: -1px; height: 1px; background: var(--accent);
  transition: width .1s linear; }

/* --- back to top --- */
/* .pf-scoped (not bare .totop) so its border/background survive the
   .pf button { border: none; background: none; } reset above, which
   otherwise wins on specificity (class+type beats a single class). */
.pf .totop { position: fixed; z-index: 90;
  right: max(24px, env(safe-area-inset-right));
  bottom: max(24px, env(safe-area-inset-bottom));
  width: 48px; height: 48px; display: grid; place-items: center;
  border: 1px solid var(--rule); border-radius: 50%;
  background: color-mix(in srgb, var(--bg) 80%, transparent); backdrop-filter: blur(8px);
  opacity: 0; transform: translateY(8px) scale(0.9); pointer-events: none;
  transition: opacity .3s ease, transform .3s cubic-bezier(.2,.8,.2,1), border-color .3s ease; }
.pf .totop.show { opacity: 1; transform: none; pointer-events: auto; }
.pf .totop:hover { border-color: var(--accent); color: var(--accent); }
.pf .totop .arrow { font-size: 18px; transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.pf .totop:hover .arrow { transform: translateY(-3px); }
@media (max-width: 640px) { .pf .totop { width: 44px; height: 44px; right: 16px; bottom: 16px; } }

/* --- masthead: the frame hero (HeroFrames.jsx) ---
   One full screen: the sticky bar sits above it in flow, so subtract its
   height rather than using a bare 100svh that would push the hero's foot
   below the fold. svh, not vh, so mobile browser chrome doesn't overshoot. */
.mast { position: relative; overflow: hidden; display: flex;
  min-height: calc(100svh - 64px);
  /* how soft the picture sits behind the copy — one dial, tune here */
  --hero-soften: 3px; }
.mast .wrap { position: relative; z-index: 3; width: 100%; }
.mast-stage { position: relative; flex: 1; min-width: 0;
  display: flex; align-items: center; }
.mast-frames { position: absolute; inset: 0; z-index: 0; }
/* the long cross-fade is the whole transition — two frames overlap for
   well over a second, so nothing ever cuts */
.mast-frame { position: absolute; inset: 0; opacity: 0;
  transition: opacity 1.1s cubic-bezier(.4, 0, .2, 1); }
.mast-frame.on { opacity: 1; }
/* Overscale hides the soft edge the blur leaves at the frame border, and
   the drift keeps a held shot from reading as a stalled page. It runs on
   every frame, not just the visible one — tying it to .on would snap the
   outgoing frame back to its start mid-fade. */
.mast-frame img { width: 100%; height: 100%; object-fit: cover;
  object-position: 50% 42%; transform: scale(1.03);
  filter: blur(var(--hero-soften)) saturate(.94) brightness(.78);
  /* transition:none so .pf img's transform tween doesn't fight the drift */
  transition: none;
  animation: heroDrift 24s ease-in-out infinite alternate; }
@keyframes heroDrift { to { transform: scale(1.08); } }
.mast-scrim { position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(100deg,
    color-mix(in srgb, var(--bg) 84%, transparent) 0%,
    color-mix(in srgb, var(--bg) 40%, transparent) 48%,
    color-mix(in srgb, var(--bg) 70%, transparent) 100%); }

/* Scroll cue — the only thing in the hero you can act on, parked in the
   bottom-right corner the frame counter used to hold. .pf-scoped so its
   colour beats .mono's var(--dim). */
.pf .mast-scroll { position: absolute; z-index: 3;
  right: clamp(18px, 4vw, 46px); bottom: clamp(22px, 4vw, 40px);
  display: inline-flex; align-items: center; gap: 10px; padding: 8px 6px;
  color: color-mix(in srgb, var(--ink) 62%, transparent);
  transition: color .3s ease; }
.pf .mast-scroll:hover { color: var(--accent); }
.mast-arrow { display: inline-block; font-size: 13px;
  animation: scrollNudge 2.4s cubic-bezier(.4, 0, .2, 1) infinite; }
@keyframes scrollNudge {
  0%, 100% { transform: translateY(0); opacity: .55; }
  50% { transform: translateY(5px); opacity: 1; }
}

.display { font-weight: 300; letter-spacing: -0.04em; line-height: .95;
  font-size: clamp(44px, 10.5vw, 140px); text-wrap: balance;
  overflow-wrap: break-word; max-width: 100%; }
.mast .display { text-shadow: 0 4px 44px color-mix(in srgb, var(--bg) 82%, transparent); }
/* No ch-based cap here: ch resolves against this box's 16px font, not the
   140px headline inside it, so 22ch squeezed the h1 into ~180px — and
   .display's overflow-wrap then broke words mid-syllable (Cra/fte/d).
   The headline wraps on the 1180px .wrap instead, which sets its rhythm. */
.mast-copy { max-width: 100%; }
.mast-sub { margin-top: 22px; max-width: 34ch; font-weight: 300;
  letter-spacing: -0.015em; line-height: 1.45; font-size: clamp(15px, 1.7vw, 20px);
  color: color-mix(in srgb, var(--ink) 78%, transparent); }
/* the bar wraps to two rows below 720px, so it eats more of the screen */
@media (max-width: 720px) { .mast { min-height: calc(100svh - 96px); } }
@media (max-width: 640px) {
  .pf .mast-scroll { right: 16px; bottom: 20px; }
}

/* standfirst / disciplines / role: fade+rise in after the headline
   resolves (--rd, set inline per element), so the primary hero text
   settles before the supporting copy and CTAs do. */
.hero-reveal { opacity: 0; transform: translateY(14px);
  animation: heroUp .6s cubic-bezier(.16,1,.3,1) var(--rd, 0s) forwards; }
@keyframes heroUp { to { opacity: 1; transform: none; } }

/* --- the two practices, moved out of the hero and given their own room --- */
.intro-sec { padding: 12vh 0 2vh; }
.intro-sec .role { display: flex; justify-content: space-between; gap: 20px;
  flex-wrap: wrap; margin-top: 34px; }
.intro-sec .drawline { height: 1px; background: var(--accent); transform: scaleX(0);
  transform-origin: left; margin-top: 40px;
  animation: draw 1.1s cubic-bezier(.76,0,.24,1) forwards; }
@keyframes draw { to { transform: scaleX(1); } }

/* --- thesis --- */
.thesis-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 56px; align-items: end; }
@media (max-width: 860px) { .thesis-grid { grid-template-columns: 1fr; align-items: start; gap: 32px; } }
.lead { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(24px, 3.6vw, 44px);
  line-height: 1.22; max-width: 22ch; }
.lead i { font-style: normal; color: var(--accent); }
.aside { max-width: 400px; color: var(--dim); line-height: 1.72; font-size: 15px; }
.aside p + p { margin-top: 16px; }

/* --- photography: one card per project --- */
.stack { padding-bottom: 18vh; display: flex; flex-direction: column; gap: 34px; }
/* These were sticky, which piled the projects up on top of each other as
   you scrolled. Plain flow instead: one project after another, each read
   on its own. */
.card { position: relative; background: var(--panel); border: 1px solid var(--rule);
  border-radius: 4px; overflow: hidden; transition: border-color .4s ease; }
.card:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--rule)); }
.card-in { display: grid; grid-template-columns: 1.25fr 1fr; }
@media (max-width: 860px) {
  .card-in { grid-template-columns: 1fr; }
  .stack { gap: 26px; }
}
.shot { position: relative; overflow: hidden; aspect-ratio: 4/3; display: block; }
.shot img { transition: filter .6s ease; will-change: transform; }
/* WebGL distortion layer: the real photo sits underneath, the canvas on
   top — if WebGL/texture fails, the canvas is transparent and the photo
   shows through. */
.shot .distort-fallback { position: absolute; inset: 0; }
.shot .distort-canvas { position: absolute !important; inset: 0; display: block; }
.shot .open { position: absolute; right: 14px; bottom: 14px; z-index: 2;
  background: color-mix(in srgb, var(--bg) 55%, transparent); color: var(--ink);
  backdrop-filter: blur(8px); border: 1px solid var(--rule); border-radius: 100px;
  padding: 7px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  letter-spacing: .14em; text-transform: uppercase; }
.cap { padding: 34px 32px; display: flex; flex-direction: column; justify-content: space-between; gap: 26px; }
.cap .kind { display: inline-block; border: 1px solid var(--rule); border-radius: 100px;
  padding: 4px 12px; margin-bottom: 18px; }
.cap h2 { font-weight: 400; letter-spacing: -0.03em; font-size: clamp(24px, 3vw, 38px); line-height: 1.05; }
.cap p { color: var(--dim); line-height: 1.68; font-size: 15px; margin-top: 14px; }
.cap .meta { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  padding-top: 16px; border-top: 1px solid var(--rule); }

/* --- brand logo in the bar ---
   Drop the real file at public/logo.svg (or .png / .webp) and it is
   picked up automatically; until then the wordmark text shows. The
   .pf img reset (width/height 100% + filter) must not apply here. */
/* The C& mark + wordmark. On load the outline draws itself, then the
   fill develops in — a nod to a print coming up in the tray. Hovering
   the brand twists the mark slightly, like focusing a lens. */
.logo { display: inline-flex; align-items: center; gap: 12px; }
.logo-mark { height: 34px; width: auto; aspect-ratio: 13113 / 11894; color: var(--ink);
  overflow: visible; transition: transform .5s cubic-bezier(.2,.8,.2,1), color .3s ease;
  transform-origin: 50% 50%; }
.logo-mark path { fill: currentColor; stroke: currentColor; stroke-width: 220;
  stroke-dasharray: 1; stroke-dashoffset: 1; fill-opacity: 0;
  animation: logoDraw 1.4s cubic-bezier(.4,0,.2,1) .2s forwards,
             logoFill .7s ease 1.2s forwards; }
@keyframes logoDraw { to { stroke-dashoffset: 0; } }
@keyframes logoFill { to { fill-opacity: 1; } }
.brand { display: inline-flex; align-items: center; min-height: 34px; }
.brand:hover .logo-mark { transform: rotate(-12deg) scale(1.08); }
/* wordmark: each letter rises out of a clipped line, cascading left to
   right so the name finishes composing just as the mark's fill lands.
   On hover the letters track apart slightly — a quiet typographic nod. */
.logo-word { display: inline-flex; overflow: hidden; gap: 0px;
  transition: gap .45s cubic-bezier(.2,.8,.2,1), color .3s ease; }
.logo-word b { font-weight: inherit; display: inline-block; opacity: 0;
  transform: translateY(130%); animation: wordUp .6s cubic-bezier(.16,1,.3,1) forwards; }
@keyframes wordUp { to { opacity: 1; transform: none; } }
.brand:hover .logo-word { gap: 1.5px; }
@media (max-width: 720px) {
  .logo-mark { height: 28px; }
  .logo-word { display: none; } /* the mark carries the brand on phones */
}

/* --- categorised gallery (Work page) ---
   Deliberately mute: four category tabs and a masonry of frames.
   No captions, no notes — the grid is the whole statement. */
.gwork { padding: 12vh 0; border-top: 1px solid var(--rule); }
.gwork-head { display: flex; justify-content: space-between; align-items: center;
  gap: 18px 28px; flex-wrap: wrap; margin-bottom: 36px; }
.gtabs { display: flex; gap: 8px; flex-wrap: wrap; }
.gtab { border: 1px solid var(--rule); border-radius: 100px; padding: 8px 16px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: .14em;
  text-transform: uppercase; color: var(--dim);
  transition: border-color .3s ease, color .3s ease, background-color .3s ease; }
.gtab:hover { border-color: var(--accent); color: var(--accent); }
.gtab[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--bg); }
.gempty { padding: 9vh 24px; text-align: center; border: 1px dashed var(--rule);
  border-radius: 6px; }

/* --- home: photography collection cards ---
   One framed cover per collection; opens the full gallery at
   /photography/:slug. Mirrors the site's card idiom (accent hover, the
   same pill "open" badge as the project stack). */
.gwork-all { display: inline-flex; align-items: center; gap: 8px; color: var(--dim);
  transition: color .3s ease; }
.gwork-all:hover { color: var(--accent); }
.gwork-all .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.gwork-all:hover .arrow { transform: translateX(5px); }
.projrow { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 22px; }
@media (max-width: 560px) { .projrow { grid-template-columns: 1fr; } }
.projcard { display: block; }
.projshot { position: relative; overflow: hidden; border: 1px solid var(--rule);
  border-radius: 4px; background: var(--panel); aspect-ratio: 4/3;
  transition: border-color .4s ease; }
.projcard:hover .projshot { border-color: color-mix(in srgb, var(--accent) 45%, var(--rule)); }
.projshot img { transition: transform 1.1s cubic-bezier(.2,.8,.2,1), filter .6s ease; }
.projcard:hover .projshot img { transform: scale(1.05); }
.projshot::after { content: ""; position: absolute; inset: 0; background: var(--accent);
  opacity: 0; mix-blend-mode: overlay; transition: opacity .4s ease; pointer-events: none; }
.projcard:hover .projshot::after { opacity: .12; }
.projshot .open { position: absolute; right: 12px; bottom: 12px; z-index: 2;
  background: color-mix(in srgb, var(--bg) 55%, transparent); color: var(--ink);
  backdrop-filter: blur(8px); border: 1px solid var(--rule); border-radius: 100px;
  padding: 7px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  letter-spacing: .14em; text-transform: uppercase; }
.projcap { display: flex; justify-content: space-between; align-items: baseline;
  gap: 12px; padding: 14px 2px 0; }
.projcap h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(19px, 2.2vw, 25px);
  transition: color .3s; }
.projcard:hover .projcap h3 { color: var(--accent); }
.projcap .mono { flex: 0 0 auto; color: var(--dim); }
/* label above the pooled "selected frames" grid on the home page */
.gwork-sub { margin: 48px 0 20px; color: var(--dim);
  padding-top: 26px; border-top: 1px solid var(--rule); }

/* --- reserved room (design work not published yet) --- */
.reserved { border: 1px dashed var(--rule); border-radius: 6px; padding: 8vh 36px;
  display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.reserved h3 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.05;
  font-size: clamp(24px, 3.2vw, 40px); text-wrap: balance; }
.reserved p { color: var(--dim); font-size: 15px; line-height: 1.7; max-width: 44ch; }
.reserved .extlink { margin-top: 10px; }

/* --- section shell with sticky label --- */
.sec { padding: 13vh 0; border-top: 1px solid var(--rule); }
.sec-grid { display: grid; grid-template-columns: 180px 1fr; gap: 40px; align-items: start; }
.sec-label { position: sticky; top: 100px; }
@media (max-width: 860px) { .sec-grid { grid-template-columns: 1fr; gap: 24px; } .sec-label { position: static; } }

/* --- metrics --- */
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1px; background: var(--rule); border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; position: relative; }
.metrics::after { content: ""; position: absolute; left: 0; top: 0; height: 2px; width: 100%;
  background: var(--accent); transform: scaleX(0); transform-origin: left; z-index: 2;
  transition: transform 1.1s cubic-bezier(.76,0,.24,1); }
.metrics.in::after { transform: scaleX(1); }
.metric { background: var(--bg); padding: 30px 24px; }
.metric b { display: block; font-weight: 300; letter-spacing: -0.03em;
  font-size: clamp(36px, 4.4vw, 60px); line-height: 1; font-variant-numeric: tabular-nums; }
.metric span { display: block; margin-top: 12px; }
/* the % / wks rides in as the number lands, so it needs its own box */
.metric b .suf { display: inline-block; margin-top: 0; will-change: transform, opacity; }

/* --- services / shot list ---
   No entrance animation: the rows are simply there. The only motion in
   the block is the hover, and it stays small — the row lifts a few
   pixels and its rule and number brighten. The old version swept a
   solid accent fill across and inverted the text, which was far more
   than a list of four steps needs. */
.sl-row { display: grid; grid-template-columns: 42px 1fr 1.1fr;
  gap: 20px; align-items: baseline; padding: 22px 0;
  border-bottom: 1px solid var(--rule);
  transition: transform .35s cubic-bezier(.2,.8,.2,1), border-color .35s ease; }
.sl-row:first-child { border-top: 1px solid var(--rule); }
.sl-row:hover { transform: translateY(-4px);
  border-bottom-color: color-mix(in srgb, var(--accent) 45%, var(--rule)); }
.sl-row h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(18px, 2.1vw, 25px);
  transition: color .35s ease; }
.sl-row p { color: var(--dim); font-size: 14.5px; line-height: 1.58; }
.sl-row .mono { transition: color .35s ease; }
/* the number carries the state — accent is near-white, so brightening
   the dim mono reads far more clearly than tinting the already-light h3 */
.sl-row:hover .mono { color: var(--accent); }
@media (max-width: 700px) { .sl-row { grid-template-columns: 30px 1fr; } .sl-row p { grid-column: 2; } }

/* --- carousel dot rail (the lightbox's frame picker) ---
   Each dot is a 26px-tall tap target; the 2px bar centred in it is the
   visual. Laid out by .lb-foot, so there's no container rule here. */
.dot { width: 26px; height: 26px; position: relative; }
.dot::before { content: ""; position: absolute; left: 0; right: 0; top: 50%;
  margin-top: -1px; height: 2px; background: var(--rule); transition: background-color .4s; }
.dot.on::before { background: var(--accent); }

/* --- end --- */
.end { padding: 14vh 0 44px; border-top: 1px solid var(--rule); }
.end h2 { font-weight: 300; letter-spacing: -0.04em; line-height: .98; font-size: clamp(40px, 8vw, 108px); text-wrap: balance; }
.mail { display: inline-block; font-weight: 400; font-size: clamp(19px, 2.6vw, 30px);
  margin-top: 30px; position: relative; }
.mail::after { content: ""; position: absolute; left: 0; right: 0; bottom: -3px; height: 1px;
  background: var(--accent); transform: scaleX(0); transform-origin: right;
  transition: transform .5s cubic-bezier(.76,0,.24,1); }
.mail:hover::after { transform: scaleX(1); transform-origin: left; }
.colophon { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 28px;
  margin-top: 13vh; padding-top: 22px; border-top: 1px solid var(--rule); }
.colophon dd { margin: 8px 0 0; font-size: 14px; line-height: 1.72; color: var(--dim); }

/* --- contact form --- */
.contact-form { max-width: 620px; margin-top: 30px; display: flex; flex-direction: column; gap: 18px; }
.cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 620px) { .cf-row { grid-template-columns: 1fr; } }
.cf-field { display: flex; flex-direction: column; gap: 8px; }
.cf-field input, .cf-field textarea { background: var(--panel); border: 1px solid var(--rule);
  border-radius: 4px; color: var(--ink); font: inherit; font-size: 15px; padding: 13px 15px;
  width: 100%; transition: border-color .25s ease; }
.cf-field input:focus, .cf-field textarea:focus { border-color: var(--accent); outline: none; }
.cf-field textarea { resize: vertical; line-height: 1.6; }
/* honeypot: off-screen, never shown, no tab stop */
.cf-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.cf-foot { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: 4px; }
.cf-foot button[disabled] { opacity: .5; pointer-events: none; }
.cf-err { text-transform: none; letter-spacing: .02em; color: #F4595E; }
.cf-err a { color: var(--accent); }
.form-done { margin-top: 30px; }
.form-done .mono { margin-top: 10px; }

/* --- contact modal ---
   Sized to the form rather than the screen: wide enough for the two-up
   name/email row, capped so it never sprawls on a desktop, and it
   scrolls internally instead of growing past the viewport. Below the
   lightbox (400) but above the masthead (80). */
.cmodal { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center;
  padding: 24px; overflow-y: auto;
  background: color-mix(in srgb, var(--bg) 62%, transparent);
  backdrop-filter: blur(18px) saturate(.9); -webkit-backdrop-filter: blur(18px) saturate(.9); }
.cmodal-panel { width: min(100%, 560px); max-height: calc(100vh - 48px); overflow-y: auto;
  background: var(--panel); border: 1px solid var(--rule); border-radius: 8px;
  padding: 30px 32px 32px; box-shadow: 0 30px 80px rgba(0, 0, 0, .55); }
@media (max-width: 560px) { .cmodal { padding: 14px; } .cmodal-panel { padding: 24px 20px 26px; } }
.cmodal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.cmodal-head h2 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.05;
  font-size: clamp(26px, 4vw, 34px); margin-top: 12px; }
.cmodal-x { flex: 0 0 auto; width: 34px; height: 34px; display: grid; place-items: center;
  border: 1px solid var(--rule); border-radius: 50%; color: var(--dim); font-size: 13px;
  transition: border-color .3s ease, color .3s ease; }
.cmodal-x:hover { border-color: var(--accent); color: var(--accent); }
/* the form fills the panel here, unlike the wide page version */
.cmodal-panel .contact-form { max-width: none; margin-top: 24px; }
.cmodal-panel .form-done { margin-top: 24px; }
.cmodal-foot { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--rule);
  text-transform: none; letter-spacing: .04em; }
.cmodal-foot a { color: var(--accent); }

/* --- work detail page --- */
.detail { padding: 12vh 0 10vh; }
.back { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 40px; }
.back .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.back:hover .arrow { transform: translateX(-5px); }
.detail-head { display: flex; justify-content: space-between; align-items: flex-end;
  gap: 28px; flex-wrap: wrap; margin-bottom: 40px; }
.detail-head h1 { font-weight: 300; letter-spacing: -0.03em; line-height: 1;
  font-size: clamp(36px, 6.5vw, 84px); text-wrap: balance; }
.detail-fig { position: relative; overflow: hidden; border-radius: 4px; border: 1px solid var(--rule);
  aspect-ratio: 3/2; }
.detail-fig img { will-change: transform; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px 56px; margin-top: 56px; }
@media (max-width: 760px) { .detail-grid { grid-template-columns: 1fr; gap: 28px; } }
.detail-note { font-weight: 300; letter-spacing: -0.01em; font-size: clamp(18px, 2.2vw, 26px);
  line-height: 1.45; max-width: 30ch; }
.spec { display: flex; flex-direction: column; gap: 0; }
.spec div { display: flex; justify-content: space-between; gap: 20px;
  padding: 14px 0; border-bottom: 1px solid var(--rule); }
.spec dt { color: var(--dim); }
.spec dd { text-align: right; }
.pager { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  margin-top: 14vh; padding-top: 24px; border-top: 1px solid var(--rule); }
.pager a { display: flex; flex-direction: column; gap: 6px; }
.pager .next { text-align: right; align-items: flex-end; }
.pager strong { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(18px, 2.4vw, 26px);
  transition: color .3s; }
.pager a:hover strong { color: var(--accent); }

/* --- nav links in the bar --- */
/* Generous, viewport-tracking gaps so the four sections read as four
   separate destinations rather than one run of text; clamped so they
   neither crowd at 900px nor drift apart on a wide desktop. */
.nav { display: flex; gap: clamp(24px, 3.4vw, 44px); align-items: center; }
.nav a { position: relative; }
.nav a[aria-current="page"] { color: var(--accent); }
.nav a::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px; height: 1px;
  background: var(--accent); transform: scaleX(0); transform-origin: right;
  transition: transform .35s cubic-bezier(.76,0,.24,1); }
.nav a:hover::after, .nav a[aria-current="page"]::after { transform: scaleX(1); transform-origin: left; }
/* Four sections don't fit a phone in one row, so the bar wraps and the
   nav sits on its own line rather than disappearing. */
@media (max-width: 720px) {
  .bar-in { flex-wrap: wrap; gap: 10px 14px; padding: 12px 20px; }
  .nav { order: 3; width: 100%; gap: 16px; justify-content: space-between; }
  .nav a { font-size: 10.5px; letter-spacing: .1em; }
}

/* --- about page --- */
.about { padding: 12vh 0 8vh; }
.about-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }
@media (max-width: 820px) { .about-hero { grid-template-columns: 1fr; gap: 36px; } }
.about-kicker { margin-bottom: 22px; }
.about-hero h1 { font-weight: 300; letter-spacing: -0.04em; line-height: .98;
  font-size: clamp(44px, 8vw, 104px); text-wrap: balance; }
.about-lead { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(20px, 2.6vw, 30px);
  line-height: 1.35; margin-top: 28px; max-width: 22ch; }
.about-lead i { font-style: normal; color: var(--accent); }
.about-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 34px; }
.about-tags span { border: 1px solid var(--rule); border-radius: 100px; padding: 8px 16px;
  transition: border-color .35s ease; }
.about-tags span:hover { border-color: var(--accent); }
.about-portrait { position: relative; overflow: hidden; border-radius: 4px;
  border: 1px solid var(--rule); aspect-ratio: 4/5; }
.about-portrait img { will-change: transform; }
.about-portrait figcaption { position: absolute; left: 0; right: 0; bottom: 0; z-index: 1;
  padding: 46px 16px 15px; color: var(--ink);
  background: linear-gradient(to top, color-mix(in srgb, var(--bg) 90%, transparent), transparent); }

/* --- section header: numbered label + a rule that draws in --- */
.shead { display: flex; align-items: center; gap: 20px; margin-bottom: 36px; }
.shead-n { flex: none; color: var(--accent); font-variant-numeric: tabular-nums; }
.shead-label { flex: none; white-space: nowrap; color: var(--dim); }
.shead-rule { flex: 1 1 auto; height: 1px; background: var(--rule);
  transform: scaleX(0); transform-origin: left; transition: transform .9s cubic-bezier(.2,.8,.2,1); }
.shead.in .shead-rule { transform: scaleX(1); }

/* Bio left, globe right. The globe column simply isn't rendered when
   heavy visuals are off — hence minmax on the *text* column, so it
   spreads to the full width on its own rather than staying pinned to a
   60ch strip with dead space beside it. */
.about-body { display: grid; grid-template-columns: minmax(0, 60ch) 1fr;
  gap: 48px; align-items: center; margin: 12vh 0; }
.about-body:not(:has(.about-body-viz)) { grid-template-columns: minmax(0, 64ch); }
.about-body-viz { position: relative; height: 460px; min-width: 0; }
/* ParticleSphere mounts its canvas into this, not into .about-body-viz —
   without inset:0 it has no height of its own and the globe sizes itself
   from the component's 400px bootstrap instead of the column. */
.psphere { position: absolute; inset: 0; cursor: grab; }
.psphere:active { cursor: grabbing; }
.about-body-text { color: var(--dim); line-height: 1.8; font-size: 16px; }
.about-body-text p + p { margin-top: 20px; }
/* first paragraph reads as a lead-in — brighter, larger, sets the voice */
.about-body-text .lead-p { color: var(--ink); font-weight: 300; letter-spacing: -0.02em;
  font-size: clamp(19px, 2.3vw, 25px); line-height: 1.5; }
.about-body-text .lead-p + p { margin-top: 30px; }
@media (max-width: 900px) {
  .about-body { grid-template-columns: 1fr; gap: 32px; }
  .about-body-viz { height: 320px; }
}
.approach { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1px;
  background: var(--rule); border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; }
/* panels are plain <div> on the about page and <a> on the home page,
   where each one is a door into that practice */
.approach div, .approach a { position: relative; background: var(--bg); padding: 34px 26px 30px;
  display: block; transition: background-color .4s ease; }
.approach div::before, .approach a::before { content: ""; position: absolute; left: 0; right: 0; top: 0;
  height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left;
  transition: transform .45s cubic-bezier(.2,.8,.2,1); }
.approach div:hover::before, .approach a:hover::before { transform: scaleX(1); }
.approach a:hover { background: var(--panel); }
.approach a:hover h3 { color: var(--accent); }
.approach-n { display: block; color: var(--accent); opacity: .85; margin-bottom: 18px; }
.approach h3 { transition: color .3s ease; }
.approach h3 { font-weight: 400; letter-spacing: -0.02em; font-size: 19px; margin-bottom: 12px; }
.approach p { color: var(--dim); font-size: 14.5px; line-height: 1.6; }

/* --- timeline: a real spine with accent dot markers --- */
.timeline { position: relative; margin-top: 4vh; }
.timeline::before { content: ""; position: absolute; left: 6px; top: 32px; bottom: 32px;
  width: 1px; background: var(--rule); }
.tl-row { position: relative; display: grid; grid-template-columns: 84px 1fr; gap: 24px;
  align-items: baseline; padding: 26px 0 26px 42px; border-bottom: 1px solid var(--rule);
  transition: padding-left .35s cubic-bezier(.2,.8,.2,1); }
.tl-row::before { content: ""; position: absolute; left: 1px; top: 32px; width: 11px; height: 11px;
  border-radius: 50%; background: var(--bg); border: 2px solid var(--accent);
  transition: transform .35s ease, background-color .35s ease; }
.tl-row:hover::before { background: var(--accent); transform: scale(1.18); }
.tl-row:first-child { border-top: 1px solid var(--rule); }
.tl-row:hover { padding-left: 52px; }
.tl-row b { font-weight: 400; font-size: clamp(17px, 1.8vw, 22px);
  color: var(--accent); font-variant-numeric: tabular-nums; }
.tl-row p { font-size: clamp(16px, 1.9vw, 21px); letter-spacing: -0.01em; }
@media (max-width: 700px) { .tl-row { grid-template-columns: 64px 1fr; gap: 16px; } }

/* --- full-bleed band ---
   The version this came from is a cream site, where these bands were a
   true colour inversion to black. Inverting a dark site would drop a
   white slab into the middle of it, so here the band is a lift instead:
   the panel tone, ruled top and bottom. Same job — it breaks the page
   into rooms — in this palette. Breaks out of the centred .wrap column,
   so put a plain .wrap inside to re-centre the content. */
.invert-band { width: 100vw; margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw); padding: 11vh 0;
  background: var(--panel);
  border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
/* the approach panels sit on the band, so they take its tone, not the page's */
.invert-band .approach div, .invert-band .approach a { background: var(--panel); }

/* --- "What you get" — offset card grid ---
   Two columns with the even one dropped 44px so the pairs stagger.
   Number-led: an oversized outlined index as a graphic element, which
   fills to the accent as the card lifts. */
/* no top margin: this sits in the right-hand column of .sec-grid, level
   with its label, not stacked under a heading */
.get-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.get-card { position: relative; border: 1px solid var(--rule); border-radius: 7px;
  padding: 32px 30px 30px; background: var(--panel); overflow: hidden;
  transition: transform .45s cubic-bezier(.2,.8,.2,1), border-color .4s ease, box-shadow .45s ease; }
.get-card:nth-child(even) { margin-top: 44px; }
.get-card:hover { transform: translateY(-5px); border-color: var(--accent);
  box-shadow: 0 22px 44px -28px rgba(0, 0, 0, .75); }
/* Inter 600, not the personal version's Anton — this site has one
   typeface family and an outlined 300 would read as a hairline smudge. */
.get-num { display: block; font-weight: 600; font-size: 62px; line-height: 1;
  letter-spacing: -0.04em; color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--ink) 26%, transparent);
  margin-bottom: 16px; transition: -webkit-text-stroke-color .4s ease; }
.get-card:hover .get-num { -webkit-text-stroke-color: var(--accent); }
.get-card h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(20px, 2.4vw, 28px);
  margin-bottom: 10px; }
.get-card p { color: var(--dim); font-size: 14.5px; line-height: 1.6; max-width: 42ch; }
@media (max-width: 720px) {
  .get-grid { grid-template-columns: 1fr; gap: 14px; }
  .get-card:nth-child(even) { margin-top: 0; }
}

/* --- "What I'm hired for" — capability pills + live caption ---
   The services wrap like a keyword cloud; hovering or tapping one fills
   it and swaps the large caption below to that service's description. */
.hire { margin-top: 34px; }
.hire-tags { display: flex; flex-wrap: wrap; gap: 12px; }
.pf .hire-tag { display: inline-flex; align-items: center; gap: 10px; padding: 12px 22px;
  border: 1px solid var(--rule); border-radius: 100px; letter-spacing: -0.01em;
  font-size: clamp(16px, 1.8vw, 22px); color: var(--ink);
  transition: color .35s ease, background-color .35s ease, border-color .35s ease; }
.hire-tag .mono { color: var(--accent); font-size: 11px; transition: color .35s ease; }
.pf .hire-tag:hover, .pf .hire-tag.on { background: var(--accent);
  border-color: var(--accent); color: var(--bg); }
.hire-tag:hover .mono, .hire-tag.on .mono { color: var(--bg); }
.hire-desc { margin-top: 28px; min-height: 3em; }
.hire-desc p { font-weight: 300; letter-spacing: -0.02em; color: var(--dim);
  font-size: clamp(18px, 2.3vw, 27px); line-height: 1.4; max-width: 40ch; }
.hire-desc b { font-weight: 400; color: var(--ink); font-style: normal; }

/* ==================================================================
   PHOTOGRAPHY PAGE
   ================================================================== */

/* --- hero slideshow ---
   Stacked full-bleed frames crossfading with a slow Ken Burns push.
   The caption block and the tick rail sit above them; the whole hero
   is a link to the project currently on screen. */
.phero { position: relative; height: min(88vh, 900px); overflow: hidden;
  border-bottom: 1px solid var(--rule); background: var(--panel); }
.phero-stage { position: absolute; inset: 0; }
.phero-fr { position: absolute; inset: 0; }
/* full-bleed cover — the frame fills the banner; object-position keeps the
   upper-middle (faces) in view when a tall photo is cropped to fit */
.phero-fr img { will-change: transform; object-position: center 30%; }
.phero-fr::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--bg) 46%, transparent) 0%,
    transparent 30%,
    color-mix(in srgb, var(--bg) 30%, transparent) 60%,
    color-mix(in srgb, var(--bg) 94%, transparent) 100%); }
.phero-in { position: relative; z-index: 2; height: 100%; display: flex;
  flex-direction: column; justify-content: flex-end; gap: 26px; padding: 8vh 28px 40px; }
/* top labels stay pinned to the top; caption + rail sit at the bottom */
.phero-top { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  margin-bottom: auto; }
.phero-cap h1 { font-weight: 300; letter-spacing: -0.04em; line-height: .96;
  font-size: clamp(44px, 9vw, 120px); text-wrap: balance; }
.phero-cap .sub { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 18px; }
.phero-open { display: inline-flex; align-items: center; gap: 10px; margin-top: 26px;
  border: 1px solid var(--rule); border-radius: 100px; padding: 10px 20px;
  background: color-mix(in srgb, var(--bg) 55%, transparent); backdrop-filter: blur(8px);
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .16em;
  text-transform: uppercase; transition: border-color .35s ease, color .35s ease; }
.phero-open:hover { border-color: var(--accent); color: var(--accent); }
.phero-open .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.phero-open:hover .arrow { transform: translateX(5px); }
.phero-foot { display: flex; align-items: flex-end; justify-content: space-between;
  gap: 24px; flex-wrap: wrap; }
/* tick rail — one bar per featured project, the active one fills with
   the autoplay timer */
.ticks { display: flex; gap: 10px; align-items: center; }
.tick-btn { width: 54px; height: 26px; position: relative; }
.tick-btn::before { content: ""; position: absolute; left: 0; right: 0; top: 50%;
  margin-top: -1px; height: 2px; background: var(--rule); }
.tick-btn i { position: absolute; left: 0; right: 0; top: 50%; margin-top: -1px;
  height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left; }
.tick-btn[aria-current="true"] i { animation: tickFill 5.4s linear forwards; }
@keyframes tickFill { to { transform: scaleX(1); } }
.tick-btn:hover i { transform: scaleX(1); opacity: .4; animation: none; }
.phero-count { font-variant-numeric: tabular-nums; }
.phero-count b { font-weight: 400; color: var(--accent); }
@media (max-width: 640px) { .phero { height: 78vh; } .tick-btn { width: 32px; } }

/* --- project intro band --- */
.band { padding: 12vh 0 2vh; }
.band h2 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.02;
  font-size: clamp(30px, 5vw, 66px); text-wrap: balance; }
.band p { color: var(--dim); font-size: 15px; line-height: 1.72; max-width: 46ch; margin-top: 20px; }

/* --- photo project detail --- */
/* Fixed, capped hero so a portrait source can't blow the box up to
   full-width-portrait height; the image covers a 16:9 frame instead. */
/* Shows the opening frame whole. This was aspect-ratio: 16/9 with the
   site-wide object-fit: cover, which guillotined every portrait — heads
   cropped off the top. Now it's a fixed-height stage with the picture
   fitted inside it, so a portrait keeps its full height and a landscape
   its full width, and nothing is scaled in or out.

   Height is set so the whole stage clears the fold: the masthead, the
   page's top padding, the back link and the title take ~310px above it,
   and at 76vh the foot of the frame sat 170px below the bottom of a
   900px window. The tightened spacing below buys most of that back. */
.pj-hero { position: relative; overflow: hidden; border-radius: 4px;
  border: 1px solid var(--rule); background: var(--panel);
  /* the third term is the one that matters on a short window: what's
     above the stage is ~310px of largely fixed chrome, so cap the frame
     at the space actually left rather than at a share of the height */
  height: min(60vh, 640px, calc(100svh - 330px)); }
/* scoped to this page — /work/:seed and /design/:slug share .detail and
   want their original, roomier lead-in */
.detail-pj { padding-top: 7vh; }
.detail-pj .back { margin-bottom: 26px; }
.detail-pj .detail-head { margin-bottom: 28px; }
.pj-hero img { width: 100%; height: 100%; object-fit: contain;
  transform: none; transition: none; }
.pj-intro { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(20px, 2.8vw, 34px);
  line-height: 1.32; max-width: 26ch; }

/* masonry-ish grid: CSS columns keep the frames' own aspect ratios */
.pgrid { columns: 3; column-gap: 18px; margin-top: 18px; }
@media (max-width: 900px) { .pgrid { columns: 2; } }
@media (max-width: 560px) { .pgrid { columns: 1; } }
.pgrid figure { break-inside: avoid; margin: 0 0 18px; position: relative;
  overflow: hidden; border-radius: 3px; border: 1px solid var(--rule);
  cursor: pointer; background: var(--panel); }
.pgrid img { transition: transform 1.1s cubic-bezier(.2,.8,.2,1), filter .6s ease; }
.pgrid figure:hover img { transform: scale(1.05); }
.pgrid figure::after { content: ""; position: absolute; inset: 0;
  background: var(--accent); opacity: 0; mix-blend-mode: overlay;
  transition: opacity .4s ease; pointer-events: none; }
.pgrid figure:hover::after { opacity: .14; }
.pgrid .idx { position: absolute; left: 12px; top: 12px; z-index: 2; opacity: 0;
  transform: translateY(-4px); transition: opacity .35s ease, transform .35s ease; }
.pgrid figure:hover .idx { opacity: 1; transform: none; }

/* --- frames coverflow ---------------------------------------------
   The active photograph centred at full size, its neighbours peeking in
   from either edge; the arrows ride over them. Every slide is the same
   height and takes its width from the picture's own aspect ratio, so a
   portrait is a tall narrow card and a landscape a wide one — both
   whole, neither cropped nor zoomed.

   Breaks the .wrap column to full width so the neighbours run off the
   sides of the screen rather than stopping at the text margin. */
.pcar { position: relative; width: 100vw; margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw); }
.pcar-stage { position: relative; height: min(64vh, 560px); overflow: hidden; }
/* Sizing is layout; the depth effect is transform only — that keeps
   every slide's measured width constant, which is what the centring
   maths reads mid-animation. */
.pcar-track { position: absolute; top: 0; bottom: 0; left: 0;
  display: flex; align-items: center; gap: clamp(14px, 2vw, 28px);
  will-change: transform;
  transition: transform .8s cubic-bezier(.22, .61, .36, 1); }
.pf .pcar-slide { position: relative; flex: 0 0 auto; height: 100%; padding: 0;
  border-radius: 10px; overflow: hidden; background: var(--panel);
  cursor: pointer; transform: scale(.8); opacity: .3; filter: saturate(.55);
  transition: transform .8s cubic-bezier(.22, .61, .36, 1),
    opacity .8s ease, filter .8s ease; }
.pf .pcar-slide.on { transform: scale(1); opacity: 1; filter: none; cursor: default;
  box-shadow: 0 30px 70px -30px rgba(0, 0, 0, .85); }
.pf .pcar-slide:not(.on):hover { opacity: .55; transform: scale(.83); }
/* the slide box already matches the picture's ratio, so contain and
   cover agree — contain is the safe one when a seed has no dimensions
   recorded and the box falls back to 3/2 */
.pcar-slide img { width: 100%; height: 100%; object-fit: contain;
  transform: none; transition: none; }

.pf .pcar-arrow { position: absolute; top: 50%; z-index: 3; width: 52px; height: 52px;
  transform: translateY(-50%); display: grid; place-items: center;
  border-radius: 50%; color: var(--ink);
  border: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
  background: color-mix(in srgb, var(--bg) 55%, transparent);
  backdrop-filter: blur(10px);
  transition: background-color .3s ease, color .3s ease, border-color .3s ease; }
.pcar-arrow.prev { left: clamp(12px, 3vw, 40px); }
.pcar-arrow.next { right: clamp(12px, 3vw, 40px); }
.pf .pcar-arrow:hover { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.pcar-arrow svg { width: 20px; height: 20px; fill: none;
  stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }

@media (max-width: 700px) {
  .pcar-stage { height: 52vh; }
  .pf .pcar-arrow { width: 44px; height: 44px; }
}

/* --- lightbox slideshow --- */
.lb { position: fixed; inset: 0; z-index: 400; background: color-mix(in srgb, var(--bg) 94%, #000);
  display: grid; grid-template-rows: auto minmax(0, 1fr) auto; padding: 20px 24px 28px; }
.lb-bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.lb-stage { position: relative; display: grid; place-items: center; overflow: hidden; }
.lb-stage img { width: auto; height: auto; max-width: 100%; max-height: calc(100vh - 120px);
  object-fit: contain; border-radius: 3px; }
.lb-foot { display: flex; justify-content: center; gap: 8px; }
.lb-x { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .16em;
  text-transform: uppercase; transition: color .3s;
  padding: 14px; margin: -14px; } /* bigger tap target, no layout shift */
.lb-x:hover { color: var(--accent); }
.lb-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3;
  width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center;
  border: 1px solid var(--rule); background: color-mix(in srgb, var(--bg) 60%, transparent);
  backdrop-filter: blur(8px); transition: border-color .3s ease, color .3s ease; }
.lb-arrow:hover { border-color: var(--accent); color: var(--accent); }
.lb-arrow.prev { left: 8px; } .lb-arrow.next { right: 8px; }

/* ==================================================================
   WEB DESIGN PAGE
   ================================================================== */

/* --- browser-chrome card ---
   The screenshot is taller than its frame; on hover it scrolls to its
   own bottom, so each card previews the whole page in place. */
.browser { border: 1px solid var(--rule); border-radius: 6px; overflow: hidden;
  background: var(--panel); transition: border-color .4s ease, transform .5s cubic-bezier(.2,.8,.2,1); }
.browser:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--rule)); }
.browser-bar { display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  border-bottom: 1px solid var(--rule); background: var(--bg); }
.browser-dots { display: flex; gap: 6px; }
.browser-dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--rule); }
.browser:hover .browser-dots i:first-child { background: var(--accent); }
.browser-url { flex: 1; text-align: center; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; }
.browser-view { position: relative; aspect-ratio: 16/11; overflow: hidden; }
.browser-view img { height: auto; min-height: 100%; object-position: top;
  transition: transform 3.2s cubic-bezier(.33,0,.2,1), filter .6s ease; }
.browser:hover .browser-view img { transform: translateY(calc(-100% + 100cqh)); }
.browser-view { container-type: size; }

/* branded placeholder inside a browser card when a project has no real
   cover image yet — the name + tag on the dark panel, no stock photo */
.browser-ph { aspect-ratio: 16/11; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px; text-align: center;
  padding: 24px; background:
    radial-gradient(120% 90% at 50% 18%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%),
    var(--panel); }
.browser-ph-name { font-weight: 300; letter-spacing: -0.03em; line-height: 1;
  font-size: clamp(28px, 4vw, 46px); }
.browser-ph .mono { opacity: 0.7; }

/* in-card live Figma preview: the prototype's starting frame renders in
   an iframe over the name/tag fallback (which shows while it loads).
   pointer-events:none so the whole card stays a link to the detail page,
   where the same prototype is fully interactive. */
.figbox { position: relative; aspect-ratio: 16/11; overflow: hidden; background: var(--panel); }
.figbox-fallback { position: absolute; inset: 0; aspect-ratio: auto; }
.figbox-frame { position: absolute; inset: 0; width: 100%; height: 100%; border: 0;
  pointer-events: none; }

/* live Figma prototype embed on a design detail page.
   A tall, height-driven frame (not a short landscape aspect box) so mobile
   prototypes render large and the visitor can scroll/click through the
   whole flow inside the iframe rather than it being cropped. */
.figma-embed { position: relative; height: min(82vh, 880px); background: var(--panel); }
.figma-embed iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
@media (max-width: 640px) { .figma-embed { height: min(80vh, 700px); } }

.wgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 28px; }
@media (max-width: 760px) { .wgrid { grid-template-columns: 1fr; } }
.wcard-cap { display: flex; justify-content: space-between; align-items: flex-start;
  gap: 16px; padding: 20px 4px 0; }
.wcard-cap h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(20px, 2.4vw, 27px);
  transition: color .3s; }
.wcard:hover .wcard-cap h3 { color: var(--accent); }
.wcard-cap p { color: var(--dim); font-size: 14.5px; line-height: 1.6; margin-top: 10px; max-width: 40ch; }
.tool-badge { flex: 0 0 auto; border: 1px solid var(--rule); border-radius: 100px;
  padding: 5px 12px; }

/* ==================================================================
   DESIGN INDEX — /design (magazine-style redesign)

   Masthead → one featured build (large split) → a numbered grid of the
   rest. Reuses the shared .browser / .figbox / .pill primitives so the
   card previews stay identical to the home page; only the surrounding
   layout and captions are new (dz- prefix) — Home.jsx keeps .wgrid/.wcard.
   ================================================================== */
/* --- hero: headline (left) + featured live preview (right) --- */
.dz-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
@media (max-width: 900px) { .dz-hero { grid-template-columns: 1fr; gap: 40px; } }
.dz-hero-copy { min-width: 0; }
.dz-kicker { display: flex; justify-content: space-between; align-items: baseline;
  gap: 14px 24px; flex-wrap: wrap; margin-bottom: 30px; }
.dz-hero-copy h1 { font-weight: 300; letter-spacing: -0.04em; line-height: .96;
  font-size: clamp(42px, 6.4vw, 92px); text-wrap: balance; }
.dz-role { margin-top: 18px; }
.dz-hero-cta { margin-top: 28px; }

/* the featured preview is a single link; a small label rides above the
   browser frame so the slot reads as "featured", not just another card */
.dz-hero-media { display: block; min-width: 0; }
.dz-hero-tag { display: block; color: var(--dim); margin-bottom: 14px; }
.dz-hero-media:hover .dz-hero-tag { color: var(--accent); }

.dz-open { display: inline-flex; align-items: center; gap: 10px; color: var(--accent); }
.dz-open .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.dz-hero-cta:hover .arrow { transform: translateX(6px); }

/* --- the rest: numbered grid --- */
.dz-work-sec { padding: 7vh 0 12vh; }
.dz-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 26px; }
@media (max-width: 760px) { .dz-grid { grid-template-columns: 1fr; } }
.dz-card { display: block; }
.dz-card-cap { padding: 18px 2px 0; }
.dz-card-line { display: flex; align-items: baseline; gap: 12px; }
.dz-card-idx { flex: 0 0 auto; color: var(--accent); font-variant-numeric: tabular-nums; }
.dz-card-line h3 { flex: 1; font-weight: 400; letter-spacing: -0.02em;
  font-size: clamp(19px, 2.2vw, 24px); transition: color .3s; }
.dz-card:hover .dz-card-line h3 { color: var(--accent); }
.dz-arrow { flex: 0 0 auto; color: var(--dim); }
.dz-arrow .arrow { display: inline-block; transition: transform .3s cubic-bezier(.2,.8,.2,1), color .3s; }
.dz-card:hover .dz-arrow { color: var(--accent); }
.dz-card:hover .dz-arrow .arrow { transform: translateX(5px); }
.dz-card-cap p { color: var(--dim); font-size: 14px; line-height: 1.6; margin-top: 10px; max-width: 40ch; }

/* stack pills */
.stack-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.pill { border: 1px solid var(--rule); border-radius: 100px; padding: 6px 14px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: .14em;
  text-transform: uppercase; color: var(--dim); transition: border-color .3s ease, color .3s ease; }
.pill:hover { border-color: var(--accent); color: var(--accent); }

/* external link button — .pf-scoped (not bare .extlink) so its border
   survives the .pf button { border: none; ... } reset when it's used
   on a <button> (NotFound/ErrorBoundary), not just an <a>. */
.pf .extlink { display: inline-flex; align-items: center; gap: 12px; border-radius: 100px;
  border: 1px solid var(--accent); color: var(--accent); padding: 13px 24px;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .16em;
  text-transform: uppercase; transition: background-color .35s ease, color .35s ease; }
.extlink:hover { background: var(--accent); color: var(--bg); }
.extlink[aria-disabled="true"] { border-color: var(--rule); color: var(--dim);
  pointer-events: none; }
.extlink .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.extlink:hover .arrow { transform: translate(3px, -3px); }

/* --- design detail screens --- */
.screens { display: flex; flex-direction: column; gap: 24px; margin-top: 18px; }
.screen { overflow: hidden; border-radius: 4px; border: 1px solid var(--rule);
  background: var(--panel); }
.screen img { will-change: transform; }

/* --- cross-page teaser (home → photography / design) --- */
.teaser { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--rule);
  border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; }
@media (max-width: 760px) { .teaser { grid-template-columns: 1fr; } }
.teaser a { background: var(--bg); padding: 44px 34px; display: flex;
  flex-direction: column; gap: 14px; min-height: 240px; justify-content: space-between;
  transition: background-color .4s ease; }
.teaser a:hover { background: var(--panel); }
.teaser h3 { font-weight: 300; letter-spacing: -0.03em; font-size: clamp(26px, 3.4vw, 42px);
  line-height: 1.05; transition: color .3s; }
.teaser a:hover h3 { color: var(--accent); }
.teaser p { color: var(--dim); font-size: 14.5px; line-height: 1.65; max-width: 34ch; }
.teaser .go { display: inline-flex; align-items: center; gap: 10px; }
.teaser a:hover .go .arrow { transform: translateX(6px); }
.teaser .go .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }

/* --- masthead standfirst + the two practices ---
   The home page introduces the person, so the masthead has to state
   both crafts above the fold. The standfirst says it in words; the
   two doors below let a visitor pick a practice immediately. */
.standfirst { font-weight: 300; letter-spacing: -0.02em;
  font-size: clamp(18px, 2.2vw, 27px); line-height: 1.4;
  max-width: 36ch; margin-top: 24px; }
.standfirst strong { font-weight: 400; color: var(--accent); }
.standfirst i { font-style: normal; color: var(--dim); }

.disciplines { display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: var(--rule); border: 1px solid var(--rule); border-radius: 4px;
  overflow: hidden; margin-top: 42px; max-width: 760px; }
@media (max-width: 640px) { .disciplines { grid-template-columns: 1fr; } }
.disc { position: relative; background: var(--bg); padding: 24px 26px;
  display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
.disc::before { content: ""; position: absolute; inset: 0; background: var(--accent);
  transform: translateY(101%); transition: transform .5s cubic-bezier(.76,0,.24,1); }
.disc:hover::before { transform: translateY(0); }
.disc > * { position: relative; z-index: 1; transition: color .35s ease .05s; }
.disc strong { font-weight: 400; letter-spacing: -0.02em;
  font-size: clamp(21px, 2.5vw, 30px); }
.disc .go { display: inline-flex; align-items: center; gap: 8px; margin-top: 2px; }
.disc .go .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.disc:hover .go .arrow { transform: translateX(6px); }
.disc:hover strong, .disc:hover .mono { color: var(--bg); }


@media (prefers-reduced-motion: reduce) {
  .pf *, .pf *::before, .pf *::after { animation: none !important; transition: none !important; }
  .rv { opacity: 1 !important; transform: none !important; }
  .hero-reveal { opacity: 1 !important; transform: none !important; }
  .logo-mark path { stroke-dashoffset: 0 !important; fill-opacity: 1 !important; }
  .logo-word b { opacity: 1 !important; transform: none !important; }
  .intro-sec .drawline, .metrics::after { transform: scaleX(1) !important; }
  .shot img, .detail-fig img, .about-portrait img { transform: none !important; }
  .phero-fr img, .pj-hero img, .pgrid img, .browser-view img { transform: none !important; }
  /* the hero holds its first frame — see HeroFrames, which skips the
     reel entirely rather than cutting between shots */
  .tick-btn[aria-current="true"] i { transform: scaleX(1) !important; }
  .iris-lens { display: none; }
}
`;
