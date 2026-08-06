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

/* Should we load the three.js chunk at all? Checked BEFORE the lazy
   import() is triggered, so phones never fetch the largest chunk in the
   app just to decline to use it.

   Width only, deliberately. This used to test the pointer as well, first
   `pointer: fine` and then `any-pointer: fine`, and both proved
   unreliable: `pointer` describes the *primary* input, so a laptop with
   a touchscreen reports coarse even with a mouse attached, and the whole
   effect vanished on ordinary desktops with no way for the visitor to
   tell why. Screen width is the thing we actually care about, and it
   can't misreport.

   Motion preference is NOT tested here — that is each effect's business:
   the sphere renders a still frame, DistortImage falls back to the plain
   photograph. Deciding it centrally meant "respect the preference" and
   "show nothing at all" were the same code path. */
export const heavyVisualsAllowed = () =>
  typeof matchMedia !== "undefined" && matchMedia("(min-width: 900px)").matches;

export const P = {
  name: "Crafted & Captured",   // the studio, shown in the masthead bar
  photographer: "Viraj Mehta",  // the person the home page is about
  photoBrand: "Lensofviraj",    // the photography practice — /photography
  /* The same name split for the /photography wordmark, where it is set as
     a lockup rather than a word: the two halves in the display face, the
     joint in the mono one. Kept next to the string it is cut from so the
     two can't drift apart. Nothing is inserted between the parts, so the
     accessible name stays "Lensofviraj" exactly as above. */
  photoBrandParts: ["Lens", "of", "viraj"],
  email: "craftedandcaptured@gmail.com",  // the only contact address — no personal ones
  phone: "+1 (672) 968-9680",
  city: "Vancouver",
  area: "Lower Mainland",       // the wider area he actually travels for
  region: "British Columbia, Canada",
  socials: [
    { k: "Instagram", v: "@lensofviraj", href: "https://www.instagram.com/lensofviraj/" },
    { k: "LinkedIn", v: "virajmehtaa", href: "https://www.linkedin.com/in/virajmehtaa" },
  ],
};

/* ==================================================================
   INTRO — the home page introduces the person, not one of the crafts.

   Viraj runs two practices in parallel: photography as Lenzofviraj,
   and UI/UX design. He designs — Figma screens and clickable
   prototypes — and hands them to a developer to build; he does not
   write the code himself, so no copy on this site may claim he
   builds, ships or codes anything. A visitor landing cold should
   learn who he is, what he does, and what they walk away with — then
   choose a door. Each craft keeps its own page.

   PLACEHOLDER COPY: replace with Viraj's own words.
   ================================================================== */
export const INTRO = {
  lead: "Engineering taught him how things work. Design and photography taught him how they feel.",
  body: [
    "Viraj Mehta is a designer and photographer based in Vancouver. With a background in Computer Engineering and Web & Mobile Application Design, he blends technology, creativity and storytelling, designing intuitive digital products and capturing moments through photography.",
    "Two practices, one pair of hands. Under Lensofviraj he shoots portraits, events and visual stories; as a designer he draws the apps and sites those pictures end up on — every screen prototyped in Figma and handed over ready to build, so nothing gets cropped, re-shot, or lost in a handover between two strangers.",
  ],
  /* the two doors — the practice cards under the home hero. The card
     carries the craft's name and nothing else; the pages themselves do
     the explaining. */
  does: [
    { t: "Mobile App & Web Design", to: "/design" },
    { t: "Photography", to: "/photography" },
  ],
  /* what a client actually walks away with — framed on the two crafts he
     does himself: photography and design (not development/build). */
  offer: [
    { k: "A finished set", v: "Graded, consistent photographs, delivered in web and print sizes. Not a folder of raws." },
    { k: "A design, ready to build", v: "Every screen designed and prototyped in Figma: clean and considered, ready to hand to any developer." },
    { k: "One eye across both", v: "The person who shoots is the person who designs. Pictures and product, thought through together." },
    { k: "Yours to keep", v: "You leave with the source files: the graded photos and the editable Figma, ready to use." },
  ],
};

/* ROLES — the hero line that types itself out (Typewriter in ui.jsx).
   Order matters: it types the first, erases it, types the next, and
   cycles. Keep them short — the line holds one row in the masthead. */
export const ROLES = ["Mobile app designer", "Web designer", "Photographer"];

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
    note: "Short description of the project. Replace with your own: what it was, why it mattered, what shipped.",
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
    note: "A night series shot entirely on available light. Replace this with the real brief: who it was for and what the pictures had to carry.",
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
    intro: "Documentary coverage. Nobody looked at the camera on purpose.",
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
   cropped down to a vertical sliver of itself — landscape only. Also used by
   the home photography cards to stack a second frame under a landscape
   collection so it fills its column like the portrait ones. */
export const isLandscape = (seed) => {
  const p = PHOTOS.get(seed);
  return !!(p?.w && p?.h && p.w > p.h);
};

/* projectCover(p): the frame to put in a card.

   Cards frame their cover in a fixed landscape box so every card in the
   stack is the same size — otherwise each one inherits its cover photo's
   native ratio and a portrait opening frame turns into an ~870px-tall
   card next to a ~330px landscape one. Given a fixed box, prefer a
   landscape frame from the collection: a portrait cropped to 4:3 is a
   sliver of itself. photos[0] stays the project's opening frame
   everywhere it's shown whole (the detail hero, the grid). */
export const projectCover = (p) =>
  (p.photos || []).find(isLandscape) || p.photos?.[0];

/* Hero slideshow — landscape frames only, found rather than listed.

   The banner is ~2.4:1 on a desktop, so a portrait shows about a third
   of itself; every candidate is filtered through isLandscape(), which
   reads the real pixel dimensions the Contentful sync wrote into the
   manifest. Nothing is hand-picked: publish a wide frame to any
   collection and it becomes eligible on the next build.

   The collections are interleaved round-robin so consecutive slides come
   from different sets, and the run is capped — the hero is a taste of the
   work, not the whole library, and each extra slide is another full-width
   image the page may end up fetching. A collection with no landscape
   frame at all still contributes its opening one, so a project is never
   dropped from the hero entirely (it just crops, as it did before). */
const HERO_MAX = 6;

export const FEATURED = (() => {
  const lists = PHOTO_PROJECTS.map((p) => {
    const wide = (p.photos || []).filter(isLandscape);
    return { p, photos: wide.length ? wide : (p.photos || []).slice(0, 1) };
  });
  const out = [];
  const longest = Math.max(0, ...lists.map((l) => l.photos.length));
  for (let i = 0; i < longest && out.length < HERO_MAX; i++) {
    for (const { p, photos } of lists) {
      if (!photos[i] || out.length >= HERO_MAX) continue;
      out.push({ seed: photos[i], t: p.t, slug: p.slug, loc: p.loc, year: p.year });
    }
  }
  return out;
})();

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
    intro: "An interactive Figma prototype. Click through the full product flow.",
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
    intro: "An interactive Figma prototype. Click through the full product flow.",
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
    intro: "An interactive Figma prototype. Click through the full product flow.",
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
    intro: "An interactive Figma prototype. Click through the full product flow.",
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
  { v: 4, s: "wks", k: "Shoot to final delivery" },
];

