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
    "Under Lensofviraj he shoots portraits, events and visual stories; as a designer he draws the apps and sites those pictures end up on. Every screen is prototyped in Figma and handed over ready to build, so nothing gets cropped, re-shot, or lost in a handover between two strangers.",
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
export const ROLES = ["Mobile App Designer", "Web Designer", "Photographer"];

/* --- real photos (from the Contentful sync) -------------------------
   scripts/sync-contentful.mjs writes photos.manifest.json at build time.
   Every synced photo is keyed by seed → { sm, lg } local WebP URLs. No
   stock/placeholder fallback: an unsynced seed resolves to nothing, and
   every list built from PHOTOS (FRAMES, PHOTO_PROJECTS, …) is empty
   rather than padded out with stand-in photos. */
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

/* img(seed, w): resolves a seed to a local optimized image. Picks the
   small variant for thumbnail widths, the large one otherwise. An
   unsynced seed resolves to undefined — no `src` rather than a stock
   placeholder — so callers should already be guarding on hasPhoto()/the
   list being non-empty before reaching for an <img>. Call sites still
   pass a height as a third argument in places; it's ignored. */
export const img = (s, w = 1200) => {
  const p = PHOTOS.get(s);
  if (!p) return undefined;
  return w <= 640 ? p.sm : p.lg;
};

/* srcSet(seed): every rendered width for a seed, so <img> can ship the
   resolution that actually matches the slot instead of always whatever
   fixed width img() was called with. The sync writes this string with
   each file's true width (see renderVariants in sync-contentful.mjs) —
   the widths can't be inferred here, because a source photo narrower
   than a resize step keeps its native size, and a descriptor claiming
   more detail than the file holds corrupts the browser's own quality
   choice. The Figma cover screenshots predate the field and still carry
   only an sm/lg pair. undefined for an unsynced seed, same as img(). */
export const srcSet = (s) => {
  const p = PHOTOS.get(s);
  if (!p) return undefined;
  return p.srcset || `${p.sm} 640w, ${p.lg} ${p.w || 2000}w`;
};

/* pickSrc(seed, cssW): the narrowest variant that still covers a slot
   cssW CSS pixels wide. An <img> gets this for free by handing srcSet()
   to the browser; SVG <image> takes no srcset at all, so anything drawn
   that way has to choose here — and img()'s two tiers mean "not a
   thumbnail" resolves to the ~2600px file, which is how phones came to
   download the desktop's photographs.

   DPR is capped at 2 deliberately: a 3× phone would ask for 1170px on a
   full-width tile and land on the top tier, which is three times the
   bytes for a difference that doesn't survive being looked at on a
   phone. */
const pickSrc = (s, cssW) => {
  const p = PHOTOS.get(s);
  if (!p) return undefined;
  if (!p.srcset) return cssW <= 640 ? p.sm : p.lg;
  const dpr = typeof window === "undefined"
    ? 1
    : Math.min(window.devicePixelRatio || 1, 2);
  const need = cssW * dpr;
  const tiers = p.srcset
    .split(",")
    .map((part) => {
      const [url, d] = part.trim().split(/\s+/);
      return { url, w: parseInt(d, 10) || 0 };
    })
    .sort((a, b) => a.w - b.w);
  return (tiers.find((t) => t.w >= need) || tiers[tiers.length - 1]).url;
};

/* The collage tile is at most the full stage wide, and the stage is the
   viewport — so that is what both the tile and the loader preloading it
   ask for. ⚠ It is ONE function on purpose: the loader exists to have
   the frame decoded before the zoom starts, and if it and the tile
   compute their URL separately the loader spends the whole hold warming
   a file the page never requests. Add a caller, don't inline the width. */
export const collageSrc = (seed) =>
  pickSrc(seed, typeof window === "undefined" ? 1600 : window.innerWidth);

/* ratio(seed, fw, fh): CSS aspect-ratio for a seed — the synced photo's
   real dimensions when the manifest has them, the caller's requested box
   shape otherwise (a layout fallback, not a stand-in photo). Lets
   free-flowing grids reserve space before the image loads, so lazy
   loading doesn't shift the layout. */
export const ratio = (s, fw = 3, fh = 2) => {
  const p = PHOTOS.get(s);
  return p?.w && p?.h ? `${p.w} / ${p.h}` : `${fw} / ${fh}`;
};

/* Eerie-black base. Dark, quiet room; the work is the only bright thing.
   It was #0A0A0B, which read as a hole rather than a room. The client
   asked for #1C1C1C, then for a step back down from it; #161616 is that
   step — 1.06:1 off #1C1C1C, and 1.09:1 off the original near-black.
   The rest of the ladder has to move with it either way.

   THE WHOLE PALETTE IS RELATIVE TO bg, so lifting bg alone would have
   broken it in both directions: the old panel (#111114) is DARKER than
   this, so every lifted surface would have become a dent, and the old
   rule (#1E1E22) lands ~1.04:1 against it, so every hairline on the
   site — the one thing separating the sections — would have vanished.

   These four are the values that keep each step's contrast against the
   background exactly what it was, so the design reads identically, just
   on a lighter floor:

     panel  1.053:1  (was 1.050)   the lift under bands and cards
     rule   1.185:1  (was 1.191)   the section hairline
     dim    5.22:1   (was 5.20)    body copy, still past AA's 4.5
     ink   15.32:1   (was 16.75)   left alone; brighter than #ECECEC
                                   only heads toward pure white

   dim had to move: #82828B on this ground measures 4.9:1 and was down
   to 4.48:1 at #1C1C1C, which fails AA for body text. Recompute all
   four if bg changes again — don't eyeball them. */
const BASE = {
  bg: "#161616",
  panel: "#1B1B1E",
  ink: "#ECECEC",
  dim: "#898992",
  rule: "#252529",
  filter: "saturate(0.92) brightness(0.96)",
};

/* One fixed palette. The accent switcher was removed at the client's
   request, so the accent is a constant — every var(--accent) rule in
   the CSS keeps working, it just never changes. */
export const THEME = { ...BASE, accent: "#E4E4E7" };

/* Real synced photos only — no stock/placeholder fallback. FRAMES drives
   the work cards + /work/:seed pages; an empty manifest means an empty
   list, and every page reading it already guards for that. (SHEET, which
   fed the marquee strip, went with it when the strip was removed.) */
export const FRAMES = manifest.work || [];

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

   Real synced Contentful collections only — no stock/placeholder
   fallback. An empty manifest means an empty list, which every
   downstream consumer (FEATURED, PHOTO_POOL, COLLAGE, and every page
   that maps over PHOTO_PROJECTS) already collapses to "render nothing"
   rather than crash or show fake content.
   ================================================================== */

export const PHOTO_PROJECTS = manifest.photoProjects || [];

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

/* COLLAGE — the one screen of frames between the design run and the
   photography index (.collage in the CSS, laid out in Home.jsx).

   Every tile has a shape, and each frame is picked to fit the tile it
   lands in: a portrait dropped into the wide strip shows about a third
   of itself, which is the same trap the hero banner has. Collections are
   walked round-robin so no two neighbouring tiles come from the same
   set. A collection with nothing of the right shape is skipped rather
   than cropped — and if none has one, any unused frame is taken, because
   a filled tile beats an empty one. Returns [] outright with no synced
   photos, which Home.jsx already gates the whole section on. */
const COLLAGE_SHAPE = ["wide", "tall", "wide", "wide", "wide"];

export const COLLAGE = (() => {
  const pools = PHOTO_PROJECTS.map((p) => ({ t: p.t, slug: p.slug, photos: p.photos || [] }));
  if (!pools.length) return [];
  const taken = new Set();
  let at = 0;                                   // where the last pick left off

  const take = (fits) => {
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[(at + i) % pools.length];
      const seed = pool.photos.find((s) => !taken.has(s) && fits(s));
      if (!seed) continue;
      taken.add(seed);
      at = (at + i + 1) % pools.length;
      return { seed, t: pool.t, slug: pool.slug };
    }
    return null;
  };

  return COLLAGE_SHAPE
    .map((shape) => {
      const wants = shape === "tall" ? (s) => !isLandscape(s) : isLandscape;
      return take(wants) || take(() => true);
    })
    .filter(Boolean);
})();

/* ==================================================================
   WEB DESIGN — /design and /design/:slug

   Real projects: interactive Figma prototypes. Each carries `href`
   (the Figma prototype link) and `embed: true`, which makes the detail
   page render the live prototype in an iframe instead of screenshots —
   so visitors click through the real design, no mock images needed.

   PLACEHOLDER COPY: `intro`/`note`/`role`/`year` are Viraj's to fill in
   with the real brief. `shots` is empty on purpose (the embed is the
   visual); add real screen seeds later for a static gallery too.

   `shape` is what device the prototype is drawn for — "phone" or "wide"
   — and it is structural, not copy. The home showcase sizes its stage
   from it: a phone prototype in a full-width frame is fitted by height
   and ends up a 330px sliver stranded in a thousand pixels of Figma's
   own black canvas, so "phone" gets a narrow tall stage it actually
   fills. Anything without the field is treated as "wide". */
