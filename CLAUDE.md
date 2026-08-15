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
  [src/data.js](src/data.js). **It is empty today**: every section on
  the site leads with a Fraunces headline, so no mono label *is* a
  heading any more. The rule stands for anything added later.
- A **page hero's** mono kicker (`.about-kicker`, `.dz-kicker`) stays
  dim — there the `h1` is what leads. Section headers no longer have a
  mono kicker at all; theirs is `.chead-kicker`, the display face's
  italic, and it is full ink because it *is* the first line of the
  heading rather than a label on top of one.
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

## The whole site is one centred section shape

Every major block on **every page** — Design, Photography, "What you get",
Kind words and Contact on the home page; the process grids, "More work",
"The collections", "How I work" and "The short version" on the inner
pages — is built from the same header and the same kind of grid. The CSS lives in the **CENTRED SECTION SYSTEM** block in
[src/data.js](src/data.js); the header is `CenterHead` in
[src/ui.jsx](src/ui.jsx). Don't lay a new section out by hand.

- **The header is a five-rung ladder, and a section takes only the rungs
  it has something to put in.** In order: `kicker` (the section's own
  word, **Fraunces italic**, `.chead-kicker`) → `title`
  (`h2.chead-title`, Fraunces roman) → `lead` (Inter **400**,
  `var(--ink)`, one sentence) → `sub` (Inter **300**, `var(--dim)`, the
  longer explanation) → `cta`. Everything except `title` is optional and
  renders nothing when omitted. On the home page today: Design and
  Photography take `kicker` + `title` + `sub`, "What you get" takes
  `sub` only, and Kind words is a headline with **nothing** under it —
  that is the shape, not an omission to fix.