/* Viraj's real bio — condensed from his own words. */
export const ABOUT = {
  portrait: manifest.portrait?.seed ?? "pf-about",
  lead: "I create meaningful visual experiences: digital products designed with intent, and moments captured through a lens.",
  body: [
    "My creative journey started with photography. I picked up my first camera in 2014, and it changed the way I saw the world. A few years later, while studying Computer Science Engineering, I built a foundation in programming and software development. Although I enjoyed solving problems through code, I found myself drawn to the creative side of technology, which eventually led me into UI/UX design and creating digital experiences that are both functional and visually engaging.",
    "Today, I combine both passions in my work. Whether I’m designing an app or website, or capturing moments through my camera, I enjoy creating work that tells a story and connects with people.",
  ],
  approach: [
    { k: "Logic meets creativity", v: "An engineer's problem-solving applied to design and photographs: analytical where it helps, intuitive where it matters." },
    { k: "One pair of hands", v: "Shot and designed by the same person, so nothing gets lost between the pictures and the page." },
    { k: "Technology with emotion", v: "Products people can use without thinking; pictures people feel before they think." },
  ],
  timeline: [
    { y: "2014", t: "First point-and-shoot camera. Curiosity becomes a habit." },
    { y: "2018", t: "First DSLR. Photography turns serious, and he starts teaching it." },
    { y: "2019", t: "Leads the college photography group: shoots, collabs, mentoring." },
    { y: "Today", t: "Vancouver. Designing digital products, shooting as Lensofviraj." },
  ],
  kit: [
    { k: "Camera", v: "Sony A7 IV, A7 V" },
    { k: "Lens", v: "24-70mm, 50mm, 70-200mm" },
  ],
};

/* Client words. Attribution is a placeholder role until real names come in —
   swap `by` for the client's name/shoot when available. */
export const TESTIMONIALS = [
  { q: "Viraj made us feel comfortable from the moment the shoot started. The photos exceeded our expectations.", by: "Portrait client" },
  { q: "Viraj understood exactly what we wanted before we did.", by: "Event client" },
];

/* The studio line, used as a standalone statement on the home page. */
export const TAGLINE = "Designed with intention. Captured with emotion.";

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
.pf button { font: inherit; color: inherit; text-transform: inherit; background: none; border: none;
  cursor: pointer; padding: 0; margin: 0; }
/* The font:inherit above out-specifies .mono (0,1,1 vs 0,1,0), so a button
   carrying .mono silently fell back to Inter at body size — which is why
   the bar's "Contact me" CTA didn't match the nav links beside it. Give
   the mono face back to any .mono button. */
.pf button.mono { font-family: 'IBM Plex Mono', monospace; font-size: 11px; }
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

/* HEADINGS LEAD — site-wide rule, see CLAUDE.md.
   A section's own name is the brightest thing in its block. .mono is
   dim by default because most mono text is secondary (badges, meta,
   "all collections" links); but where a mono label IS the section's
   heading — no h1/h2 above it — it must not read quieter than the cards
   underneath, so it takes full ink and weight.
   Only labels that are the heading belong here: a kicker sitting above a
   real <h1> (.about-kicker, .dz-kicker) stays dim, because there the
   headline is what leads. Add new section labels to this list rather
   than patching them one page at a time.

   Colour only — no weight bump. Bolding the mono face at 11px thickened
   the letterforms and read as shouting; brightness alone is enough to
   put the label ahead of the cards. */
.gwork-head > .mono:first-child,
.sec-label,
.hsx-label,
.shead-label { color: var(--ink); }

/* …and the cards under a section label sit one step back from it, so the
   eye reads the section first and the items second. Hover still lifts
   them to the accent. */
.projcap h3,
.wcard-cap h3,
.dz-card-line h3 { color: color-mix(in srgb, var(--ink) 72%, transparent); }

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

/* --- masthead: the light hero ---
   One full screen: the sticky bar sits above it in flow, so subtract its
   height rather than using a bare 100svh that would push the hero's foot
   below the fold. svh, not vh, so mobile browser chrome doesn't overshoot. */
/* 68px is the measured bar: 38px CTA pill (the tallest thing in it, taller
   than the 34px logo) + 14px padding top and bottom + its 1px rule. */
.mast { position: relative; overflow: hidden; display: flex;
  min-height: calc(100svh - 68px); }
.mast .wrap { position: relative; z-index: 3; width: 100%; }
.mast-stage { position: relative; flex: 1; min-width: 0;
  display: flex; align-items: center; }

/* Light moving behind the name. Three pools of the accent, each wandering
   its own four-corner circuit and breathing in and out. The periods are
   coprime-ish (19/23/29s) so the set never repeats a pose, which is what
   keeps it reading as light rather than a loop.

   Each path is a closed loop — the last keyframe is the first — so it
   runs infinite rather than alternate: alternate replays the same route
   backwards, which is exactly the tell that gives away a loop. Linear
   timing for the same reason; ease-in-out would pause the pool at every
   waypoint and turn a wander into four separate slides.
   (No backticks anywhere in here — this stylesheet is a template
   literal, and one closes it.)

   The softness is in the gradient itself, not a blur() filter: a
   full-bleed blur repaints the whole hero every frame, a radial-gradient
   is free. Only transform and opacity animate, so this stays on the
   compositor. */
.mast-light { position: absolute; inset: 0; z-index: 0;
  overflow: hidden; pointer-events: none; }
.mast-light i { position: absolute; display: block;
  width: 78vmax; height: 78vmax; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%,
    color-mix(in srgb, var(--accent) 10%, transparent) 0%,
    color-mix(in srgb, var(--accent) 4.5%, transparent) 32%,
    color-mix(in srgb, var(--accent) 1.5%, transparent) 56%,
    transparent 72%);
  /* --near (0…1) is how close the cursor's pool is — Home.jsx writes it
     every frame. Base × 1.38 at the closest approach, and the bases are
     set so that lands just under 1: opacity clamps there, and a pool that
     hits the ceiling early spends the rest of the cursor's approach doing
     nothing visible, which is the one thing this effect can't afford. */
  opacity: calc(var(--o) * (1 + var(--near, 0) * .38));
  will-change: transform, opacity; }
.mast-light i:nth-child(1) { --o: .72; top: -34%; left: -18%;
  animation: lightWanderA 19s linear infinite; }
.mast-light i:nth-child(2) { --o: .6; top: -6%; right: -26%;
  animation: lightWanderB 23s linear infinite; }
.mast-light i:nth-child(3) { --o: .5; bottom: -46%; left: 22%;
  animation: lightWanderC 29s linear infinite; }
