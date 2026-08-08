# CLAUDE.md

Photographer portfolio — a dark, type-led single-page site (React 19 + Vite,
deployed on Vercel). Studio brand **Crafted & Captured**, photographer **Viraj**.

## Copy rule: no filler text — this one is not negotiable

**Never add words that don't earn their place.** No decorative kickers, no
mono-caps labels that repeat the heading right below them, no taglines,
status lines ("Booking 2026"), city stamps, or numbered `01 ·` prefixes
unless the visitor genuinely needs them there.

- If a word appears twice on one screen, the second one goes.
- If removing a line costs the visitor nothing, remove it.
- A card, header or section gets its name and the one thing you can act
  on — nothing more.
- The same goes for facts (city, year, role): state them once, in the one
  place they're actually useful (footer, About, contact), never as
  atmosphere sprinkled across every section.

When in doubt, leave it out and say so — adding filler back is one line;
the client has repeatedly had to ask for it to be stripped.

## Type rule: headings lead — also not negotiable

**A heading is never dimmer than the text under it.** The site's `.mono`
label style is `var(--dim)` by default, and that default kept getting
applied to *section headings*, so the cards below out-shouted the section
they belonged to. That is backwards, everywhere, always.

- If a mono label **is** the section's heading (no `h1`/`h2` above it),
  it gets `var(--ink)` — brightness only, **never a weight bump**. The
  mono face at 11px thickens badly when bolded and reads as shouting. The
  shared list lives in the "HEADINGS LEAD" block next to `.mono` in
  [src/data.js](src/data.js) — add new section labels there, don't
  re-style them per page.
- A kicker that sits *above* a real headline (`.about-kicker`,
  `.dz-kicker`, and every `.chead-label` in the centred section system
  below) stays dim — there the `h1`/`h2` is what leads.
- Item titles under a section label sit one step back
  (`color-mix(… var(--ink) 72% …)`), so the eye reads section → items.
- Before shipping any new block, check the visual order top-down: heading
  brightest, then its items, then meta. If something below the heading
  pops harder, fix the heading — don't dim the content further.
- **The project hero frame is centred**, not hard-left. `.pj-hero` takes
  the photo's own aspect ratio, so a portrait is only about a third of the
  column — left-aligned it leaves a dead void down the right. It is
  centred via `margin-inline: auto` and must stay that way for every
  collection, portrait or landscape, existing or new.

## The home page is one centred section shape

Every major block on the home page — Design, Photography, "What you get",
Kind words, Contact — is built from the same header and the same kind of
grid. The CSS lives in the **CENTRED SECTION SYSTEM** block in
[src/data.js](src/data.js); the header is `CenterHead` in
[src/ui.jsx](src/ui.jsx). Don't lay a new section out by hand.

- **The header is a four-rung ladder, and a section takes only the rungs
  it has something to put in.** In order: `title` (`h2.chead-title`,
  Fraunces, with exactly **one word** in `<span className="serif">`) →
  `lead` (Inter **400**, `var(--ink)`, one sentence) → `sub` (Inter
  **300**, `var(--dim)`, the longer explanation) → `cta`. Every one
  after the title is optional and renders nothing when omitted. On the
  home page today: Design and Photography take all four, "What you get"
  takes `sub` only, and Kind words is a headline with **nothing** under
  it — that is the shape, not an omission to fix.
- `lead` and `sub` are the **same size** on purpose. They separate by
  weight and colour only; adding a size step would be a third variable
  doing a job two already do, and stacking those steps per section is
  what made the page look like six different type scales.
- The spacing between the header and what it heads is `.chead`'s own
  `margin-bottom`, *not* `.chead + *`: every header is wrapped in a
  `<Reveal>`, so the grid's previous sibling is the reveal's div and an
  adjacent-sibling rule matches nothing.
