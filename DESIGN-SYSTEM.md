# Design system reference — derived from the Crafted & Captured home page

This is not a spec to copy verbatim. It is a distilled description of the
**design sense** behind this site's home page — the reasoning behind its
layout decisions, its type system, its motion rules, and its restraint —
written so it can brief a *different* site. Attach this file when starting
a new build and ask for the same sensibility applied to new content: same
discipline, different words, different palette if needed.

If you paste this into a project, treat every "why" line as the part worth
keeping and every literal pixel/hex value as an example, not a requirement.

---

## 1. The one governing idea

**Nothing is said twice, and nothing is dimmer than what it introduces.**

Two rules, and almost everything else below is a consequence of them:

1. **No filler.** No decorative kickers, no mono-caps label that repeats
   the heading under it, no taglines, no status badges, no numbered
   prefixes — unless the visitor genuinely needs the information there.
   If a word appears twice on one screen, the second instance is deleted.
   If removing a line costs the reader nothing, it's removed. State a
   fact (place, year, role) once, in the one place it's useful — never as
   ambient texture repeated across sections.
2. **Headings lead.** A heading is never visually dimmer or smaller than
   the content it introduces. Any label style that defaults to a muted
   colour must be brightened when it *is* the heading (not decoration on
   top of one). The visual order top-down is always: heading brightest →
   its items → meta/caption dimmest. If something below a heading pops
   harder than the heading itself, the heading is wrong, not the content.

Before shipping any block, ask: *if I stripped this line, would the
visitor lose anything?* If not, cut it. Then ask: *is the heading the
brightest, loudest thing in this block?* If not, fix it.

---

## 2. Page structure: one shape, reused

The entire page is built from **one section shell + one header component**,
never hand-laid-out per section. Concretely:

- A `wrap` (reading column, ~1180px) for copy-heavy sections; a
  `wrap-wide` (~1340px) for anything showing actual work (image grids,
  card rows, rails). **Copy stays at reading width; work goes wide.** A
  three-card grid squeezed into a 1180px reading column comes out as
  thumbnails — not a "look" at the work.
- Every major block opens with the **same header component** — call it
  `CenterHead` — built as an optional five-rung ladder:

  ```
  kicker  →  title  →  lead  →  sub  →  cta
  ```

  Every rung except `title` is optional and renders nothing when omitted.
  A section takes *only the rungs it has content for* — it is normal and
  correct for one section to be a bare headline with nothing under it
  (when the block beneath it is the loud part, e.g. a testimonial rail)
  and for another to carry all five.
- **Exactly one italic word per header.** If the section has a `kicker`
  (its own one-word name — "Design", "Photography"), the kicker carries
  the italic and the headline stays fully upright. If there's no kicker,
  one word *inside* the headline takes the italic instead. Never both,
  never an italic phrase — italicising more than one word turns emphasis
  into a second voice reading half the sentence. Pick the word the
  sentence would lose the most by dropping (prefer the opening verb:
  "*Prototyped*, not mocked up," not "Prototyped, *not mocked up*").
- **`lead` and `sub` are the same font size**, separated only by weight
  and colour (lead = full ink, regular weight; sub = dimmer, lighter
  weight). Don't add a third size step here — two tiers already do the
  job of "the one sentence" vs. "the longer explanation."
- Sections are separated by **one hairline rule + a large, consistent
  vertical rhythm** (one CSS variable driving the gap everywhere), not
  bespoke padding guessed per section. Pick one vertical measure for the
  whole page and let every section read it.
- **Grids never auto-fit.** Choose an explicit column count that divides
  the actual item count evenly (3 cards → 3 columns; 4 cards → 2×2), and
  collapse straight from that count to 1 column at the mobile breakpoint
  — never pass through an intermediate count that would strand a lone
  card in a half-empty row.
- **Cards in the same row share one fixed aspect ratio**, never each
  photo's/asset's own ratio. A mixed aspect grid produces mismatched card
  heights and a per-card cropping problem; pick a landscape-biased crop
  strategy for cover art so the fixed box loses as little as possible.

---

## 3. Type system

A small, deliberate set of faces, each with exactly one job. Copy this
*shape* (headline face / body face / control face), not necessarily these
exact fonts.

| Rung | Role | Example treatment on this site |
| --- | --- | --- |
| **Headline** | Display statement, one weight, one italic word | Serif display font at weight 300, one word set in its italic |
| **Lead** | The one sentence under a headline | Sans, regular weight, full-ink colour |
| **Body / sub** | Longer explanation, card copy | Sans, light weight, dimmed colour |
| **Control** | Buttons, nav, badges | Monospace, medium weight, uppercase, wide letter-spacing |