@keyframes lightWanderA {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  25%  { transform: translate3d(20vw, 13vh, 0) scale(1.16); }
  50%  { transform: translate3d(31vw, -7vh, 0) scale(.92); }
  75%  { transform: translate3d(11vw, 17vh, 0) scale(1.2); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes lightWanderB {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  25%  { transform: translate3d(-17vw, 19vh, 0) scale(.86); }
  50%  { transform: translate3d(-27vw, 4vh, 0) scale(1.14); }
  75%  { transform: translate3d(-9vw, 22vh, 0) scale(.94); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes lightWanderC {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  25%  { transform: translate3d(15vw, -16vh, 0) scale(1.12); }
  50%  { transform: translate3d(-6vw, -24vh, 0) scale(.9); }
  75%  { transform: translate3d(-19vw, -9vh, 0) scale(1.18); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
/* the cursor's pool — smaller and dimmer than the drifting three, so it
   reads as a hand held near the surface, not a torch. Home.jsx writes the
   transform; the trailing lag is in there, this only says what it looks
   like. Placed from its own centre (the negative margins) so the
   transform is a plain cursor position with no offset maths. */
/* z-index over the vignette above, which otherwise ate the spotlight in
   the outer third of the frame — the corner settle is there to hold the
   three drifting pools in, not to fight the cursor.

   Kept under the threshold of noticing: this pool alone is barely a
   lift off the black. Most of what a visitor actually sees when they
   move the mouse is the ambient pool it passes brightening — the --near
   handoff above — which is why this one can afford to be this faint. */
.mast-spot { position: absolute; top: 0; left: 0; z-index: 1;
  width: 44vmax; height: 44vmax; margin: -22vmax 0 0 -22vmax; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%,
    color-mix(in srgb, var(--accent) 4%, transparent) 0%,
    color-mix(in srgb, var(--accent) 1.8%, transparent) 34%,
    transparent 66%);
  opacity: 0; transition: opacity .55s ease; will-change: transform; }
.mast-light[data-spot="on"] .mast-spot { opacity: 1; }
/* the pools are brightest in the middle of the frame, where the copy is —
   this settles the corners so the hero still ends in the page's black */
.mast-light::after { content: ""; position: absolute; inset: 0;
  background: radial-gradient(ellipse 82% 72% at 50% 46%,
    transparent 0%, color-mix(in srgb, var(--bg) 72%, transparent) 78%, var(--bg) 100%); }

.display { font-weight: 300; letter-spacing: -0.04em; line-height: .95;
  font-size: clamp(44px, 10.5vw, 140px); text-wrap: balance;
  overflow-wrap: break-word; max-width: 100%; }
.mast .display { text-shadow: 0 4px 44px color-mix(in srgb, var(--bg) 82%, transparent); }
/* No ch-based cap here: ch resolves against this box's 16px font, not the
   140px headline inside it, so 22ch squeezed the h1 into ~180px — and
   .display's overflow-wrap then broke words mid-syllable (Cra/fte/d).
   The headline wraps on the 1180px .wrap instead, which sets its rhythm. */
/* The hero is centred: the studio name opens the page from the middle of
   the frame, and the role line it leaves behind takes the same axis. */
.mast-copy { max-width: 100%; text-align: center; }
/* the row the name and the roles share — the swell is centred on this,
   not on the whole copy block, so the roles appear where the name was */
.mast-line { position: relative; }
.mast-sub { margin-top: clamp(28px, 6vh, 64px); margin-inline: auto;
  max-width: 46ch; font-weight: 300;
  letter-spacing: -0.015em; line-height: 1.5; font-size: clamp(14px, 1.45vw, 17px);
  color: color-mix(in srgb, var(--ink) 62%, transparent); }

/* the opening: the studio name fades up, swells past the edge of the
   frame and clears out, leaving the role line in its place. Absolute, so
   the roles below never move for it; overflow:hidden on .mast does the
   cropping. Under reduced motion Home.jsx drops .mast-swell and the name
   simply sits above the roles instead. */
.mast-swell { position: absolute; left: 0; right: 0; top: 50%;
  translate: 0 -50%; pointer-events: none; opacity: 0;
  animation: swell 2.3s cubic-bezier(.3, 0, .2, 1) forwards; }
@keyframes swell {
  0%   { opacity: 0; scale: .86; filter: blur(8px); }
  20%  { opacity: 1; scale: 1;   filter: blur(0); }
  58%  { opacity: 1; scale: 1.05; filter: blur(0); }
  100% { opacity: 0; scale: 2.1;  filter: blur(12px); }
}

/* the role line — the headline's size sits between .display and the sub,
   so the longest role ("Mobile app designer") holds one row down to
   phone widths */
.mast-roles { font-weight: 300; letter-spacing: -0.035em; line-height: 1.05;
  font-size: clamp(30px, 6.4vw, 86px); min-height: 1.05em; }
.tw-sr { position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap; }
.tw-caret { display: inline-block; width: 2px; height: .84em; margin-left: .07em;
  vertical-align: -0.05em; background: var(--accent);
  animation: caret 1.05s steps(1) infinite; }
@keyframes caret { 50% { opacity: 0; } }

/* the bar wraps to two rows below 720px, so it eats more of the screen:
   44px CTA row + 10px row gap + 14px nav row + 24px padding + 1px rule */
@media (max-width: 720px) { .mast { min-height: calc(100svh - 93px); } }

/* standfirst / disciplines / role: fade+rise in after the headline
   resolves (--rd, set inline per element), so the primary hero text
   settles before the supporting copy and CTAs do. */
.hero-reveal { opacity: 0; transform: translateY(14px);
  animation: heroUp .6s cubic-bezier(.16,1,.3,1) var(--rd, 0s) forwards; }
@keyframes heroUp { to { opacity: 1; transform: none; } }

/* --- the hero's foot dissolves into the page ---
   .mast clips its light at the section edge, and a clipped glow reads as
   a seam: lit above the line, flat black below it. Two halves to the fix,
   and both are needed — the hero's last stretch fades to the page colour,
   and the section under it opens with the faintest continuation of the
   same light, so the glow crosses the boundary instead of stopping at it.
   Between .mast-light (z 0) and .mast .wrap (z 3), so it dissolves the
   light without touching the copy. */
.mast::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0;
  height: 26vh; z-index: 2; pointer-events: none;
  background: linear-gradient(to bottom, transparent, var(--bg) 92%); }

/* --- the two practices, moved out of the hero and given their own room --- */
.intro-sec { position: relative; padding: 12vh 0 2vh; }
/* The carry-over: a whisper of the hero's light, gone by the time the eye
   reaches the standfirst. Deliberately fainter than anything in the hero
   — it is the tail of the glow, not another source.

   It starts at transparent and swells a fifth of the way down, never at
   its own top edge. A band that opens at full strength puts a lit line
   directly against the faded-black foot of the hero, which is the seam
   this was meant to remove, one section lower. */
.intro-sec::before { content: ""; position: absolute; left: 0; right: 0; top: 0;
  height: 56vh; pointer-events: none;
  background: linear-gradient(to bottom,
    transparent 0%,
    color-mix(in srgb, var(--accent) 3.5%, transparent) 22%,
    transparent 80%); }
.intro-sec > .wrap { position: relative; z-index: 1; }
.intro-sec .drawline { height: 1px; background: var(--accent); transform: scaleX(0);
  transform-origin: left; margin-top: 40px;
  animation: draw 1.1s cubic-bezier(.76,0,.24,1) forwards; }
@keyframes draw { to { transform: scaleX(1); } }

/* --- photography: one card per project --- */
.stack { padding-bottom: 18vh; display: flex; flex-direction: column; gap: 34px; }
/* These were sticky, which piled the projects up on top of each other as
   you scrolled. Plain flow instead: one project after another, each read
   on its own. */
.card { position: relative; background: var(--panel); border: 1px solid var(--rule);
  border-radius: 4px; overflow: hidden; transition: border-color .4s ease; }
.card:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--rule)); }
/* align-items: stretch is the default, but it's load-bearing here: the
   caption column matches the cover's height rather than the other way
   round, so the card's height comes from one fixed ratio. */
.card-in { display: grid; grid-template-columns: 1.15fr 1fr; }
@media (max-width: 860px) {
  .card-in { grid-template-columns: 1fr; }
  .stack { gap: 26px; }
}
/* 3/2 and fixed. The ratio used to be set inline per card from the cover
   photo's own dimensions, which made every card a different height — a
   portrait cover ran to ~870px against a landscape's ~330px, and the
   stack had no rhythm at all. One ratio for every card instead, so the
   covers line up down the page; projectCover() picks a landscape frame
   so the fixed box crops as little as possible. */
.shot { position: relative; overflow: hidden; aspect-ratio: 3/2; display: block; }
/* the cover is a crop, so bias it above centre — horizons and faces sit
   in the upper half far more often than the lower */
.shot img { object-position: 50% 42%;
  transition: filter .6s ease; will-change: transform; }
/* WebGL distortion layer: the real photo sits underneath, the canvas on
   top — if WebGL/texture fails, the canvas is transparent and the photo
   shows through. */
.shot .distort-fallback { position: absolute; inset: 0; }
/* the canvas takes the same grade as .pf img — a WebGL layer gets none of
   the site-wide filter otherwise, and the card would sit brighter than
   every other photo on the page */
.shot .distort-canvas { position: absolute !important; inset: 0; display: block;
  filter: var(--filter); }
.shot .open { position: absolute; right: 14px; bottom: 14px; z-index: 2;
  background: color-mix(in srgb, var(--bg) 55%, transparent); color: var(--ink);
  backdrop-filter: blur(8px); border: 1px solid var(--rule); border-radius: 100px;
  padding: 7px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  letter-spacing: .14em; text-transform: uppercase; }
.cap { padding: 34px 32px; display: flex; flex-direction: column; justify-content: space-between; gap: 26px; }
/* The copy used to sit hard against the top of a 400px column with the
   meta pinned to the bottom, leaving a hollow band between them. Auto
   margins centre the copy in whatever space is left over; the meta keeps
   its place on the bottom rule. */
.cap > :first-child { margin-block: auto; }
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
/* photography-route logo (Lensofviraj). Drop public/logo-viraj.{svg,png,webp};
   until then the wordmark below stands in. */
/* the viraj photography mark, inlined so its entrance animation runs.
   overflow:visible so the shutter's rotate-in isn't clipped mid-spin. */
.logo-photo { gap: 0; display: inline-flex; }
.logo-photo svg { height: 34px; width: auto; display: block; overflow: visible; }
@media (max-width: 720px) { .logo-photo svg { height: 28px; } }
.logo-mark { height: 34px; width: auto; aspect-ratio: 13113 / 11894; color: var(--ink);
  overflow: visible; transition: transform .5s cubic-bezier(.2,.8,.2,1), color .3s ease;
  transform-origin: 50% 50%; }
.logo-mark path { fill: currentColor; fill-rule: evenodd; stroke: currentColor; stroke-width: 220;
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
.projshot + .projshot { margin-top: 22px; }
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
.cf-field > span.mono { font-size: 13px; }
.cf-field input, .cf-field textarea, .cf-field select { background: var(--panel); border: 1px solid var(--rule);
  border-radius: 4px; color: var(--ink); font: inherit; font-size: 15px; padding: 13px 15px;
  width: 100%; transition: border-color .25s ease; }
.cf-field input::placeholder, .cf-field textarea::placeholder { color: var(--dim); opacity: .45; }
.cf-field input:focus, .cf-field textarea:focus, .cf-field select:focus { border-color: var(--accent); outline: none; }
.cf-field textarea { resize: vertical; line-height: 1.6; }
/* select: strip the native chrome, draw our own chevron, and dim the label
   until a real option is chosen (empty value fails :invalid on a required select). */
.cf-field select { appearance: none; -webkit-appearance: none; cursor: pointer; padding-right: 40px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%2382828B' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 15px center; }
.cf-field select:required:invalid { color: var(--dim); }
.cf-field select option { color: var(--ink); background: var(--panel); }
.cf-field select option[disabled] { color: var(--dim); }
/* honeypot: off-screen, never shown, no tab stop */
.cf-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.cf-foot { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: 4px; }
.cf-foot button[disabled] { opacity: .5; pointer-events: none; }
.cf-err { text-transform: none; letter-spacing: .02em; color: #F4595E; }
.cf-err a { color: var(--accent); }
/* reply-time note + social links, sat below the button on one line */
.cf-after { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  flex-wrap: wrap; margin-top: 8px; padding-top: 16px; border-top: 1px solid var(--rule); }
.cf-reply { text-transform: none; letter-spacing: .04em; color: var(--dim); }
.cf-social { display: flex; gap: 10px; }
.pf .cf-social a { width: 36px; height: 36px; display: grid; place-items: center; color: var(--dim);
  border: 1px solid var(--rule); border-radius: 50%;
  transition: color .3s ease, border-color .3s ease; }
.pf .cf-social a:hover { color: var(--accent); border-color: var(--accent); }
.cf-social svg { width: 18px; height: 18px; }
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
.cmodal-head h2 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.1;
  font-size: clamp(24px, 3.4vw, 32px); text-wrap: balance; }
.cmodal-sub { margin-top: 14px; color: var(--dim); font-size: 15px; line-height: 1.6; max-width: 48ch; }
.cmodal-x { flex: 0 0 auto; width: 34px; height: 34px; display: grid; place-items: center;
  border: 1px solid var(--rule); border-radius: 50%; color: var(--dim); font-size: 13px;
  transition: border-color .3s ease, color .3s ease; }
.cmodal-x:hover { border-color: var(--accent); color: var(--accent); }
/* the form fills the panel here, unlike the wide page version */
.cmodal-panel .contact-form { max-width: none; margin-top: 24px; }
.cmodal-panel .form-done { margin-top: 24px; }

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
/* Generous, viewport-tracking gaps so the five sections read as five
   separate destinations rather than one run of text; clamped so they
   neither crowd at 900px nor drift apart on a wide desktop. Contact me
   is a button (opens the enquiry modal, not a route) but shares every
   selector below so it reads exactly like the other four. */
.nav { display: flex; gap: clamp(24px, 3.4vw, 44px); align-items: center; }
.nav a, .nav button { position: relative; }
.nav a[aria-current="page"] { color: var(--accent); }
.nav a::after, .nav button::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px; height: 1px;
  background: var(--accent); transform: scaleX(0); transform-origin: right;
  transition: transform .35s cubic-bezier(.76,0,.24,1); }
.nav a:hover::after, .nav button:hover::after,
.nav a[aria-current="page"]::after { transform: scaleX(1); transform-origin: left; }
/* Five sections don't fit a phone in one row, so the bar wraps and the
   nav sits on its own line rather than disappearing. */
@media (max-width: 720px) {
  .bar-in { flex-wrap: wrap; gap: 10px 14px; padding: 12px 20px; }
  .nav { order: 3; width: 100%; gap: 16px; justify-content: space-between; }
  .nav a, .nav button { font-size: 10.5px; letter-spacing: .1em; }
}
/* One row of five stops fitting at about 370px. What happened past that
   point was two different failures: at 360px "Contact me" broke across
   two lines inside its own link, and by 320px the whole link had been
   pushed off the right edge with no way to reach it — the one link that
   matters. So below 370 the nav wraps to a second row and packs left in
   reading order (space-between would fling the leftovers to opposite
   edges of that row), with the labels themselves held on one line.
   Kept off at 375px and up, where the row genuinely fits: a blanket
   flex-wrap broke a 375px iPhone to two rows for a few subpixels. The
   second row makes the bar taller, so the hero's offset matches. */
@media (max-width: 370px) {
  .nav { flex-wrap: wrap; justify-content: flex-start; gap: 9px 14px; }
  .nav a, .nav button { white-space: nowrap; }
  .mast { min-height: calc(100svh - 118px); }
}

/* --- about page --- */
/* vertical padding only: a padding shorthand here would reset .wrap's
   left/right 28px to 0 and jam the whole page against the screen edge. */
.about { padding-top: 12vh; padding-bottom: 8vh; }
.about-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }
@media (max-width: 820px) { .about-hero { grid-template-columns: 1fr; gap: 36px; }
  /* single column now, so the 22ch measure that sat beside the portrait
     just leaves dead space on the right — let the lead fill the column
     (it's a short sentence, so it becomes a couple of full-width lines). */
  .about-lead { max-width: none; } }
.about-kicker { margin-bottom: 22px; }
.about-hero h1 { font-weight: 300; letter-spacing: -0.04em; line-height: .98;
  font-size: clamp(44px, 8vw, 104px); text-wrap: balance; }
.about-lead { font-weight: 300; letter-spacing: -0.02em; font-size: clamp(20px, 2.6vw, 30px);
  line-height: 1.35; margin-top: 28px; max-width: 22ch; }
.about-lead i { font-style: normal; color: var(--accent); }
.about-portrait { position: relative; overflow: hidden; border-radius: 4px;
  border: 1px solid var(--rule); aspect-ratio: 4/5; }
/* kit + availability strip — a plain spec grid under the bio */
.about-kit { margin: 10vh 0; }
.kitgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 30px 28px;
  border-top: 1px solid var(--rule); padding-top: 32px; }
