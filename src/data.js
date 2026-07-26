/* ==================================================================
   DATA + STYLES — pure constants (no React components), so this file
   stays HMR-clean and is safe to import anywhere.

   PLACEHOLDER CONTENT: swap these for the client's real details.
   ================================================================== */

import manifest from "./photos.manifest.json";

/* Read the motion preference live so an OS change is respected on the
   next mount. Single source of truth, shared by every animated piece. */
export const prefersReduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export const P = {
  name: "Crafted & Captured",   // the studio, shown in the masthead bar
  photographer: "Viraj Mehta",  // the person the home page is about
  photoBrand: "Lensofviraj",    // the photography practice — /photography
  designBrand: "Design & Build",// the web practice — /design
  role: "Photographer & Designer",
  email: "hello@yourstudio.com",
  email2: "studio@yourstudio.com",
  phone: "+1 000 000 0000",
  city: "Vancouver",
  region: "Canada",
  /* footer "Elsewhere" list — swap for real handles */
  socials: [
    { k: "Instagram", v: "@lensofviraj", href: "https://instagram.com" },
    { k: "Behance", v: "viraj", href: "https://behance.net" },
    { k: "LinkedIn", v: "viraj", href: "https://linkedin.com" },
  ],
};

/* ==================================================================
   INTRO — the home page introduces the person, not one of the crafts.

   Viraj runs two practices in parallel: photography as Lensofviraj,
   and web design & build. A visitor landing cold should learn who he
   is, what he does, and what they walk away with — then choose a
   door. Each craft keeps its own page.

   PLACEHOLDER COPY: replace with Viraj's own words.
   ================================================================== */