Rules worth keeping regardless of the actual typefaces chosen:

- **The display face is used in exactly one weight family (e.g. only a
  300 + its italic)** and nowhere else on the site — not on card titles,
  not on nav, not on buttons. This is what makes it *read* as an accent
  rather than "the font."
- **Card and row titles stay on the body/sans face**, even directly under
  a display headline — putting the display face on item titles flattens
  the hierarchy the headline/heading rule exists to protect.
- **The monospace control face never gets a weight bump when used as a
  small label/eyebrow.** A heavier weight at ~11px thickens badly and
  reads as shouting. Weight bumps on the mono face are reserved for
  actual interactive controls (pills, nav links) where it needs to hold
  its own against a dark or busy background.
- **There is no separate "eyebrow" label style above a heading.** A mono
  caption sitting above a headline and restating it in a different
  typeface is filler by the rule in §1. If a section needs a one-word
  name, that word *is* the kicker rung of the header, set in the display
  face — not a smaller caption bolted on top of it.
- If a display face is used at two very different scales in two places
  on the page (e.g. a giant hero word vs. a normal section kicker), tie
  their proportions together with **ratios, not fixed pixel values** —
  one base size variable, with the related sizes computed as fractions
  of it. Fixing each occurrence in pixels independently is how two
  lockups that are supposed to feel like "the same idea, different
  scale" end up looking unrelated.

---

## 4. Colour & surface

This site runs one fixed dark palette — a near-black background, a
near-white ink, one dim/muted grey for secondary text, one hairline-rule
grey, and a single accent colour used consistently for interactive states
(links on hover, focus rings, underlines, selection colour). Example
token set (swap the actual values, keep the *roles*):

```
--bg      near-black background
--panel   slightly lifted surface (cards, if any)
--ink     primary text, near-white
--dim     secondary text / captions
--rule    hairline borders and section dividers
--accent  the one colour used for interactive/attention moments
```

Rules to carry forward:

- **The accent is a constant, not a per-section theme.** One colour, used
  everywhere something is interactive or needs a flash of attention
  (selection highlight, focus outline, hover underline, CTA border).
  Multiplying accent colours per section is what makes a site look
  unbranded.
- **Only one thing on the page is "lit."** Reserve any glow/gradient
  lighting effect for a single hero moment. A glow band repeated between
  every section spends the effect until it means nothing.
- **If you introduce a deliberately colourful exception (e.g. this site's
  pastel testimonial cards), it must be the *one* documented exception**,
  and the type sitting on top of it must be measured for contrast against
  *that* background, not assumed safe because it looks fine on the dark
  page elsewhere. Light backgrounds get the page's ink colour in reverse
  (near-black text), not white — white text on a light/pastel surface
  frequently fails contrast entirely.

---

## 5. Hero pattern

The hero on this home page is not a static banner. Its structure is worth
carrying forward as a pattern, independent of the specific site:

1. **The name/brand swells in** — the primary heading is the first thing
   on screen, large, and animates in with a scale/opacity entrance timed
   in one place (a small set of named constants: when the entrance
   finishes, when the next element starts, etc.), so timing edits happen
   in one spot rather than scattered magic numbers through the markup.
2. **A typed role/description line arrives while the heading is still
   settling**, not after — the two motions overlap rather than queue.
   Implemented as a typewriter effect cycling through a short list of
   roles/descriptors, always with a screen-reader-friendly plain-text
   fallback rendered off-screen (a cycling animated string is not
   accessible on its own).
3. **A single supporting line (subhead/quote) fades in last**, after the
   role line has had time to be read.
4. **An ambient light layer follows the cursor**, trailing rather than
   snapping to the pointer position, plus a few slow independent
   "drifting" light pools that animate on their own cycle. The point is
   that the hero feels alive without demanding attention — the
   cursor-follow light is deliberately subtle; what the visitor notices
   is nearby elements brightening, not a dot glued to the mouse.
5. **A scroll cue** (small "scroll to explore" affordance) is an ordinary
   anchor link, so it still works with JavaScript/motion disabled.
6. **All of this is skipped under `prefers-reduced-motion`** — state the
   final, settled content plainly instead of freezing mid-animation.

---

## 6. The "practices" / capability intro

Directly under the hero, one short line names what the site's owner does,
paired with a small number of doorways (2–3 max) into the main sections —
not a paragraph of self-description. Example shape:

> "One pair of *hands*." — followed by two link-cards, each just a bold
> label and a mono "Enter →" affordance.

The lesson: **a capability list is doors, not descriptions.** If the
doors already communicate the offering by their labels and destinations,
don't also write three sentences explaining what's behind them.

---

## 7. Featured-work section (single spotlight, not a grid)