- **Work grids go wide; copy stays at the reading measure.** The design
  and photography card grids sit in `.wrap.wrap-wide` (1340px) while
  their headers stay in the plain 1180px `.wrap` — three cards in the
  reading column came out at 356px, which is a thumbnail rather than a
  look at the work. The testimonial rail takes the wide column too. The
  "What you get" cards are the one grid that keeps the narrow measure:
  they are copy, and 548px is already a generous line for them.
- **There is no eyebrow, and one must not be added back.** `CenterHead`
  has no `label` prop on purpose. A mono label above the headline said
  "Design" over "Prototyped, not mocked up." and "Photography" over a
  row of photographs — a caption for something already on screen, which
  is the filler the copy rule above forbids.
- **The grid never auto-fits.** `.cgrid-1/2/3` are explicit column
  counts, chosen so every row is full: four "What you get" cards are
  `.cgrid-2` (two full rows), three design cards and three photography
  collections are `.cgrid-3`, two testimonials are `.cgrid-2`. Where the
  item count comes from Contentful and isn't knowable in the code, call
  `gridCols(n)`. `.cgrid-3` collapses **straight to one column** at
  900px and never passes through two, which is what would leave a lone
  card in a half-empty row.
- **Cards in a row take one fixed aspect ratio**, never the photo's own.
  A per-photo ratio makes a portrait card two and a half times the
  height of the landscape one beside it; `projectCover()` picks a
  landscape frame so the fixed box crops as little as possible. Same
  rule as `.shot` on `/photography`.
- **Sections are separated by one hairline over a lot of space.**
  `--sec-y` on `.pf` is the one vertical measure every block reads, and
  `.csec` takes the same 1px `var(--rule)` top border as `.sec`,
  `.statement` and `.end`. The exception is the `.lov` collage and the
  `.gwork` section under it, which are **deliberately borderless**:
  `.lov-stage` is sticky and a screen tall, so a border travelled with
  it and came to rest as a line ruled directly under the lensofviraj
  wordmark. Don't put either one back. **The only lit thing on the site is
  the hero.** A full-width glow band between sections was tried and
  removed — repeating the hero's glow down the page spends the effect.
  Don't reintroduce one.
- **The design section is one prototype at a time, not a grid**
  (`DesignShowcase` in [src/pages/Home.jsx](src/pages/Home.jsx)). The
  three project names are a `tablist` standing where the section's CTA
  used to be; the CTA moved below the work. **Don't put the grid back**
  — `intro`, `tag`, `role` and `tool` are the same placeholder string on
  every entry in `WEB_PROJECTS` and `year` is empty, so three cards
  side by side differed only in their title and printed "Figma" nine
  times across the row. One project on screen fixes that without a word
  being invented, because there is nothing left to repeat.
  - **Only visited projects are mounted.** A Figma embed is an iframe
    loading a whole editor runtime; `seen` grows as tabs are used and
    panels are never unmounted after, so first paint costs one and
    going back is instant rather than a reload.
  - **`shape` on each project drives the stage** — `"phone"` gets a
    420px column and `object-fit: cover` so the cover's black margins
    are cropped away; `"wide"` gets the full column and
    `object-fit: contain` so the laptop isn't cropped. Missing ⇒
    `"wide"`. It is structural metadata, not copy.
  - Arrow keys move between tabs (roving `tabIndex`); inactive panels
    are `aria-hidden` with their link taken out of the tab order, since
    they stay painted for the crossfade.