export const INTRO = {
  lead: "Viraj Mehta makes the pictures, then designs and builds the place they live.",
  body: [
    "A designer and photographer based in Vancouver. With a background in Computer Engineering and Web & Mobile Application Design, Viraj blends technology, creativity and storytelling — designing intuitive digital products and capturing moments through photography.",
    "Two crafts, one pair of hands. Under Lensofviraj he shoots portraits, events and visual stories; as a designer he draws and ships the sites and apps those pictures end up living on. Hire one or hire both — when the same person shoots and builds, nothing gets lost in the handover.",
  ],
  /* the two doors, mirrored in the hero strip */
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
      v: "Sites designed and shipped end to end — Figma or Canva through to a live, fast, editable page.",
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

/* --- real photos (from Google Drive sync) ---------------------------
   scripts/sync-drive.mjs writes photos.manifest.json at build time.
   Every synced photo is keyed by seed → { sm, lg } local WebP URLs.
   When the manifest is empty (no credentials / fresh clone) we fall
   back to seeded picsum placeholders so the site still renders. */
const PHOTOS = new Map();
for (const p of manifest.work || []) PHOTOS.set(p.seed, p);
for (const p of manifest.gallery || []) PHOTOS.set(p.seed, p);
/* photos placed into projects from /admin — keyed `p-<driveFileId>` */
for (const p of manifest.projectPhotos || []) PHOTOS.set(p.seed, p);
if (manifest.portrait) PHOTOS.set(manifest.portrait.seed, manifest.portrait);

/* Curated web-design sample screenshots — full-page site & app mockups
   bundled in public/web-samples/ (never touched by the Drive/Contentful
   sync). They back the WEB_PROJECTS_FALLBACK covers so the design
   archive shows real interface work out of the box; any real project
   published from /admin still overrides these by seed. Keyed `ws-*`. */
const WEB_SAMPLES = {
  "ws-vertex": "/web-samples/project-vertex.jpg",
  "ws-galerie": "/web-samples/project-galerie.jpg",
  "ws-gusoar": "/web-samples/concept-1.jpg",
  "ws-saasf": "/web-samples/concept-2.jpg",
  "ws-surtielo": "/web-samples/concept-3.jpg",
  "ws-anton": "/web-samples/concept-4.jpg",
  "ws-listafre": "/web-samples/concept-5.jpg",
};
for (const [seed, url] of Object.entries(WEB_SAMPLES)) {
  PHOTOS.set(seed, { seed, sm: url, lg: url });
}

/* img(seed, w, h): resolves a seed to a local optimized image. Picks the
   small variant for thumbnail widths, the large one otherwise. Unknown
   seeds fall through to a picsum placeholder of the requested size. */
export const img = (s, w = 1200, h = 800) => {
  const p = PHOTOS.get(s);
  if (p) return w <= 640 ? p.sm : p.lg;
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
};

/* focus(seed): subject-aware CSS object-position ("50% 30%") detected at
   build time (see scripts/focus.mjs) and stored in the manifest, so an
   object-fit:cover crop keeps the main subject — a face, usually — in
   frame. Falls back to a gentle upper-centre bias for placeholders and
   any photo synced before framing existed. */
export const focus = (s) => PHOTOS.get(s)?.focus || "50% 40%";

/* ratio(seed, fw, fh): CSS aspect-ratio for a seed — the synced photo's
   real dimensions when the manifest has them, the placeholder's requested
   size otherwise. Lets free-flowing grids reserve space before the image
   loads, so lazy loading doesn't shift the layout. */
export const ratio = (s, fw = 3, fh = 2) => {
  const p = PHOTOS.get(s);
  return p?.w && p?.h ? `${p.w} / ${p.h}` : `${fw} / ${fh}`;
};

/* Warm paper base. A light, quiet editorial room: cream ground, dark
   ink, one orange accent — the "Crafted & Captured" theme, matched to
   the reference design. Every var(--…) rule in the CSS keeps working;
   only these values changed to repaint the whole site. */
const BASE = {
  bg: "hsl(38 25% 96%)",
  panel: "hsl(38 24% 92%)",
  ink: "hsl(210 20% 12%)",
  dim: "hsl(210 14% 42%)",
  rule: "hsl(210 20% 12% / 0.12)",
  /* light ground → show photographs at full strength, no dimming */
  filter: "none",
};

/* One fixed palette. The accent switcher was removed at the client's
   request, so the accent is a constant — every var(--accent) rule in
   the CSS keeps working, it just never changes. */
export const THEME = { ...BASE, accent: "hsl(18 78% 50%)" };

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

const SHEET_FALLBACK = ["pf-c1", "pf-c2", "pf-c3", "pf-c4", "pf-c5", "pf-c6"];

/* Prefer real synced photos; fall back to placeholders when the
   manifest is empty. FRAMES drives the work cards + /work/:seed pages;
   SHEET drives the contact strip + horizontal gallery. */
export const FRAMES = manifest.work?.length ? manifest.work : FRAMES_FALLBACK;
export const SHEET = manifest.gallery?.length
  ? manifest.gallery.map((p) => p.seed)
  : SHEET_FALLBACK;
export const TICKER = ["Editorial", "Events", "Portraits", "Art direction", "Colour grading", "Design & build", "Booking 2026"];

/* ==================================================================
   GALLERY — the simple, captionless grid on the Work page.

   Two fixed categories. A synced photo's category comes from the Drive
   subfolder it lives in (see scripts/sync-drive.mjs): a "Wildlife"
   subfolder lands in Wildlife; everything else falls into Portraits.
   With no manifest at all, placeholder seeds are dealt across the
   categories so the grid still renders.
   ================================================================== */
export const GALLERY_CATS = ["Wildlife", "Portraits"];

/* Gallery photos carry no sub-category in Contentful, so we sort them:
   an explicit "wild" folder/tag OR a wildlife-animal cue in the name
   lands in Wildlife; everything else (people, events) is Portraits. */
const WILD_RE = /wild|cheetah|lion|tiger|leopard|deer|buck|stag|elephant|bird|safari|antelope|zebra|giraffe|fox|bear|animal/i;
const normCat = (raw = "") => (WILD_RE.test(String(raw)) ? "Wildlife" : "Portraits");

/* `ar` (aspect ratio = w/h) rides along so the justified gallery can lay
   photos out at their true proportions without ever cropping. Fallback
   seeds have no real dimensions, so they get a varied, natural-looking
   spread instead. */
const FALLBACK_AR = [1.5, 0.72, 1.33, 0.8, 1.6, 0.75, 1.2];
export const GALLERY_ITEMS = manifest.gallery?.length
  ? manifest.gallery.map((p) => ({
      seed: p.seed,
      cat: normCat(p.cat || p.seed),
      ar: p.w && p.h ? p.w / p.h : 1.4,
    }))
  : SHEET_FALLBACK.map((s, i) => ({
      seed: s,
      cat: GALLERY_CATS[i % GALLERY_CATS.length],
      ar: FALLBACK_AR[i % FALLBACK_AR.length],
    }));

/* True once real design projects exist (published from /admin). Until
   then the Work page shows the reserved-room panel instead of the
   placeholder cards. */
export const HAS_REAL_WEB = !!manifest.webProjects?.length;

/* ==================================================================
   PHOTOGRAPHY — /photography and /photography/:slug

   FEATURED drives the hero slideshow; PHOTO_PROJECTS drives the sticky
   stack below it and every project page. Each project owns its own set
   of frames, so a project page can show a grid + a carousel roll.

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

/* Projects made in /admin win outright — they are the real content.
   Failing that we deal synced photos across the placeholder projects,
   and failing THAT the placeholders stand alone, so a fresh clone with
   no credentials still renders a complete site. */
export const PHOTO_PROJECTS = manifest.photoProjects?.length
  ? manifest.photoProjects
  : withSyncedPhotos(PHOTO_PROJECTS_FALLBACK);

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

/* ==================================================================
   WEB DESIGN — /design and /design/:slug

   Each project carries an external link (Figma, Canva, or the live
   site) plus a set of screens. `href: ""` renders the button disabled,
   so a project without a public link still looks intentional.
   ================================================================== */

const WEB_PROJECTS_FALLBACK = [
  {
    slug: "vertex-capital",
    t: "Vertex Capital",
    tag: "Fintech",
    year: "2024",
    role: "Design · Build",
    status: "Delivered",
    note: "A trading & wealth app — dashboard, live positions, and a marketing site sharing one design system. Swap for the real brief and what shipped.",
    intro: "A fintech product and its marketing site, drawn from one system.",
    tool: "Figma · React",
    href: "https://figma.com",
    live: "https://example.com",
    stack: ["Figma", "React", "TypeScript", "Vercel"],
    cover: "ws-vertex",
    shots: photoSeeds("web-vertex", 4),
    specs: [
      { k: "Scope", v: "Product UI, design system, front-end build" },
      { k: "Timeline", v: "8 weeks, design to live" },
      { k: "Handoff", v: "Figma library + deployed app" },
    ],
  },
  {
    slug: "galerie-noir",
    t: "Galerie Noir",
    tag: "Culture",
    year: "2025",
    role: "Design · Build",
    status: "Delivered",
    note: "A contemporary gallery — exhibitions, a shop, and an editorial voice, all typography-led. Replace with the real story.",
    intro: "An art gallery where the type does the talking.",
    tool: "Figma · Webflow",
    href: "https://figma.com",
    live: "https://example.com",
    stack: ["Figma", "Webflow", "GSAP"],
    cover: "ws-galerie",
    shots: photoSeeds("web-galerie", 4),
    specs: [
      { k: "Scope", v: "Art direction, UI design, CMS build" },
      { k: "Timeline", v: "6 weeks" },
      { k: "Handoff", v: "Editable CMS + brand kit" },
    ],
  },
  {
    slug: "gusoar",
    t: "Gusoar",
    tag: "E-commerce",
    year: "2025",
    role: "Concept · UI",
    note: "A fashion storefront concept — product grid, quick-add, and a checkout that stays out of the way.",
    intro: "A fashion storefront concept, from grid to checkout.",
    tool: "Figma",
    href: "https://figma.com",
    live: "",
    stack: ["Figma", "Shopify"],
    cover: "ws-gusoar",
    shots: photoSeeds("web-gusoar", 4),
    specs: [
      { k: "Scope", v: "UX flow, UI design, prototype" },
      { k: "Timeline", v: "Self-directed" },
      { k: "Handoff", v: "Interactive Figma prototype" },
    ],
  },
  {
    slug: "saasf",
    t: "Saasf",
    tag: "SaaS",
    year: "2025",
    role: "Concept · Product",
    note: "A SaaS dashboard concept — dense data made calm, with a component set built to scale.",
    intro: "A SaaS dashboard concept: dense data, kept calm.",
    tool: "Figma · React",
    href: "https://figma.com",
    live: "",
    stack: ["Figma", "React", "Recharts"],
    cover: "ws-saasf",
    shots: photoSeeds("web-saasf", 4),
    specs: [
      { k: "Scope", v: "Information design, UI kit, prototype" },
      { k: "Timeline", v: "Self-directed" },
      { k: "Handoff", v: "Component library" },
    ],
  },
  {
    slug: "surtielo",
    t: "Surtielo",
    tag: "Restaurant",
    year: "2024",
    role: "Concept · Brand",
    note: "A restaurant brand concept — a warm one-pager with the menu and a reservation flow front and centre.",
    intro: "A restaurant one-pager: menu, mood, and a table booked.",
    tool: "Figma",
    href: "https://figma.com",
    live: "",
    stack: ["Figma", "Illustrator"],
    cover: "ws-surtielo",
    shots: photoSeeds("web-surtielo", 4),
    specs: [
      { k: "Scope", v: "Brand direction, one-page site" },
      { k: "Timeline", v: "Self-directed" },
      { k: "Handoff", v: "Figma file" },
    ],
  },
  {
    slug: "anton-studio",
    t: "Anton Studio",
    tag: "Editorial",
    year: "2025",
    role: "Concept · UI",
    note: "An outdoor editorial concept — big imagery, a mountain hero, and a reading experience that gets out of the way.",
    intro: "An editorial concept built around big landscape imagery.",
    tool: "Figma · Webflow",
    href: "https://figma.com",
    live: "",
    stack: ["Figma", "Webflow"],
    cover: "ws-anton",
    shots: photoSeeds("web-anton", 4),
    specs: [
      { k: "Scope", v: "Art direction, UI design" },
      { k: "Timeline", v: "Self-directed" },
      { k: "Handoff", v: "Figma file" },
    ],
  },
  {
    slug: "listafre",
    t: "Listafre",
    tag: "Travel",
    year: "2026",
    role: "Concept · Product",
    note: "A travel-planning app concept — itineraries, saved places, and a booking flow designed for the phone first.",
    intro: "A travel-planning app concept, designed phone-first.",
    tool: "Figma",
    href: "https://figma.com",
    live: "",
    stack: ["Figma", "React Native"],
    cover: "ws-listafre",
    shots: photoSeeds("web-listafre", 4),
    specs: [
      { k: "Scope", v: "UX, UI design, prototype" },
      { k: "Timeline", v: "Self-directed" },
      { k: "Handoff", v: "Interactive prototype" },
    ],
  },
];

/* Same precedence as the photo projects: /admin content first, the
   placeholder set only when nothing has been published yet. */
export const WEB_PROJECTS = manifest.webProjects?.length
  ? manifest.webProjects
  : WEB_PROJECTS_FALLBACK;

export const METRICS = [
  { v: 10, s: "+", k: "Years of experience" },
  { v: 2014, s: "", k: "Behind a lens since" },
  { v: 2, s: "", k: "Crafts, one pair of hands" },
  { v: 100, s: "%", k: "Shot & built in-house" },
];

export const QUOTES = [
  { q: "A short, specific line about the work. Replace with a real quote once you have one.", a: "Client Name", r: "Role, Company" },
  { q: "Another testimonial goes here. Two sentences at most — the shorter, the better.", a: "Client Name", r: "Role, Company" },
  { q: "One more placeholder quote. Swap these three out and delete the rest.", a: "Client Name", r: "Role, Company" },
];

export const SHOTLIST = [
  { k: "Portraits", v: "Studio or location — natural, unforced, and true to the person." },
  { k: "Events", v: "Moments as they happen, told as one visual story from start to finish." },
  { k: "Visual storytelling", v: "A series with a thread running through it, not just a folder of good frames." },
  { k: "UI/UX design", v: "Web and mobile products designed around how people actually use them." },
  { k: "Design & build", v: "Figma or Canva through to a live, fast, editable site — I ship what I design." },
  { k: "Colour grading", v: "Consistent across a whole set, so the work reads as one body, not stray shots." },
];

export const ABOUT = {
  portrait: manifest.portrait?.seed ?? "pf-about",
  lead: "I'm Viraj Mehta — a designer and photographer passionate about creating meaningful visual experiences.",
  body: [
    "My creative journey started with technology. While studying Computer Engineering I built a strong foundation in programming and problem-solving, working as a developer and shipping solutions through code. But I was always drawn to the creative side — not just how things work, but how they look, feel and connect with people.",
    "That curiosity led me into UI/UX and Web & Mobile Application design, where I began building applications and websites that pair real functionality with meaningful user experience. Alongside it, photography has always been my other language. I picked up my first point-and-shoot in 2014; in 2018 I bought my first DSLR, went deeper, and eventually began teaching others — and from 2019 to 2020 I led a photography group in college, organising shoots and helping fellow creators find their own perspective.",
    "Today, based in Vancouver, I bring engineering, design and photography together — creating digital experiences and capturing visual stories that connect technology with human emotion.",
  ],
  approach: [
    { k: "Logic meets craft", v: "An engineer's problem-solving behind every frame and every layout — analytical where it helps, human where it matters." },
    { k: "One pair of hands", v: "Shot, designed and built by the same person, so nothing gets lost in a handover." },
    { k: "Built to connect", v: "Whether it's a site or a photograph, the goal is the same — experiences that communicate emotion, not just information." },
  ],
  timeline: [
    { y: "2014", t: "First point-and-shoot camera — curiosity grows into a love of visual storytelling." },
    { y: "2018", t: "Bought my first DSLR, went deeper into photography, and began teaching others." },
    { y: "2019", t: "Led a photography group in college — organising shoots and mentoring creators." },
    { y: "2021", t: "Studied Web & Mobile Application Design; started building products end to end." },
    { y: "2026", t: "Based in Vancouver, bringing engineering, design and photography together." },
  ],
};

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.pf, .pf *, .pf *::before, .pf *::after { box-sizing: border-box; margin: 0; }
.pf { background: var(--bg); color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif; font-weight: 400;
  -webkit-font-smoothing: antialiased; letter-spacing: -0.01em;
  /* clip (not hidden) so horizontal overflow is still contained WITHOUT
     turning .pf into a scroll container — hidden would force overflow-y to
     'auto' and break every position:sticky inside (nav bar, stacking cards). */
  transition: color .5s ease; overflow-x: clip; position: relative; min-height: 100vh; }
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

/* --- dark sections ---
   Redefines the theme variables to a warm near-black for any block tagged
   .invert, so the whole subtree repaints itself (ink → cream, hairlines →
   light) while the orange accent stays put. Mixes black bands into the
   cream site for rhythm. .invert-band additionally breaks a block out to
   full viewport width — for dark bands that sit inside a centred .wrap
   column (e.g. on /about); put a plain .wrap inside to re-centre content. */
.invert { --bg: hsl(30 8% 8%); --panel: hsl(30 8% 13%); --ink: hsl(40 33% 96%);
  --dim: hsl(38 9% 64%); --rule: hsl(40 33% 96% / 0.15);
  background: var(--bg); color: var(--ink); }
.invert-band { width: 100vw; margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw); padding: 11vh 0; }

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
/* Hides while reading down, returns the moment you scroll up (driven
   from App.jsx) — so the page is uninterrupted, but navigation is one
   flick away from anywhere, including the bottom. */