.kitgrid dd { margin: 10px 0 0; font-weight: 300; letter-spacing: -0.01em;
  font-size: 17px; line-height: 1.5; color: var(--ink); }
.about-portrait img { will-change: transform; }

/* --- section header: numbered label + a rule that draws in --- */
.shead { display: flex; align-items: center; gap: 20px; margin-bottom: 36px; }
.shead-n { flex: none; color: var(--accent); font-variant-numeric: tabular-nums; }
/* colour/weight come from the "headings lead" block near .mono */
.shead-label { flex: none; white-space: nowrap; }
.shead-rule { flex: 1 1 auto; height: 1px; background: var(--rule);
  transform: scaleX(0); transform-origin: left; transition: transform .9s cubic-bezier(.2,.8,.2,1); }
.shead.in .shead-rule { transform: scaleX(1); }

/* Globe left, bio right. The globe column simply isn't rendered when
   heavy visuals are off — hence the minmax on the *text* column, so it
   spreads to a full measure on its own rather than staying pinned to a
   60ch strip with dead space beside it. */
.about-body { display: grid; grid-template-columns: 1fr minmax(0, 60ch);
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
  /* stacked, the bio leads and the globe follows — it's decoration, and
     shouldn't push the reading off the top of the section */
  .about-body-text { order: 1; }
  .about-body-viz { order: 2; }
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

/* studio tagline — a large, quiet, centred statement between sections */
.statement { padding: 15vh 0; border-top: 1px solid var(--rule); text-align: center; }
.statement p { font-weight: 300; letter-spacing: -0.03em; line-height: 1.14;
  font-size: clamp(28px, 5vw, 58px); text-wrap: balance; }
.st-line { display: block; }
.st-line + .st-line { color: var(--dim); }

/* testimonials — client words in the standard two-up card grid */
.tmon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 720px) { .tmon-grid { grid-template-columns: 1fr; } }
.tcard { border: 1px solid var(--rule); border-radius: 7px; background: var(--panel);
  padding: 30px 30px 26px; display: flex; flex-direction: column; gap: 18px; }