- **The testimonials are an infinite rail, not a grid** (`Testimonials`
  in [src/pages/Home.jsx](src/pages/Home.jsx)). Three cards **hold for
  `HOLD_MS` (5.5s), then slide exactly one card in `SLIDE_MS` (0.72s)**:
  middle → left, right → middle, a new one in from the right. It is
  deliberately not a continuous drift — copy moving under the eye can't
  be read.
  - **The list is repeated in the markup** — `copies` of it, measured to
    overflow the rail twice — and the position is written out modulo the
    width of one copy. Stepping past the end of a copy lands on the
    identical frame at the start of the next, so the row never has to
    rewind to reach the first quote again. Clones past the first copy
    are `aria-hidden`.
  - `pos` is kept **unbounded** and wrapped only at the moment it is
    written to `scrollLeft`, and renormalised by whole copies **between**
    steps, never during one. Wrapping it in place puts a discontinuity
    inside the slide, and a tween across it runs the row backwards
    through the whole rail to reach a position one card ahead.
  - **Never add scroll-snap.** The slide is a JS tween; a CSS snap
    fights it for the whole of its travel. The settle after a drag is
    done in the same tween for the same reason.
  - **One rAF owns `scrollLeft`**, so the slide, the arrows and a drag
    can't write over each other. It also *adopts* scroll it did not
    cause (trackpad, touch fling, Tab onto an off-screen card) by
    comparing against the last value it wrote.
  - Any number of quotes works; everything is measured. Auto-advance is
    off under reduced motion (arrows still work, jumping rather than
    sliding) and pauses on hover, focus, drag and off-screen.
  - ⚠ **Puppeteer's `screenshot()` resets this rail's `scrollLeft`** —
    both element and page-clip captures. Verify the loop by sampling
    `scrollLeft` over `requestAnimationFrame`, never by diffing
    screenshots; a screenshot-based seam test will always report a
    mismatch that isn't there.
- **The testimonial cards are the one coloured thing on the site**, and
  a deliberate exception to the palette note in `data.js`. Four pastel
  mesh gradients, cycled by `data-tone`: a base colour (`--t1`) plus a
  stack of radial pools (`--grad`), as a plain `background-image` on the
  card.
- ⚠ **Never put `filter: blur()` on a layer inside a rounded card.**
  WebKit does not reliably clip a *filtered* descendant to its parent's
  `border-radius` — a filtered child gets its own rendering surface and
  the parent's radius stops applying to it. Two attempts failed on
  Safari: over-sized (`inset: -7%`) escaped as a whole square over the
  rounded card, and card-sized with `border-radius: inherit` still left
  square edges showing at the corners. It cannot be patched from the
  outside. The softness now comes from the radial stops themselves,
  which is visually indistinguishable and clipped correctly everywhere.
  `.disc::before` carries `border-radius: inherit` for the related
  transform case.
- **The type on them is the page's near-black, not white**, and that is
  load-bearing. White 300-weight text on a pastel mesh measures about
  1.5:1 — it stops being text and becomes texture. Dark type on the same
  gradients measures 4.5–15:1. Verified by rasterising the cards and
  sampling every pixel under the text: worst case **4.52:1**, on the
  Rosewood base. **If you change a gradient, re-measure** — the check is
  a screenshot of the text band with the text hidden, then a contrast
  sweep against `#0A0A0B`.

> ⚠ **The quotes in `TESTIMONIALS` are placeholder copy — none of them
> came from a real client.** They must be replaced with real words
> before the site is public. Publishing invented reviews as genuine is
> deceptive advertising (Competition Act in BC; FTC endorsement rules
> for US traffic), not a style choice. Delete any you have no source for
> rather than shipping them — the rail handles any count, and two real
> quotes beat four invented ones.

### The headline face: Fraunces 300

**Every large statement headline on the site is Fraunces 300**, with
**one word** per headline taken to the italic via `.serif`. The face is
`var(--font-accent)`, self-hosted through `@fontsource/fraunces` —
**300 roman and 300 italic, nothing else** — imported in
[src/main.jsx](src/main.jsx).

The list of headline selectors lives in one place, the `HEADLINE FACE`
block next to `.mono` in [src/data.js](src/data.js): `.display`,
`.mast-roles`, `.chead-title`, `.end h2`, `.statement p`. Add a new
headline there rather than setting `font-family` on it — that list is
what stops one heading being left behind on the sans.