.bar { position: sticky; top: 0; z-index: 80;
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: blur(16px); border-bottom: 1px solid var(--rule);
  transition: transform .42s cubic-bezier(.2,.8,.2,1); }
.bar.hide { transform: translateY(-101%); }
.bar-in { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 9px 28px; max-width: 1180px; margin: 0 auto; }
.brand { color: var(--ink); }
/* sits where the accent switcher used to be */
.barmeta { text-align: right; }
@media (max-width: 860px) { .barmeta { display: none; } }
.prog { position: absolute; left: 0; bottom: -1px; height: 1px; background: var(--accent);
  transition: width .1s linear; }

/* --- masthead --- */
.mast { padding: 5vh 0 8vh; position: relative; }
.mast .wrap { position: relative; z-index: 1; }
.hero-canvas { position: absolute !important; inset: 0; z-index: 0;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(120% 90% at 50% 42%, #000 30%, transparent 78%);
          mask-image: radial-gradient(120% 90% at 50% 42%, #000 30%, transparent 78%); }
.display { font-family: 'Anton', sans-serif; font-weight: 400; text-transform: uppercase;
  letter-spacing: -0.015em; line-height: .88;
  font-size: clamp(52px, 11.5vw, 150px); text-wrap: balance; }
.display .ch { display: inline-block; opacity: 0; transform: translateY(0.4em) rotate(3deg);
  filter: blur(12px); animation: charUp 1s cubic-bezier(.16,1,.3,1) both; }
@keyframes charUp { to { opacity: 1; transform: none; filter: blur(0); } }
/* the two lines of a SlideHeading slide in from opposite sides (see ui.jsx) */
.sh-line { display: inline-block; will-change: transform; }
.mast .drawline { height: 1px; background: var(--accent); transform: scaleX(0); transform-origin: left;
  margin-top: 40px; animation: draw 1.1s .85s cubic-bezier(.76,0,.24,1) forwards; }
@keyframes draw { to { transform: scaleX(1); } }
.mast .role { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  margin-top: 18px; }

/* --- contact strip (marquee) --- */
.strip { overflow: hidden; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.strip-track { display: flex; gap: 10px; padding: 14px 0; width: max-content;
  animation: roll 48s linear infinite; }
.strip:hover .strip-track { animation-play-state: paused; }
.strip-fr { flex: 0 0 auto; width: 200px; height: 132px; overflow: hidden; border-radius: 2px; }
@keyframes roll { to { transform: translateX(-50%); } }

/* --- ticker --- */
.tick { border-bottom: 1px solid var(--rule); overflow: hidden; padding: 16px 0; display: flex;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
.tick-in { display: flex; width: max-content; animation: roll 34s linear infinite; }
.tick-in em { font-style: normal; font-weight: 500; font-size: 15px; white-space: nowrap;
  padding: 0 20px; display: flex; align-items: center; gap: 20px; }
.tick-in em::after { content: "·"; color: var(--accent); }

/* --- thesis --- */
.thesis { padding: 15vh 0 12vh; }
.thesis-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 56px; align-items: end; }
@media (max-width: 860px) { .thesis-grid { grid-template-columns: 1fr; align-items: start; gap: 32px; } }
.lead { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(24px, 3.6vw, 44px);
  line-height: 1.22; max-width: 22ch; }
.lead i { font-style: normal; color: var(--accent); }
.aside { max-width: 400px; color: var(--dim); line-height: 1.72; font-size: 15px; }
.aside p + p { margin-top: 16px; }

/* --- work: sticky stacking cards --- */
.stack { padding-bottom: 18vh; }
.card { position: sticky; top: 92px; background: var(--panel); border: 1px solid var(--rule);
  border-radius: 4px; margin-bottom: 24px; overflow: hidden;
  transition: border-color .4s ease; }
.card:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--rule)); }
.card-in { display: grid; grid-template-columns: 1.25fr 1fr; }
@media (max-width: 860px) { .card-in { grid-template-columns: 1fr; } .card { top: 72px; } }
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

/* --- auto-playing horizontal gallery (marquee) --- */
.gallery { overflow: hidden; border-top: 1px solid var(--rule); background: var(--bg);
  padding: 12vh 0; }
.gallery-head { padding-bottom: 6vh; }
.gallery-head h2 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.02;
  font-size: clamp(30px, 4.4vw, 60px); text-wrap: balance; }
.gallery-head p { color: var(--dim); font-size: 15px; line-height: 1.7; margin-top: 20px; max-width: 34ch; }
.gallery-view { overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent); }
.gallery.reduced .gallery-view { overflow-x: auto; -webkit-overflow-scrolling: touch; }
/* duplicated track (items rendered twice) drifts -50% for a seamless loop.
   margin-right (not gap) keeps a trailing gap so the wrap point is exact. */
.gallery-track { display: flex; align-items: center; width: max-content;
  animation: roll 80s linear infinite; }
.gallery:hover .gallery-track { animation-play-state: paused; }
.gal-fr { flex: 0 0 auto; width: min(40vw, 420px); aspect-ratio: 3/4; overflow: hidden;
  border-radius: 4px; border: 1px solid var(--rule); margin-right: 24px; }
@media (max-width: 700px) { .gal-fr { width: 70vw; } }

/* --- brand logo in the bar ---
   Drop the real file at public/logo.svg (or .png / .webp) and it is
   picked up automatically; until then the wordmark text shows. The
   .pf img reset (width/height 100% + filter) must not apply here. */
.pf .logo-img { width: auto; height: 26px; object-fit: contain; filter: none; display: block; }
.brand { display: inline-flex; align-items: center; min-height: 26px; }
@media (max-width: 720px) { .pf .logo-img { height: 24px; } }

/* Inline brand mark (shown when no logo file is present): the C&
   monogram + a compact Anton wordmark. Explicitly sized so the SVG
   never inflates the bar. On load (and every 15s, via a remount in the
   Logo component) the outline draws itself, the fill develops in, and the
   wordmark letters cascade after it; hovering gives a small lens twist. */
.logo { display: inline-flex; align-items: center; gap: 9px; line-height: 1; }
.logo-mark { height: 22px; width: auto; display: block;
  transition: transform .5s cubic-bezier(.2,.8,.2,1); }
.logo:hover .logo-mark { transform: rotate(-7deg) scale(1.08); }
/* pathLength="1" on the <path> normalises the outline to 1, so the dash
   draw is resolution-independent; the fill then fades in over it. */
.logo-mark path { fill: var(--ink); fill-opacity: 0;
  stroke: var(--ink); stroke-width: 230; stroke-dasharray: 1; stroke-dashoffset: 1;
  animation: logoDraw 1s cubic-bezier(.65,0,.35,1) forwards, logoFill .6s ease .82s forwards; }
@keyframes logoDraw { to { stroke-dashoffset: 0; } }
@keyframes logoFill { to { fill-opacity: 1; } }
.logo-word { font-family: 'Anton', sans-serif; text-transform: uppercase; white-space: pre;
  font-size: 14px; letter-spacing: .02em; color: var(--ink); }