.tcard blockquote { font-weight: 300; letter-spacing: -0.02em;
  font-size: clamp(18px, 2vw, 23px); line-height: 1.5; }
.tcard blockquote::before { content: "\\201C"; color: var(--accent); }
.tcard blockquote::after { content: "\\201D"; color: var(--accent); }
.tcard-by { color: var(--dim); margin-top: auto; }

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
/* caption + rail sit at the bottom of the frame */
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
/* the bottom padding is the gap down to the frames carousel — 2vh let the
   copy sit almost on top of the first slide */
.band { padding: 12vh 0 7vh; }
.band h2 { font-weight: 300; letter-spacing: -0.03em; line-height: 1.02;
  font-size: clamp(30px, 5vw, 66px); text-wrap: balance; }
/* --- the Lensofviraj wordmark ---
   The practice's name is the one place on this page that is a name rather
   than a sentence, so it is set as a lockup instead of a heading: the two
   halves in the display face at a size above the band's own h2, the joint
   dropped into the mono face at a third the size and pushed off the
   baseline. Both faces are already loaded — this invents no new type.

   The joint is --dim, not --accent: the accent in this palette is #E4E4E7
   against #ECECEC ink, a difference of twelve values that nobody can see.
   Contrast has to come from the grey.

   Baseline alignment (not centre) is what holds it together — the mono
   cap sits on the same line the display letters stand on, then rides up
   from there, so the three parts read as one word set three ways. */
.pbrand { display: flex; align-items: baseline; flex-wrap: wrap;
  font-weight: 300; letter-spacing: -0.045em; line-height: .95;
  font-size: clamp(38px, 7vw, 86px); }
.pbrand-of { font-family: 'IBM Plex Mono', monospace; font-weight: 400;
  font-size: .3em; letter-spacing: .2em; text-transform: uppercase;
  color: var(--dim);
  /* the .2em of tracking above hangs off the F as trailing space, so the
     right margin has to be .2em short of the left one for the two gaps
     to measure the same on screen */
  margin: 0 .14em 0 .34em; transform: translateY(-0.62em); }
/* the tail carries the name; a hair more weight than the opening half so
   the eye lands on "viraj" rather than on "Lens" */
.pbrand-tail { font-weight: 400; letter-spacing: -0.05em; }
.band p { color: var(--dim); font-size: 15px; line-height: 1.72; max-width: 46ch; margin-top: 20px; }
/* the photography philosophy line — brighter and larger than the note below it.
   Written as .band p.band-lead, not .band-lead: a bare class (0,1,0) loses
   to the .band p rule above (0,1,1), so every declaration here was being
   discarded and the lead rendered as an identical second note — same 15px,
   same dim grey, same 46ch. Same trap as .pf button.mono near the top. */
.band p.band-lead { color: var(--ink); font-weight: 300; letter-spacing: -0.02em;
  font-size: clamp(19px, 2.4vw, 27px); line-height: 1.45; max-width: 30ch; margin-top: 26px; }

/* --- photo project detail --- */
/* Shows the opening frame whole. This was aspect-ratio: 16/9 with the
   site-wide object-fit: cover, which guillotined every portrait — heads
   cropped off the top. Then it was a full-width fixed-height stage with
   the picture contained inside it, which read as a black slab with a
   sliver of photograph in the middle: a portrait at this height only
   fills about a quarter of the 1180px column, and .pj-hero's panel
   background filled the rest. That fixed height was then put on the
   *figure*, with the img at a flat 100%/100% inside it — which fixed
   portraits but broke landscapes on a narrow phone: a 16:9 frame at the
   height cap wants far more width than a ~330px column has, so
   max-width:100% clamped the figure's width while its height stayed
   fixed, leaving the actual photograph shrunk to a strip in the middle
   of a tall black box.

   The fix is to stop dictating a box and let the img size itself: the
   aspect-ratio lives on the img (not the figure), with width/height auto
   and a max-width/max-height pair — the browser finds the largest size
   that satisfies the ratio within both caps, exactly like .lb-stage img
   in the lightbox. The figure has no height of its own; it shrink-wraps
   to whatever the img resolves to, so a portrait is a tall narrow frame
   and a landscape a wide (or, on a narrow phone, short) one — the whole
   picture either way, on every viewport, and no letterbox around it. */
.pj-hero { position: relative; overflow: hidden; border-radius: 4px;
  border: 1px solid var(--rule); background: var(--panel);
  /* fit-content, not auto: a block-level box with width:auto stretches to
     the column, which is what left the black margins. max-width keeps a
     very wide frame inside the column. margin-inline: auto centres it: a
     portrait fills only about a third of the 1180px column, and hard-left
     left a dead void down its right side. Centred it holds the page on
     every project, portrait or landscape, without changing the shape of
     the frame itself. */
  width: fit-content; max-width: 100%; margin-inline: auto; }
/* scoped to this page — /work/:seed and /design/:slug share .detail and
   want their original, roomier lead-in */
.detail-pj { padding-top: 7vh; }
.detail-pj .back { margin-bottom: 26px; }
.detail-pj .detail-head { margin-bottom: 28px; }
/* width/height auto (not 100%) is what lets the img size itself rather
   than fill a box dictated from outside; max-height is the one that
   matters on a short window — what's above the stage is ~310px of
   largely fixed chrome, so cap the frame at the space actually left
   rather than at a share of the height. */
.pj-hero img { display: block; width: auto; height: auto; max-width: 100%;
  max-height: min(60vh, 640px, calc(100svh - 330px));
  object-fit: contain; transform: none; transition: none; }
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
  text-transform: uppercase; color: var(--dim); transition: color .3s;
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

