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
  name: "Crafted & Captured",
  photographer: "Viraj",
  role: "Photographer & Web Designer",
  email: "hello@yourstudio.com",
  city: "Your City",
};

/* --- real photos (from Google Drive sync) ---------------------------
   scripts/sync-drive.mjs writes photos.manifest.json at build time.
   Every synced photo is keyed by seed → { sm, lg } local WebP URLs.
   When the manifest is empty (no credentials / fresh clone) we fall
   back to seeded picsum placeholders so the site still renders. */
const PHOTOS = new Map();
for (const p of manifest.work || []) PHOTOS.set(p.seed, p);
for (const p of manifest.gallery || []) PHOTOS.set(p.seed, p);
if (manifest.portrait) PHOTOS.set(manifest.portrait.seed, manifest.portrait);

/* img(seed, w, h): resolves a seed to a local optimized image. Picks the
   small variant for thumbnail widths, the large one otherwise. Unknown
   seeds fall through to a picsum placeholder of the requested size. */
export const img = (s, w = 1200, h = 800) => {
  const p = PHOTOS.get(s);
  if (p) return w <= 640 ? p.sm : p.lg;
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
};

/* Shared near-black base. Themes differ ONLY by accent — the room stays
   dark, one light changes. */
const BASE = {
  bg: "#0A0A0B",
  panel: "#111114",
  ink: "#ECECEC",
  dim: "#71717A",
  rule: "#1E1E22",
  filter: "saturate(0.92) brightness(0.96)",
};

export const THEMES = [
  { id: "mono", name: "Mono", accent: "#E4E4E7" },
  { id: "amber", name: "Amber", accent: "#E0A93B" },
  { id: "cyan", name: "Cyan", accent: "#38BDF8" },
  { id: "violet", name: "Violet", accent: "#A78BFA" },
  { id: "rose", name: "Rose", accent: "#F471A0" },
  { id: "lime", name: "Lime", accent: "#A3E635" },
].map((t) => ({ ...BASE, ...t }));

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

/* --- bar + accent switcher --- */
.bar { position: sticky; top: 0; z-index: 80;
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: blur(16px); border-bottom: 1px solid var(--rule); }
.bar-in { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 28px; max-width: 1180px; margin: 0 auto; }
.brand { color: var(--ink); }
.chips { display: flex; gap: 8px; align-items: center; }
.chip { width: 14px; height: 14px; border-radius: 50%; position: relative;
  border: 1px solid var(--rule); display: grid; place-items: center; }
.chip i { display: block; width: 10px; height: 10px; border-radius: 50%; }
.chip[aria-pressed="true"] { box-shadow: 0 0 0 1px var(--bg), 0 0 0 2px var(--accent); }
.themename { min-width: 92px; text-align: right; color: var(--accent); }
@media (max-width: 640px) { .themename { display: none; } }
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

/* --- pinned horizontal gallery --- */
.gallery { overflow: hidden; border-top: 1px solid var(--rule); background: var(--bg); }
.gallery.scrollable { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.gallery-track { display: flex; gap: 24px; align-items: center; width: max-content;
  padding: 10vh 28px; }
.gallery-head { flex: 0 0 auto; width: min(40vw, 460px); padding-right: 48px; }
.gallery-head h2 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.02;
  font-size: clamp(30px, 4.4vw, 60px); text-wrap: balance; }
.gallery-head p { color: var(--dim); font-size: 15px; line-height: 1.7; margin-top: 20px; max-width: 34ch; }
.gal-fr { flex: 0 0 auto; width: min(40vw, 420px); aspect-ratio: 3/4; overflow: hidden;
  border-radius: 4px; border: 1px solid var(--rule); }
.gal-fr .mono { display: block; padding: 12px 2px 0; }
@media (max-width: 700px) { .gallery-head { width: 78vw; } .gal-fr { width: 70vw; } }

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

/* --- services / shot list --- */
.sl-row { display: grid; grid-template-columns: 42px 1fr 1.1fr; gap: 20px; align-items: baseline;
  padding: 22px 0; border-bottom: 1px solid var(--rule);
  transition: padding-left .35s cubic-bezier(.2,.8,.2,1); }
.sl-row:first-child { border-top: 1px solid var(--rule); }
.sl-row:hover { padding-left: 10px; }
.sl-row h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(18px, 2.1vw, 25px);
  transition: color .3s; }
.sl-row:hover h3 { color: var(--accent); }
.sl-row p { color: var(--dim); font-size: 14.5px; line-height: 1.58; }
@media (max-width: 700px) { .sl-row { grid-template-columns: 30px 1fr; } .sl-row p { grid-column: 2; } }

/* --- quotes slideshow --- */
.slide { position: relative; min-height: 200px; }
.q p { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(21px, 2.7vw, 32px);
  line-height: 1.35; max-width: 24ch; }
.q footer { margin-top: 22px; }
.dots { display: flex; gap: 8px; margin-top: 28px; }
.dot { width: 26px; height: 2px; background: var(--rule); transition: background-color .4s; }
.dot.on { background: var(--accent); }

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
@media (max-width: 560px) { .nav { display: none; } }

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
.approach div { background: var(--bg); padding: 30px 26px; }
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

@media (prefers-reduced-motion: reduce) {
  .pf *, .pf *::before, .pf *::after { animation: none !important; transition: none !important; }
  .rv { opacity: 1 !important; transform: none !important; }
  .display .ch { opacity: 1 !important; transform: none !important; filter: none !important; }
  .mast .drawline, .metrics::after { transform: scaleX(1) !important; }
  .shot img, .detail-fig img, .about-portrait img { transform: none !important; }
  .card { position: static; }
  .iris-lens { display: none; }
  .cursor { display: none; }
}
`;