.logo-word b { font-weight: 400; display: inline-block; opacity: 0;
  transform: translateY(0.25em);
  animation: logoLetter .5s cubic-bezier(.16,1,.3,1) both; }
@keyframes logoLetter { to { opacity: 1; transform: none; } }
@media (max-width: 620px) { .logo-word { display: none; } }

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

/* justified gallery: rows fill the width edge-to-edge, every photo at its
   true aspect ratio (width + row-height are computed in JS to match), so
   nothing is cropped and the rows still line up cleanly. */
.jgal { display: flex; flex-direction: column; gap: 14px; margin-top: 6px; }
.jrow { display: flex; }
.jfig { margin: 0; flex: 0 0 auto; overflow: hidden; border-radius: 5px;
  border: 1px solid var(--rule); background: var(--panel); }
.jfig img { width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 1.1s cubic-bezier(.2,.8,.2,1); }
.jfig:hover img { transform: scale(1.04); }

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

/* --- "What you get" — offset card grid ------------------------------
   Two columns, the even column dropped 44px so the pairs stagger up and
   down (asymmetry reads premium). Each card is number-led: an oversized
   outlined Anton index as a graphic element, which fills to the accent
   on hover as the card lifts. Deliberately unlike the timeline rows. */
.get-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.get-card { position: relative; border: 1px solid var(--rule); border-radius: 7px;
  padding: 32px 30px 30px; background: var(--bg); overflow: hidden;
  transition: transform .45s cubic-bezier(.2,.8,.2,1), border-color .4s ease, box-shadow .45s ease; }
.get-card:nth-child(even) { margin-top: 44px; }
.get-card:hover { transform: translateY(-5px); border-color: var(--accent);
  box-shadow: 0 22px 44px -28px rgba(30,20,10,.4); }
.get-num { display: block; font-family: 'Anton', sans-serif; font-size: 64px; line-height: 1;
  color: transparent; -webkit-text-stroke: 1px var(--rule); margin-bottom: 16px;
  transition: -webkit-text-stroke-color .4s ease; }
.get-card:hover .get-num { -webkit-text-stroke-color: var(--accent); }
.get-card h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(20px, 2.4vw, 28px);
  margin-bottom: 10px; }
.get-card p { color: var(--dim); font-size: 14.5px; line-height: 1.6; max-width: 42ch; }
@media (max-width: 720px) { .get-grid { grid-template-columns: 1fr; gap: 14px; }
  .get-card:nth-child(even) { margin-top: 0; } }

/* --- "What I'm hired for" — capability pills + live caption ----------
   The services are pills that wrap like a keyword cloud; hovering (or
   tapping) one fills it with the accent and swaps the large caption
   below to that service's description. Interactive, and nothing like
   the card grid above or the timeline rows. */
.hire-tags { display: flex; flex-wrap: wrap; gap: 12px; }
.hire-tag { display: inline-flex; align-items: center; gap: 10px; padding: 12px 22px;
  border: 1px solid var(--rule); border-radius: 100px; letter-spacing: -0.01em;
  font-size: clamp(16px, 1.8vw, 22px);
  transition: color .35s ease, background-color .35s ease, border-color .35s ease; }
.hire-tag .mono { color: var(--accent); font-size: 11px; transition: color .35s ease; }
.hire-tag:hover, .hire-tag.on { background: var(--accent); border-color: var(--accent); color: var(--bg); }
.hire-tag:hover .mono, .hire-tag.on .mono { color: var(--bg); }
.hire-desc { margin-top: 28px; min-height: 3em; }
.hire-desc p { font-weight: 300; letter-spacing: -0.02em; color: var(--dim);
  font-size: clamp(18px, 2.3vw, 27px); line-height: 1.4; max-width: 40ch; }
.hire-desc b { font-weight: 400; color: var(--ink); font-style: normal; }

/* --- quotes slideshow --- */
.slide { position: relative; min-height: 200px; }
.q p { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(21px, 2.7vw, 32px);
  line-height: 1.35; max-width: 24ch; }
.q footer { margin-top: 22px; }
/* Each dot is a 26px-tall tap target; the 2px bar centred in it is the visual. */
.dots { display: flex; gap: 8px; margin-top: 16px; }
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
.colophon dd a { transition: color .3s ease; }
.colophon dd a:hover { color: var(--accent); }

/* --- shared site footer (always dark, every public page) --- */
.site-foot { padding: 9vh 0 46px; }
.site-foot .colophon { margin-top: 0; }
.foot-nav a { display: block; width: fit-content; }
.foot-nav a + a { margin-top: 4px; }
.foot-base { display: flex; justify-content: space-between; flex-wrap: wrap;
  gap: 10px; padding-top: 18px; }

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

/* --- custom cursor (fine-pointer, non-reduced only) --- */
.cursor-on, .cursor-on * { cursor: none !important; }
.cursor { position: fixed; top: 0; left: 0; z-index: 600; width: 12px; height: 12px;
  border-radius: 50%; background: #fff; mix-blend-mode: difference; pointer-events: none;
  opacity: 0; display: grid; place-items: center; will-change: transform;
  transition: width .3s cubic-bezier(.2,.8,.2,1), height .3s cubic-bezier(.2,.8,.2,1),
    background-color .3s ease, mix-blend-mode 0s; }
.cursor.is-hover { width: 40px; height: 40px; }
.cursor.is-view { width: 84px; height: 84px; background: var(--accent); mix-blend-mode: normal; }
.cursor-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--bg); opacity: 0; transition: opacity .25s; white-space: nowrap; }
.cursor.is-view .cursor-label { opacity: 1; }

/* --- nav links in the bar --- */
.nav { display: flex; gap: 22px; align-items: center; }
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
.about-hero h1 { font-family: 'Anton', sans-serif; font-weight: 400; text-transform: uppercase;
  letter-spacing: -0.015em; line-height: .9;
  font-size: clamp(44px, 8vw, 104px); text-wrap: balance; }
.about-lead { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(20px, 2.6vw, 30px);
  line-height: 1.35; margin-top: 28px; max-width: 22ch; }
.about-lead i { font-style: normal; color: var(--accent); }
.about-portrait { position: relative; overflow: hidden; border-radius: 4px;
  border: 1px solid var(--rule); aspect-ratio: 4/5; }
.about-portrait img { will-change: transform; }
/* bio: copy on the left (capped for readability), particle sphere on the right */
.about-body { display: grid; grid-template-columns: 1fr minmax(0, 60ch); gap: 40px;
  align-items: center; margin: 12vh 0; }
.about-body-text { color: var(--dim); line-height: 1.8; font-size: 16px; }
.about-body-text p + p { margin-top: 20px; }
.about-body-viz { position: relative; height: 460px; }
.psphere { position: absolute; inset: 0; cursor: grab; }
.psphere:active { cursor: grabbing; }
@media (max-width: 820px) { .about-body { grid-template-columns: 1fr; }
  .about-body-viz { display: none; } }
.approach { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1px;
  background: var(--rule); border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; }
/* panels are plain <div> on the about page and <a> on the home page,
   where each one is a door into that practice */
.approach div, .approach a { background: var(--bg); padding: 30px 26px; display: block;
  transition: background-color .4s ease; }
.approach a:hover { background: var(--panel); }
.approach a:hover h3 { color: var(--accent); }
.approach h3 { transition: color .3s ease; }
.approach h3 { font-weight: 400; letter-spacing: -0.02em; font-size: 19px; margin-bottom: 12px; }
.approach p { color: var(--dim); font-size: 14.5px; line-height: 1.6; }
.timeline { margin-top: 4vh; }
.tl-row { display: grid; grid-template-columns: 90px 1fr; gap: 24px; align-items: baseline;
  padding: 22px 0; border-bottom: 1px solid var(--rule);
  transition: padding-left .35s cubic-bezier(.2,.8,.2,1); }
.tl-row:first-child { border-top: 1px solid var(--rule); }
.tl-row:hover { padding-left: 10px; }
.tl-row b { font-weight: 400; color: var(--accent); font-variant-numeric: tabular-nums; }
.tl-row p { font-size: clamp(16px, 1.9vw, 21px); letter-spacing: -0.01em; }

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
.phero-fr img { will-change: transform; }
/* No full-frame wash — the photo shows at full strength. Only a soft
   scrim at the very top and bottom edges, purely so the white caption
   and ticks stay legible; the middle of the frame is untouched. */
.phero-fr::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(180deg, rgba(12,14,18,0.42) 0%, rgba(12,14,18,0) 22%),
    linear-gradient(0deg, rgba(12,14,18,0.55) 0%, rgba(12,14,18,0) 32%); }
.phero-in { position: relative; z-index: 2; height: 100%; display: flex;
  flex-direction: column; justify-content: space-between; padding: 8vh 0 34px; }
