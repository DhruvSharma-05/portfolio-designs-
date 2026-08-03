# Changes

A running log of edits made to the site, newest session at the top. Each
point says *what* changed, *where*, and *why*, so a change can be found
again (or undone) without digging through the diff.

---

## 2026-08-03

### 1. Home intro — "lensofviraj" lowercased

- The standfirst under the hero read "Photographs made as **Lensofviraj**";
  the brand now renders lowercase: "Photographs made as **lensofviraj**".
- [src/pages/Home.jsx](src/pages/Home.jsx) — the `<strong>` was printing
  `{P.photoBrand}`; replaced with the literal `lensofviraj` so only this
  sentence changed.
- Everywhere else still shows the capitalised "Lensofviraj" — the
  `01 · PHOTOGRAPHY` card below it, the nav wordmark on `/photography`, the
  About caption, and the SEO/schema copy. Flip
  [src/data.js](src/data.js) → `photoBrand` if the brand should be lowercase
  site-wide.

### 2. Home photography cards — removed the duplicate collection label

- Each card printed the collection title *and* its `kind` label, and for
  Contentful-synced collections the sync derives `kind` from the same
  collection name — so cards read "Traditional / Traditional",
  "Wildlife / Wildlife", "Modern / Modern".
- [src/pages/Home.jsx](src/pages/Home.jsx) — dropped the
  `<span className="mono">{p.kind}</span>` from `.projcap` in
  `PhotoProjects`; the card now shows just the title under the image.
- [src/data.js](src/data.js) — removed the now-dead `.projcap .mono` CSS
  rule and its comment.
- `kind` is still used by the hero frames, so the data itself was left alone.

### 3. `/photography` hero — removed the top label row

- The two mono labels pinned to the top of the hero image
  ("LENSOFVIRAJ · THE PHOTOGRAPHY PRACTICE" on the left,
  "VANCOUVER · BOOKING 2026" on the right) are gone.
- [src/pages/Photography.jsx](src/pages/Photography.jsx) — deleted the whole
  `.phero-top` block (those two spans were its only contents).
- [src/data.js](src/data.js) — removed the unused `.phero-top` CSS.
- Layout is unaffected: `.phero-in` already bottom-aligns with
  `justify-content: flex-end`, so the title, meta row and slide rail stay
  put and the top of the frame is now clean image.

### 4. Home hero — removed the "SCROLL ↓" cue

- The scroll button in the bottom-right corner of the masthead is gone.
- [src/HeroFrames.jsx](src/HeroFrames.jsx) — deleted the button and the
  `onScrollDown` prop it was the only consumer of; updated the file's header
  comment, which described the cue as the hero's one interactive element.
- [src/pages/Home.jsx](src/pages/Home.jsx) — dropped the
  `onScrollDown={() => go("/#intro")}` handler and the now-unused `go` from
  `useApp()`.
- [src/data.js](src/data.js) — removed the dead `.mast-scroll` /
  `.mast-arrow` rules, the `scrollNudge` keyframes and the 640px override.
- Trade-off: the hero is now entirely non-interactive, with no explicit cue
  to keep scrolling. A middle ground, if it ever reads too static, is
  restoring the animated `↓` on its own without the "Scroll" word.

### 5. "Vancouver" thinned out across the site

The city was repeated in a dozen visible places and read as filler. It now
appears only where it carries information — the footer, and the About page.

Removed:

- [src/pages/Home.jsx](src/pages/Home.jsx) — hero kicker above the headline,
  now just "Viraj Mehta" instead of "Viraj Mehta · Vancouver".
- [src/pages/Home.jsx](src/pages/Home.jsx) — the role line under the two
  practice cards, now "Photographer & Designer · Booking 2026".
- [src/pages/Home.jsx](src/pages/Home.jsx) — the "Prefer email?" line in the
  contact section, now email + phone only (the footer two rows below already
  states the city).
- [src/pages/Design.jsx](src/pages/Design.jsx) — the hero kicker, now just
  "Design & Build".