/* --- home design run: the projects travel sideways --------------------
   The section holds the screen while its track slides left, so a project
   is read one at a time at full width instead of three-up and thumbnail
   sized. .hsx gets its height from Home.jsx (viewport + however far the
   track overruns it) — that extra height is what the sticky child scrubs
   through, and it is why the page's scrollbar still tells the truth
   about the section's length.

   The pinned run is for screens that can hold a full card. Everything
   else — narrow, short, or motion-averse — gets the flat layout at the
   bottom of this block: the panel stacked above a swipe row. A phone
   already has a horizontal gesture; hijacking its vertical scroll to
   fake one is worse than the thing it replaces. */
.hsx { position: relative; border-top: 1px solid var(--rule);
  /* the bar is sticky, so an anchor jump would land under it */
  scroll-margin-top: 80px; }
.hsx-sticky { position: sticky; top: 0; height: 100svh; overflow: hidden;
  display: flex; align-items: center; background: var(--bg); }
.hsx-track { display: flex; align-items: flex-start;
  gap: clamp(28px, 3.4vw, 64px); padding: 0 clamp(24px, 6vw, 90px);
  will-change: transform; }
/* the cards' wrapper dissolves here: its children become the track's own
   flex items, so the desktop row is laid out as though it weren't in the
   markup at all. It only becomes a box on phones (see the flat layout). */
.hsx-row { display: contents; }
/* the opening panel: the section's name and the line that earns the run.
   Centred against the cards rather than top-aligned with them, so the two
   read as one row. */
.hsx-intro { flex: 0 0 auto; width: min(84vw, 420px); align-self: center; }
/* The name carries the panel, so the mono face is taken up to headline
   size. Tracking comes down as the size goes up — .mono's .16em is set for
   an 11px label and turns a 44px word into scattered letters. Size and ink
   only: no weight bump, which is what thickens this face into shouting. */
/* font-weight is not decoration here: this is an h2, and the UA's bold
   default is exactly the weight bump the rule above forbids — at 44px the
   mono face turns into a slab and out-shouts the whole section. */
.hsx-label { font-size: clamp(26px, 3.2vw, 44px); letter-spacing: .04em;
  font-weight: 400; line-height: 1; margin: 0; }
/* the line under it sits one step back, so the eye reads name then line */
.hsx-title { font-weight: 300; letter-spacing: -0.02em; line-height: 1.35;
  font-size: clamp(16px, 1.5vw, 20px); margin-top: 18px; max-width: 24ch;
  color: color-mix(in srgb, var(--ink) 72%, transparent); }
/* Three caps, not one: the viewport width holds the card on a laptop, the
   720px keeps it from becoming a billboard on a wide monitor, and the
   svh cap is what stops a short screen cropping the caption — the card is
   a 16/11 frame plus a title and a line of copy under it. */
.hsx-card { flex: 0 0 auto; width: min(84vw, 720px, 92svh); display: block; }
.hsx-more { flex: 0 0 auto; align-self: center;
  padding-inline: clamp(20px, 4vw, 60px); }
/* --- the flat layout: heading stacked above a swipe row ---------------
   Three conditions, one block, because the answer to all three is the
   same. Narrow: no room for a 720px card. Short: a landscape phone is
   over 820px wide and would take the pinned run at 390px tall, where a
   card shrinks to a third of the screen and the section becomes 1500px
   of scrolling for it. Reduced motion: Home.jsx returns before wiring
   the driver, so the track never moves and the cards past the fold would
   be unreachable without this. */
@media (max-width: 819px), (max-height: 619px), (prefers-reduced-motion: reduce) {
  .hsx { height: auto !important; padding: clamp(70px, 12vw, 120px) 0; }
  .hsx-sticky { position: static; height: auto; overflow: visible; display: block; }
  /* the track stops being the row and becomes a plain column: panel on
     top, cards in their own scroller under it */
  .hsx-track { display: block; padding: 0 var(--hsx-pad); transform: none !important;
    will-change: auto; --hsx-pad: clamp(20px, 5vw, 40px); }
  .hsx-intro { width: auto; max-width: 34ch; margin-bottom: clamp(24px, 5vw, 40px); }
  /* Bleeds to both edges while its first card still lines up with the
     heading — the negative margin cancels the track's padding, the
     matching padding puts the content back where it was. A row that
     stops at a 20px margin looks like it has run out; one that runs off
     the edge says there is more. */
  .hsx-row { display: flex; align-items: flex-start; gap: clamp(18px, 5vw, 34px);
    overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
    margin-inline: calc(var(--hsx-pad) * -1); padding: 0 var(--hsx-pad) 10px;
    /* snapping ignores padding — without this the first snap point sits at
       the scrollport edge, so the row loads already scrolled past its own
       padding and card one starts flush against the screen */
    scroll-padding-inline: var(--hsx-pad);
    overscroll-behavior-x: contain; }
  .hsx-row::-webkit-scrollbar { display: none; }
  .hsx-card, .hsx-more { scroll-snap-align: start; }
  /* under 100% so the next card peeks in — that sliver is the only thing
     telling a visitor the row scrolls at all */
  .hsx-card { width: min(84vw, 460px); }
  .hsx-more { align-self: center; padding-inline: clamp(10px, 4vw, 30px); }
}

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
.dz-kicker { margin-bottom: 30px; }
.dz-hero-copy h1 { font-weight: 300; letter-spacing: -0.04em; line-height: .96;
  font-size: clamp(42px, 6.4vw, 92px); text-wrap: balance; }
.dz-role { margin-top: 18px; }

/* the featured slot: a label rides above the browser frame so it reads as
   "featured" rather than just another card, and the CTA sits under the
   frame it opens. Both are links to the same project — the shot is the
   big target, the CTA the worded one. */
.dz-hero-media { min-width: 0; }
.dz-hero-shot { display: block; }
.dz-hero-tag { display: block; color: var(--dim); margin-bottom: 14px; }
.dz-hero-shot:hover .dz-hero-tag { color: var(--accent); }
.dz-hero-cta { margin-top: 20px; }

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
   PHONE PASS — one inset, one size for secondary copy.

   Every card on this site carries its own padding (32/30 on .get-card,
   34/26 on .approach, 30/30 on .tcard, 34/32 on .cap, 44/34 on .teaser)
   and its own body size (14 → 16px). At 1180px none of that shows: each
   block sits in its own room, and the variation reads as rhythm.

   On a 390px screen they all collapse into one column and stack
   directly on top of each other, and the variation becomes the only
   thing you see — running down a single page, text starts at x52, x54,
   x58, x61, x70 and x78 while every heading beside it starts at x28,
   and paragraphs half a pixel apart in size sit back to back. It reads
   as sloppiness rather than hierarchy.

   So on phones the cards give up their individual spacing: one inset for
   anything with a border round it, one gutter for the marker rows, one
   size for secondary copy. Everything here is inside the breakpoint, so
   the desktop layout is untouched.
   ================================================================== */