.phero-top { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
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
/* hero text sits in white over the full-bleed photo (accent stays orange
   via inline styles), with a light shadow so it reads on any frame */
.phero-in { color: #fff; }
.phero-in .mono { color: rgba(255,255,255,0.82); }
.phero-cap h1 { color: #fff; text-shadow: 0 2px 34px rgba(0,0,0,0.4); }
.phero-open { border-color: rgba(255,255,255,0.42); color: #fff;
  background: rgba(10,12,16,0.28); }
.tick-btn::before { background: rgba(255,255,255,0.4); }

/* --- project intro band --- */
.band { padding: 12vh 0 2vh; }
.band h2 { font-family: 'Anton', sans-serif; font-weight: 400; text-transform: uppercase;
  letter-spacing: -0.015em; line-height: .92;
  font-size: clamp(30px, 5vw, 66px); text-wrap: balance; }
.band p { color: var(--dim); font-size: 15px; line-height: 1.72; max-width: 46ch; margin-top: 20px; }

/* --- coverflow reel (3D slideshow) --- */
.cflow-sec { height: clamp(360px, 54vh, 560px); margin: clamp(48px, 8vh, 110px) 0 0;
  padding: 0 12px; }

/* --- flat-slat coverflow carousel (CoverflowCarousel.jsx) --- */
.cfc { position: relative; width: 100vw; margin-left: calc(50% - 50vw); }
.cfc-stage { position: relative; width: 100%; height: clamp(440px, 76vh, 780px);
  overflow: hidden; touch-action: pan-y; isolation: isolate; outline: none; }
/* arrows sit just inside each side slat (over the neighbouring frames),
   positioned off the measured active-card half-width (--cfc-inner). */
.cfc-arrow { position: absolute; top: 50%; z-index: 2000;
  width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center;
  font-size: 24px; line-height: 1; color: var(--ink);
  border: 1px solid var(--rule2, var(--rule)); background: color-mix(in srgb, var(--bg) 72%, transparent);
  backdrop-filter: blur(8px); transition: border-color .3s ease, color .3s ease, background-color .3s ease; }
.cfc-arrow:hover { border-color: var(--accent); color: var(--accent); }
.cfc-arrow.prev { left: calc(50% - var(--cfc-inner, 34%) - 16px); transform: translate(-50%, -50%); }
.cfc-arrow.next { left: calc(50% + var(--cfc-inner, 34%) + 16px); transform: translate(-50%, -50%); }
.cfc-dots { display: flex; justify-content: center; gap: 9px; margin-top: 24px; }
.cfc-dot { width: 22px; height: 20px; position: relative; }
.cfc-dot::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; margin-top: -1px;
  height: 2px; border-radius: 2px; background: var(--rule); transition: background-color .3s ease; }
.cfc-dot.on::before { background: var(--accent); }

/* optional coverflow controls (arrows + dots) — used on the project page */
.cflow-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 6;
  width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center;
  font-size: 22px; line-height: 1; color: var(--ink);
  border: 1px solid var(--rule2, var(--rule)); background: color-mix(in srgb, var(--bg) 66%, transparent);
  backdrop-filter: blur(8px); transition: border-color .3s ease, color .3s ease, background-color .3s ease; }
.cflow-arrow:hover { border-color: var(--accent); color: var(--accent); }
.cflow-arrow.prev { left: clamp(10px, 4vw, 46px); }
.cflow-arrow.next { right: clamp(10px, 4vw, 46px); }
.cflow-dots { position: absolute; left: 0; right: 0; bottom: 10px; z-index: 6;
  display: flex; justify-content: center; gap: 9px; }
.cflow-dot { width: 22px; height: 20px; position: relative; }
.cflow-dot::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; margin-top: -1px;
  height: 2px; border-radius: 2px; background: var(--rule2, var(--rule)); transition: background-color .3s ease; }
.cflow-dot.on::before { background: var(--accent); }

/* --- sticky stacking project cards ---
   Each card sticks near the top with a small extra offset per card, so
   the next one rides up and overlaps it; a scroll-linked scale (set in
   the component) shrinks the covered cards so they recede. */
.pstack { position: relative; padding-top: 4vh; padding-bottom: 3vh; }
.pcard-wrap { position: sticky; margin-bottom: clamp(48px, 7vw, 108px); }
.pcard { width: 100%; background: var(--bg); transform-origin: top center;
  border: 1px solid color-mix(in srgb, var(--ink) 22%, transparent);
  border-radius: clamp(24px, 3.6vw, 50px); padding: clamp(16px, 2.2vw, 30px);
  box-shadow: 0 36px 90px -50px rgba(20, 20, 26, .45); }
.pcard-head { display: flex; align-items: center; gap: clamp(10px, 1.6vw, 22px); flex-wrap: wrap;
  border-bottom: 1px solid var(--rule); padding-bottom: clamp(14px, 1.8vw, 22px);
  margin-bottom: clamp(16px, 2vw, 26px); }
.pcard-num { font-family: 'Anton', sans-serif; font-weight: 400; color: var(--ink);
  line-height: .8; font-size: clamp(32px, 5.5vw, 72px); }
.pcard-badge { border: 1px solid var(--rule); border-radius: 100px; padding: 5px 13px;
  color: var(--dim); }
.pcard-name { flex: 1 1 auto; font-weight: 500; text-transform: uppercase; letter-spacing: -0.01em;
  font-size: clamp(17px, 2.6vw, 34px); color: var(--ink); }
.pcard-open { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid var(--ink); border-radius: 100px; padding: 9px 18px; color: var(--ink);
  transition: background-color .3s ease, color .3s ease; }
.pcard-open:hover { background: var(--ink); color: var(--bg); }
.pcard-open .arrow { transition: transform .3s ease; }
.pcard-open:hover .arrow { transform: translateX(4px); }
.pcard-media { display: grid; grid-template-columns: 1fr; gap: clamp(12px, 1.5vw, 20px); }
@media (min-width: 720px) { .pcard-media { grid-template-columns: 5fr 7fr; } }
.pcard-col { display: flex; flex-direction: column; gap: clamp(12px, 1.5vw, 20px); }
.pcard-img { position: relative; display: block; overflow: hidden; background: var(--panel);
  border-radius: clamp(14px, 2.2vw, 30px); }
.pcard-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  transition: transform 1.1s cubic-bezier(.2, .8, .2, 1); }
.pcard-media:hover .pcard-img img { transform: scale(1.04); }
.pcard-img.sm { height: clamp(110px, 13vw, 178px); }
.pcard-img.md { height: clamp(140px, 17vw, 262px); }
@media (max-width: 719px) { .pcard-img.big { height: 62vw; } }

/* --- photo project detail --- */
.pj-hero { position: relative; overflow: hidden; border-radius: 4px;
  border: 1px solid var(--rule); aspect-ratio: 16/9; }
.pj-hero img { will-change: transform; }
.pj-intro { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(20px, 2.8vw, 34px);
  line-height: 1.32; max-width: 26ch; }

/* professional editorial header + meta (no technical/EXIF details) */
.pj.detail { padding-top: 12vh; }
.pj-head { max-width: 900px; margin-bottom: clamp(34px, 5vw, 58px); }
.pj-kicker { color: var(--accent); font-size: 10px; }
.pj-title { font-size: clamp(42px, 9vw, 116px); line-height: .9; margin-top: 16px; }
.pj-lede { margin-top: 24px; max-width: 52ch; color: var(--dim);
  font-size: clamp(16px, 1.8vw, 20px); line-height: 1.6; }
.pj .pj-hero { aspect-ratio: 16 / 9; border-radius: 14px; }
.pj-meta { display: grid; grid-template-columns: repeat(2, 1fr);
  margin-top: clamp(40px, 5vw, 64px); border-top: 1px solid var(--rule); }
@media (min-width: 760px) { .pj-meta { grid-template-columns: repeat(4, 1fr); } }
.pj-meta > div { display: flex; flex-direction: column; gap: 8px;
  padding: 22px 0; border-bottom: 1px solid var(--rule); }
@media (min-width: 760px) { .pj-meta > div { padding: 24px 24px 24px 0; } }
.pj-meta .mono { color: var(--dim); }
.pj-meta span:last-child { font-size: clamp(15px, 1.6vw, 18px); letter-spacing: -0.01em; }
.pj-note { margin-top: clamp(40px, 6vw, 72px); max-width: 40ch; font-weight: 300;
  letter-spacing: -0.01em; font-size: clamp(20px, 2.6vw, 30px); line-height: 1.4; }

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

/* --- carousel roll: snap-scrolling filmstrip with drag ------------- */
.roll { position: relative; }
.roll-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory;
  padding-bottom: 18px; scrollbar-width: none; cursor: grab; }
.roll-track::-webkit-scrollbar { display: none; }
.roll-track.dragging { cursor: grabbing; scroll-snap-type: none; }
.roll-fr { flex: 0 0 auto; width: min(62vw, 700px); aspect-ratio: 3/2; overflow: hidden;
  border-radius: 4px; border: 1px solid var(--rule); scroll-snap-align: center;
  position: relative; background: var(--panel); }