- [src/pages/About.jsx](src/pages/About.jsx) — the portrait caption, now just
  "Lensofviraj"; the page states the location twice more below it.

Kept deliberately:

- Home footer — "Vancouver, BC · Booking 2026".
- About — the "Based in" colophon entry, the "Location" kit row
  (Richmond · Vancouver · Lower Mainland), and the two mentions inside the
  bio prose and the 2026 timeline row.
- All SEO copy — page meta descriptions in the `useSeo(...)` calls and the
  `LocalBusiness` schema in [index.html](index.html). These are invisible on
  the page and are what makes the site findable for local searches, so they
  should stay.

### 6. "Booking 2026" / the hardcoded year removed everywhere

No "2026" is left anywhere in `src/`, `index.html` or `public/` (only the
sync script's `generatedAt` timestamp in `photos.manifest.json`, which is
machine-written).

- [src/pages/Home.jsx](src/pages/Home.jsx) — the role line under the practice
  cards is now just "Photographer & Designer".
- [src/pages/Home.jsx](src/pages/Home.jsx) — the footer's right-hand line is
  now just "Vancouver, BC".
- [src/pages/Home.jsx](src/pages/Home.jsx) — dropped "Booking 2026." from the
  home page's SEO description.
- [index.html](index.html) — dropped it from all three meta descriptions
  (`description`, `og:description`, `twitter:description`).
- [public/og.svg](public/og.svg) — the social share card's bottom line is now
  just "CRAFTEDANDCAPTURED.COM".
- [src/pages/Home.jsx](src/pages/Home.jsx) — the footer copyright was
  hardcoded `© 2026`; it now reads `© {new Date().getFullYear()}` so it
  stays correct on its own instead of going stale. The line still shows a
  year — delete the `©` span if it should go entirely.
- [src/data.js](src/data.js) — the About timeline's last row was labelled
  "2026"; it now reads "Today" so the 2014 → 2018 → 2019 → Today sequence
  still makes sense without a date that ages.

Note: `og.png` (the actual image social platforms fetch — `og.svg` is the
source) was not regenerated, so the old "BOOKING 2026" card will keep showing
in link previews until a new PNG is exported from the updated SVG.

### 7. Filler text stripped from the home intro + a standing no-filler rule

- [src/pages/Home.jsx](src/pages/Home.jsx) — deleted the "Photographer &
  Designer" line under the two practice cards (this is where "Booking 2026"
  used to sit); the `.role` block is gone entirely, along with its CSS in
  [src/data.js](src/data.js) and the now-unused `P.role` field.
- [src/pages/Home.jsx](src/pages/Home.jsx) — the practice cards lost their
  `01 · PHOTOGRAPHY` / `02 · WEB DESIGN & BUILD` kickers, which just
  restated the title underneath them.
- [src/data.js](src/data.js) — `INTRO.does` is now two entries of
  `{ t, to }`. The cards read **"Photography"** and **"Mobile App & Web
  Design"** (was "Lensofviraj" / "Design & Build"). Dropped the `k` and `v`
  fields — `v` was never rendered anywhere — and the unused `P.designBrand`.
- Each card now holds its name plus `Enter →`, which is the only thing on it
  you can act on. Say so if the arrow should go too.
- [CLAUDE.md](CLAUDE.md) — added a **"Copy rule: no filler text"** section at
  the top so this holds for all future work: no decorative kickers, no
  repeated labels, no status/city/year stamps as atmosphere; state a fact
  once, in the one place it's useful.

### 8. Hierarchy fixed — headings lead, items sit back

The `.mono` label style is `var(--dim)`, and that default had been applied
to *section headings* too, so "PHOTOGRAPHY" read quieter than the
"Traditional / Wildlife / Modern" cards under it. Same everywhere the
pattern was used.