When you have a small number of portfolio items (here: 3–4) and they
don't yet have meaningfully different metadata (same tagline pattern,
same tooling badge, empty date fields), **do not lay them out as a grid
of near-identical cards.** A row of three cards whose only difference is
the title reads as one card printed three times.

Pattern used here: a **tab switcher** naming each item, one large stage
showing the active item's actual work (a live embed, a full-page
screenshot, or a device frame), and the call-to-action moved *below* the
work rather than above it — you put the CTA after the visitor has
actually seen something, not before.

Engineering note worth keeping regardless of stack: **only mount the
heavy content (iframe embed, video, etc.) for tabs that have actually
been viewed**, growing a "seen" set as the visitor clicks — first paint
only costs one heavy embed, and switching back to something already
viewed is instant.

Apply this "spotlight, not grid" rule any time your placeholder/early
content would otherwise repeat itself across cards. Once real, differentiated
metadata exists for each item (real dates, real one-line summaries, real
tags), a grid becomes valid again — the rule is about not laying out
*for* filler.

---

## 8. Photography / gallery section — the collage-to-word transition

This is the most bespoke piece of motion on the page and probably won't
transplant literally, but the underlying idea generalizes: **let a visual
element resolve into the section's own label, so the section doesn't need
a separate header repeating what the visual just said.**

Concretely here: five photographs tile into a full-bleed collage; as the
visitor scrolls, everything outside a large word-shaped mask fades to
black and the collage zooms until the surviving slivers of photograph
exactly form the word "Photography" as oversized display type. Only
*after* that word has fully resolved does supporting copy fade in beneath
it. Because the collage itself becomes the section's name, there is
**no redundant kicker/label above it** during normal motion — one only
appears as a fallback under reduced motion, where the zoom never runs.

Reusable takeaways even without building this exact effect:
- A section whose visual *is* self-explanatory doesn't need a caption
  stacked on top of it.
- Any scroll-driven "reveal" of this kind needs an explicit, simpler
  fallback for `prefers-reduced-motion` that shows the same end content
  without the animation, not a broken half-state.