.roll-fr img { pointer-events: none; }
.roll-nav { display: flex; gap: 10px; margin-top: 4px; }
.roll-btn { width: 44px; height: 44px; border: 1px solid var(--rule); border-radius: 50%;
  display: grid; place-items: center; transition: border-color .3s ease, color .3s ease; }
.roll-btn:hover { border-color: var(--accent); color: var(--accent); }
@media (max-width: 700px) { .roll-fr { width: 84vw; } }

/* --- lightbox slideshow --- */
.lb { position: fixed; inset: 0; z-index: 400; background: color-mix(in srgb, var(--bg) 94%, #000);
  display: grid; grid-template-rows: auto 1fr auto; padding: 20px 24px 28px; }
.lb-bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.lb-stage { position: relative; display: grid; place-items: center; overflow: hidden; }
.lb-stage img { width: auto; height: auto; max-width: 100%; max-height: 100%;
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
   DESIGN PAGE — the "editorial" archive (.dlx)

   Inherits the now-global warm-paper theme; this block only adds the
   page's own layout: an Anton display, a staggered cursor-tilt grid,
   and generous spacing. Projects still come from WEB_PROJECTS
   (Contentful / Drive) — only the presentation is bespoke here.
   ================================================================== */
.dlx { min-height: 100vh; position: relative; z-index: 1; }
.dlx-wrap { max-width: 1240px; margin: 0 auto; padding: clamp(64px, 10vh, 120px) 24px 0; }

/* --- cinematic "Projects" scroll intro --- */
.dprojhero { position: relative; }
.dph-stage { position: relative; width: 100%; height: 100vh; overflow: hidden;
  display: grid; place-items: center; }
.dprojhero.is-static .dph-stage { height: auto; padding: 20vh 24px 8vh; }
.dph-title { position: relative; z-index: 2; text-align: center; pointer-events: none; }
.dph-h { font-family: 'Anton', sans-serif; text-transform: uppercase; font-weight: 400;
  letter-spacing: -0.02em; line-height: .86; font-size: clamp(64px, 17vw, 260px); color: var(--ink); }
.dph-sub { display: block; margin-top: 2px; font-family: 'Dancing Script', cursive;
  font-weight: 400; font-size: clamp(26px, 4.4vw, 58px); color: var(--dim); }
.dph-card { position: absolute; left: 50%; top: 50%; z-index: 3;
  width: clamp(230px, 24vw, 340px); background: var(--panel); border: 1px solid var(--rule);
  border-radius: 10px; padding: 12px 12px 8px; text-decoration: none; color: var(--ink);
  box-shadow: 0 40px 80px -40px rgba(20,20,26,.45); will-change: transform;
  transition: border-color .3s ease; }
.dph-card:hover { border-color: var(--accent); }
.dph-card-img { overflow: hidden; border-radius: 5px; aspect-ratio: 4 / 5; background: var(--bg); }
.dph-card-img img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
.dph-card-cap { padding: 10px 3px 4px; }
.dph-card-cap strong { display: block; font-weight: 600; font-size: 11.5px;
  text-transform: uppercase; letter-spacing: .05em; line-height: 1.28; }
.dph-card-cap .mono { display: block; margin-top: 5px; font-size: 9px; color: var(--dim); }
.dph-cue { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 4;
  color: var(--dim); display: inline-flex; gap: 8px; align-items: center; }
.dph-cue i { font-style: normal; animation: dphBob 1.6s ease-in-out infinite; }
@keyframes dphBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }

/* --- masthead + filter tabs --- */
.dlx-head { display: flex; flex-direction: column; gap: 26px;
  border-bottom: 1px solid var(--rule); padding-bottom: 28px; }
@media (min-width: 820px) {
  .dlx-head { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 40px; }
}
.dlx-kicker { color: var(--accent); font-size: 10px; }
.dlx-title { font-family: 'Anton', sans-serif; font-weight: 400; text-transform: uppercase;
  letter-spacing: -0.015em; line-height: 0.9; font-size: clamp(60px, 12vw, 150px); margin-top: 18px; }
.dlx-intro { margin-top: 22px; max-width: 48ch; color: var(--dim); font-size: 15.5px; line-height: 1.7; }
.dlx-tabs { display: flex; gap: 8px; flex-shrink: 0; }
.dlx-tab { border: 1px solid var(--rule); border-radius: 100px; padding: 9px 18px;
  font-size: 10px; color: var(--dim);
  transition: color .3s ease, background-color .3s ease, border-color .3s ease; }
.dlx-tab:hover { border-color: var(--ink); color: var(--ink); }
.dlx-tab.on { background: var(--ink); border-color: var(--ink); color: var(--bg); }

/* --- archive: an asymmetric grid — the right column rides lower for a
   clean up-and-down rhythm rather than flat, symmetric rows --- */
.dlx-archive { padding-top: clamp(56px, 8vw, 104px); }
.dlx-grid { display: grid; grid-template-columns: 1fr;
  gap: clamp(40px, 5vw, 64px) clamp(24px, 3vw, 48px); align-items: start; }
@media (min-width: 760px) {
  .dlx-grid { grid-template-columns: 1fr 1fr; column-gap: clamp(32px, 4vw, 64px); }
  .dlx-grid > .dlx-cell:nth-child(even) { margin-top: clamp(64px, 9vw, 132px); }
}
.dlx-proj { display: block; }
.dlx-proj-head { display: flex; align-items: baseline; justify-content: space-between;
  gap: 16px; margin-bottom: 15px; color: var(--dim); font-size: 10px;
  transition: color .35s ease; }
.dlx-proj:hover .dlx-proj-head { color: var(--ink); }
.dlx-proj-head .idx { color: var(--ink); }
.dlx-card { overflow: hidden; border-radius: 12px; background: var(--panel);
  border: 1px solid var(--rule); will-change: transform; aspect-ratio: 3 / 2;
  transition: transform .28s ease-out, box-shadow .5s ease; }
/* covers are full-page screenshots — anchor the crop to the top */
.dlx-card img { object-position: top; transition: transform 1.1s cubic-bezier(.2,.8,.2,1); }
/* hover: the screenshot eases in and a "View project" cue rises up */
.dlx-proj:hover .dlx-card img { transform: scale(1.05); }
.dlx-card-hint { position: absolute; left: 14px; bottom: 14px; z-index: 2;
  display: inline-flex; align-items: center; gap: 8px; padding: 9px 15px; border-radius: 100px;
  background: color-mix(in srgb, var(--ink) 90%, transparent); color: var(--bg);
  font-size: 10px; opacity: 0; transform: translateY(10px);
  transition: opacity .4s ease, transform .45s cubic-bezier(.2,.8,.2,1); }
.dlx-proj:hover .dlx-card-hint { opacity: 1; transform: none; }
.dlx-card-hint .arrow { transition: transform .3s ease; }
.dlx-proj:hover .dlx-card-hint .arrow { transform: translateX(4px); }
.dlx-proj:hover .dlx-card { box-shadow: 0 34px 60px -34px hsl(210 25% 12% / 0.4); }
.dlx-cap { display: flex; align-items: baseline; justify-content: space-between;
  gap: 18px; margin-top: 22px; }
.dlx-cap h3 { font-weight: 500; letter-spacing: -0.01em;
  font-size: clamp(20px, 2.4vw, 27px); transition: color .3s ease; }
.dlx-proj:hover .dlx-cap h3 { color: var(--accent); }
.dlx-cap .cat { flex: 0 0 auto; color: var(--dim); font-size: 14px; }
.dlx-empty { text-align: center; padding: 90px 0; color: var(--dim); }

/* --- process --- */
.dlx-craft { padding-top: clamp(80px, 12vw, 168px); display: grid;
  grid-template-columns: 1fr; gap: 32px; }
@media (min-width: 900px) {
  .dlx-craft { grid-template-columns: 320px 1fr; gap: 64px; align-items: start; }
  .dlx-craft-head { position: sticky; top: 100px; }
}
.dlx-h2 { font-family: 'Anton', sans-serif; text-transform: uppercase; font-weight: 400;
  letter-spacing: -0.01em; font-size: clamp(30px, 4vw, 50px); line-height: 0.95; margin-top: 14px; }
.dlx-craft-row { border-top: 1px solid var(--rule); padding: 26px 0; display: grid; gap: 10px;
  transition: padding-left .35s ease; }
.dlx-craft-row:hover { padding-left: 14px; }
@media (min-width: 720px) { .dlx-craft-row { grid-template-columns: 1fr 1fr; align-items: baseline; } }
.dlx-craft-row h3 { font-weight: 500; font-size: clamp(20px, 2.4vw, 28px);
  display: flex; align-items: baseline; gap: 14px; letter-spacing: -0.01em; }
.dlx-craft-row h3 .idx { color: var(--accent); font-size: 13px; }
.dlx-craft-row p { color: var(--dim); max-width: 44ch; font-size: 14.5px; line-height: 1.65; }

/* --- cross-links --- */
.dlx-teaser { padding-top: clamp(80px, 12vw, 168px); display: grid;
  grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 760px) { .dlx-teaser { grid-template-columns: 1fr 1fr; gap: 28px; } }
.dlx-teaser > a { display: block; border: 1px solid var(--rule); border-radius: 14px;
  padding: 34px; background: var(--panel);
  transition: border-color .35s ease, transform .5s cubic-bezier(.16,1,.3,1), box-shadow .5s ease; }
.dlx-teaser > a:hover { border-color: var(--accent); transform: translateY(-4px);
  box-shadow: 0 30px 50px -34px hsl(210 25% 12% / 0.35); }
.dlx-teaser .mono { color: var(--accent); }
.dlx-teaser h3 { font-weight: 500; letter-spacing: -0.01em;
  font-size: clamp(23px, 3vw, 33px); margin: 16px 0 10px; }
.dlx-teaser p { color: var(--dim); font-size: 14.5px; line-height: 1.65; max-width: 34ch; }
.dlx-teaser .go { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; color: var(--dim); }
.dlx-teaser .go .arrow { transition: transform .3s ease; }
.dlx-teaser > a:hover .go { color: var(--ink); }
.dlx-teaser > a:hover .go .arrow { transform: translateX(5px); }

/* --- closing CTA --- */
.dlx-cta { padding: clamp(100px, 16vw, 200px) 0 clamp(80px, 12vw, 140px); text-align: center; }
.dlx-cta .dlx-title { font-size: clamp(42px, 8vw, 104px); }
.dlx-mail { display: inline-flex; align-items: center; gap: 10px; margin-top: 30px;
  font-family: 'IBM Plex Mono', monospace; font-size: clamp(15px, 2.2vw, 22px); letter-spacing: -0.01em;
  border-bottom: 1px solid var(--rule); padding-bottom: 6px;
  transition: color .3s ease, border-color .3s ease; }
.dlx-mail:hover { color: var(--accent); border-color: var(--accent); }
.dlx-mail .arrow { transition: transform .3s ease; }
.dlx-mail:hover .arrow { transform: translateX(5px); }
.dlx-back { margin-top: 50px; }
.dlx-back a { display: inline-flex; align-items: center; gap: 8px; color: var(--dim);
  transition: color .3s ease; }
.dlx-back a:hover { color: var(--ink); }

/* --- Home: web-design teaser (flat 3-up, deliberately distinct from the
   /design archive so the full page still reads as a reveal) --- */
/* --- home design teaser: pinned horizontal scroll --------------------
   Desktop: the section pins and the track slides left as you scroll
   (wired in Home.jsx via GSAP). Mobile: native horizontal swipe. */
/* .hsx height is set from JS (viewport + track overflow) so the sticky
   child can scrub sideways; sticky (not GSAP pin) keeps the page stable. */
.hsx { position: relative; }
.hsx-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden;
  display: flex; align-items: center; background: var(--bg); }