- **One word in the italic. One, literally** — never a phrase. The
  italic exists to catch the eye on the word the headline turns on, and
  an italic phrase ("as one", "handed over", "by them") reads as a
  second voice speaking half the line instead. Pick the word the
  sentence would lose most by dropping, and prefer the opening verb:
  *Prototyped*, not mocked up. · *Shot*, selected and graded as one. ·
  *Read* what people say. A headline with every word in `.serif` has no
  emphasis at all.
- `CenterHead`'s `small` prop steps a headline down one size, for a
  section where the block underneath is the loud part — the
  testimonials, where the quotes are what the visitor came to read.
- Tracking and leading were retuned for the serif (roughly -0.01em and
  +0.1 line-height against the old Inter values). A serif at Inter 300's
  -0.04em and 0.95 line-height collides with itself.
- Body copy, nav, card titles and every `.mono` label stay on Inter /
  IBM Plex Mono, untouched. The other pages' own heading classes
  (`.dz-hero-copy h1`, `.about-hero h1`, `.band h2`, `.detail-head h1`)
  are still on Inter — extend the list above if they should follow.

### The four faces, and what each one is for

The whole site is one display face and two text faces used at four
weights. If a new element doesn't fit one of these rungs, it is probably
the wrong element, not a missing style.

| Rung | Face | Where |
| --- | --- | --- |
| Headline | Fraunces 300 (+ italic on one word) | `.chead-title`, `.display`, `.statement p`, `.mast-roles` |
| Lead | Inter 400, `--ink` | `.chead-lead` — the one sentence under a headline |
| Body | Inter 300, `--dim` | `.chead-sub`, `.standfirst`, card copy |
| Control | IBM Plex Mono **500**, uppercase, `.16em` | `.extlink` buttons and `.nav` |

The mono **500** on buttons and nav is not a contradiction of the
HEADINGS LEAD rule above. That rule forbids a weight bump on mono used
as a *section heading*, where 11px letterforms thicken into shouting; on
a bordered pill or a nav link the face is a control, and 400 let it sink
into the bar. Captions and badges (`.pill`, `.tool-badge`, `.projshot
.open`, meta rows) stay at 400.

## Photos come from Contentful (build-time sync)

Real Work/Gallery/Portrait photos are pulled from **Contentful** at **build
time** by [scripts/sync-contentful.mjs](scripts/sync-contentful.mjs) — runs
automatically before `npm run build` (the `prebuild` script) and on demand
via `npm run sync`. The script optimizes images to WebP under
`public/photos/` and writes `src/photos.manifest.json`, which `src/data.js`
reads. The live site is 100% static; nothing hits Contentful at runtime.

**No stock/placeholder fallback.** `FRAMES`, `PHOTO_PROJECTS`, `FEATURED`,
`PHOTO_POOL`, `COLLAGE` and `ABOUT.portrait` are only ever the real synced
manifest data — an empty or missing collection means an empty list, not a
`picsum.photos` stand-in or hard-coded sample project. `img()`/`srcSet()`
return `undefined` for an unsynced seed rather than a placeholder URL.
Every page that reads these already gates on emptiness (hero slideshows,
the frames carousel, the project stack, the home photography section, and
the About portrait all render nothing rather than a gap or broken image
when the corresponding photos are removed from Contentful) — keep that
pattern for any new section that reads photo data.

The `collection` field also drives **photography projects**: any value
other than `work`/`gallery`/`portrait` (e.g. `wildlife`, `traditional`,
`modern`) is treated as its own project collection. The sync groups those
photos under `public/photos/projects/<slug>/`, lists them in the manifest's
`projectPhotos`, and builds one entry per collection in `photoProjects`.
`data.js` exposes them as `PHOTO_PROJECTS`, which drives the home
photography cards, the `/photography` stack + hero, and each
`/photography/:slug` gallery view (grid + roll + lightbox of that
collection). `order` controls both the collection sort and the photo sort
within it.