- Split a long scroll-linked sequence into named phases with a percentage
  boundary between each (e.g. "zoom finishes at 62% of the section's
  scroll distance, copy fades in from 68–92%") — keeping those checkpoints
  as named constants close together, rather than inline magic numbers, is
  what makes the sequence tunable later.

---

## 9. Numbered sequences → a rail, not boxes

Any list that is genuinely **ordered** (a process, "how it works," "what
you get" as sequential steps) renders as a **vertical timeline/rail**:
one line down the middle (or side, on mobile), steps hung off alternating
sides, exactly one step "lit" at a time (full brightness, full scale) with
the rest dimmed and slightly scaled down. No boxes, no borders, no card
panels — the type carries the whole design.

Only use bordered cards/panels for things that are **not** a sequence —
standing positions or parallel categories where "then" would be the wrong
word (e.g. "three ways I work" rather than "three steps you go through").
Test this before choosing: does the list actually have an order the
reader passes through, or are these independent, co-equal items? If the
latter, keep the panel/card layout; forcing it onto a rail would say
"then" where the content means "and."

---

## 10. Testimonials / social proof as a rail, not a grid

If there are 2+ pieces of social proof, an **infinite, slowly-advancing
rail** (hold for several seconds → slide exactly one card → hold again)
reads better than a static grid or a fast continuous marquee:

- **Hold long enough to actually read** (validate against your longest
  quote), then slide — never a continuous drift, which makes text
  impossible to read while it's moving.
- **Never runs backwards.** Repeat the list enough times in the markup to
  cover the visible rail twice over, and always advance forward through
  the repeated copies — looping back to the start would require either a
  visible snap or a reverse-scroll, both of which look like a glitch.
- Pauses on hover, focus, and drag; adopts (rather than fights) manual
  scroll input (trackpad, touch fling); is keyboard-scrollable.
- Respects reduced motion by turning off auto-advance while keeping
  manual navigation (arrows) working.
- This is the one place on the page allowed to break the neutral palette
  — social proof can carry colour/warmth the rest of the site
  deliberately avoids — **but if you do that, re-verify text contrast
  against the actual background used**, don't assume.

⚠ **Any testimonial/review copy must be real before the site goes live.**
Placeholder quotes attributed to invented people are deceptive advertising
in most jurisdictions (consumer protection / FTC endorsement rules), not
a style choice. Two genuine quotes beat four invented ones — delete
placeholders rather than shipping them, and design the rail to work with
any count so trimming down to "just the real ones" never breaks layout.

---

## 11. Motion principles (apply site-wide)

- **A header reveals itself in reading order**, not as one faded block:
  kicker → headline → description arrive as separate, staggered moments
  because that's the order a reader's eye takes them in anyway.
- **A block of independent lines (e.g. a two-sentence statement) reveals
  line-by-line with a stagger**, not as one paragraph fading in — when
  content is already shaped as discrete lines, let the motion follow
  that shape instead of treating it as one opaque object.
- **Every scroll-triggered reveal fires once** (`once: true` equivalent) —
  content should not re-animate every time it scrolls back into view;
  that reads as flickery rather than intentional.
- **Clear inline transform/opacity styles left behind by a JS animation
  library once a reveal finishes.** An animation library's inline style
  can silently out-rank a CSS `:hover` rule on the same property forever
  if it's never cleaned up — this is a common, hard-to-spot bug class:
  hover states that "just don't work" on elements that were also
  scroll-revealed.
- **Respect `prefers-reduced-motion` everywhere**, not just on the hero:
  every custom scroll-linked or infinite-loop animation needs an explicit
  branch that shows the final, settled state instantly. This is not
  optional polish; treat it as a required code path for every new motion
  effect.

---

## 12. Footer / closing pattern

- One shared footer component, rendered on **every** page that visitors
  can land on directly (not just the homepage) — a portfolio's most
  common entry points are often deep pages (a project page, a gallery
  page) found via search or a shared link, and those need a way back to
  contact info just as much as the homepage does.
- Content: how to reach the person/business (email, phone), a location
  fact stated once, and links elsewhere (social, etc.) — then a hairline
  rule, then copyright + (optionally) a "back to home" link.
- Sub-pages that are themselves a single project's detail view (a case
  study, a single gallery) can skip the full footer if they already end
  in an explicit "back to index" link — a full footer under a single
  project reads as a second ending stacked on the first.

---

## 13. Loading/first-paint pattern (if the homepage has heavy hero assets)

If the hero depends on assets that must be ready before an animation
starts (custom fonts, several decoded hero images), a lightweight loader
is worth building — but keep it honest and bounded:

- Wait for actual readiness signals (fonts loaded, images *decoded*, not
  just fetched) rather than an arbitrary timer.
- **Cap the wait** at a fixed maximum regardless of network speed — a
  preloader stuck on a slow connection is a blank page, which is worse
  than the flash of unstyled content it was meant to prevent.
- Show it **once per session**, not on every reload during development
  or every repeat visit.
- Skip it entirely under reduced motion — it exists only to protect an
  animation that won't be playing.
- Don't render a literal byte-accurate progress percentage if one isn't
  knowable (fonts and image decode don't report partial progress) — a
  precise-looking number backed by a guess is worse than an honest
  coarse one. A stepped/coarse progress indicator that eases visually
  between steps reads as smoother than it actually is, without lying
  about precision.

---

## 14. Accessibility baseline (non-negotiable, not a nice-to-have)

- Every custom interactive rail/carousel/tab group: full keyboard support
  (arrow keys within a tablist, Tab moves past the group as a whole),
  correct ARIA roles, and inactive panels taken out of the tab order.
- Every modal/lightbox: focus moves into it on open, Tab is trapped
  inside it, Esc closes it, and focus returns to the element that opened
  it on close. Page scroll is locked while it's open.
- Any animated/cycling text (typewriter effects, etc.) needs a plain,
  static, non-animated equivalent exposed to screen readers — never rely
  on a live region announcing every keystroke.
- Contrast is **measured**, not assumed, especially anywhere the design
  deliberately breaks the base palette (colour cards, gradient
  backgrounds). Verify against the actual rendered background, not a
  swatch.

---

## 15. How to use this file when starting a new build

1. Decide the new site's **one governing idea** (§1 equivalent) — what's
   the one or two rules this build refuses to break? Write them at the
   top of that project's own design notes, the way §1 anchors this one.
2. Pick the four-face type system (§3) for the new brand: one display
   face for headlines, one body face, one control face — and decide
   which single weight of the display face is "the" headline weight.
3. Pick a single fixed palette (§4): background, ink, dim, rule, one
   accent. Resist a second accent colour unless there's a specific,
   documented exception (like the testimonial cards here).
4. Build **one header component** (§2) before building any section, and
   make every section consume it. Don't hand-lay-out a second header
   shape later "just this once."
5. For each planned section, ask: is this a sequence (→ rail/timeline),
   a spotlight (→ single-item switcher), a grid (→ fixed-ratio cards,
   explicit column counts), or a rail of social proof (→ hold-and-slide)?
   Match it to the closest pattern above rather than inventing a new
   layout shape per section.
6. Apply the motion and accessibility baselines (§11, §14) to every
   interactive piece as it's built, not as a pass at the end.