.hsx-track { display: flex; align-items: center; gap: clamp(26px, 3vw, 60px);
  padding: 0 clamp(24px, 6vw, 90px); will-change: transform; }
.hsx-intro { flex: 0 0 auto; width: min(84vw, 440px); }
.hsx-title { font-size: clamp(40px, 6vw, 96px); line-height: .9; margin: 14px 0 24px; }
.hsx-sub { color: var(--dim); font-size: 16px; line-height: 1.65; max-width: 34ch; }
.hsx-scroll { display: inline-flex; align-items: center; gap: 9px; margin-top: 34px; color: var(--accent); }
.hsx-scroll .arrow { animation: hsxNudge 1.8s ease-in-out infinite; }
@keyframes hsxNudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
.hsx-card { flex: 0 0 auto; width: min(82vw, 580px); display: block; color: inherit; }
.hsx-shot { position: relative; overflow: hidden; border-radius: 14px; border: 1px solid var(--rule);
  aspect-ratio: 16 / 10; background: var(--panel); transition: border-color .35s ease; }
.hsx-shot img { width: 100%; height: 100%; object-fit: cover; object-position: top;
  transition: transform 1.1s cubic-bezier(.2, .8, .2, 1); }
.hsx-card:hover .hsx-shot { border-color: color-mix(in srgb, var(--accent) 45%, var(--rule)); }
.hsx-card:hover .hsx-shot img { transform: scale(1.05); }
.hsx-cap { margin-top: 22px; }
.hsx-cap h3 { font-weight: 500; letter-spacing: -0.02em; font-size: clamp(24px, 2.6vw, 38px);
  transition: color .3s ease; }
.hsx-card:hover .hsx-cap h3 { color: var(--accent); }
.hsx-cap p { color: var(--dim); margin-top: 10px; max-width: 46ch; line-height: 1.55; font-size: 14.5px; }
.hsx-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.hsx-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: .1em;
  text-transform: uppercase; color: var(--dim); border: 1px solid var(--rule);
  border-radius: 100px; padding: 7px 15px; }
.hsx-more { flex: 0 0 auto; display: grid; place-items: center; padding: 0 clamp(30px, 6vw, 90px); }
@media (max-width: 819px) {
  .hsx { height: auto !important; padding: clamp(70px, 12vw, 120px) 0; }
  .hsx-sticky { position: static; height: auto; display: block; overflow: visible; }
  .hsx-track { overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
    transform: none !important; padding-bottom: 18px; }
  .hsx-track::-webkit-scrollbar { display: none; }
  .hsx-intro, .hsx-card, .hsx-more { scroll-snap-align: start; }
  .hsx-intro, .hsx-card { width: 84vw; }
}

/* stack pills */
.stack-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.pill { border: 1px solid var(--rule); border-radius: 100px; padding: 6px 14px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: .14em;
  text-transform: uppercase; color: var(--dim); transition: border-color .3s ease, color .3s ease; }
.pill:hover { border-color: var(--accent); color: var(--accent); }

/* external link button */
.extlink { display: inline-flex; align-items: center; gap: 12px; border-radius: 100px;
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

/* ==================================================================
   ADMIN — /admin. Same palette as the site so it feels like one thing,
   but plainer: forms want clarity, not atmosphere.
   ================================================================== */
.admin { padding: 6vh 0 14vh; max-width: 1100px; }
.admin-top { display: flex; justify-content: space-between; align-items: flex-end;
  gap: 20px; flex-wrap: wrap; padding-bottom: 18px; margin-bottom: 34px;
  border-bottom: 1px solid var(--rule); }
.admin-top h1 { font-weight: 300; letter-spacing: -0.03em; font-size: clamp(30px, 5vw, 52px);
  margin-top: 10px; }
.admin-top a:hover { color: var(--accent); }

.admin-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1px; background: var(--rule); border: 1px solid var(--rule); border-radius: 4px;
  overflow: hidden; margin-bottom: 26px; }
.admin-stat { background: var(--bg); padding: 22px 20px; }
.admin-stat b { display: block; font-weight: 300; letter-spacing: -0.03em;
  font-size: clamp(28px, 3.4vw, 42px); line-height: 1; font-variant-numeric: tabular-nums; }
.admin-stat span { display: block; margin-top: 10px; }

.admin-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.btn { border: 1px solid var(--rule); border-radius: 100px; padding: 11px 22px;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .14em;
  text-transform: uppercase; color: var(--ink);
  transition: border-color .3s ease, background-color .3s ease, color .3s ease; }