@media (max-width: 560px) {
  /* the page margin itself. 28px is a desktop measure; here it costs
     56px of an already narrow column before a card has inset its text
     on top of it. padding-inline, not padding — .about, .detail and
     .phero-in set their own vertical padding on this same element. */
  .wrap { padding-inline: 20px; }

  /* one inset for every bordered text block, so all boxed copy starts on
     the same vertical line down the page */
  .get-card, .tcard, .metric, .cap, .approach div, .approach a,
  .teaser a, .disc { padding: 22px; }
  /* the teaser leant on 240px of height to hold its shape at desktop
     padding; at this inset that is just a hole under the text */
  .teaser a { min-height: 0; gap: 12px; }

  /* the two marker-gutter rows. Both keep their gutter — the timeline's
     dot rail and the shot list's number are the point of the layout —
     but sized for this column instead of a 1180px one, where they were
     pushing copy 50px past every other left edge on the page. */
  .tl-row { padding-left: 34px; grid-template-columns: 52px 1fr; gap: 14px; }
  .tl-row:hover { padding-left: 40px; }
  .sl-row { grid-template-columns: 24px 1fr; gap: 14px; }

  /* one size for supporting copy. These ranged 14 / 14.5 / 15px, a
     difference too small to read as hierarchy and large enough to look
     like a mistake once the cards are stacked in one column. */
  .get-card p, .approach p, .sl-row p, .cap p, .band p,
  .wcard-cap p, .dz-card-cap p, .colophon dd { font-size: 15px; }
}

/* ==================================================================
   ADMIN — /admin. Same palette as the site, but the site's display
   typography is wrong for a form: .mono is 11px uppercase at --dim
   (5.2:1), which reads fine as a one-word kicker on a poster page and
   badly as the label on all thirty fields of a working tool. All-caps
   also measures ~13% slower to read. So the admin overrides it with
   sentence-case Inter at real sizes, and defines its own line/edge
   tokens because the site's --rule (#1E1E22) sits at 1.19:1 against
   the background — invisible, which is why nothing here had structure.

   Every token below is scoped to .admin, so the public site keeps its
   deliberate look untouched.
   ================================================================== */
.admin {
  --a-line: #48484F;    /* structural dividers — visible, quiet */
  --a-edge: #666670;    /* interactive borders — 3.5:1, WCAG 1.4.11 */
  --a-label: #C4C4CC;   /* field labels — 11.8:1 */
  --a-hint: #9A9AA4;    /* helper text — 7.1:1 */
  --a-field: #17171B;   /* input fill */
  --a-ok: #4ADE80;      /* active   — 11.4:1 */
  --a-draft: #9A9AA4;   /* draft    — 7.1:1 */
  --a-bad: #FF6B70;     /* revoked  — 7.2:1 */
  padding: 6vh 0 14vh; max-width: 1000px;
}
.admin-top { display: flex; justify-content: space-between; align-items: flex-end;
  gap: 20px; flex-wrap: wrap; padding-bottom: 18px; margin-bottom: 30px;
  border-bottom: 1px solid var(--a-line); }
.admin-top h1 { font-weight: 300; letter-spacing: -0.03em; font-size: clamp(28px, 4vw, 40px);
  margin-top: 8px; }
.admin-top .mono { color: var(--a-hint); }
.pf .admin-viewsite { font-size: 13.5px; color: var(--a-hint); transition: color .25s ease; }
.pf .admin-viewsite:hover { color: var(--ink); }
/* the editor's status line sits under a heading, so it needs the gap */
.admin-sec-head .status { margin-top: 6px; }

.admin-summary { color: var(--a-hint); font-size: 14px; margin-bottom: 18px; }

/* in-app guide — collapsible walkthrough on the dashboard */
.admin-guide { border: 1px solid var(--a-line); border-radius: 6px; background: var(--a-field);
  margin-bottom: 22px; }
.admin-guide > summary { display: flex; align-items: center; justify-content: space-between;
  gap: 12px; cursor: pointer; padding: 15px 18px; font-weight: 500; font-size: 15px;
  color: var(--a-label); list-style: none; }
.admin-guide > summary::-webkit-details-marker { display: none; }
.admin-guide > summary:hover { color: #fff; }
.admin-guide-cue { flex: 0 0 auto; font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  letter-spacing: .16em; text-transform: uppercase; color: var(--a-hint);
  border: 1px solid var(--a-edge); border-radius: 100px; padding: 4px 10px; }
.admin-guide[open] > summary { border-bottom: 1px solid var(--a-line); }
.admin-guide-steps { margin: 0; padding: 16px 20px 6px 42px; display: flex;
  flex-direction: column; gap: 12px; }
.admin-guide-steps li { color: var(--a-hint); font-size: 14px; line-height: 1.6; padding-left: 4px; }
.admin-guide-steps li b { color: var(--a-label); font-weight: 500; }
.admin-guide-note { margin: 6px 20px 18px; font-size: 13px; line-height: 1.6; color: var(--a-hint); }
.admin-guide-note b { color: var(--a-label); font-weight: 500; }

.admin-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
/* Every control class below is .pf-scoped, same as .totop and .extlink
   above and for the same reason: the .pf button reset (border: none;
   background: none) is class+type, which beats a bare class, so an
   unscoped .btn on a <button> loses its border and fill and renders as
   naked text. These pages are almost entirely buttons, so it applies
   throughout — .btn, .mini, .crumb, .client-dl, .client-alt. NB: this
   whole stylesheet is a template literal, so no
   backticks in these comments. */
.pf .btn { border: 1px solid var(--a-edge); border-radius: 100px; padding: 10px 20px;
  font-size: 13.5px; font-weight: 500; letter-spacing: 0; color: var(--ink);
  transition: border-color .25s ease, background-color .25s ease, color .25s ease; }
.pf .btn:hover { border-color: var(--ink); }
.pf .btn:disabled { opacity: .4; pointer-events: none; }
.pf .btn.primary { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.pf .btn.primary:hover { filter: brightness(1.1); color: var(--bg); }
.pf .btn.ghost { border-color: transparent; color: var(--a-hint); }
.pf .btn.ghost:hover { color: var(--ink); }
.pf .btn.danger { color: var(--a-bad); border-color: color-mix(in srgb, var(--a-bad) 40%, transparent); }
.pf .btn.danger:hover { border-color: var(--a-bad); }
.pf .btn.small { padding: 7px 15px; font-size: 12.5px; }
.pf .mini { width: 32px; height: 32px; border: 1px solid var(--a-edge); border-radius: 4px;
  display: grid; place-items: center; font-size: 13px; color: var(--a-hint);
  transition: border-color .25s ease, color .25s ease; }
.pf .mini:hover { border-color: var(--ink); color: var(--ink); }
.pf .mini:disabled { opacity: .35; pointer-events: none; }
.pf .mini.danger:hover { border-color: var(--a-bad); color: var(--a-bad); }

.admin-msg { padding: 12px 16px; border: 1px solid var(--a-line); border-radius: 4px;
  margin-bottom: 20px; font-size: 14px; color: var(--ink); }
.admin-msg.bad { color: var(--a-bad); border-color: color-mix(in srgb, var(--a-bad) 50%, transparent); }
.admin-msg.preview { color: #E0A93B; border-color: color-mix(in srgb, #E0A93B 40%, transparent);
  background: color-mix(in srgb, #E0A93B 7%, transparent); }
.admin-empty { padding: 22px 0; color: var(--a-hint); font-size: 14px; }

.admin-sec { margin-top: 38px; }
.admin-sec-head { display: flex; justify-content: space-between; align-items: center;
  gap: 16px; flex-wrap: wrap; padding-bottom: 12px; border-bottom: 1px solid var(--a-line); }
.admin-sec-head h2 { font-weight: 500; letter-spacing: -0.01em; font-size: 20px; }
.admin-sec-head .sub { display: block; margin-top: 4px; font-size: 13px; color: var(--a-hint); }

.admin-row { display: grid; grid-template-columns: 1fr auto; gap: 16px;
  align-items: center; padding: 14px 0; border-bottom: 1px solid var(--a-line); }
.admin-row-main strong { font-weight: 500; letter-spacing: -0.01em; font-size: 16px; display: block; }
.admin-row-main .dim { color: var(--a-hint); font-style: normal; }
.admin-row-meta { display: flex; align-items: center; gap: 10px; margin-top: 5px; font-size: 13px; }
.admin-row-code { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px;
  letter-spacing: .02em; color: var(--a-hint); }
.admin-row-acts { display: flex; gap: 8px; align-items: center; }
@media (max-width: 640px) {
  .admin-row { grid-template-columns: 1fr; gap: 10px; }
  .admin-row-acts { justify-content: flex-start; }
}

/* --- forms --- */
.admin-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 26px; }
@media (max-width: 720px) { .admin-form { grid-template-columns: 1fr; } }
.admin-field { display: flex; flex-direction: column; gap: 7px; }
.admin-field.wide { grid-column: 1 / -1; }
.admin-field > .lbl { font-size: 13.5px; font-weight: 500; color: var(--a-label);
  letter-spacing: 0; text-transform: none; }
.admin-field em { font-style: normal; font-size: 13px; line-height: 1.5; color: var(--a-hint); }
.admin-field input, .admin-field textarea, .admin-login input {
  background: var(--a-field); border: 1px solid var(--a-edge); border-radius: 4px;
  color: var(--ink); font: inherit; font-size: 15px; padding: 11px 13px; width: 100%;
  transition: border-color .2s ease, box-shadow .2s ease; }
.admin-field input:focus, .admin-field textarea:focus, .admin-login input:focus {
  border-color: var(--ink); outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ink) 14%, transparent); }
.admin-field textarea { resize: vertical; line-height: 1.6; }

.admin-login { max-width: 340px; display: flex; flex-direction: column; gap: 10px; margin-top: 8vh; }
.admin-login .lbl { font-size: 13.5px; font-weight: 500; color: var(--a-label); }

/* --- status: colour AND word together, never colour alone --- */
.status { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; }
.status::before { content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: currentColor; flex: 0 0 auto; }
.status-active { color: var(--a-ok); }
.status-draft { color: var(--a-draft); }
.status-revoked { color: var(--a-bad); }

/* --- Drive folder picker (client-delivery folder field) --- */
.admin-picker { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,.78);
  display: grid; place-items: center; padding: 24px; }