const WEB_PROJECTS_FALLBACK = [
  {
    slug: "trackher",
    shape: "phone",
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
    shape: "wide",
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
    shape: "phone",
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
    shape: "phone",
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

/* Viraj's real bio — condensed from his own words. */
export const ABOUT = {
  portrait: manifest.portrait?.seed,
  lead: "I create meaningful visual experiences: digital products designed with intent, and moments captured through a lens.",
  body: [
    "My creative journey started with photography. I picked up my first camera in 2014, and it changed the way I saw the world. A few years later, while studying Computer Science Engineering, I built a foundation in programming and software development. Although I enjoyed solving problems through code, I found myself drawn to the creative side of technology, which eventually led me into UI/UX design and creating digital experiences that are both functional and visually engaging.",
    "Today, I combine both passions in my work. Whether I’m designing an app or website, or capturing moments through my camera, I enjoy creating work that tells a story and connects with people.",
  ],
  approach: [
    { k: "Logic meets creativity", v: "An engineer's problem-solving applied to design and photographs: analytical where it helps, intuitive where it matters." },
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

/* ⚠ PLACEHOLDER COPY — NOT REAL CLIENT WORDS. NONE OF THESE FOUR QUOTES
   CAME FROM A CLIENT. They exist so the carousel has something to lay
   out, and every one of them has to be replaced with something a real
   person actually said before this site is public.

   Publishing invented quotes as genuine reviews is not a style
   question: it misleads the people deciding whether to hire Viraj, and
   for a business operating in BC it is deceptive advertising under the
   Competition Act (and the FTC's endorsement rules for any US traffic).
   Delete the ones you have no source for rather than shipping them —
   the carousel handles any count, and two real quotes beat four
   invented ones.

   `by` is a placeholder role for the same reason: swap it for the
   client's name or the shoot when the real words come in. */
export const TESTIMONIALS = [
  { q: "Viraj made us feel comfortable from the moment the shoot started. The photos exceeded our expectations.", by: "Portrait client" },
  { q: "Viraj understood exactly what we wanted before we did.", by: "Event client" },
  { q: "He sent the gallery back faster than we expected, and every single frame was worth keeping. Choosing between them was the hard part.", by: "Wedding client" },
  { q: "We came in with a rough idea and left with something better than we'd pictured. He asks the right questions before he picks up the camera.", by: "Brand client" },
];

/* The studio line, used as a standalone statement on the home page. */
export const TAGLINE = "Designed with intention. Captured with emotion.";

/* gridCols(n): how many columns n cards should sit in so that every row
   is full — the .cgrid-N class in the centred section system.

   Sections whose item count is fixed in the code name their own class;
   this is for the ones fed from Contentful, where nobody here knows how
   many collections will be published. It prefers three, takes two when
   three would leave a remainder, and gives a lone card the column to
   itself. 5, 7 and 11 have no exact answer at these widths and get
   three — the closest a fixed grid comes. */
export const gridCols = (n) =>
  n <= 1 ? 1 : n % 3 === 0 ? 3 : n % 2 === 0 ? 2 : 3;

/* Inter + IBM Plex Mono + Fraunces are self-hosted via @fontsource (see
   main.jsx) — no render-blocking request to fonts.googleapis.com. */
export const CSS = `
.pf, .pf *, .pf *::before, .pf *::after { box-sizing: border-box; margin: 0; }
.pf { background: var(--bg); color: var(--ink);
  /* Measured height of the sticky bar, in one place: every full-screen
     block subtracts it so it lands inside the visible page rather than
     under the bar. 68px = 38px CTA pill + 14px padding top and bottom +
     its 1px rule; the bar wraps to a second row on a phone, and to a
     third when the nav wraps (see the .nav rules), hence the steps. */
  --bar-h: 68px;
  /* The one vertical measure for a major block. Every centred section on
     the home page reads it, so the page's rhythm is a single number
     rather than a padding value guessed per section. */
  --sec-y: clamp(96px, 15vh, 180px);
  /* The headline accent face. Exactly one word of a centred headline is
     set in it — see .serif — and nothing else on the site is, which is
     why only the 300 italic is loaded. */
  --font-accent: 'Fraunces', Georgia, 'Times New Roman', serif;
  /* THE ITALIC LOCKUP, in two numbers, because it appears at two very
     different scales and has to read as the same thing at both. The
     photography section's italic is the collage's own word at up to
     130px; Design's is 84px. Fixing the roman size and the gap in
     pixels made those two lockups look unrelated — the same pair of
     lines, differently proportioned. Both are now fractions of whatever
     the italic happens to be, so the relationship is identical
     everywhere and only the scale changes.

     ratio: the roman headline's size, as a fraction of the italic.
     gap:   the space between them, likewise. */
  --italic-ratio: 0.52;
  --italic-gap: 0.28;
  font-family: 'Inter', system-ui, sans-serif; font-weight: 400;
  -webkit-font-smoothing: antialiased; letter-spacing: -0.01em;
  transition: color .5s ease; position: relative; min-height: 100vh;
  /* clip, not hidden: hidden would compute overflow-y to auto and turn
     .pf into a scroll container, which silently kills every position:sticky
     inside it (the bar, .card, .lov-stage). clip contains the same
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
/* HEADLINE FACE — Fraunces 300, everywhere a statement headline appears.
   One list, so a new headline can never be left on the sans by accident;
   body copy, nav, cards and every .mono label stay on Inter / IBM Plex
   Mono and are deliberately not in here.

   Each of these classes keeps its own size, and each has had its tracking
   and leading retuned where it sits: the old -0.03/-0.04em and sub-1.0
   line-heights were set for a thin Inter 300, and a serif at the same
   numbers collides with itself — the letters carry more weight per glyph
   and the ascenders and descenders need the room. */
.display, .mast-roles, .chead-title, .chead-kicker, .end h2, .statement p,
.dz-hero-copy h1, .about-hero h1, .detail-head h1,
.cap h2, .phero-cap h1, .cmodal-head h2 {
  font-family: var(--font-accent); font-weight: 300; }
/* CARD AND ROW TITLES STAY ON INTER. They are items under a headline,
   not headlines: .dz-card-line h3, .projcap h3, .wcard-cap
   h3, .tl-row b and the get/testimonial cards all sit one rung down the
   ladder, and putting the display face on them flattens the very order
   the HEADINGS LEAD rule exists to keep. */
/* the emphasis inside a headline: one word taken to the italic. It is the
   only contrast the headline has, so a headline where every word is in
   here has none — never wrap the whole thing. */
.serif { font-style: italic; }
.rule { height: 1px; background: var(--rule); border: 0; }

/* HEADINGS LEAD — site-wide rule, see CLAUDE.md.
   A section's own name is the brightest thing in its block. .mono is
   dim by default because most mono text is secondary (badges, meta,
   "all collections" links); but where a mono label IS the section's
   heading — no h1/h2 above it — it must not read quieter than the cards
   underneath, so it takes full ink and weight.
   Only labels that are the heading belong here: a kicker sitting above a
   real <h1>/<h2> (.about-kicker, .dz-kicker, and every .chead-label in
   the centred section system) stays dim, because there the headline is
   what leads. Add new section labels to this list rather than patching
   them one page at a time.

   Colour only — no weight bump. Bolding the mono face at 11px thickened
   the letterforms and read as shouting; brightness alone is enough to
   put the label ahead of the cards. */
/* Nothing is left in this list. Every section on the site now leads
   with a Fraunces headline in the centred system rather than a mono
   label, so there is no mono label that IS a heading any more. The rule
   still stands for anything added later. */

/* …and the cards under a section label sit one step back from it, so the
   eye reads the section first and the items second. Hover still lifts
   them to the accent. */
.projcap h3,
.dz-card-line h3 { color: color-mix(in srgb, var(--ink) 72%, transparent); }

/* --- the loader ---
   Above everything, including the iris (500), because it covers the
   whole first paint. Same three marks the site is built from: the name
   in the display face, one hairline, one mono figure — no spinner, no
   logo animation, nothing that has to be watched.

   It leaves by lifting its own content out and fading the panel, which
   is the reverse of how the hero arrives underneath it. The node stays
   mounted for the length of that transition and is removed after — see
   the leaving/gone pair in Loader.jsx. */
.loadr { position: fixed; inset: 0; z-index: 600; background: var(--bg);
  display: grid; place-items: center;
  transition: opacity .8s cubic-bezier(.4, 0, .2, 1); }
.loadr[data-leaving] { opacity: 0; pointer-events: none; }
.loadr-in { display: flex; flex-direction: column; align-items: center; gap: 22px;
  transition: transform .8s cubic-bezier(.2, .8, .2, 1), opacity .5s ease; }
.loadr[data-leaving] .loadr-in { transform: translateY(-12px); opacity: 0; }
.loadr-name { font-family: var(--font-accent); font-weight: 300;
  font-size: clamp(21px, 3vw, 32px); letter-spacing: -0.01em; color: var(--ink); }
/* the same 1px rule the whole site is ruled with, filling left to right */
.loadr-rail { display: block; width: min(230px, 44vw); height: 1px;
  background: var(--rule); overflow: hidden; }
/* The transition is what actually animates the bar. Loader.jsx steps the
   scale a few times a second and this carries it between steps, on the
   compositor — which matters because the loader is on screen exactly
   while the main thread is too busy to run a per-frame tween. */
.loadr-rail i { display: block; height: 100%; background: var(--accent);
  transform-origin: left center;
  transition: transform .5s cubic-bezier(.3, 0, .2, 1); }
.loadr-pct { color: var(--dim); font-size: 10px; letter-spacing: .2em; }

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
  min-height: calc(100svh - var(--bar-h)); }
.mast .wrap { position: relative; z-index: 3; width: 100%; }
.mast-stage { position: relative; flex: 1; min-width: 0;
  display: flex; align-items: center; }

/* The gallery tunnel behind the name — GalleryTunnel.jsx, a three.js
   corridor of the site's own tones plus real synced photographs,
   drifting toward the camera forever. Replaces the old cursor-lit pools:
   one ambient background system, not two competing for the same job.
   Gated behind heavyVisualsAllowed() (Home.jsx) the same as About's
   particle globe, so a phone never fetches the three.js chunk for an
   effect it wouldn't render smoothly anyway. */
.mast-tunnel { position: absolute; inset: 0; z-index: 0;
  overflow: hidden; pointer-events: none; }
.mast-tunnel canvas { display: block; }
/* the tunnel is brightest in the middle of the frame, where the copy is —
   this settles the corners so the hero still ends in the page's black,
   same fix the old light layer used */
.mast-tunnel::after { content: ""; position: absolute; inset: 0;
  background: radial-gradient(ellipse 82% 72% at 50% 46%,
    transparent 0%, color-mix(in srgb, var(--bg) 72%, transparent) 78%, var(--bg) 100%); }

.display { font-weight: 300; letter-spacing: -0.012em; line-height: 1.0;
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
/* The quote marks belong to the quotation, not to the paragraph that
   holds it. On .mast-sub the ::after came after ALL of its content —
   including the attribution, which is display: block — so the closing
   mark was pushed onto a line of its own underneath da Vinci's name.
   Wrapped round the sentence itself, it closes where the sentence does. */
.mast-quote::before { content: "\\201C"; color: var(--accent); }
.mast-quote::after { content: "\\201D"; color: var(--accent); }
.mast-sub-by { display: block; margin-top: 10px; font-size: 10px;
  letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }
/* The first-scroll cue is deliberately part of the hero, not a fixed UI
   element: it disappears with the mast and never competes with the work
   below. The travelling dash is a lightweight CSS animation, with no
   scroll listener required. */
.mast-scroll { position: absolute; z-index: 3; left: 50%; bottom: clamp(20px, 4vh, 42px);
  translate: -50% 8px; opacity: 0; display: flex; flex-direction: column; align-items: center; gap: 10px;
  color: color-mix(in srgb, var(--ink) 54%, transparent); font-size: 9px; line-height: 1;
  white-space: nowrap; transition: color .25s ease;
  animation: mastScrollIn .5s cubic-bezier(.16,1,.3,1) 2.35s forwards; }
.mast-scroll:hover { color: var(--ink); }
.mast-scroll i { position: relative; display: block; width: 1px; height: 28px; overflow: hidden;
  background: color-mix(in srgb, var(--ink) 18%, transparent); }
.mast-scroll i::after { content: ""; position: absolute; top: -9px; left: 0; width: 1px; height: 10px;
  background: var(--accent); animation: scrollCue 1.7s cubic-bezier(.65,0,.35,1) infinite; }
@keyframes mastScrollIn { to { opacity: 1; translate: -50% 0; } }
@keyframes scrollCue { to { transform: translateY(38px); } }
@media (max-width: 560px) {
  .mast-scroll { bottom: 18px; gap: 8px; font-size: 8px; }
  .mast-scroll i { height: 22px; }
}

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
.mast-roles { font-weight: 300; letter-spacing: -0.01em; line-height: 1.14;
  font-size: clamp(30px, 6.4vw, 86px); min-height: 1.14em; }
.tw-sr { position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap; }
.tw-caret { display: inline-block; width: 2px; height: .84em; margin-left: .07em;
  vertical-align: -0.05em; background: var(--accent);
  animation: caret 1.05s steps(1) infinite; }
@keyframes caret { 50% { opacity: 0; } }

/* the bar wraps to two rows below 720px, so it eats more of the screen:
   44px CTA row + 10px row gap + 14px nav row + 24px padding + 1px rule */
@media (max-width: 720px) { .pf { --bar-h: 93px; } }
@media (max-width: 680px) {
  .pf { --sec-y: clamp(58px, 10vh, 88px); }
}

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
   Between .mast-tunnel (z 0) and .mast .wrap (z 3), so it dissolves the
   light without touching the copy. */
.mast::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0;
  height: 26vh; z-index: 2; pointer-events: none;
  background: linear-gradient(to bottom, transparent, var(--bg) 92%); }

/* --- the canvas: one screen of frames that becomes the brand ---------
   It opens as the collage — five photographs, exactly the visible page
   minus the bar, so the whole thing is taken in at once — and as the
   section is scrolled through, everything outside the letterforms goes
   black and the word shrinks out of the picture to a headline.

   One canvas, masked. The earlier build painted the picture twice, once
   full-bleed and once clipped to the type, and two layers kept in
   registration by hand read as two images however carefully the maths
   agrees. Here the mask decides what survives: inside the letters and
   outside them are the same pixels, so there is nothing to align.

   The type is SVG, which is not a detail. CSS text-align does not shift
   inline content wider than its box — the overflow goes right — so an
   HTML word at 3000px showed its *start*, hard against the left edge,
   and appeared to zoom out of the corner. text-anchor="middle" anchors
   the run on its own centre at every size, which is what makes it zoom
   out of the middle of the word.

   Home.jsx owns the numbers: --fs (type size), --open (the mask's rect,
   which is the opening beat) and the two opacities that hand the word
   over from photograph to flat ink. The fallbacks here are the settled
   end state, for when the driver never runs. */
.lov { position: relative; }
/* sticks under the bar, not at the top of the screen, so the opening
   frame is the whole visible page and nothing hides beneath the bar */
/* the page's own black, so that what the mask takes away is black and the
   letters read at full strength against it. The hairlines between frames
   are drawn inside the canvas instead (.lov-bed) — as a background here
   they tinted everything the mask removed. */
/* No rules top or bottom. The stage is sticky and a screen tall, so its
   borders travelled with it — a hairline pinned across the foot of the
   viewport for the whole run, which came to rest directly under the
   wordmark at the end of it and read as a line ruled under the brand.
   Full bleed instead: the canvas is a photograph filling the screen and
   wants no frame, and the section below (.gwork, also borderless for
   this reason) opens on its own space. */
.lov-stage { position: sticky; top: var(--bar-h);
  height: calc(100svh - var(--bar-h)); overflow: hidden;
  background: var(--bg); }
/* The lift is written by paint() as the sentence arrives: the word rises
   out of the middle of the frame to clear room for it rather than
   leaving. The whole svg moves, so the mask, the picture inside the
   letters and the flat ink stay in registration — moving the text nodes
   alone would need the mask's copy and the ink copy kept in step by
   hand, and a mask that has drifted a pixel shows as a seam. Nothing is
   revealed at the foot by the move: the canvas is already at opacity 0
   by the time this starts. */
.lov-svg { display: block; width: 100%; height: 100%;
  transform: translateY(var(--lift, 0px)); }
.lov-tile { /* geometry is written by Home.jsx — see lovTiles */ }
/* the surround: a white disc in the mask, closed in from the edges by the
   driver (it writes the gradient's radius). No opacity of its own — a
   half-transparent surround is a haze over the whole frame, and it makes
   the letters read as translucent even at full strength. */
.lov-canvas { opacity: var(--shot-o, 0); }
/* The accent face's italic, same as .chead-kicker — this word IS the
   photography section's kicker, it just happens to arrive by being cut
   out of five photographs. Tracking comes back from .045em to almost
   nothing: the negative track was set for a geometric sans at display
   size and closes the serif's italic up into a single mark. */
/* No text-transform. It carried lowercase from when this was the
   lensofviraj wordmark, where a lowercase mark was the brand; now the
   word is a section's name standing opposite "Design", and a lowercase
   p against a capital D set the two practices differently again.
   COLLAGE_WORD in Home.jsx carries the capital. */
.lov-cut { font-family: var(--font-accent); font-style: italic;
  font-size: var(--fs, clamp(56px, 9vw, 130px)); font-weight: 300;
  letter-spacing: -0.01em; }
.lov-ink { fill: var(--ink); opacity: var(--ink-o, 1); }

/* The sentence, in the lower part of the same sticky frame. Absolutely
   placed rather than in flow: the svg fills the stage, and this has to
   sit over its lower third without changing the geometry the mask is
   measured against. --copy-o is written by paint(); the translate is
   derived from it so the fade and the rise cannot fall out of step. */
/* Hung off the WORD, not off the floor of the stage. Anchoring it to
   the bottom of the viewport left roughly 180px between the italic and
   the roman here against 18px on the Design lockup — the same two lines
   at two unrelated spacings. Positioned from the word's own centre it
   sits --italic-gap below it, exactly as Design's does.

   0.565 is how far the word's ink reaches below its centre: the text is
   dominant-baseline:central and "photography" is all lowercase with
   three descenders, so a little over half its em box hangs below the
   middle. It was measured, not derived — rendered both lockups, scanned
   the pixels for the last lit row of the italic and the first of the
   roman, and tuned it until the optical gap came to the same fraction
   of the italic in each (0.345). --lov-k is the word's live size,
   clamped — during the zoom
   --fs runs to a couple of thousand pixels, and the copy is invisible
   then but would still be laid out a screen and a half down. */
.lov-copy { --lov-k: clamp(56px, var(--fs, 130px), 130px);
  position: absolute; left: 0; right: 0;
  top: calc(50% + var(--lift, 0px) + var(--lov-k) * (0.565 + var(--italic-gap)));
  text-align: center;
  opacity: var(--copy-o, 0);
  transform: translateY(calc((1 - var(--copy-o, 0)) * 26px));
  pointer-events: none; }
/* the collage's word is this lockup's italic, so the roman under it is
   sized off that rather than off .chead's own default */
.lov-copy .chead { margin-bottom: 0; --kicker-fs: var(--lov-k); }
.lov-copy .chead-title {
  font-size: calc(var(--kicker-fs) * var(--italic-ratio)); line-height: 1.2; }

/* --- the two practices, moved out of the hero and given their own room ---
   No light in here. This section used to open with a carry-over of the
   hero's glow, to stop the boundary between them reading as a seam; it
   put a lit haze behind the standfirst, which is copy and wants a black
   page behind it. The hero's own fade to the page colour closes that
   boundary on its own. */
/* The bottom padding is --sec-y, the same measure the section below puts
   above its own headline, so the rule between them sits centred in the
   gap. At 0 the two doors ended a couple of pixels above that rule and
   it read as a line drawn under them rather than a boundary between two
   rooms. */
.intro-sec { padding: clamp(80px, 12vh, 150px) 0 var(--sec-y); text-align: center; }
/* Four words, so this is a statement rather than a paragraph and takes
   the headline face and a headline's size — at .standfirst's 18-27px a
   line this short reads as a caption that lost its picture. It stays
   well under the hero above it, which is the one thing on the page
   allowed to be the biggest. */
.intro-sec .standfirst { font-family: var(--font-accent); font-weight: 300;
  font-size: clamp(28px, 4vw, 50px); line-height: 1.16; letter-spacing: -0.008em;
  max-width: none; margin: 0; }
/* Centre-origin, not left: a rule that draws from one edge under centred
   copy points at nothing. It also stops being full width — a hairline
   the width of the column under one line of type is a bar, not a mark. */
.intro-sec .drawline { height: 1px; background: var(--accent); transform: scaleX(0);
  width: 120px; margin: clamp(34px, 4.5vw, 52px) auto 0;
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
.cap h2 { font-weight: 300; letter-spacing: -0.008em; font-size: clamp(24px, 3vw, 38px); line-height: 1.16; }
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
/* No top rule, unlike every other section. This one follows the .lov
   canvas, which ends on the wordmark cut out of the photographs — a
   hairline drawn straight under that reads as a line ruled under the
   brand rather than a boundary between two rooms, and it closed off the
   one moment on the page that is meant to open out. The section's own
   --sec-y of space is the separation here. */
.gwork { padding: var(--sec-y) 0; }
@media (max-width: 680px) {
  .gwork { position: relative; z-index: 1; margin-top: clamp(-190px, -24svh, -120px);
    padding-top: clamp(12px, 3vh, 24px); }
}
/* --- home: photography collection cards ---
   One framed cover per collection; opens the full gallery at
   /photography/:slug. Mirrors the site's card idiom (accent hover, the
   same pill "open" badge as the project stack).

   The "all collections" link used to sit opposite the section name in a
   space-between row, styled as a bare mono link (.gwork-all, now gone).
   In the centred system it is the header's call to action, in the same
   place and the same .extlink pill as every other section's — one CTA
   treatment on the page, not two.

   .projrow is not a grid of its own any more — the cards go in a
   .cgrid, which sets the column count from how many collections there
   actually are. Everything below styles one card. */
.projcard { display: block; }
/* 4/3 and fixed for every collection, same reasoning as .shot on the
   /photography stack: the ratio used to come from the cover photo's own
   dimensions, which made a portrait card two and a half times the height
   of a landscape one standing next to it in the same row. */
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
.projcap { display: flex; justify-content: center; align-items: baseline;
  gap: 12px; padding: 16px 2px 0; text-align: center; }
.projcap h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(19px, 2.2vw, 25px);
  transition: color .3s; }
.projcard:hover .projcap h3 { color: var(--accent); }
/* The dashed "reserved room" that stood in for the design section before
   any project was published is gone: HAS_REAL_WEB false now renders the
   same centred header as the real section, saying the work is on its way
   — one shape for the section either way, rather than a placeholder that
   looked like a different site. */

/* ==================================================================
   CENTRED SECTION SYSTEM — the home page's one shape

   Every major block on the home page is built the same way: a headline
   with one word in the italic, one or two lines of description, an
   optional call to action — all centred on the column — and under that
   a grid whose columns divide the row exactly.

   Two rules hold it together:

   1. The header is a fixed stack, so the distance from headline to
      description to call-to-action is identical in every section and
      the page reads as one system rather than six arrangements of the
      same parts. Sections opt in by using .chead; nothing is
      per-section. There is no eyebrow — see CenterHead in ui.jsx for
      why one must not be added back.
   2. No auto-fit. Column counts are set from the number of items a
      section actually has (.cgrid-2 for four cards, .cgrid-3 for three)
      and collapse straight to one column rather than through a count
      that would leave a half-empty last row — which is why .cgrid-3
      goes 3 → 1 and never passes through 2.

   Sections are separated by the same hairline every other block on the
   site uses, over --sec-y of space. The full-width glow band that used
   to sit between them is gone: the only lit thing on the page is the
   hero, and repeating its glow down the page spent the effect.
   ================================================================== */
.csec { padding: var(--sec-y) 0; border-top: 1px solid var(--rule); }
/* The gap under the header is its own margin-bottom, not .chead + *:
   every one of these is wrapped in a <Reveal>, so the grid's previous
   sibling is the reveal's div and an adjacent-sibling rule would match
   nothing. Set here rather than on each grid, so the header and what it
   heads can never drift apart from one section to the next. */
.chead { max-width: 760px; margin: 0 auto clamp(52px, 7vw, 90px); text-align: center; }
@media (max-width: 680px) {
  .chead { margin-bottom: clamp(30px, 8vw, 44px); }
}
/* The section's own word, in the accent face's italic, above the
   headline. It reads as the first line of a display lockup rather than
   a label on top of one — which is why it is the same face as the
   headline and only a size down, not the 11px mono caption that used to
   sit here. A header carrying a kicker gives up the italic word inside
   its headline: one italic per header, and this is it. */
/* --kicker-fs is the one size a lockup is built from: the italic takes
   it directly, and the roman and the gap are fractions of it.

   This is deliberately the SAME EXPRESSION the collage's word resolves
   to — paint() in Home.jsx ends at max(56, min(130, vw * 0.09)), which
   is this clamp. The two sections carry equal weight on the page and
   should introduce themselves at equal volume; sized apart, Design read
   as the smaller of the two practices rather than the other half of the
   same studio. If the collage's final size changes, change this with
   it. */
.chead { --kicker-fs: clamp(56px, 9vw, 130px); }

/* The mask the display tier rises out of. See CenterHead in ui.jsx.

   The padding/negative-margin pair is the whole trick: overflow clips at
   the padding edge, so pushing that edge 0.24em past the text leaves
   room for the descenders of an italic "Photography" to sit outside the
   line box without being cut off at rest, and the negative margin takes
   the space straight back out of the layout so nothing below it moves.
   Without it the mask shaves the tails off g, p and y permanently. */
.chead-line { display: block; overflow: hidden;
  padding-bottom: 0.24em; margin-bottom: -0.24em; }
.chead-line > span { display: block; }
.chead-kicker { font-family: var(--font-accent); font-style: italic;
  font-weight: 300; color: var(--ink);
  font-size: var(--kicker-fs); line-height: 1.08;
  letter-spacing: -0.005em;
  /* The kicker carries .chead-line too, and its own margin-bottom would
     otherwise beat that rule's -0.24em compensation — leaving the mask's
     descender padding in the layout and opening the gap by a quarter of
     the italic. Subtracting it here is the same cancellation, done where
     the winning declaration is. 0.24em resolves against this element's
     own font-size, which is --kicker-fs, so the two match exactly. */
  margin-bottom: calc(var(--kicker-fs) * var(--italic-gap) - 0.24em); }
.chead-title { font-weight: 300; letter-spacing: -0.008em; line-height: 1.14;
  font-size: clamp(33px, 5.2vw, 66px); text-wrap: balance; }
/* THE ITALIC IS THE BIGGER OF THE TWO where a header has a kicker, and
   by exactly --italic-ratio — a roman headline at the same scale as the
   italic above it reads as two headlines arguing. Headers with no
   kicker keep the full size above, because there the headline is the
   only thing in the lockup. */
.chead-kicker + .chead-title {
  font-size: calc(var(--kicker-fs) * var(--italic-ratio));
  line-height: 1.2; }
/* One step down, for a section where the headline introduces the block
   rather than carrying it — the testimonials, where the quotes are what
   the visitor came to read. Still unmistakably the headline tier; it is
   a step, not a different rung. */
.chead-title-sm { font-size: clamp(28px, 3.7vw, 48px); }
/* The two tiers under a headline. They are one step apart in BOTH
   weight and colour, which is what makes them read as a ladder rather
   than as two paragraphs that happen to be different sizes: the lead is
   the sans at its normal 400 and full ink, the sub drops to 300 and
   --dim. Same size, deliberately — changing size as well would be a
   third variable doing a job two already do, and it is what made the
   old page look like six different type scales.

   Neither is required. See CenterHead in ui.jsx: a section takes the
   tiers it has something to say in and no more. */
.chead-lead { color: var(--ink); font-weight: 400;
  font-size: clamp(15px, 1.45vw, 17px); line-height: 1.6;
  max-width: 46ch; margin: 26px auto 0; text-wrap: balance; }
.chead-sub { color: var(--dim); font-weight: 300;
  font-size: clamp(15px, 1.45vw, 17px); line-height: 1.68;
  max-width: 52ch; margin: 22px auto 0; text-wrap: pretty; }
/* when the lead is there, the sub is its continuation rather than a new
   paragraph, so the two sit closer than either sits to the headline */
.chead-lead + .chead-sub { margin-top: 8px; }
.chead-cta { margin-top: 34px; display: flex; justify-content: center; }

/* .cbeat — a header given its own screen — is gone. It was written for
   the moment after the collage, and that moment now happens inside the
   collage's own sticky frame instead: the word stays and the sentence
   arrives under it. See .lov-copy. */

/* --- the grids ---
   minmax(0, 1fr), not 1fr: a grid item's automatic minimum is its
   min-content size, so a long unbreakable word (or a card with an
   iframe in it) would otherwise push its column wider than its
   neighbours and break the equal split this whole block exists for. */
.cgrid { display: grid; gap: clamp(22px, 2.8vw, 40px); align-items: stretch; }
/* --- the wide column ---
   The work grids break out of the 1180px measure the copy uses. That
   width is set for reading — 52ch of description sat in the middle of
   it — and three project cards inside it came out at 356px each, which
   is a thumbnail of a phone screen rather than a look at the work. At
   1340 they are just over 400 and the gutter opens with them, which is
   what reads as room around a piece rather than a tight row.

   Only the grid goes wide, never the header: the copy keeps its
   reading measure and stays centred on the same axis, so the section
   still reads as one column with a wider band of work under it. */
.wrap-wide { max-width: 1340px; }

/* The caption under a design card: title, intro line, tool badge, all
   centred under the browser-chrome preview above them. */
.wcard-cap { display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 22px 4px 0; text-align: center; }
.wcard-cap h3 { font-weight: 400; letter-spacing: -0.02em; font-size: clamp(20px, 2.4vw, 27px); }
.wcard:hover .wcard-cap h3 { color: var(--accent); }
.wcard-cap p { color: var(--dim); font-size: 14.5px; line-height: 1.6;
  max-width: 38ch; margin-inline: auto; }
.tool-badge { flex: 0 0 auto; border: 1px solid var(--rule); border-radius: 100px;
  padding: 5px 12px; }

/* one card: it keeps a card's proportions instead of stretching across
   the whole 1180px column, and stays on the page's axis */
.cgrid-1 { grid-template-columns: minmax(0, min(520px, 100%)); justify-content: center; }
.cgrid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cgrid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
@media (max-width: 900px) { .cgrid-3 { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 680px) { .cgrid-2 { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 680px) {
  .dshow-cta { display: flex; justify-content: center; text-align: center; }
  .collections-cta { margin-top: 28px; }
}

/* --- section shell with sticky label --- */
.sec { padding: 13vh 0; border-top: 1px solid var(--rule); }
/* .sec-grid and .sec-label are gone with the sticky-mono-label layout
   they made. Both sections that used them — the two "How a project
   goes" blocks — are a centred header over a .cgrid now, same as the
   home page. .sec survives as a plain ruled section shell. */

/* The .sl-row numbered process list is gone. Both places that used it
   render PROCESS as a Timeline now. */

/* --- carousel dot rail (the lightbox's frame picker) ---
   Each dot is a 26px-tall tap target; the 2px bar centred in it is the
   visual. Laid out by .lb-foot, so there's no container rule here. */
.dot { width: 26px; height: 26px; position: relative; }
.dot::before { content: ""; position: absolute; left: 0; right: 0; top: 50%;
  margin-top: -1px; height: 2px; background: var(--rule); transition: background-color .4s; }
.dot.on::before { background: var(--accent); }

/* --- end ---
   The closing CTA on every page, centred like the sections above it.
   The button and the colophon inherit the centring rather than each
   setting their own, which is what keeps the closing block on the same
   axis as the rest of the page. */
.end { padding: var(--sec-y) 0 44px; border-top: 1px solid var(--rule); text-align: center; }
.end h2 { font-weight: 300; letter-spacing: -0.012em; line-height: 1.06;
  font-size: clamp(40px, 8vw, 108px); text-wrap: balance; }
/* the closing block's one line of copy is the same tier as .chead-sub —
   300 and dim — so the ladder under a headline reads the same here as
   it does in every section above it */
.end .standfirst { margin-inline: auto; color: var(--dim); text-align: justify;
  font-size: clamp(15px, 1.45vw, 17px); line-height: 1.68; max-width: 52ch; }
/* .extlink is inline-flex, so text-align centres it; a <button> is not a
   text node to the parent's alignment in every engine, hence the flex */
.end-cta { display: flex; justify-content: center; margin-top: 30px; }
.mail { display: inline-block; font-weight: 400; font-size: clamp(19px, 2.6vw, 30px);
  margin-top: 30px; position: relative; }
.mail::after { content: ""; position: absolute; left: 0; right: 0; bottom: -3px; height: 1px;
  background: var(--accent); transform: scaleX(0); transform-origin: right;
  transition: transform .5s cubic-bezier(.76,0,.24,1); }
.mail:hover::after { transform: scaleX(1); transform-origin: left; }
/* Three equal columns, then one — never the two that auto-fit used to
   give between roughly 490 and 800px, which left "Elsewhere" alone on a
   second row under a half-empty one. The breakpoint is where three
   230px tracks and their gutters stop fitting the column (3×230 + 2×28
   + the wrap's 56px of padding ≈ 800): 230px is the width the email
   address actually needs, and it is the widest unbreakable thing on the
   site, so below that it gets the full column to itself. */
.colophon { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px;
  margin-top: 13vh; padding-top: 22px; border-top: 1px solid var(--rule); }
@media (max-width: 800px) { .colophon { grid-template-columns: minmax(0, 1fr); gap: 24px; } }
/* belt and braces: a grid item's automatic minimum is its min-content
   width, which is what let the address push past its track in the first
   place. These two mean it wraps inside the column instead, whatever
   the address grows into later. */
.colophon > div { min-width: 0; }
/* the copyright, and on every page but home the way back, on one row —
   the two things that close a page, so they close it together */
.colophon-foot { display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap; padding-top: 18px; }
.colophon dd { margin: 8px 0 0; font-size: 14px; line-height: 1.72; color: var(--dim);
  overflow-wrap: anywhere; }

/* THE WAY BACK IS A CONTROL, NOT A CAPTION.
   It shared .mono with the © line beside it — same face, same 11px, same
   uppercase, same .16em — so the only thing separating the one thing you
   can press in this row from a legal notice was --ink against --dim. It
   read as the second half of the copyright. It also had no hover colour
   at all (.back:hover is only defined under .client-foot), so nothing
   confirmed it was a link, and it was a 118×14px target: a third of the
   44px minimum, on a link that is the only way home from the two pages a
   visitor is most likely to land on cold.

   So it takes the mono CONTROL rung — the 500 weight and the pill the
   four-faces table gives .extlink and .nav — but the QUIET version of
   it: --rule border and --ink text at rest, accent only on hover. Every
   page that renders <Colophon back /> has an accent-filled .extlink
   ("Contact me", "Book a session") a few hundred pixels above this row,
   and that is the section's one primary action; a second filled pill
   under it would argue with it. Bordered-neutral is the same shape at
   lower volume, which is what a secondary control is. Precedent for the
   pair is already here: .pill and .client-alt both go accent-on-hover
   without filling, .extlink fills.

   margin-bottom: 0 is a fix, not a preference. .back's 40px is the gap
   down to the headline on /design/:slug and /photography/:slug, where
   the link sits at the TOP of a page; inherited into this flex row it
   pushed the pill ~26px above the copyright it is supposed to sit level
   with. Scoped to .colophon-foot so the detail pages keep theirs. */
/* The border is --dim, NOT --rule, and that is the difference between a
   pill and no pill. --rule (#252529) sits at 1.19:1 against this
   background — the admin block further down says so in as many words,
   and it is why nothing down there had structure until it defined its
   own --a-edge. A 1.19:1 hairline around this link would have made it a
   control that only exists on hover. --dim (#898992) measures 5.22:1,
   comfortably past the 3:1 WCAG 1.4.11 wants for the visual boundary of
   a UI component, and it is the grey already sitting next to it in the
   © line, so the pill reads as quiet rather than as a new colour. */
.colophon-foot .back { margin-bottom: 0; min-height: 44px; padding: 12px 22px;
  border: 1px solid var(--dim); border-radius: 100px;
  color: var(--ink); font-weight: 500;
  transition: border-color .3s ease, color .3s ease; }
.colophon-foot .back:hover { border-color: var(--accent); color: var(--accent); }
/* Below 560 the row stacks and the pill takes the full column, the way
   .client-alt does — 167px of copyright plus a 164px pill and their gap
   is 347 of the 350px available at 390px wide, so side by side it sat
   hard against the page edge, and one notch narrower it wrapped anyway.
   column-reverse puts the control above the footnote. align-items:
   stretch is what lets both centre themselves: .end is text-align:
   centre at every width, so a full-width © centres with the headline and
   the primary CTA above it instead of hanging off the left. */
@media (max-width: 560px) {
  .colophon-foot { flex-direction: column-reverse; align-items: stretch; gap: 20px; }
  .colophon-foot .back { justify-content: center; }
}

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
@media (max-width: 620px) {
  .cf-after { order: 1; margin-top: 0; }
  .cf-foot { order: 2; align-items: stretch; flex-direction: column; }
  .cf-foot .extlink { justify-content: center; width: 100%; }
}
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
.cmodal-head h2 { font-weight: 300; letter-spacing: -0.008em; line-height: 1.18;
  font-size: clamp(24px, 3.4vw, 32px); text-wrap: balance; }
.cmodal-sub { margin-top: 14px; color: var(--dim); font-size: 15px; line-height: 1.6; max-width: 48ch; text-align: justify; }
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
.detail-head h1 { font-weight: 300; letter-spacing: -0.01em; line-height: 1.08;
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
/* 500 — see .extlink. The nav is the other place the mono face is a
   control rather than a caption, and at 400 it sat back into the bar. */
.nav a, .nav button { position: relative; font-weight: 500; }
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
  .pf { --bar-h: 118px; }
}

/* --- about page --- */
/* vertical padding only: a padding shorthand here would reset .wrap's
   left/right 28px to 0 and jam the whole page against the screen edge. */
.about { padding-top: 12vh; padding-bottom: 8vh; }
.about-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }
/* no portrait synced yet — one column, same dead-space fix as the phone
   layout below, so the lead isn't stuck at its narrow two-up measure */
.about-hero.no-portrait { grid-template-columns: 1fr; }
.about-hero.no-portrait .about-lead { max-width: none; }
@media (max-width: 820px) { .about-hero { grid-template-columns: 1fr; gap: 36px; }
  /* single column now, so the 22ch measure that sat beside the portrait
     just leaves dead space on the right — let the lead fill the column
     (it's a short sentence, so it becomes a couple of full-width lines). */
  .about-lead { max-width: none; } }
.about-kicker { margin-bottom: 22px; }
.about-hero h1 { font-weight: 300; letter-spacing: -0.012em; line-height: 1.06;
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
/* .shead — a mono label with a rule that drew itself across — is gone
   with the SectionHead component it styled; its four call sites are
   CenterHead lockups now. */

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
/* --- .approach: the welded row of panels on /about ---
   This was briefly a Timeline, for consistency with the home page's
   "What you get" and both process sections. Reverted at the client's
   request: "How I work" is three standing positions, not three steps
   you pass through in order, and a rail that lights one at a time
   implies a sequence that isn't there. The panels say "and", the
   timeline said "then". Everything numbered elsewhere on the site is
   still a Timeline. */
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

/* ==================================================================
   THE TIMELINE — a rail down the middle, steps alternating off it

   Replaced the numbered card grid everywhere it was used. Four boxes
   say "four separate things"; these are one sequence, and a line you
   travel down says so. There is no box, no border and no panel here on
   purpose — the type is the whole design, which is also what keeps the
   copy legible at this measure.

   Lit state is driven from Timeline in ui.jsx: exactly one step carries
   data-on="1" at a time, and the rail's fill is --prog.
   ================================================================== */
.tline { position: relative; list-style: none; margin: 0; padding: 0;
  --tline-gap: clamp(34px, 5vw, 80px); }
/* the rail sits on the column's centre line and runs the full height —
   a border on the list would stop at the last item's box */
.tline-rail { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px;
  background: var(--rule); transform: translateX(-50%); }
.tline-rail i { display: block; width: 100%; background: var(--accent);
  transition: height .25s linear; }

.tline-step { position: relative; display: grid;
  grid-template-columns: 1fr 1fr; column-gap: var(--tline-gap);
  padding-block: clamp(30px, 6vh, 74px); }
/* Odd steps sit right of the rail and read left-to-right; even ones sit
   left and are set ragged-left, so both columns hug the line and the
   eye comes back to it between steps instead of tracking to the margin. */
.tline-step[data-side="right"] .tline-body { grid-column: 2; text-align: left; }
.tline-step[data-side="left"] .tline-body { grid-column: 1; text-align: right; }
.tline-body { max-width: 46ch; }
.tline-step[data-side="left"] .tline-body { margin-left: auto; }

/* the marker where the step meets the rail, on the step's first line */
.tline-dot { position: absolute; left: 50%; top: clamp(38px, 6vh, 82px);
  width: 9px; height: 9px; border-radius: 50%;
  transform: translate(-50%, -50%) scale(.7);
  background: var(--bg); border: 1px solid var(--rule);
  transition: background-color .5s ease, border-color .5s ease, transform .5s cubic-bezier(.2,.8,.2,1); }

/* THE ONE THAT IS LIT. Everything else sits back — dimmed and a shade
   smaller, so the page is reading one step at a time rather than four
   at once. transform-origin follows the side so a step shrinks toward
   the rail it hangs off rather than drifting away from it. */
.tline-step { opacity: .34; transition: opacity .55s ease, transform .55s cubic-bezier(.2,.8,.2,1); }
.tline-step[data-side="right"] { transform-origin: left center; }
.tline-step[data-side="left"] { transform-origin: right center; }
.tline-step[data-on="1"] { opacity: 1; }
.tline-step[data-on="0"] { transform: scale(.94); }
.tline-step[data-on="1"] .tline-dot { background: var(--accent);
  border-color: var(--accent); transform: translate(-50%, -50%) scale(1.15); }

.tline-n { display: block; color: var(--dim); margin-bottom: 14px; }
.tline-step[data-on="1"] .tline-n { color: var(--accent); }
.tline-body h3 { font-weight: 400; letter-spacing: -0.02em;
  font-size: clamp(21px, 2.6vw, 30px); margin-bottom: 12px; line-height: 1.2; }
.tline-body p { color: var(--dim); font-size: clamp(15px, 1.5vw, 16.5px);
  line-height: 1.72; }

/* Reduced motion: everything lit, rail drawn full, nothing scaled. */
.tline[data-still] .tline-step { opacity: 1; transform: none; }
.tline[data-still] .tline-dot { background: var(--accent); border-color: var(--accent); }

/* Below the two-column measure the rail moves to the left edge and every
   step hangs off the same side — alternating sides in a 350px column
   gives each one about 150px to say its piece in. */
@media (max-width: 760px) {
  .tline { --tline-gap: 26px; }
  .tline-rail { left: 3px; }
  .tline-step { grid-template-columns: 1fr; padding-left: 30px; }
  .tline-step[data-side="right"] .tline-body,
  .tline-step[data-side="left"] .tline-body {
    grid-column: 1; text-align: left; margin-left: 0; }
  .tline-dot { left: 3px; }
}

/* The numbered card (.get-card / .get-num) is gone, and with it the
   cursor-tracked pool of light that sat on it. Every place it was
   used — the home page's "What you get" and both process sections —
   renders a Timeline instead: four boxes say "four separate things",
   and these are all one sequence. (/about's "How I work" went that way
   too and came back; see .approach above — it is the one such list that
   isn't a sequence.) The lit /
   dimmed step does the job the hover depth was doing, on scroll
   rather than on pointer. See THE TIMELINE above. */

/* studio tagline — a large, quiet, centred statement between sections */
.statement { padding: var(--sec-y) 0; border-top: 1px solid var(--rule); text-align: center; }
.statement p { font-weight: 300; letter-spacing: -0.008em; line-height: 1.26;
  font-size: clamp(28px, 5vw, 58px); text-wrap: balance; }
.st-line { display: block; }
.st-line + .st-line { color: var(--dim); }

/* --- testimonials — a dragged rail of coloured cards -------------------
   The one place on the page that is not near-black. The palette note at
   the top of this file says the work is the only bright thing here, and
   that still holds for every photograph and every card of copy — this
   rail is the deliberate exception, and the tones below are pitched a
   good deal deeper than a light-UI product site would use them so the
   colour reads as warmth in a dark room rather than as four posters
   nailed to the wall next to the photographs.

   It is a native scroll container, not a translated track: touch
   panning, the trackpad and focus-scrolling are then the browser's, and
   the driver in Home.jsx only has to own scrollLeft.

   NO SCROLL SNAP. The row holds for five and a half seconds and then
   slides one card under its own tween; a CSS snap would fight that
   tween for the whole of its travel and drag the row to the nearest
   card mid-slide. The settle after a drag is done in the tween too, for
   the same reason. The list is repeated in the markup so the step has
   an identical frame to wrap into — see Testimonials in Home.jsx. */
.tmon-rail { display: flex; gap: clamp(22px, 2.8vw, 40px); overflow-x: auto;
  scrollbar-width: none; cursor: grab;
  /* Vertical only, and it exists for the cards' hover lift and shadow —
     a horizontal inset would sit inside the scroll container and offset
     the whole row from the headline above it. */
  padding: 10px 0 26px;
  -webkit-overflow-scrolling: touch; }
.tmon-rail::-webkit-scrollbar { display: none; }
.tmon-rail[data-drag="on"] { cursor: grabbing; }
/* No transition on the cards' transform while dragging: the rail is
   moving under the cursor and a hover lift firing on whichever card
   passes underneath is a row that twitches as you drag it. */
.tmon-rail[data-drag="on"] .tcard { transition: none; }
/* Three up on the wide column, matching the project cards; two, then one
   as it narrows. Written as a flex basis rather than a grid because the
   rail scrolls — a grid would size its columns to the container and put
   every card on screen at once, which is the thing this replaces. */
/* Near-square and generously rounded, which is most of what makes these
   read as objects rather than as panels of text. */
.tcard { flex: 0 0 calc((100% - 2 * clamp(22px, 2.8vw, 40px)) / 3);
  min-width: 0; position: relative; overflow: hidden;
  border-radius: 24px;
  padding: 40px 38px 34px; display: flex; flex-direction: column; gap: 18px;
  min-height: clamp(360px, 29vw, 440px);
  text-align: center; align-items: center; justify-content: flex-start;
  /* NO BLURRED LAYER, and no filter anywhere inside this card. The
     softness is in the gradient itself — see --grad below.

     There were two goes at doing it with filter: blur() on a
     pseudo-element, and Safari broke both. WebKit does not reliably
     clip a FILTERED descendant to its parent's border-radius: the
     over-sized version escaped as a whole square over the rounded card,
     and even sized to the card with border-radius: inherit it left its
     square edges showing through the corners. It is not a bug that can
     be patched from the outside — a filtered child gets its own
     rendering surface and the parent's radius stops applying to it.

     So the gradient is an ordinary background-image on the card. A
     background is clipped by border-radius in every engine that has
     ever existed, and the radial stops below are wide enough that the
     result is indistinguishable from the blurred version. Do not
     reintroduce a filtered layer here to "soften" it. */
  background-color: var(--t1); background-image: var(--grad);
  transition: transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s ease; }
.tcard:hover { transform: translateY(-6px);
  box-shadow: 0 30px 60px -34px rgba(0, 0, 0, .9); }
@media (max-width: 1000px) {
  .tcard { flex-basis: calc((100% - clamp(22px, 2.8vw, 40px)) / 2); }
}
@media (max-width: 680px) { .tcard { flex-basis: 100%; } }
/* Four mesh gradients, cycled by index so a fifth quote starts the run
   again. Each is a base colour (--t1, which also fills the card behind
   the blurred layer) plus a stack of radial pools (--grad).

   THESE ARE LIGHT, so the type on them is the page's near-black rather
   than white — see .tcard blockquote below. That is the whole reason
   they work: on a pastel mesh, white 300-weight text sits at about
   1.5:1 and is not text any more, it is texture. Dark type on the same
   gradients measures 8-15:1.

   Sources: "Jade Sky" and "Rosewood Blush" are the 21st.dev gradient
   recipes as given, stop for stop. Tone 2 is the radial white-to-violet
   snippet with one change — its far stop was #63e, which the card's
   corners reach and which drops the attribution sitting over it to
   about 1.6:1; it now passes through #8b5cf6 so full violet only lands
   outside the text. Tone 3 is built in the same idiom from the blob
   background's pink. */
.tcard[data-tone="0"] { --t1: #CFE9F0; --grad:
  radial-gradient(circle at 65.34% 44.62%, rgba(238,246,227,1) 0%, rgba(238,246,227,0) 34.1%),
  radial-gradient(circle at 28.07% 74.48%, rgba(183,217,142,1) 0%, rgba(183,217,142,0) 45.65%),
  radial-gradient(circle at 52.42% 19.94%, rgba(127,191,154,1) 0%, rgba(127,191,154,0) 57.55%),
  radial-gradient(circle at 80.31% 84.47%, rgba(207,233,240,1) 0%, rgba(207,233,240,0) 69.1%); }
/* Rosewood's base is the darkest point on any of the four cards and the
   one the contrast sweep bottoms out on. #B65C7E measured 4.49:1 — a
   hair under the 4.5 bar — so base and matching stop are lifted ~4% to
   #BE6786, which is imperceptible next to the original and clears it. */
.tcard[data-tone="1"] { --t1: #BE6786; --grad:
  radial-gradient(circle at 65.68% 46.6%, rgba(255,241,230,1) 0%, rgba(255,241,230,0) 39.7%),
  radial-gradient(circle at 28.5% 72.47%, rgba(255,201,169,1) 0%, rgba(255,201,169,0) 51.25%),
  radial-gradient(circle at 52.7% 17.67%, rgba(249,143,123,1) 0%, rgba(249,143,123,0) 63.15%),
  radial-gradient(circle at 78.79% 84.35%, rgba(190,103,134,1) 0%, rgba(190,103,134,0) 74.7%); }
.tcard[data-tone="2"] { --t1: #FFFFFF; --grad:
  radial-gradient(125% 125% at 50% 10%, #fff 40%, #8b5cf6 88%, #6633ee 100%); }
.tcard[data-tone="3"] { --t1: #F6D9E4; --grad:
  radial-gradient(circle at 30% 24%, rgba(255,214,224,1) 0%, rgba(255,214,224,0) 46%),
  radial-gradient(circle at 74% 66%, rgba(236,140,180,1) 0%, rgba(236,140,180,0) 56%),
  radial-gradient(circle at 50% 96%, rgba(255,238,244,1) 0%, rgba(255,238,244,0) 62%); }
/* Near-black, so the quote reads as ink on a coloured card rather than
   as a fifth colour. No text-shadow: that was carrying white type over
   a mid-tone ground, and under dark type on a light one it is just a
   smudge.

   ⚠ THIS IS A LITERAL, NOT var(--bg), AND MUST STAY ONE. It was the
   token, which quietly tied a measured contrast decision to the page
   colour: when bg went from #0A0A0B to #1C1C1C the quotes came with it
   and the worst card (Rosewood) fell from 4.52:1 to about 4.0 — under
   AA — for a change that had nothing to do with these cards. The
   attribution beside it was already hard-coded for the same reason. */
.tcard blockquote { color: #0A0A0B; font-weight: 400; letter-spacing: -0.02em;
  font-size: clamp(17px, 1.7vw, 21px); line-height: 1.55; }
.tcard blockquote::before { content: "\\201C"; }
.tcard blockquote::after { content: "\\201D"; }
/* Two auto top-margins in a column, which split the card's free space
   between them: the quote lands a little above centre and the
   attribution is pushed to the foot. That is what makes four cards of
   equal height sign off on the same line despite quotes of four
   different lengths — and it holds however long a real one turns out to
   be, which a fixed offset would not. */
.tcard blockquote { margin-top: auto; }
.tcard-by { color: rgba(10, 10, 11, .66); margin-top: auto; }

/* the arrows. Deliberately quiet and sat under the middle of the rail —
   the rail is already draggable and scrollable, so these are a third way
   of doing it rather than the only one. */
.tmon-nav { display: flex; justify-content: center; gap: 12px; margin-top: 26px; }
.pf .tmon-nav button { width: 42px; height: 42px; border-radius: 50%;
  display: grid; place-items: center; color: var(--dim);
  border: 1px solid var(--rule); background: var(--panel);
  transition: color .3s ease, border-color .3s ease, background-color .3s ease; }
/* fills white with the chevron knocked out in the page's black — the
   same inversion .extlink does on hover, so the two controls behave the
   same way even though one is a pill and one is a disc */
.pf .tmon-nav button:hover, .pf .tmon-nav button:focus-visible {
  background: var(--ink); border-color: var(--ink); color: var(--bg); }
.tmon-nav svg { width: 16px; height: 16px; }

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
   upper-middle (faces) in view when a tall photo is cropped to fit.
   No will-change: transform. Nothing here is transformed any more (the
   Ken Burns zoom is gone), and the hint alone promotes the image to a
   compositor layer that rasterises once — which softened a photograph
   the whole page exists to show. */
.phero-fr img { object-position: center 30%; }
/* Written as .pf img.phero-bg (0,2,1), not a bare .phero-bg (0,1,0):
   .pf img above sets display:block at (0,1,1) and wins over the bare
   class, so the phone backdrop stayed displayed on a desktop — and being
   a static-flow child of .phero-fr it took the whole banner and pushed
   the real frame out below it, leaving a 640px thumbnail stretched
   across the hero. Same trap as .pf button.mono. */
.pf img.phero-bg { display: none; }
.phero-fr::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--bg) 46%, transparent) 0%,
    transparent 30%,
    color-mix(in srgb, var(--bg) 30%, transparent) 60%,
    color-mix(in srgb, var(--bg) 94%, transparent) 100%); }
.phero-in { position: relative; z-index: 2; height: 100%; display: flex;
  flex-direction: column; justify-content: flex-end; gap: 26px; padding: 8vh 28px 40px; }
/* caption + rail sit at the bottom of the frame */
.phero-cap h1 { font-weight: 300; letter-spacing: -0.012em; line-height: 1.04;
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
@media (max-width: 640px) {
  .phero { height: 78vh; }
  .tick-btn { width: 32px; }
  /* the banner is portrait-shaped here while every featured frame is
     landscape (FEATURED only ever picks wide covers) — cover would crop
     most of the photo's width away, so it's shown whole over a blurred
     fill instead. See the .phero-bg comment in Photography.jsx. */
  /* .pf img.phero-bg for the same specificity reason as the base rule —
     as a bare class even the blur lost to .pf img's filter, so the
     "blurred" backdrop was rendering perfectly sharp. */
  .pf img.phero-bg { display: block; position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; object-position: center; filter: blur(40px) brightness(.55) saturate(1.15);
    transform: scale(1.25); }
  .phero-fr img.phero-fg { object-fit: contain; object-position: center; }
}

/* --- project intro band --- */
/* the bottom padding is the gap down to the frames carousel — 2vh let the
   copy sit almost on top of the first slide */
.band { padding: 12vh 0 7vh; }
/* .band renders a CenterHead now, so .band h2, .pbrand, .band p and
   .band p.band-lead are gone with the hand-built lockup they styled.
   .band p in particular had to go: at (0,1,1) it beat .chead-sub at
   (0,1,0) and would have taken the centred paragraph's auto margins
   away, leaving it centred as text but parked left as a block. The last
   surviving .band p — a font-size in the 560px block — was still
   winning over .chead-kicker the same way, and it is gone too: it shrank
   the italic to 15px, which is the body copy's size, so on every phone
   the practice's name, the headline and the explanation were three lines
   of near-identical type with no ladder between them at all. */

/* This lockup is a step down from the site's --kicker-fs, and the reason
   is its title: every other kicker'd header on the site pairs its word
   with a SHORT line ("Prototyped, not mocked up."), and this one carries
   a full sentence. At the standard 130px the italic came out twice the
   size of its own headline and the sentence broke to three lines of
   67px — a 430px slab of Fraunces in which nothing led. 92px puts the
   headline on two lines at every width down to 560 and keeps the brand
   name from out-shouting the line it introduces.

   The floor stays 56px, so from ~850px down this lockup is exactly the
   one Design wears on the home page (56/29) — the mobile proportion is
   the desktop proportion, which is the whole point of sizing the roman
   and the gap off the italic rather than in pixels. Only the ceiling and
   the slope move. --italic-ratio is untouched: that number is what makes
   every lockup on the site read as the same lockup. */
.band .chead { --kicker-fs: clamp(56px, 6.6vw, 92px); }

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

/* ==================================================================
   DESIGN INDEX — /design (magazine-style redesign)

   Masthead → one featured build (large split) → a numbered grid of the
   rest. Reuses the shared .browser / .figbox / .pill primitives so the
   card previews stay identical to the home page; only the surrounding
   layout and captions are new (dz- prefix); Home.jsx keeps .wcard /
   .wcard-cap / .tool-badge (above) as its own three-up grid's card.
   ================================================================== */
/* --- hero: headline (left) + featured live preview (right) --- */
.dz-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
@media (max-width: 900px) { .dz-hero { grid-template-columns: 1fr; gap: 40px; } }
.dz-hero-copy { min-width: 0; }
.dz-kicker { margin-bottom: 30px; }
.dz-hero-copy h1 { font-weight: 300; letter-spacing: -0.012em; line-height: 1.04;
  font-size: clamp(42px, 6.4vw, 92px); text-wrap: balance; }
/* The one mono row here that can wrap. At 11px with .16em tracking two
   lines set solid read as a slab of spaced caps rather than a list, so
   it gets its own leading — and a phone gets the tracking eased off,
   which is what decides whether it needs a second line at all. */
.dz-role { margin-top: 18px; }
.dz-role .mono { display: block; line-height: 2; }
@media (max-width: 560px) { .dz-role .mono { letter-spacing: .1em; } }

/* the featured slot: a label rides above the browser frame so it reads as
   "featured" rather than just another card, and the CTA sits under the
   frame it opens. Both are links to the same project — the shot is the
   big target, the CTA the worded one. */
.dz-hero-media { min-width: 0; }
.dz-hero-shot { display: block; }
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
/* 500, not 400: this is the mono tier's loudest member — a button, sat
   under a headline, and the one thing in the section a visitor is meant
   to press. The weight bump the HEADINGS LEAD rule forbids is for mono
   used as a section *heading*, where it thickens 11px letterforms into
   shouting; on a bordered pill that is exactly the presence it wants.
   Same reason the nav takes 500. */
.pf .extlink { display: inline-flex; align-items: center; gap: 12px; border-radius: 100px;
  border: 1px solid var(--accent); color: var(--accent); padding: 14px 26px;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 500;
  letter-spacing: .16em;
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

/* Two separate cards with air between them, not one bordered block split
   down the middle by a hairline. The 1px gap over a --rule background
   welded the two doors into a single object with a seam in it, and the
   seam sat hard against the copy on both sides; every other card grid on
   this page (.cgrid) puts real space between its items, and these are
   cards like any other. Same gap scale, same panel tone, same radius. */
.disciplines { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(18px, 2.2vw, 28px); margin: clamp(40px, 5.5vw, 62px) auto 0;
  max-width: 860px; }
@media (max-width: 640px) { .disciplines { grid-template-columns: minmax(0, 1fr); } }
/* overflow:hidden + the radius are load-bearing together: the ::before
   below is a full-bleed accent panel that slides up on hover, and
   without the clip it would square off the card's corners as it arrives */
.disc { position: relative; background: var(--panel); border: 1px solid var(--rule);
  border-radius: 7px; padding: clamp(40px, 5vw, 58px) 28px clamp(32px, 4vw, 44px);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  text-align: center; overflow: hidden;
  transition: border-color .4s ease, transform .45s cubic-bezier(.2,.8,.2,1); }
.disc:hover { border-color: var(--accent); transform: translateY(-4px); }
/* border-radius: inherit for the same WebKit reason as .tcard::before —
   Safari does not reliably clip a transformed child to its parent's
   radius, so this accent panel sliding up inside a rounded card showed
   square corners as it arrived. Rounding the panel itself means it never
   depends on the parent clipping it. */
.disc::before { content: ""; position: absolute; inset: 0; background: var(--accent);
  border-radius: inherit;
  transform: translateY(101%); transition: transform .5s cubic-bezier(.76,0,.24,1); }
.disc:hover::before { transform: translateY(0); }
.disc > * { position: relative; z-index: 1; transition: color .35s ease .05s; }
.disc strong { font-weight: 400; letter-spacing: -0.02em;
  font-size: clamp(21px, 2.5vw, 30px); }
/* pushed to the foot of the card, not sat 2px under the name: the two
   doors are the same height (grid stretch) but their names are not —
   "Mobile App & Web Design" takes two lines to "Photography"'s one — so
   without this the two "Enter" links sit at different heights in a row
   that is otherwise perfectly symmetrical */
.disc .go { display: inline-flex; align-items: center; gap: 8px; margin-top: auto;
  padding-top: 10px; }
.disc .go .arrow { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.disc:hover .go .arrow { transform: translateX(6px); }
.disc:hover strong, .disc:hover .mono { color: var(--bg); }

/* ==================================================================
   PHONE PASS — one inset, one size for secondary copy.

   Every card on this site carries its own padding (
   30/30 on .tcard, 34/32 on .cap, 44/34 on .teaser)
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
  .tcard, .cap, .approach div, .approach a,
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

  /* one size for supporting copy. These ranged 14 / 14.5 / 15px, a
     difference too small to read as hierarchy and large enough to look
     like a mistake once the cards are stacked in one column.

     .band p is NOT in this list and must not be added back: .band's only
     paragraphs are CenterHead's own tiers, which are sized by the header
     system, and at (0,1,1) this rule beat .chead-kicker's (0,1,0) and
     dropped the display italic to body size. See .band. */
  .approach p, .cap p,
  .dz-card-cap p, .colophon dd { font-size: 15px; }
}

/* ==================================================================
   ADMIN — /admin. Same palette as the site, but the site's display
   typography is wrong for a form: .mono is 11px uppercase at --dim
   (5.2:1), which reads fine as a one-word kicker on a poster page and
   badly as the label on all thirty fields of a working tool. All-caps
   also measures ~13% slower to read. So the admin overrides it with
   sentence-case Inter at real sizes, and defines its own line/edge
   tokens because the site's --rule (#252529) sits at 1.19:1 against
   the background — invisible, which is why nothing here had structure.

   Every token below is scoped to .admin, so the public site keeps its
   deliberate look untouched.
   ================================================================== */
.admin {
  /* Re-solved when bg left #0A0A0B, to the ratios these were originally
     picked for — a-edge in particular had slid to exactly 3.00:1,
     sitting on WCAG 1.4.11's floor instead of above it, and a-field had
     gone from a lift to a dent. */
  --a-line: #4E4E55;    /* structural dividers — 2.2:1, visible, quiet */
  --a-edge: #6C6C76;    /* interactive borders — 3.5:1, WCAG 1.4.11 */
  --a-label: #CDCDD5;   /* field labels — 11.5:1 */
  --a-hint: #A1A1AB;    /* helper text — 7.1:1 */
  --a-field: #1F1F23;   /* input fill — a lift, like --panel */
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
  .mast-scroll { opacity: 1 !important; translate: -50% 0 !important; }
  .logo-mark path { stroke-dashoffset: 0 !important; fill-opacity: 1 !important; }
  .logo-word b { opacity: 1 !important; transform: none !important; }
  .intro-sec .drawline { transform: scaleX(1) !important; }
  /* no typing, so the roles are listed at once — at headline size three
     of them on one line would fill the hero, so the line steps down */
  .mast-roles { font-size: clamp(18px, 2.6vw, 30px); }
  .shot img, .detail-fig img, .about-portrait img { transform: none !important; }
  .phero-fr img, .pj-hero img, .pgrid img, .browser-view img { transform: none !important; }
  /* the canvas keeps its pictures and loses its run: nothing pins, the
     mask stays open so all five frames show (the wipe's radius keeps its
     markup default, which clears the frame), and the word — which only
     ever arrives by zooming — is dropped rather than parked on top of
     them. It is still on /photography. */
  .lov-stage { position: static; height: auto; }
  .lov-svg { height: 70svh; transform: none !important; }
  .lov-canvas { opacity: 1; }
  .lov-ink { opacity: 0; }
  /* The sentence stops being an overlay on a sticky frame and becomes an
     ordinary block under the pictures: the driver that writes --copy-o
     never runs here, so left as an absolutely-placed layer at opacity 0
     it would simply never appear. Home.jsx gives it back its kicker in
     the same breath, since the word it would otherwise inherit from the
     collage is the thing this block just dropped. */
  .lov-copy { position: static; opacity: 1; transform: none;
    padding-block: clamp(44px, 8vh, 90px); }
  /* the hero light holds still — the pools stay where they start, so the
     glow is there but nothing moves */
  .tick-btn[aria-current="true"] i { transform: scaleX(1) !important; }
  .iris-lens { display: none; }
}
`;