.btn:hover { border-color: var(--accent); color: var(--accent); }
.btn:disabled { opacity: .45; pointer-events: none; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--bg); }
.btn.primary:hover { filter: brightness(1.12); color: var(--bg); }
.btn.ghost { border-color: transparent; color: var(--dim); }
.btn.ghost:hover { color: var(--ink); }
.btn.danger:hover { border-color: #F4595E; color: #F4595E; }
.btn.small { padding: 8px 16px; font-size: 10px; }
.mini { width: 30px; height: 30px; border: 1px solid var(--rule); border-radius: 4px;
  display: grid; place-items: center; font-size: 12px; color: var(--dim);
  transition: border-color .25s ease, color .25s ease; }
.mini:hover { border-color: var(--accent); color: var(--accent); }
.mini:disabled { opacity: .3; pointer-events: none; }
.mini.danger:hover { border-color: #F4595E; color: #F4595E; }

.admin-msg { padding: 12px 16px; border: 1px solid var(--rule); border-radius: 4px;
  margin-bottom: 22px; color: var(--accent); }
.admin-msg.bad { color: #F4595E; border-color: color-mix(in srgb, #F4595E 45%, var(--rule)); }
.admin-msg.preview { color: #E0A93B; border-color: color-mix(in srgb, #E0A93B 45%, var(--rule));
  background: color-mix(in srgb, #E0A93B 8%, transparent); }
.admin-empty { padding: 22px 0; color: var(--dim); }

.admin-sec { margin-top: 44px; }
.admin-sec-head { display: flex; justify-content: space-between; align-items: flex-end;
  gap: 16px; flex-wrap: wrap; padding-bottom: 14px; border-bottom: 1px solid var(--rule); }
.admin-sec-head h2 { font-weight: 400; letter-spacing: -0.02em; font-size: 24px; }
.admin-sec-head span { display: block; margin-top: 6px; }

.admin-row { display: grid; grid-template-columns: 40px 1fr auto; gap: 16px;
  align-items: center; padding: 16px 0; border-bottom: 1px solid var(--rule); }
.admin-row .num { color: var(--dim); }
.admin-row-main strong { font-weight: 400; letter-spacing: -0.02em; font-size: 18px; display: block; }
.admin-row-main .dim { color: var(--dim); font-style: normal; }
.admin-row-main span { display: block; margin-top: 5px; }
.admin-row-acts { display: flex; gap: 8px; align-items: center; }
@media (max-width: 640px) {
  .admin-row { grid-template-columns: 1fr; gap: 10px; }
  .admin-row-acts { justify-content: flex-start; }
}

/* --- forms --- */
.admin-form { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 30px; }
@media (max-width: 720px) { .admin-form { grid-template-columns: 1fr; } }
.admin-field { display: flex; flex-direction: column; gap: 8px; }
.admin-field.wide { grid-column: 1 / -1; }
.admin-field em { font-style: normal; font-size: 12.5px; color: var(--dim); }
.admin-field input, .admin-field textarea, .admin-login input {
  background: var(--panel); border: 1px solid var(--rule); border-radius: 4px;
  color: var(--ink); font: inherit; font-size: 15px; padding: 12px 14px; width: 100%;
  transition: border-color .25s ease; }
.admin-field input:focus, .admin-field textarea:focus, .admin-login input:focus {
  border-color: var(--accent); outline: none; }
.admin-field textarea { resize: vertical; line-height: 1.6; }
.admin-check { display: flex; align-items: center; gap: 10px; color: var(--dim); font-size: 14.5px; }
.admin-check input { width: 16px; height: 16px; accent-color: var(--accent); }

.admin-login { max-width: 340px; display: flex; flex-direction: column; gap: 12px; margin-top: 8vh; }

/* --- chosen pictures --- */
.admin-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px; margin-top: 20px; }
.admin-thumb { border: 1px solid var(--rule); border-radius: 4px; overflow: hidden;
  background: var(--panel); }
.admin-thumb img { aspect-ratio: 4/3; }
.admin-thumb figcaption { display: flex; align-items: center; gap: 6px; padding: 8px;
  justify-content: space-between; }

/* --- Drive picker --- */
.admin-picker { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.72);
  display: grid; place-items: center; padding: 24px; }
.admin-picker-in { background: var(--bg); border: 1px solid var(--rule); border-radius: 6px;
  width: min(1100px, 100%); height: min(80vh, 800px); display: flex; flex-direction: column;
  overflow: hidden; }
.admin-picker-top { display: flex; justify-content: space-between; align-items: center;
  gap: 16px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--rule); }
.admin-picker-body { display: grid; grid-template-columns: 220px 1fr; flex: 1; min-height: 0; }
@media (max-width: 700px) { .admin-picker-body { grid-template-columns: 1fr; } .admin-folders { display: none; } }
.admin-folders { border-right: 1px solid var(--rule); overflow-y: auto; padding: 12px; }
.fold { display: block; width: 100%; text-align: left; padding: 9px 12px; border-radius: 4px;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .08em;
  color: var(--dim); transition: background-color .25s ease, color .25s ease; }
.fold:hover { background: var(--panel); color: var(--ink); }
.fold.on { background: var(--accent); color: var(--bg); }
.admin-grid { overflow-y: auto; padding: 16px; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; align-content: start; }
.pickfr { position: relative; border: 1px solid var(--rule); border-radius: 4px;
  overflow: hidden; aspect-ratio: 1; transition: border-color .25s ease; }
.pickfr:hover { border-color: var(--accent); }
.pickfr.on { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
.pickfr .badge { position: absolute; right: 6px; top: 6px; background: var(--accent);
  color: var(--bg); border-radius: 100px; min-width: 22px; height: 22px; display: grid;
  place-items: center; padding: 0 6px; font-size: 10px; }

/* ==================================================================
   CLIENT AREA — /client. The plainest page on the site: a client here
   wants their photos, not an experience.
   ================================================================== */
.client { min-height: 100vh; display: flex; flex-direction: column;
  justify-content: center; align-items: center; padding: 12vh 0 8vh; text-align: center; }
.client-kicker { margin-bottom: 40px; }
.client-card { width: min(560px, 100%); border: 1px solid var(--rule); border-radius: 6px;
  background: var(--panel); padding: 44px 38px; }
@media (max-width: 560px) { .client-card { padding: 32px 22px; } }
.client-card h1 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.05;
  font-size: clamp(28px, 5vw, 44px); margin-top: 14px; text-wrap: balance; }
.client-shoot { color: var(--dim); font-size: 15px; margin-top: 10px; }
.client-lead { color: var(--dim); font-size: 15px; line-height: 1.7; margin-top: 14px; }
.client-note { color: var(--ink); font-size: 15px; line-height: 1.7; margin-top: 22px;
  padding: 16px 18px; border-left: 2px solid var(--accent); text-align: left;
  background: color-mix(in srgb, var(--accent) 6%, transparent); }

.client-card form { display: flex; flex-direction: column; gap: 10px; margin-top: 28px; }
.client-card label { text-align: left; }
.client-card input { background: var(--bg); border: 1px solid var(--rule); border-radius: 4px;
  color: var(--ink); font-family: 'IBM Plex Mono', monospace; font-size: 16px;
  letter-spacing: .06em; padding: 15px 16px; width: 100%; text-align: center;
  transition: border-color .25s ease; }
.client-card input:focus { border-color: var(--accent); outline: none; }

/* one button does the whole job — make it obvious */
.client-dl { display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  width: 100%; margin-top: 26px; padding: 17px 26px; border-radius: 4px;
  background: var(--accent); color: var(--bg); border: 1px solid var(--accent);
  font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .16em;
  text-transform: uppercase; transition: filter .3s ease, opacity .3s ease; }
.client-dl:hover { filter: brightness(1.12); }
.client-dl:disabled { opacity: .45; pointer-events: none; }
.client-dl .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.client-dl:hover .arrow { transform: translate(2px, -2px); }

.client-facts { display: flex; justify-content: center; gap: 34px; margin-top: 28px;
  padding-top: 20px; border-top: 1px solid var(--rule); }
.client-facts dd { margin: 6px 0 0; font-size: 19px; font-variant-numeric: tabular-nums; }
.client-help { margin-top: 20px; line-height: 1.8; text-transform: none; letter-spacing: .04em; }
.client-help a { color: var(--accent); }
.client-err { margin-top: 18px; color: #F4595E; text-transform: none; letter-spacing: .04em;
  line-height: 1.7; }
.client-foot { margin-top: 44px; }
.client-foot .back:hover { color: var(--accent); }

/* --- admin: the delivery panel --- */
.deliver { border: 1px solid var(--rule); border-radius: 6px; padding: 26px 24px;
  background: var(--panel); }
.deliver .admin-sec-head { border-bottom-color: var(--rule); }
.admin-inline { display: flex; gap: 8px; align-items: center; }
.admin-inline input { flex: 1; }
.deliver-send { margin-top: 26px; padding-top: 20px; border-top: 1px solid var(--rule); }
.deliver-send pre { background: var(--bg); border: 1px solid var(--rule); border-radius: 4px;
  padding: 16px 18px; margin: 12px 0 14px; white-space: pre-wrap; word-break: break-word;
  font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; line-height: 1.7; color: var(--dim); }
.deliver-hint { margin-top: 12px; text-transform: none; letter-spacing: .04em; }

@media (prefers-reduced-motion: reduce) {
  .pf *, .pf *::before, .pf *::after { animation: none !important; transition: none !important; }
  .rv { opacity: 1 !important; transform: none !important; }
  .display .ch { opacity: 1 !important; transform: none !important; filter: none !important; }
  /* with animation off, show the brand mark fully drawn/filled, not blank */
  .logo-mark path { fill-opacity: 1 !important; stroke-dashoffset: 0 !important; }
  .logo-word b { opacity: 1 !important; transform: none !important; }
  .mast .drawline, .metrics::after { transform: scaleX(1) !important; }
  .shot img, .detail-fig img, .about-portrait img { transform: none !important; }
  .phero-fr img, .pj-hero img, .pgrid img, .browser-view img { transform: none !important; }
  .tick-btn[aria-current="true"] i { transform: scaleX(1) !important; }
  .card { position: static; }
  /* with transitions off, an auto-hiding bar would blink in and out —
     keep it put instead */
  .bar.hide { transform: none !important; }
  .roll-track { scroll-snap-type: none; }
  .iris-lens { display: none; }
  .cursor { display: none; }
}
`;