- [src/data.js](src/data.js) — added a shared **"HEADINGS LEAD"** block next
  to `.mono`. Section labels that *are* the heading —
  `.gwork-head > .mono:first-child` (home Photography), `.sec-label` (home
  Design), `.shead-label` (the numbered section heads on About / Design) —
  now take `var(--ink)`. **Colour only, no weight bump** — the first pass
  also set `font-weight: 600` and it read as shouting; the mono face
  thickens badly at 11px. Brightness alone puts the label ahead of the
  cards, and the label now matches the weight of the "All collections"
  link beside it.
- [src/data.js](src/data.js) — `.shead-label` lost its own `color: var(--dim)`
  so the shared block wins instead of being overridden further down the file.
- [src/data.js](src/data.js) — item titles now sit one step back from their
  section label: `.projcap h3`, `.wcard-cap h3` and `.dz-card-line h3` render
  at `color-mix(in srgb, var(--ink) 72%, transparent)`. Hover still lifts them
  to the accent, unchanged.
- Deliberately **not** brightened: `.about-kicker` and `.dz-kicker`. Those sit
  above a real `<h1>`, so the headline is what leads there — brightening the
  kicker would have recreated the same problem in reverse.
- [CLAUDE.md](CLAUDE.md) — added a **"Type rule: headings lead"** section, so
  this is checked on every new block: heading brightest, then its items, then
  meta. If something below the heading pops harder, the heading gets fixed —
  the content doesn't get dimmed further.

### 9. Nav "Contact me" CTA now uses the nav's font

The CTA already carried the `.mono` class, but the global button reset
`.pf button { font: inherit; … }` out-specifies `.mono` (0,1,1 vs 0,1,0), so
the shorthand reset the family *and* size back to the body's Inter. It was
the only item in the bar not in IBM Plex Mono.

- [src/data.js](src/data.js) — added `.pf button.mono { font-family: 'IBM
  Plex Mono', monospace; font-size: 11px; }` directly after the reset, so any
  `.mono` button keeps the mono face rather than fixing this one button.
  Letter-spacing and uppercase were never lost — the `font` shorthand doesn't
  touch them — so the CTA now matches the nav links exactly.
- [src/data.js](src/data.js) — the ≤720px rule that shrinks nav links to
  10.5px now covers the CTA too, so they stay matched on mobile.

### 10. Contact address → craftedandcaptured@gmail.com

`virajmehta@outlook.in` is gone from the whole project; the personal Gmail
went with it. The studio address is now the only contact address anywhere.

- [src/data.js](src/data.js) — `P.email` is now
  `craftedandcaptured@gmail.com`, and the unused `P.email2`
  (`virajmehta227@gmail.com`, the personal one) was deleted outright.
- Every visible email on the site reads `P.email`, so all of them followed
  from that one change: the home footer colophon and its "Prefer email?"
  line, the About colophon, the Design and Photography page footers, the
  contact modal (`ContactModal email={P.email}`), and the leftover
  `/client` page.
- [index.html](index.html) — the `LocalBusiness` structured-data `email`
  field was the one hardcoded copy; updated to match.
- Verified with a project-wide grep: no `outlook` and no `virajmehta227`
  left in `src/`, `index.html`, `public/`, `scripts/`, the markdown docs or
  the env files.

### 23. About — portrait caption removed, bio replaced

- [src/pages/About.jsx](src/pages/About.jsx) — the `<figcaption>` overlaying
  the bottom of Viraj's portrait ("Lensofviraj") is gone, along with its CSS
  in [src/data.js](src/data.js) — an absolutely-positioned bar with a gradient
  scrim that existed only to hold that one word. The photo is now clean.
- [src/data.js](src/data.js) — `ABOUT.body` replaced with the client's own
  two paragraphs, supplied verbatim. It was three paragraphs of placeholder-ish
  copy; it is now two, so the page renders exactly what was given.
- Knock-on: the bio no longer mentions Vancouver or the 2014/2018 camera
  dates. The timeline section below still carries the dates, and the "Based in"
  colophon still carries the city, so nothing was actually lost from the page.