- **Every collection wants at least one landscape photo.** The wide
  frames (home hero, the `/photography` hero slideshow, the collection
  cards) all pick a collection's first landscape frame via
  `projectCover` / `isLandscape` — a portrait in a ~2.4:1 banner only
  shows about a third of itself. A collection uploaded as all-portrait
  falls back to its opening frame and gets cropped; nothing in the code
  can fix that, only a wide photo in the set can.
- **Content type:** `Photo` — fields `title`, `collection` (`work` |
  `gallery` | `portrait` | any project-collection name, e.g. `wildlife`),
  `order` (int, controls sort), `image` (media, one file).
  `location`/`year`/`role` were dropped from the model, so those detail
  rows render blank for now (the pages hide empty rows) — add the fields
  back later if wanted. The EXIF technical line (`35mm · f/8 · 1/500`) is
  still read automatically from the uploaded file, same as before.
- **Auth:** Content Delivery API only (read-only, published entries) —
  `CONTENTFUL_SPACE_ID` + `CONTENTFUL_ACCESS_TOKEN` (+ optional
  `CONTENTFUL_ENVIRONMENT`, default `master`). No Google API involved.
- **Config** lives in `.env` (git-ignored); `.env.example` is the committed
  template. On Vercel, the same vars go in Project Settings → Environment
  Variables; the existing **Deploy Hook** URL still triggers a rebuild after
  changing photos. Wire a **Contentful webhook → that Deploy Hook** to make
  publishing (new photos *and* new collections) auto-deploy — full steps in
  [PRODUCTION.md](PRODUCTION.md) → "Auto-publishing".
- **Google Drive is used for one thing only: client photo delivery,**
  not portfolio content. `/admin` + `/client` + the `api/` serverless
  functions exist and are **client-delivery only** — see
  [CLIENT-DELIVERY-POA.md](CLIENT-DELIVERY-POA.md) and `README.md` →
  "The admin panel". Work/Gallery/Portrait/project photos are never
  touched by `/admin`; they come exclusively from Contentful, above.
  `scripts/sync-drive.mjs` (which used to pull *portfolio* photos from
  Drive) is gone — `googleapis`/`archiver`/`nodemailer` remain in deps
  only for the delivery feature.

## Production readiness & scaling

See [PRODUCTION.md](PRODUCTION.md) for the high-traffic/scalability notes
(responsive images, three.js bundle, removing picsum/Google-Fonts runtime deps,
cache headers, Vercel plan) and the pre-launch gap list (content, SEO, contact
form, 404, analytics, deploy hook).

## Design projects (Figma prototypes)

`WEB_PROJECTS` in [src/data.js](src/data.js) holds the four design projects
(TrackHer, WingWise, MOMents, ArtAsta). Each has `embed: true` + a Figma
prototype `href`. The grid/home cards render a **live Figma preview** inside
the card (an iframe, `pointer-events: none`, so the card stays a link), and
the detail page (`/design/:slug`) embeds the **interactive** prototype via
`figmaEmbed(href)` — see `.figbox` / `.figma-embed` CSS. No screenshots are
stored; `intro`/`note`/`role`/`year` are placeholder copy awaiting the real
brief. The prototypes must be link-shared "Anyone with the link → view" for
the embeds to render.

## Commands

```bash
npm run dev      # local dev server (HMR) — reuses the synced photos, no network
npm run sync     # pull + optimize Contentful photos → manifest
npm run build    # prebuild sync, then vite build → dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```

`predev` runs the sync with `--cached`, which returns immediately when
the manifest already has photos in it — starting the dev server used to
wait several minutes on Contentful and sharp for a set of images that
were already on disk. **After publishing new photos, run `npm run sync`
by hand**; `npm run build` (and therefore every deploy) always does a
full pull, so nothing can ship stale.
