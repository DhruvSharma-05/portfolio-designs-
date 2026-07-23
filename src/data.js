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
  photographer: "Viraj",        // the person the home page is about
  photoBrand: "Lenzofviraj",    // the photography practice — /photography
  designBrand: "Design & Build",// the web practice — /design
  role: "Photographer & Web Designer",
  email: "hello@yourstudio.com",
  city: "Your City",
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
  lead: "Viraj makes the pictures, then builds the place they live.",
  body: [
    "Two practices, one pair of hands. Under Lenzofviraj he shoots editorial, portraits and events; under design & build he draws and ships the sites those pictures end up on.",
    "Most people hire one or the other. Hiring both means the shoot is planned around the layout and the layout is drawn around the shoot — so nothing gets cropped, re-shot, or lost in a handover between two strangers.",
  ],
  /* the two doors, mirrored in the hero strip */
  does: [
    {
      k: "Photography",
      brand: "Lenzofviraj",
      to: "/photography",
      v: "Editorial, portrait, event and landscape sets. Shot, selected and graded as one body of work.",
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

/* img(seed, w, h): resolves a seed to a local optimized image. Picks the
   small variant for thumbnail widths, the large one otherwise. Unknown
   seeds fall through to a picsum placeholder of the requested size. */
export const img = (s, w = 1200, h = 800) => {
  const p = PHOTOS.get(s);
  if (p) return w <= 640 ? p.sm : p.lg;
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
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

   Four fixed categories. A synced photo's category comes from the
   Drive subfolder it lives in (see scripts/sync-drive.mjs): make four
   subfolders inside the Gallery folder named after the categories and
   the sync sorts everything automatically. Photos left in the Gallery
   folder root land in "Open". With no manifest at all, placeholder
   seeds are dealt across the categories so the grid still renders.
   ================================================================== */
export const GALLERY_CATS = ["Professional Photoshoot", "Wildlife", "Open", "Portraits"];

const normCat = (raw = "") => {
  const s = String(raw).toLowerCase();
  if (s.includes("professional") || s.includes("shoot")) return "Professional Photoshoot";
  if (s.includes("wild")) return "Wildlife";
  if (s.includes("portrait")) return "Portraits";
  return "Open";
};

export const GALLERY_ITEMS = manifest.gallery?.length
  ? manifest.gallery.map((p) => ({ seed: p.seed, cat: normCat(p.cat) }))
  : SHEET_FALLBACK.map((s, i) => ({ seed: s, cat: GALLERY_CATS[i % GALLERY_CATS.length] }));

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
    slug: "atelier-studio",
    t: "Atelier Studio",
    tag: "Studio site",
    year: "2025",
    role: "Design · Build",
    note: "A studio site where the photograph sets the grid. Replace with the real brief, the constraints, and what shipped.",
    intro: "Editorial layout, one accent, and a gallery that behaves on a phone.",
    tool: "Figma",
    href: "https://figma.com",
    live: "",
    stack: ["Figma", "React", "Vite", "Vercel"],
    cover: "web-atelier-1",
    shots: photoSeeds("web-atelier", 4),
    specs: [
      { k: "Scope", v: "Art direction, UI design, front-end build" },
      { k: "Timeline", v: "4 weeks, design to live" },
      { k: "Handoff", v: "Figma file + deployed site" },
    ],
  },
  {
    slug: "north-cafe",
    t: "North Café",
    tag: "Brand & menu",
    year: "2025",
    role: "Design · Brand",
    note: "A small hospitality brand — identity, menu system and a one-page site. Swap for the real story.",
    intro: "A menu that reads the same printed as it does on a phone.",
    tool: "Canva",
    href: "https://canva.com",
    live: "",
    stack: ["Canva", "Illustrator", "Webflow"],
    cover: "web-north-1",
    shots: photoSeeds("web-north", 4),
    specs: [
      { k: "Scope", v: "Identity, print menu, one-page site" },
      { k: "Timeline", v: "3 weeks" },
      { k: "Handoff", v: "Brand kit + editable templates" },
    ],
  },
  {
    slug: "field-notes",
    t: "Field Notes",
    tag: "Editorial CMS",
    year: "2024",
    role: "Design · Build",
    note: "An editorial publication with a CMS behind it. Describe the volume, the constraints and the result.",
    intro: "Long-form reading, built so the writer never needs a developer.",
    tool: "Figma",
    href: "https://figma.com",
    live: "",
    stack: ["Figma", "React", "Sanity"],
    cover: "web-field-1",
    shots: photoSeeds("web-field", 4),
    specs: [
      { k: "Scope", v: "Design system, CMS modelling, build" },
      { k: "Timeline", v: "6 weeks" },
      { k: "Handoff", v: "Design system + editor training" },
    ],
  },
];

/* Same precedence as the photo projects: /admin content first, the
   placeholder set only when nothing has been published yet. */
export const WEB_PROJECTS = manifest.webProjects?.length
  ? manifest.webProjects
  : WEB_PROJECTS_FALLBACK;

export const METRICS = [
  { v: 68, s: "", k: "Projects delivered" },
  { v: 92, s: "%", k: "Clients who returned" },
  { v: 11, s: "", k: "Years behind a lens" },
  { v: 4, s: "wks", k: "Shoot to live site" },
];

export const QUOTES = [
  { q: "A short, specific line about the work. Replace with a real quote once you have one.", a: "Client Name", r: "Role, Company" },
  { q: "Another testimonial goes here. Two sentences at most — the shorter, the better.", a: "Client Name", r: "Role, Company" },
  { q: "One more placeholder quote. Swap these three out and delete the rest.", a: "Client Name", r: "Role, Company" },
];

export const SHOTLIST = [
  { k: "Editorial & campaign", v: "Shoot, select, grade, deliver. Usually two weeks." },
  { k: "Events & nightlife", v: "Available light. No flash unless you ask twice." },
  { k: "Portraits", v: "Studio or location. One light, mostly." },
  { k: "Art direction", v: "For when the pictures exist but nothing holds them together." },
  { k: "Design & build", v: "Framer, Webflow, or React. I ship what I design." },
  { k: "Colour grading", v: "Yours or mine. Consistent across a set, not just pretty alone." },
];

/* PLACEHOLDER — replace with the client's real bio, approach and history. */
export const ABOUT = {
  portrait: manifest.portrait?.seed ?? "pf-about",
  lead: "I make pictures for a living and build the places they live online. Same eye, two crafts.",
  body: [
    "This is where the biography goes. Two or three short paragraphs — how you started, what you care about, the kind of work you say yes to. Keep it plain and specific; let the pictures carry the rest.",
    "Mention the way you work: available light, small kits, quick turnarounds. Then the second craft — that you design and build the sites, so a shoot doesn't end at a folder of files.",
    "Close with what you're after now — the briefs you want, who you'd like to hear from, and that you're booking for the year ahead.",
  ],
  approach: [
    { k: "One decision", v: "Shot, graded and built by the same person, so nothing gets lost in the handover." },
    { k: "Available light", v: "Natural first. Flash only when the picture actually needs it." },
    { k: "Ship end to end", v: "The photograph sets the grid; the site is built around it, not the reverse." },
  ],
  timeline: [
    { y: "2015", t: "Picked up a camera properly. First paid editorial." },
    { y: "2018", t: "Went full-time. Started grading for other shooters." },
    { y: "2021", t: "Added design & build — began shipping clients' sites." },
    { y: "2026", t: "Booking campaigns, portraits and editorial builds." },
  ],
};

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.pf, .pf *, .pf *::before, .pf *::after { box-sizing: border-box; margin: 0; }
.pf { background: var(--bg); color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif; font-weight: 400;
  -webkit-font-smoothing: antialiased; letter-spacing: -0.01em;
  transition: color .5s ease; overflow-x: hidden; position: relative; min-height: 100vh; }
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
/* Hides while reading down, returns the moment you scroll up (driven
   from App.jsx) — so the page is uninterrupted, but navigation is one
   flick away from anywhere, including the bottom. */
.bar { position: sticky; top: 0; z-index: 80;
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: blur(16px); border-bottom: 1px solid var(--rule);
  transition: transform .42s cubic-bezier(.2,.8,.2,1); }
.bar.hide { transform: translateY(-101%); }
.bar-in { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 28px; max-width: 1180px; margin: 0 auto; }
.brand { color: var(--ink); }
/* sits where the accent switcher used to be */
.barmeta { text-align: right; }
@media (max-width: 860px) { .barmeta { display: none; } }
.prog { position: absolute; left: 0; bottom: -1px; height: 1px; background: var(--accent);
  transition: width .1s linear; }

/* --- masthead --- */
.mast { padding: 17vh 0 10vh; position: relative; }
.mast .wrap { position: relative; z-index: 1; }
.hero-canvas { position: absolute !important; inset: 0; z-index: 0;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(120% 90% at 50% 42%, #000 30%, transparent 78%);
          mask-image: radial-gradient(120% 90% at 50% 42%, #000 30%, transparent 78%); }
.display { font-weight: 300; letter-spacing: -0.04em; line-height: .95;
  font-size: clamp(52px, 12vw, 168px); text-wrap: balance; }
.display .ch { display: inline-block; opacity: 0; transform: translateY(0.4em) rotate(3deg);
  filter: blur(12px); animation: charUp 1s cubic-bezier(.16,1,.3,1) both; }
@keyframes charUp { to { opacity: 1; transform: none; filter: blur(0); } }
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
.pf .logo-img { width: auto; height: 34px; object-fit: contain; filter: none; display: block; }
.brand { display: inline-flex; align-items: center; min-height: 34px; }
@media (max-width: 720px) { .pf .logo-img { height: 28px; } }

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
   Hover sweeps the current accent across the whole row and flips the
   text to the page background — so the row reads as a solid block in
   whichever colour the visitor picked in the bar. The fill wipes in
   from the left and out to the right (transform-origin swaps on
   hover), and bleeds 18px past the text so nothing sits flush to the
   edge. Children are lifted above it with z-index. */
.sl-row { position: relative; display: grid; grid-template-columns: 42px 1fr 1.1fr;
  gap: 20px; align-items: baseline; padding: 22px 0;
  border-bottom: 1px solid var(--rule);
  transition: padding-left .35s cubic-bezier(.2,.8,.2,1); }
.sl-row::before { content: ""; position: absolute; inset: 0 -18px; z-index: 0;
  background: var(--accent); border-radius: 3px; transform: scaleX(0);
  transform-origin: right; transition: transform .55s cubic-bezier(.76,0,.24,1); }
.sl-row:hover::before { transform: scaleX(1); transform-origin: left; }
.sl-row > * { position: relative; z-index: 1; }
.sl-row:first-child { border-top: 1px solid var(--rule); }
.sl-row:hover { padding-left: 10px; }
.sl-row h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(18px, 2.1vw, 25px);
  transition: color .35s ease .06s; }
.sl-row p { color: var(--dim); font-size: 14.5px; line-height: 1.58;
  transition: color .35s ease .06s; }
.sl-row .mono { transition: color .35s ease .06s; }
/* on the filled row every layer switches to the background colour —
   the body copy at reduced opacity so the hierarchy survives */
.sl-row:hover h3, .sl-row:hover .mono { color: var(--bg); }
.sl-row:hover p { color: color-mix(in srgb, var(--bg) 72%, transparent); }
@media (max-width: 700px) { .sl-row { grid-template-columns: 30px 1fr; } .sl-row p { grid-column: 2; } }

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
.about-hero h1 { font-weight: 300; letter-spacing: -0.04em; line-height: .98;
  font-size: clamp(44px, 8vw, 104px); text-wrap: balance; }
.about-lead { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(20px, 2.6vw, 30px);
  line-height: 1.35; margin-top: 28px; max-width: 22ch; }
.about-lead i { font-style: normal; color: var(--accent); }
.about-portrait { position: relative; overflow: hidden; border-radius: 4px;
  border: 1px solid var(--rule); aspect-ratio: 4/5; }
.about-portrait img { will-change: transform; }
.about-body { max-width: 62ch; margin: 12vh 0; color: var(--dim); line-height: 1.8; font-size: 16px; }
.about-body p + p { margin-top: 20px; }
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
.phero-fr::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--bg) 62%, transparent) 0%,
    color-mix(in srgb, var(--bg) 12%, transparent) 38%,
    color-mix(in srgb, var(--bg) 88%, transparent) 100%); }
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

/* --- project intro band --- */
.band { padding: 12vh 0 2vh; }
.band h2 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.02;
  font-size: clamp(30px, 5vw, 66px); text-wrap: balance; }
.band p { color: var(--dim); font-size: 15px; line-height: 1.72; max-width: 46ch; margin-top: 20px; }

/* --- photo project detail --- */
.pj-hero { position: relative; overflow: hidden; border-radius: 4px;
  border: 1px solid var(--rule); aspect-ratio: 16/9; }
.pj-hero img { will-change: transform; }
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