- `ABOUT.lead` (the large line beside the portrait, "I create meaningful
  visual experiences…") was **not** touched — it wasn't part of the text
  given.

### 22. About — kit rows trimmed and "What I'm hired for" removed

- [src/data.js](src/data.js) — `ABOUT.kit` lost its "Location"
  (Richmond · Vancouver · Lower Mainland) and "Available for"
  (Portraits · Events · Fashion · Graduation) rows. The row is now Camera and
  Lens only. The colophon's "Based in" further down still states the city, so
  no location information was lost from the page.
- [src/pages/About.jsx](src/pages/About.jsx) — the whole
  `SectionHead n="03"` / "What I'm hired for" section is gone: the pill cloud,
  its live crossfading caption, and the `HiredFor` component that drove them.
- Cleaned up everything it left behind rather than leaving orphans:
  - `SHOTLIST` (six service entries) deleted from
    [src/data.js](src/data.js) — nothing else read it.
  - The `.hire` / `.hire-tags` / `.hire-tag` / `.hire-desc` CSS block deleted.
  - `AnimatePresence` and `SHOTLIST` dropped from About's imports; the file's
    header comment no longer describes a section that isn't there.
- Section numbering is untouched — "01 How I work" and "02 The short version"
  keep their numbers; 03 simply no longer exists.

### 21. Empty "Year" row removed from design project pages

- [src/pages/DesignProject.jsx](src/pages/DesignProject.jsx) — the spec list
  appended a `Year` row unconditionally, outside the `w.specs` map. Every
  entry in `WEB_PROJECTS` has `year: ""`, so it drew a label and a rule with
  nothing beside it. The row is gone; the list is now just what `specs`
  contains (Type, Tool).
- Every other year on the site was already guarded on the value existing —
  this was the only unconditional one.

### 20. Design hero — count removed, CTA moved under the prototype

- [src/pages/Design.jsx](src/pages/Design.jsx) — dropped "04 selected
  projects" from the kicker, along with the now-unused `total` variable that
  computed it.
- [src/data.js](src/data.js) — `.dz-kicker` was a space-between flex built to
  hold two labels at opposite ends; with one label left it's just a
  `margin-bottom`.
- [src/pages/Design.jsx](src/pages/Design.jsx) — "Open TrackHer →" moved out
  of the left copy column to sit directly under the preview it opens.
- That required a small restructure: the media column was itself the `<a>`,
  and an anchor can't contain another anchor. The column is now a `<div>`
  holding two sibling links — `.dz-hero-shot` (the framed preview) and
  `.dz-hero-cta` — both pointing at the same project.
- [src/data.js](src/data.js) — the "featured" label's hover rule moved from
  `.dz-hero-media` to `.dz-hero-shot`, so hovering the CTA no longer lights up
  a label at the other end of the block. `.dz-hero-cta` top margin 28px → 20px
  to sit under the frame rather than float below it.

### 19. /photography hero slideshow no longer crops portraits

The banner is `min(88vh, 900px)` tall at full width — about **2.41:1** on a
1900×900 desktop — and inherits the site-wide `object-fit: cover`. Traditional
and Modern open on a portrait photo, so roughly **30% of it** was visible.
Phones were fine because the viewport is narrow and the box is nearly portrait
itself, which is why it only looked wrong on a PC.

- [src/data.js](src/data.js) — `FEATURED` now takes `projectCover(p)` instead
  of `p.photos[0]`. That's the helper the collection cards already use, and it
  applies the same rule the home hero's `HERO_FRAMES` applies via
  `isLandscape`. The slideshow was the one wide consumer still using the raw
  opening frame.
- All three collections resolve to a 1.78 frame: `traditional-between-takes`,
  `wildlife-bighorn`, `modern-friends` — so every slide now reads like
  Wildlife already did.
- No CSS touched. Height, `object-fit: cover` and
  `object-position: center 30%` are unchanged; a 16:9 frame loses ~26% top and
  bottom, which is the look that already worked.
- No new helper: every landscape frame in the manifest is ~1.78, so a
  "widest frame" variant would have picked the same three photos.
- [CLAUDE.md](CLAUDE.md) — added a content note under the Contentful section:
  each collection needs at least one landscape photo, since an all-portrait
  set falls back to its opening frame and crops the same way. That's a
  shooting/upload constraint, not something the code can solve.

### 18. Project hero image centred

- [src/data.js](src/data.js) — `.pj-hero` gained `margin-inline: auto`. The
  frame takes each photo's own aspect ratio, so a portrait cover fills only
  about a third of the 1180px column; hard-left it left a dead void down the
  right of the page.
- One rule on the shared class, so it applies to **every** collection
  automatically — the ones that exist now and any added to Contentful later,
  portrait or landscape. Nothing per-project to remember.
- The frame's shape, height cap and `object-fit: contain` are untouched — the
  picture is not cropped or resized, only repositioned.
- [CLAUDE.md](CLAUDE.md) — recorded under the type rules so it doesn't get
  reverted; the previous code comment explicitly argued for hard-left.

### 17. Killed the duplicate name / "Photography" tag at the source

Point 16 patched the cards; this fixes why the text existed at all. The sync
script was **inventing** two fields for every collection: `kind`, set to a
copy of the title, and `role`, set to the literal string `"Photography"`.
Everything downstream dutifully printed them.

- [scripts/sync-contentful.mjs](scripts/sync-contentful.mjs) — `photoProjects`
  entries no longer get a `kind` or a `role`. (The manifest in the repo still
  has the old values; the next `npm run sync` / build drops them. Nothing
  reads them any more either way.)
- [src/pages/PhotoProject.jsx](src/pages/PhotoProject.jsx) — the `/photography/:slug`
  header no longer prints `kind` above the title (it was the title again) or
  the accent `role` tag on the right. The kicker now shows the year, and only
  when there is one.
- [src/pages/PhotoProject.jsx](src/pages/PhotoProject.jsx) — the spec list is
  gone entirely: "Role" (→ "Photography"), "Collection" (→ the title a third
  time) and then "Frames" too. The `.detail-grid` wrapper stays so the intro
  keeps its half-width column and its spacing under the hero; `.spec` itself
  is still used by the work and design detail pages.
- [src/pages/Photography.jsx](src/pages/Photography.jsx) — the hero caption
  had the same bug: `f.kind` under the `h1` printed the collection name
  twice. The `.sub` row now renders only when there's a real `loc` or `year`.
- [src/data.js](src/data.js) — dropped the dead `kind` field from
  `HERO_FRAMES` and `FEATURED`, which existed only to feed that caption.
- Left alone: `WorkDetail` still shows `kind` for individual `/work/:seed`
  frames, where it distinguishes "Photography" from "Web Design" and isn't a
  duplicate of anything.

### 16. Photography project cards — duplicate name, role and frame count gone

Same root cause as the home cards in point 2: the sync derives `kind` from
the collection name, so the pill above each title just restated the title.

- [src/pages/Photography.jsx](src/pages/Photography.jsx) — removed the
  `.kind` pill ("TRADITIONAL" over **Traditional**) and its CSS in
  [src/data.js](src/data.js).
- [src/pages/Photography.jsx](src/pages/Photography.jsx) — removed the
  accent `p.role` label ("PHOTOGRAPHY") from the bottom-right of the card.
- The `.meta` row's left slot fell back to `"{n} frames"` when `loc`/`year`
  were empty — which they always are, since those fields were dropped from
  the Contentful model — so it repeated the "18 FRAMES" badge sitting on the
  cover image. The row now renders **only** when there's a real `loc` or
  `year` to show, with no fallback. If those fields are ever added back to
  the model, the row reappears on its own.
- Each card is now cover + title + description, plus the frame-count badge
  on the image.

### 15. More air between the Photography intro and the carousel

- [src/data.js](src/data.js) — `.band` bottom padding went from `2vh` to
  `7vh`. That block's padding is the entire gap between the intro copy and
  the frames carousel below it, and at `2vh` the paragraph nearly touched
  the first slide.
- Scoped to the `/photography` intro only — `.band` isn't used anywhere else.

### 14. Design page cross-link cards stripped to their names

- [src/pages/Design.jsx](src/pages/Design.jsx) — the two teaser cards now
  read **"Photography"** and **"About Viraj Mehta"**, each over its existing
  link ("See the projects →" / "Read more →").
- Removed from both: the mono kickers ("The other half", "Who's behind it")
  and the description lines under the headings — same treatment as the home
  practice cards. The second description also still said "what I'm booking
  now", which was the last of the booking language.
- The first card's heading was `P.photoBrand` ("Lensofviraj"); it now says
  what the destination is, matching the home card that links to the same
  page.
- [src/data.js](src/data.js) — dropped the now-unused `.teaser p` CSS.

### 13. Home footer colophon matched to About's

Both colophons are now the same three columns — **Contact · Based in ·
Elsewhere** — and both name the wider service area.

- [src/data.js](src/data.js) — added `P.area` (`"Lower Mainland"`) so the
  two pages read from one place rather than repeating a literal.
- [src/pages/Home.jsx](src/pages/Home.jsx) — the middle column is now
  "Based in" (`Vancouver · Lower Mainland` / `British Columbia, Canada`).
  This **replaced** the "Built with" column (Figma · React · Framer /
  Capture One · DaVinci) — keeping it would have left the two footers
  three-vs-four columns and not actually matching. Easy to restore as a
  fourth column if the tool list should stay.
- [src/pages/About.jsx](src/pages/About.jsx) — its "Based in" entry picked
  up `· Lower Mainland` on the same line as the city.
- About's "Location" kit row already read
  "Richmond · Vancouver · Lower Mainland" and was left alone.

### 12. Footer bottom row — year and location gone

- [src/pages/Home.jsx](src/pages/Home.jsx) — the copyright now reads
  `© Crafted & Captured` with no year at all. Point 6 had only made it
  dynamic (`new Date().getFullYear()`), which still rendered "2026" on the
  page — the year is now removed outright, not just unhardcoded.
- [src/pages/Home.jsx](src/pages/Home.jsx) — dropped
  "Vancouver, British Columbia, Canada" from the right of that row. With one
  item left, the row is no longer a space-between flex.
- No `P.city` / `P.region` anywhere on the site now except the About page's
  "Based in" colophon and its "Location" kit row.

### 11. Email shown once, not under every CTA

The address was repeated as a mono line directly beneath the "Contact me"
button on three pages and again at the foot of the enquiry modal — the same
filler pattern as the city and the year.

- [src/ui.jsx](src/ui.jsx) — deleted the modal's `.cmodal-foot` line
  ("Prefer email? … · phone"); the form itself is the way to make contact
  there. Its CSS in [src/data.js](src/data.js) went with it.
- [src/pages/Home.jsx](src/pages/Home.jsx) — removed the "Prefer email? …"
  line under the closing CTA. The footer colophon four rows below already
  lists the email and phone.
- [src/pages/Design.jsx](src/pages/Design.jsx) and
  [src/pages/Photography.jsx](src/pages/Photography.jsx) — removed the
  matching "or email …" line under each page's closing CTA.

Kept, because each is load-bearing rather than decorative:

- The home footer colophon and the About colophon — the one place each page
  states how to reach him.
- [src/ui.jsx](src/ui.jsx) two fallbacks inside the form: the mailto link
  shown when no Formspree ID is configured, and the "That didn't send.
  Please email … instead." error. Both only appear when the form can't do
  its job, so removing them would strand the visitor.

**Verified:** `npm run lint` clean, `vite build` succeeds (the >500 kB chunk
warning is pre-existing).