- **A header carries exactly one italic, and the kicker takes it when
  there is one.** Design puts its word in the kicker, so its headline is
  plain Fraunces roman with no `.serif` span inside. Headers with no
  kicker keep the italic on one word of the headline instead ("Finished
  work, *handed over*."). Never both.
- **The italic lockup is two numbers, and both are fractions of the
  italic** — `--italic-ratio: 0.52` (the roman's size) and
  `--italic-gap: 0.28` (the space between them), on `.pf`. A lockup is
  built from **one** size, `--kicker-fs` on `.chead`, and the roman and
  the gap come off it; a section that wants a bigger lockup sets that
  one value. Fixing the roman size and the gap in pixels is what made
  Design and Photography look unrelated — the same pair of lines at two
  different proportions.
  - **Design and Photography are the same size, not merely the same
    proportion.** `.chead`'s `--kicker-fs` is `clamp(56px, 9vw, 130px)`,
    which is deliberately the same expression `paint()` in Home.jsx ends
    on — `max(56, min(130, vw * 0.09))`. The two practices carry equal
    weight on the page and introduce themselves at equal volume; sized
    apart, Design read as the smaller of the two. **If the collage's
    final word size changes, change this clamp with it.** Verified equal
    at 1900/1440/1280/820/390.
  - `.lov-copy` is positioned off the **word**, not the floor of the
    stage. Anchored to the bottom of the viewport it left ~180px between
    italic and roman against Design's ~18px. The `0.565` in its `top`
    is how far "Photography" 's ink falls below its own centre — it was
    **measured**, by scanning the rendered pixels for the last lit row
    of the italic and the first of the roman and tuning until the
    optical gap matched Design's. At a shared 130px italic they land
    **45px and 43px**. Re-measure if the word or the face changes;
    changing its *case* does not matter, since the gap is set by the
    descenders (g, p, y) and those are the same either way.
  - **Both kickers are capitalised.** `.lov-cut` carried
    `text-transform: lowercase` from when it was the lensofviraj
    wordmark — right for a brand mark, wrong now that the word is a
    practice's name standing opposite "Design". Removed.
  - Titles with **no** kicker keep the full 66px — there the headline is
    the only thing in the lockup.
- `lead` and `sub` are the **same size** on purpose. They separate by
  weight and colour only; adding a size step would be a third variable
  doing a job two already do, and stacking those steps per section is
  what made the page look like six different type scales.
- The spacing between the header and what it heads is `.chead`'s own
  `margin-bottom`, *not* `.chead + *`: headers sit inside wrappers, so
  an adjacent-sibling rule matches the wrapper rather than the grid.
- **`CenterHead` reveals itself — don't wrap it in a `<Reveal>`.** A
  Reveal fades the whole block as one object, which is the wrong motion
  for a lockup: the kicker, headline and description are read in that
  order and should arrive in it. The display tier rises out of a mask
  (`.chead-line`, `yPercent: 135`), the copy under it fades in 0.22s
  later, all on one timeline off one ScrollTrigger.
  - `.chead-line`'s `padding-bottom: .24em` / `margin-bottom: -.24em`
    pair is load-bearing: `overflow` clips at the **padding** edge, so
    the padding is what keeps the descenders of an italic "Photography"
    from being shaved off at rest, and the negative margin takes the
    space back out of the layout. `.chead-kicker` re-states the
    subtraction in its own `margin-bottom` because its declaration wins
    over `.chead-line`'s — without that the header's gap opens by a
    quarter of the italic.
  - **`still`** opts a header out entirely, for one whose visibility is
    already driven by something else — the photography lockup is faded
    in by the collage run's `--copy-o`, and a second animation fighting
    it flickers.
- `Reveal` takes `sel` + `stagger` to animate matching descendants in
  sequence rather than the block as a whole — used on the tagline, whose
  `.st-line` spans are already the shape the motion should follow.
- **Work grids go wide; copy stays at the reading measure.** The design
  and photography card grids sit in `.wrap.wrap-wide` (1340px) while
  their headers stay in the plain 1180px `.wrap` — three cards in the
  reading column came out at 356px, which is a thumbnail rather than a
  look at the work. The testimonial rail takes the wide column too. The
  "What you get" cards are the one grid that keeps the narrow measure:
  they are copy, and 548px is already a generous line for them.
- **There is no *mono* eyebrow, and one must not be added back.**
  `CenterHead` has no `label` prop on purpose: an 11px mono caption
  above the headline restated the heading below it in a second
  typeface, which is the filler the copy rule above forbids. The
  `kicker` is a different thing — the display face carrying the first
  line of a lockup, at headline scale, and the headline pays for it by
  giving up its own italic.
- **The photography section has no header of its own — the collage is
  its header.** The `.lov` run is two acts inside one sticky frame:
  the zoom that turns five photographs into the word "photography"
  (`ZOOM_END` of the scroll), then a hold where that word stays on
  screen, lifts ~17% of the stage height, and the sentence fades up
  underneath it in `.lov-copy`. The section is **three** screens tall,
  not two — the third pays for reading the sentence. `.gwork` then opens
  straight onto the collections.
  - **`.lov-copy` has no kicker** with motion on: the collage's own word
    is the kicker, and printing it again would be two "Photography"s on
    one screen. Under **reduced motion** the zoom never runs and the word
    is never cut out, so Home.jsx puts the kicker back and the CSS drops
    `.lov-copy` out of its absolute layer into ordinary flow — left as an
    overlay it would sit at `opacity: 0` forever, since the driver that
    writes `--copy-o` never runs.
  - The lift is a transform on the **whole `<svg>`**, not on the text
    nodes: the mask's copy of the word and the flat-ink copy have to stay
    in registration, and a mask that has drifted a pixel shows as a seam.
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
  it and came to rest as a line ruled directly under the word the
  collage resolves into. Don't put either one back. **The only lit thing on the site is
  the hero.** A full-width glow band between sections was tried and
  removed — repeating the hero's glow down the page spends the effect.
  Don't reintroduce one.
- **The collage resolves into "photography", not the brand.**
  `COLLAGE_WORD` in [src/pages/Home.jsx](src/pages/Home.jsx), rendered
  lowercase by `.lov-cut`. It used to be `P.photoBrand`; the canvas is
  the doorway into the photography work and the `.cbeat` under it opens
  on the same word, so the run hands the visitor a subject rather than a
  second brand name to learn. Lensofviraj still names the practice on
  `/photography` and in the bar.
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
- **The type on them is near-black, not white**, and that is
  load-bearing. White 300-weight text on a pastel mesh measures about
  1.5:1 — it stops being text and becomes texture. Dark type on the same
  gradients measures 4.5–15:1. Verified by rasterising the cards and
  sampling every pixel under the text: worst case **4.52:1**, on the
  Rosewood base. **If you change a gradient, re-measure** — the check is
  a screenshot of the text band with the text hidden, then a contrast
  sweep against `#0A0A0B`.
  - ⚠ **That colour is a literal, not `var(--bg)`, and must stay one.**
    It used to be the token, which tied a measured contrast result to
    the page colour: when the background moved to `#1C1C1C` the quotes
    followed it and the Rosewood card fell under AA, for a change that
    had nothing to do with these cards.

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

- **One italic per header, and never a phrase.** Where a header has a
  `kicker` that word is the italic and the headline stays roman
  throughout (Design, Photography). Where it doesn't, one word of the
  headline takes it. The italic exists to catch the eye on the word the
  line turns on, and an italic phrase ("as one", "handed over", "by
  them") reads as a second voice speaking half the line instead. Pick
  the word the sentence would lose most by dropping, and prefer the
  opening verb:
  *Prototyped*, not mocked up. · *Shot*, selected and graded as one. ·
  *Read* what people say. A headline with every word in `.serif` has no
  emphasis at all.
- `CenterHead`'s `small` prop steps a headline down one size, for a
  section where the block underneath is the loud part — the
  testimonials, where the quotes are what the visitor came to read.
- Tracking and leading were retuned for the serif (roughly -0.01em and
  +0.1 line-height against the old Inter values). A serif at Inter 300's
  -0.04em and 0.95 line-height collides with itself.
- Body copy, nav and every `.mono` label stay on Inter / IBM Plex Mono,
  untouched. **Card and row titles stay on Inter too** — `.dz-card-line
  h3`, `.projcap h3`, `.tl-row b`, `.get-card h3` and the testimonial
  cards are items *under* a headline, and putting the display face on
  them flattens the very order the HEADINGS LEAD rule exists to keep.

### Numbered steps are a Timeline, not cards

Every numbered k/v list that is genuinely a **sequence** — the home
page's "What you get" and both "How a … goes" process sections —
renders `Timeline` from [src/ui.jsx](src/ui.jsx). Four boxes say "four
separate things"; these are one sequence, and a rail you travel down
says so. **No box, no border, no panel** — the type is the whole design,
which is also what keeps the copy legible at this measure.

- ⚠ **/about's "How I work" is the exception, and it was tried the other
  way.** It renders the original `.approach` — a welded row of panels —
  because its three entries are standing positions, not steps you pass
  through in order: a rail that lights one at a time said "then" where
  the copy means "and". Reverted at the client's request. Before moving
  any list onto the Timeline, check it actually has an order.

- **One step is lit at a time**: the last one whose top the middle of the
  screen has passed. The rest sit at `opacity: .34` and `scale(.94)`,
  shrinking *toward* the rail (`transform-origin` follows the side) so
  they fall back rather than drift away.
- Odd steps sit right of the rail and read left-to-right; even ones sit
  left and are set ragged-left, so both columns hug the line.
- **One rAF-throttled scroll handler** drives both the rail fill
  (`--prog`) and which step is lit. An IntersectionObserver per step is
  the obvious alternative and is worse: the band that decides "current"
  is a line, not a box, so it needs a `-50%/-50%` rootMargin and still
  goes quiet whenever that line sits in the gap between two steps.
- Below 760px the rail moves to the left edge and every step hangs off
  the same side — alternating in a 350px column gives each one about
  150px to say its piece in.
- Reduced motion sets `data-still`: every step lit, rail drawn full,
  nothing scaled. The list still reads in order, it just doesn't animate.

**`clearProps` on every `Reveal` tween is not optional.** GSAP leaves
its inline `transform: translate(0px, 0px)` behind when a tween
finishes, and an inline declaration beats every rule in the stylesheet —
so any `:hover` transform on something that is also a `Reveal` silently
never fires. Verified by asserting no visible `.rv` carries an inline
transform, on every route.

### One card, one header, site-wide

Applying the system to the inner pages deleted four one-off components
rather than restyling them — if a new block doesn't fit `CenterHead` +
`.cgrid` + `.get-card`, that is a signal, not a missing style:

| Gone | Was | Now |
| --- | --- | --- |
| `SectionHead` / `.shead` | mono label + self-drawing rule | `CenterHead` |
| `.sec-grid` / `.sec-label` | sticky mono label beside content | `CenterHead` over a `.cgrid` |
| `.sl-row` | numbered process list, ×2 pages | `Timeline` |
| `.get-card` / `.get-num` | numbered card grid | `Timeline` |
| `.pbrand` / `.band-lead` | hand-built lockup on /photography | `CenterHead` with a `kicker` |

`.band p` had to go with the last of those: at (0,1,1) it beat
`.chead-sub` at (0,1,0) and would have stripped the centred paragraph's
auto margins, leaving it centred as text but parked left as a block. **One
`.band p` survived in the 560px block and was the same bug** — a
`font-size: 15px` beating `.chead-kicker`, so on every phone "Lensofviraj"
was set at body size and the header's three tiers had no ladder between
them at all. `.band`'s only paragraphs are `CenterHead`'s own tiers; never
size them from outside the header system.

**/photography's band is the one lockup a step below `--kicker-fs`**
(`clamp(56px, 6.6vw, 92px)` on `.band .chead`), because it is the one
whose `title` is a full sentence rather than a short line. At the standard
130px the italic came out twice the size of its own headline and the
sentence broke to three lines of 67px — a slab of Fraunces in which
nothing led. The **floor stays 56px**, so from ~850px down it is exactly
the lockup Design wears (56/29) and the mobile proportion is the desktop
proportion. `--italic-ratio` is untouched — that number is what makes
every lockup on the site read as the same lockup.

**The timeline on /about keeps its left-aligned dot rail on purpose** — a
chronology reads down a spine, and centring it would cost the thing that
makes it legible. A centred header over left-aligned rows is fine.

### One footer, every page

The contact block at the bottom is `Colophon` in [src/ui.jsx](src/ui.jsx) —
a `<dl class="colophon">` of email / based in / elsewhere, a hairline, then
`.colophon-foot` with the copyright and (with `back`) a link home. Home
renders `<Colophon />`; About, Design and Photography render
`<Colophon back />`.

- **It was only on the home page and About**, so `/design` and
  `/photography` ended on a cross-link teaser with no way to reach Viraj
  from the bottom of the page — the two pages a visitor is most likely to
  land on from a portfolio link.
- The detail pages (`/design/:slug`, `/photography/:slug`) deliberately
  **don't** take it: they already end in a back-link to their index, and a
  full footer under a single project is a second ending.
- It goes **inside the existing `.end` section**, after the headline and
  CTA — not in a section of its own, which would add another hairline
  rule for nothing.
- **The way back is a control, not a caption.** It shared `.mono` with the
  © line next to it — same face, same 11px, same uppercase, same tracking
  — so the only thing separating the one pressable item in that row from a
  legal notice was `--ink` against `--dim`, it had no hover colour at all
  (`.back:hover` is defined only under `.client-foot`), and it was a
  **118×14px** target. It now takes the mono **control** rung: the 500
  weight and the pill, `min-height: 44px`, scoped to `.colophon-foot`.
  - **Bordered-neutral, not filled.** Every page rendering `<Colophon
    back />` has an accent-filled `.extlink` ("Contact me", "Book a
    session") a few hundred pixels above this row, and that is the
    section's one primary action. A second filled pill would argue with
    it; same shape at lower volume is what a secondary control is.
    `.pill` and `.client-alt` already pair that rest state with
    accent-on-hover.
  - ⚠ **The border is `--dim`, never `--rule`.** `--rule` is 1.19:1
    against the background — the admin block says so itself, and it is
    why `/admin` had to define `--a-edge`. A `--rule` hairline makes a
    control that only exists on hover. `--dim` measures **5.22:1**, past
    the 3:1 WCAG 1.4.11 asks for a component boundary, and it is the grey
    already beside it in the © line. Link text lands at 16.75:1 and now
    separates from the © by 3.22:1.
  - `margin-bottom: 0` is a **fix**: `.back`'s 40px is the gap down to
    the headline on `/design/:slug` and `/photography/:slug`, where the
    link sits at the *top* of a page. Inherited into this flex row it
    floated the link ~26px above the copyright it should sit level with.
    The detail pages keep theirs — check both if you touch `.back`.
  - Below 560px the row is `column-reverse` and the pill takes the full
    column, as `.client-alt` does: 167px of © plus a 164px pill and their
    gap is 347 of the 350px available at 390px, so side by side it sat
    hard against the page edge and wrapped one notch narrower anyway.
    `align-items: stretch` is what lets both centre — `.end` is
    `text-align: center` at every width.

### The loader

[src/Loader.jsx](src/Loader.jsx), mounted once in
[src/App.jsx](src/App.jsx) inside `.pf` so it inherits the palette. It
exists for one reason: the home page opens on a timed sequence and hands
straight over to the collage zoom, and both look broken if they start
before their assets land — the hero types in a fallback face and reflows
when Fraunces arrives, and the collage zooms over frames that pop in
mid-run.

- **It waits for exactly two things**: `document.fonts.ready`, and the
  collage frames **decoded** (not merely fetched — `decode()` is the
  difference between "the bytes arrived" and "this can be painted without
  stalling a frame", which is the whole point when a scroll-linked zoom is
  next). Four frames on a narrow screen, five otherwise, matching what
  `Home.jsx` actually paints. Nothing here blocks anything; it only delays
  the reveal.
- **Three rules it obeys, and they are the interesting part**: capped at
  `CAP_MS` (a preloader waiting on a slow network is a blank page, which
  is worse than the reflow it prevents); once per session via
  `sessionStorage` (a refresh to check a change must not cost the wait
  again); and it doesn't render at all under reduced motion, since it
  exists to protect an animation that isn't playing.
- **The percentage is the higher of work-done and a time floor.** There is
  no honest byte count — fonts report nothing and `decode()` is
  all-or-nothing per image — so a "real" number would be a lie told
  precisely. The floor creeps to 88% across the cap so the rail never sits
  dead still on a fast connection; the work term is what lets it finish
  early.
- ⚠ **The counter steps coarsely on a `setInterval` and CSS carries the
  bar between steps. Don't "improve" it into a rAF-eased counter — that
  is what it was, and it barely moved.** The loader is on screen precisely
  while the main thread is saturated parsing modules and decoding five
  2000px photographs, so the frame callback fired about three times a
  second and the bar crawled from 0 to 0.088 and then jumped to gone.
  Stepping the target every 160ms and letting a `transform` transition on
  `.loadr-rail i` do the motion puts the animation on the compositor,
  which is the one place it can't be starved. Verified: `0 → 32 → 64 → 80
  → 100`, hold, exit, node gone at ~4.9s.
- `leaving` and `gone` are separate state on purpose — the node has to
  stay in the tree long enough to play its own exit transition.

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