.admin-picker-in { background: var(--bg); border: 1px solid var(--a-edge); border-radius: 6px;
  width: min(720px, 100%); height: min(70vh, 640px); display: flex; flex-direction: column;
  overflow: hidden; }
.admin-picker-top { display: flex; justify-content: space-between; align-items: center;
  gap: 16px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid var(--a-line); }
.admin-picker-top strong { font-weight: 500; font-size: 16px; }
/* Column layout so the "new folder" row sits on the bottom edge instead
   of floating under a short list. */
.admin-folder-body { padding: 16px 20px; overflow-y: auto; flex: 1; min-height: 0;
  display: flex; flex-direction: column; }
.admin-folder-body .admin-row:last-of-type { border-bottom: 0; }
.admin-crumbs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
.pf .crumb { font-size: 13px; color: var(--a-hint); }
.pf .crumb:hover { color: var(--ink); }
.pf .crumb::after { content: "/"; margin-left: 6px; color: var(--a-line); }
.pf .crumb:last-child::after { content: none; }
.admin-folder-new { display: flex; gap: 8px; margin-top: auto; padding-top: 16px;
  border-top: 1px solid var(--a-line); }
.admin-folder-new input { flex: 1; background: var(--a-field); border: 1px solid var(--a-edge);
  border-radius: 4px; color: var(--ink); font: inherit; font-size: 14px; padding: 9px 12px; }
.admin-folder-new input:focus { border-color: var(--ink); outline: none; }

/* ==================================================================
   CLIENT AREA — /client. The plainest page on the site: a client here
   wants their photos, not an experience.
   ================================================================== */
.client { min-height: 100vh; display: flex; flex-direction: column;
  justify-content: center; align-items: center; padding: 12vh 0 8vh; text-align: center; }
.client-kicker { margin-bottom: 40px; }

/* --- 404 --- */
.notfound { min-height: 100vh; display: flex; flex-direction: column;
  justify-content: center; align-items: center; padding: 12vh 0 8vh; text-align: center; }
.client-card { width: min(560px, 100%); border: 1px solid var(--rule); border-radius: 4px;
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
.pf .client-dl { display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  width: 100%; margin-top: 26px; padding: 17px 26px; border-radius: 100px;
  background: var(--accent); color: var(--bg); border: 1px solid var(--accent);
  font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .16em;
  text-transform: uppercase; transition: filter .3s ease, opacity .3s ease; }
.pf .client-dl:hover { filter: brightness(1.12); }
.pf .client-dl:disabled { opacity: .45; pointer-events: none; }
.pf .client-dl .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.pf .client-dl:hover .arrow { transform: translate(2px, -2px); }

/* secondary action shown alongside (or instead of) the ZIP button */
.pf .client-alt { display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  width: 100%; margin-top: 12px; padding: 15px 26px; border-radius: 100px;
  border: 1px solid var(--rule); color: var(--ink);
  font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .16em;
  text-transform: uppercase; transition: border-color .25s ease, color .25s ease; }
.pf .client-alt:hover { border-color: var(--accent); color: var(--accent); }
.pf .client-alt .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.pf .client-alt:hover .arrow { transform: translate(2px, -2px); }

/* shown instead of the ZIP button when a shoot is over the download cap */
.client-cap { margin-top: 16px; padding: 14px 16px; border: 1px solid var(--rule);
  border-radius: 4px; color: var(--dim); font-size: 13px; line-height: 1.7; }

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
.deliver { border: 1px solid var(--a-line); border-radius: 6px; padding: 24px;
  background: var(--panel); margin-top: 24px; }
.admin-inline { display: flex; gap: 8px; align-items: center; }
.admin-inline input { flex: 1; }
.admin-inline .folder-name { flex: 1; font-size: 14px; color: var(--ink);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-inline .folder-name.none { color: var(--a-hint); }
.deliver-send { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--a-line); }
.deliver-send .lbl { font-size: 13.5px; font-weight: 500; color: var(--a-label); }
.deliver-send pre { background: var(--bg); border: 1px solid var(--a-line); border-radius: 4px;
  padding: 14px 16px; margin: 10px 0 14px; white-space: pre-wrap; word-break: break-word;
  font-family: 'IBM Plex Mono', monospace; font-size: 13px; line-height: 1.65; color: var(--a-label); }
.deliver-hint { margin-top: 12px; font-size: 13px; color: var(--a-hint); }
.admin-folder-manual { margin-top: 8px; }
.admin-folder-manual summary { cursor: pointer; font-size: 13px; color: var(--a-hint); }
.admin-folder-manual summary:hover { color: var(--ink); }
.admin-folder-manual input { margin-top: 8px; }


@media (prefers-reduced-motion: reduce) {
  .pf *, .pf *::before, .pf *::after { animation: none !important; transition: none !important; }
  .rv { opacity: 1 !important; transform: none !important; }
  .hero-reveal { opacity: 1 !important; transform: none !important; }
  .logo-mark path { stroke-dashoffset: 0 !important; fill-opacity: 1 !important; }
  .logo-word b { opacity: 1 !important; transform: none !important; }
  .intro-sec .drawline, .metrics::after { transform: scaleX(1) !important; }
  /* no typing, so the roles are listed at once — at headline size three
     of them on one line would fill the hero, so the line steps down */
  .mast-roles { font-size: clamp(18px, 2.6vw, 30px); }
  .shot img, .detail-fig img, .about-portrait img { transform: none !important; }
  .phero-fr img, .pj-hero img, .pgrid img, .browser-view img { transform: none !important; }
  /* the design run's flat layout is handled with the narrow/short screens
     up in the .hsx block — one media query covers all three */
  /* the hero light holds still — the pools stay where they start, so the
     glow is there but nothing moves */
  .tick-btn[aria-current="true"] i { transform: scaleX(1) !important; }
  .iris-lens { display: none; }
}
`;
