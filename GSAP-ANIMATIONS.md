# GSAP animation system — reference & recipes

Every GSAP-driven animation used on this site, distilled into copy-paste
recipes. Purpose: drop this file into a new project and rebuild the same
motion language quickly, without re-deriving the timing/easing choices
from scratch. Code is genericized (no project-specific class names kept
except where they clarify structure) — rename to fit the new project.

---

## 0. Setup (do this once per project)

```bash
npm i gsap @gsap/react
# only if you want native-feel smooth scroll (used site-wide here)
npm i lenis
```

```js
// one place, imported before any component uses useGSAP
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, useGSAP);
```

**One reduced-motion check, reused everywhere — write it once:**

```js
export const prefersReduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;
```

### The four rules every recipe below follows

1. **Every animation is gated on `prefersReduced()` first**, and renders
   the *final* state instantly instead — never a frozen mid-animation
   frame. Check it inside the effect, not just once on mount (so a change
   to the setting without a reload is still respected on next mount).
2. **Every GSAP effect lives inside `useGSAP(fn, { scope, dependencies })`**,
   never a bare `useEffect` + manual `gsap.to`. `useGSAP` auto-reverts/kills
   its tweens on unmount and re-run, so navigating away mid-animation
   never leaks a ScrollTrigger or a dangling tween.
3. **Any tween that leaves an inline transform/opacity behind must clear
   it**: pass `clearProps: "transform"` (or `"transform,opacity"`). GSAP
   writes an inline `style="transform: translate(0px,0px)"` when a tween
   finishes, and an inline style beats every CSS rule — including a
   `:hover` transform on the same element. This silently kills hover
   states on anything that was also scroll-revealed. Always clear.
4. **Scroll-triggered entrances fire once**: `scrollTrigger: { once: true }`.
   Content re-animating every time it scrolls back into view reads as
   flickery, not intentional.

---

## 1. Fade-and-rise reveal (the workhorse — use this the most)

**What:** the default "this block arrives as you scroll to it" animation.
Used on almost every paragraph, card row, and section on the site.

**When:** any static block of content entering the viewport. Not for
headlines that need to arrive in stages (see §2) or for lists where each
item should stagger in as its own moment (pass `sel`).

```jsx
function Reveal({ children, className = "", delay = 0, y = 18, sel, stagger = 0, as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (prefersReduced()) return;
    const targets = sel ? ref.current.querySelectorAll(sel) : ref.current;
    if (sel && !targets.length) return;
    gsap.from(targets, {
      opacity: 0, y, duration: 0.9, delay, ease: "power3.out",
      ...(stagger ? { stagger } : {}),
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
    });
  }, { scope: ref, dependencies: [sel, stagger] });
  return <Tag ref={ref} className={`rv ${className}`} {...rest}>{children}</Tag>;
}
```

**Usage:**
```jsx
<Reveal>Whole block fades/rises as one unit</Reveal>
<Reveal sel=".line" stagger={0.14} y={22}>
  <p><span className="line">First sentence.</span><span className="line">Second sentence.</span></p>
</Reveal>
<Reveal as="dl" className="footer-grid">...</Reveal>
```

**Tuning knobs:** `y` (18 default, 22 for bigger blocks), `delay` for
sequencing several Reveals against each other, `stagger` + `sel` any time
the block is already shaped as discrete lines/items and the motion should
follow that shape rather than treat it as one blob.

---

## 2. Headline mask-rise + staggered copy fade (section header reveal)

**What:** a two-part timeline for a "kicker → headline → description"
header block: the headline **rises up out of a clipped mask** (looks like
it's being revealed by a wipe, not just fading in), then the supporting
copy fades up underneath it a beat later. This is the highest-value
recipe on the site — it's what makes headers feel considered instead of
"everything fades in at once."

**Structure required in markup:** the headline text must be wrapped in a
span inside an `overflow: clip` container with bottom padding (so
descenders like g/y/p aren't shaved off at rest — `overflow` clips at the
*padding* edge, not the content edge):

```css
.head-line { display: inline-block; overflow: clip; padding-bottom: .24em; margin-bottom: -.24em; }
```

```jsx
function SectionHead({ kicker, title, sub, still }) {
  const ref = useRef(null);

  useGSAP(() => {
    if (still || prefersReduced()) return;
    const el = ref.current;
    const rise = el.querySelectorAll(".head-line > span");       // headline + kicker spans
    const fade = el.querySelectorAll(".head-lead, .head-sub, .head-cta");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 86%", once: true } });

    if (rise.length) {
      // 135%, not 100%: the mask clips at the padding edge (see CSS above),
      // so 100% would still show the tail of a descender before it moves.
      tl.from(rise, {
        yPercent: 135, duration: 1.05, ease: "power3.out",
        stagger: 0.1, clearProps: "transform",
      }, 0);
    }
    if (fade.length) {
      tl.from(fade, {
        opacity: 0, y: 14, duration: 0.8, ease: "power3.out",
        stagger: 0.08, clearProps: "transform,opacity",
      }, 0.22); // starts 0.22s into the timeline, so the headline leads
    }
  }, { scope: ref, dependencies: [still] });

  return (
    <div className="head" ref={ref}>
      {kicker && <p className="head-kicker head-line"><span>{kicker}</span></p>}
      <h2 className="head-title"><span className="head-line"><span>{title}</span></span></h2>
      {sub && <p className="head-sub">{sub}</p>}
    </div>
  );
}
```

**`still` escape hatch:** add a prop that skips the whole effect for any
instance whose visibility is already driven by something else (e.g. it
lives inside another scroll-linked sequence) — a second animation
fighting an existing one flickers.

**Never wrap this component in the Reveal from §1.** A Reveal fades the
*whole* block as one object; that's the wrong motion for a lockup whose
parts should arrive in reading order.

---

## 3. Scroll parallax + hover zoom on images (reused on every image grid)

**What:** every photo/screenshot on the site gets (a) a slow vertical
drift tied to scroll position (parallax) and (b) a quick scale-up on
hover. One `useGSAP` block, applied to every matching element via
`gsap.utils.toArray`, so it costs one effect no matter how many images
are on the page.

```jsx
useGSAP(() => {
  if (prefersReduced()) return;
  gsap.utils.toArray("[data-par]").forEach((el) => {
    const card = el.closest(".shot") || el;
    gsap.set(el, { scale: 1.14, transformOrigin: "50% 50%" }); // headroom for the drift + zoom
    gsap.fromTo(el, { yPercent: -6 }, {
      yPercent: 6,
      ease: "none",                 // linear — this is scrubbed by scroll position, not time
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
    });
    const zoom = gsap.quickTo(el, "scale", { duration: 0.6, ease: "power2.out" });
    card.addEventListener("pointerenter", () => zoom(1.19));
    card.addEventListener("pointerleave", () => zoom(1.14));
  });
  ScrollTrigger.refresh(); // re-measure — layout may have shifted after webfonts/images load
}, { scope: root, dependencies: [/* reduced, route-key, etc. */] });
```

```html
<div class="shot"><img data-par src="..." /></div>
```

**Why `gsap.quickTo` for the hover, not `gsap.to`:** `quickTo` returns a
reusable function optimized for being called repeatedly on the same
property with different targets (e.g. rapid pointerenter/leave) — cheaper
than spinning up a new tween object every hover.

**Why `gsap.set(scale: 1.14)` up front:** the parallax drift means the
image moves outside its container's edges at the extremes of the scroll
range; pre-scaling gives it the headroom so no gap ever shows at the
container's border. Tune the base scale (1.08–1.14 across this site) to
the drift range (`yPercent` ±4 to ±6) — bigger drift needs bigger
headroom.

**Always call `ScrollTrigger.refresh()` after setting these up**,
especially if images/webfonts can still change layout after mount.

---

## 4. Count-up numbers ("stat" / metrics block)

**What:** a number animates from 0 to its target once its container is
actually visible (not merely "the page scrolled past where it would be,"
which matters if something above it is pinned/sticky and inflates scroll
distance — use an `IntersectionObserver` for the *visibility* gate, not
`ScrollTrigger`, and use GSAP only for the *tweening*).

```jsx
function Counter({ to, suffix, run, delay = 0 }) {
  const [n, setN] = useState(0);
  const sufRef = useRef(null);
  const ref = useRef(null);

  useGSAP(() => {
    if (!run) return;
    if (prefersReduced()) { setN(to); return; }
    const box = { n: 0 };
    gsap.to(box, {
      n: to, duration: 2.1, delay,
      ease: "power1.out",              // gentle — keeps the climb readable, not a snap-to-stop
      onUpdate: () => setN(Math.round(box.n)),
    });
    if (suffix && sufRef.current) {
      gsap.from(sufRef.current, {
        opacity: 0, xPercent: -40, duration: 0.55, ease: "back.out(2)",
        delay: delay + 2.1 * 0.62,      // suffix flies in as the number is finishing, not before
      });
    }
  }, { scope: ref, dependencies: [run] });

  return <b ref={ref}>{n}<span ref={sufRef}>{suffix}</span></b>;
}

function Metrics({ items }) {
  const ref = useRef(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (prefersReduced()) { setRun(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setRun(true); io.disconnect();
    }, { threshold: 0.35 });               // a third of the block visible = "really here"
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="metrics">
      {items.map((m, i) => <Counter key={m.k} to={m.v} suffix={m.suffix} run={run} delay={i * 0.09} />)}
    </div>
  );
}
```

**Key technique: `gsap.to` animating a plain JS object (`box.n`), not a
DOM node.** GSAP tweens *any* numeric property on *any* object — it
doesn't require a DOM target. Read the tweened value in `onUpdate` and
push it into React state (or straight to a DOM property) yourself.

---

## 5. Page transition — "iris"/aperture wipe

**What:** a full-screen overlay scales up to cover the viewport, the
route swaps *while covered*, then it scales back down to reveal the new
page. Used for every client-side route change.

```jsx
// one ref on a full-viewport, centered, scale-0-by-default overlay element
const irisRef = useRef(null);
const busy = useRef(false);

const go = useCallback((to) => {
  if (prefersReduced() || !irisRef.current) {
    navigateNow(to); // instant, no wipe, under reduced motion
    return;
  }
  if (busy.current) return;           // ignore taps mid-transition
  busy.current = true;
  const lens = irisRef.current;
  gsap.timeline({ onComplete: () => { busy.current = false; } })
    .fromTo(lens, { scale: 0 }, { scale: 1.1, duration: 0.45, ease: "power3.in" })
    .add(() => { navigateNow(to); window.scrollTo(0, 0); })   // swap happens fully covered
    .to(lens, { duration: 0.08 })                              // brief hold for the new page to mount
    .add(() => ScrollTrigger.refresh())                        // re-measure the NEW page's triggers
    .to(lens, { scale: 0, duration: 0.6, ease: "power3.out" });
}, []);
```

```css
.iris { position: fixed; inset: 0; z-index: 500; pointer-events: none; display: grid; place-items: center; }
.iris-lens { width: 220vmax; height: 220vmax; border-radius: 50%; background: var(--accent); transform: scale(0); }
```

**Why `.add(fn)` instead of a `duration:0` tween with `onComplete`:**
`.add()` inserts a plain callback into the timeline's sequence — cleaner
than faking a zero-length tween just to get a callback at the right
moment.

**Why `power3.in` closing but `power3.out` opening:** closing accelerates
into the cover (feels like a decisive snap shut); opening decelerates out
of it (feels like a reveal settling, not overshooting). Keep this pairing
— it's the difference between the wipe feeling like one gesture instead
of two unrelated tweens.

**Always refresh ScrollTrigger after the route swap**, before the iris
opens — otherwise the new page's scroll-triggered animations measure
against stale positions from the previous page.

---

## 6. Global smooth scroll + scroll progress bar (Lenis + GSAP ticker)

**What:** site-wide smooth (inertia) scrolling, plus a thin progress bar
that fills as the visitor scrolls the whole document. Lives once in the
app shell, not per-page.

```bash
npm i lenis
```

```jsx
useGSAP(() => {
  let lenis;
  if (!prefersReduced()) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);   // keep every ScrollTrigger in sync with Lenis, not native scroll
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);                // Lenis already smooths; double-smoothing causes drift
    lenis.__raf = raf;
  }
  const st = ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => { progressBarRef.current.style.width = `${self.progress * 100}%`; },
  });
  return () => {
    st.kill();
    if (lenis) { gsap.ticker.remove(lenis.__raf); lenis.destroy(); }
  };
}, { dependencies: [] /* reduced-motion flag, if it can change at runtime */ });
```

**Why Lenis drives native `scrollTop` rather than hijacking scroll
entirely:** `position: sticky` elements keep working. A scroll library
that fakes scrolling via transforms breaks every sticky element on the
page.

**Programmatic scroll (nav links, back-to-top) must go through the same
Lenis instance**, not `window.scrollTo`, or the two motion systems fight:

```js
lenisRef.current
  ? lenisRef.current.scrollTo(targetEl, { offset: -70 })
  : window.scrollTo({ top: targetEl.offsetTop - 70, behavior: "smooth" });
```

Call `lenis.resize()` before scrolling to a target right after a route
change — Lenis caches page height, and a stale cache clamps a deep scroll
to the previous (shorter) page's bottom.

---

## 7. Animating non-DOM values (WebGL / Canvas / anything with numeric props)

**What:** GSAP isn't limited to CSS/DOM. Any object with a numeric
property can be tweened — used here to animate a Three.js/WebGL shader
uniform on hover.

```jsx
const uniforms = { uHover: { value: 0 } };

const ease = (target) =>
  gsap.to(uniforms.uHover, {
    value: target,
    duration: 0.5,
    ease: "power2.out",
    onUpdate: invalidate,   // tell a frameloop="demand" renderer a frame is needed
  });

mesh.onPointerOver = () => ease(1);
mesh.onPointerOut = () => ease(0);
```

**General pattern for "GSAP driving a non-React render target"** (Canvas,
WebGL, `<svg>` attributes that don't have a CSS equivalent, an audio
gain node, anything): tween a plain object's property in `onUpdate`, then
push that value into whatever imperative API actually needs it. Don't
try to force GSAP to animate something it has no direct plugin for —
proxy through a plain number instead.

---

## 8. Scroll-linked custom-property painting (complex multi-phase sequences)

**What:** for a sequence too intricate for a single `ScrollTrigger.scrub`
tween — e.g. "phase one zooms a headline from huge to normal size while
a mask wipes open, phase two fades in a paragraph and lifts the headline
to make room for it" — don't fight GSAP's tween model into it. Read raw
scroll progress yourself and write plain CSS custom properties; let CSS
`transition`/`clamp()` do the rendering. Reserve GSAP/ScrollTrigger for
triggering the *setup* (measuring, refreshing) rather than the frame-by-
frame values.

```jsx
useGSAP(() => {
  const section = sectionRef.current;   // the tall "scroll distance" section
  const stage = stageRef.current;       // the sticky child that actually paints
  let dist = 0, top = 0;

  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

  // one function, split into named phases with percentage boundaries —
  // keep the boundary numbers together as named constants, not scattered
  const PHASE_1_END = 0.62;
  const PHASE_2_START = 0.68;
  const PHASE_2_END = 0.92;

  const paint = (p) => {
    const z = clamp01(p / PHASE_1_END);
    stage.style.setProperty("--size", `${lerpExpo(bigSize, smallSize, z)}px`);

    const c = clamp01((p - PHASE_2_START) / (PHASE_2_END - PHASE_2_START));
    const eased = c * c * (3 - 2 * c);              // smoothstep — settles instead of snapping
    stage.style.setProperty("--copy-o", eased.toFixed(3));
  };

  const onScroll = () => {
    if (dist <= 0) return;
    const rectTop = section.getBoundingClientRect().top;
    paint(clamp01((top - rectTop) / dist));
  };
  const measure = () => {
    top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar-h")) || 0;
    dist = Math.round(window.innerHeight * 3);       // however many "screens" the sequence needs
    section.style.height = `${stage.getBoundingClientRect().height + dist}px`;
    onScroll();
  };

  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure);
  ScrollTrigger.refresh();
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", measure);
    section.style.height = "";
  };
}, { scope: root, dependencies: [/* reduced, assets-mounted flag */] });
```

```css
.stage { position: sticky; top: 0; height: 100vh; }
.headline { font-size: var(--size); }
.paragraph { opacity: var(--copy-o); }
```

**When to reach for this instead of a normal `scrub: true` tween:** as
soon as the sequence has more than one phase with different easing
curves, or drives a value `scrub` can't touch directly (an SVG mask
radius, a geometric — not linear — size curve). A geometric curve
(`from * (to/from) ** progress`) is worth knowing: a *linear*
interpolation from a huge start size to a small end size spends its
first half between two sizes that look identical and crosses all the
*readable* sizes in the last instant. Multiplying by a constant ratio
each step is what makes a zoom look evenly paced.

---

## 9. Companion patterns that aren't GSAP (but ship alongside it)

Not GSAP, but part of the same "feel" — worth knowing so a rebuild
doesn't reach for GSAP where a plain `requestAnimationFrame` loop with
manual lerp-easing is actually the better tool (continuous pointer-
tracking and drag-driven motion don't suit a tween library, which is
built around going from A to B, not "always chasing a moving target").

- **Cursor-follow glow, trailing not snapping:** one rAF loop,
  `x += (targetX - x) * 0.06` per frame — exponential ease-toward-target
  with no fixed duration. Use this shape for anything that tracks a live
  input (cursor, drag) rather than animating between two known states.
- **Infinite "hold → slide one step → hold" rail** (testimonials-style
  carousels): a manual rAF with a custom cubic `easeInOut`
  (`t<0.5 ? 4*t*t*t : 1-(-2*t+2)**3/2`), a target timestamp for the next
  auto-advance, and unbounded position state that's only wrapped modulo
  the content width *between* steps, never mid-tween (wrapping mid-tween
  puts a visible seam in the slide).
- **Scroll-lit sequential timeline** (numbered process steps): one
  rAF-throttled scroll handler computing "which step's top has the
  viewport's vertical middle passed" — deliberately not an
  IntersectionObserver, because the "current" band is a *line*, not a
  box, and an IO would need an awkward `-50%/-50%` rootMargin and still
  go quiet in the gap between two steps.

---

## 10. Quick-reference: durations, eases, and when to use them

| Situation | Duration | Ease | Why |
| --- | --- | --- | --- |
| Fade/rise entrance (§1) | 0.8–0.9s | `power3.out` | Confident arrival, no bounce |
| Headline mask-rise (§2) | ~1.05s | `power3.out` | Slower — it's the biggest element on screen |
| Scroll-scrubbed parallax (§3) | n/a (`scrub: true`) | `none` (linear) | Position is derived from scroll, not time — linear is correct here, not a stylistic choice |
| Hover zoom (§3) | 0.6s | `power2.out` | Quick but not abrupt on pointer in/out |
| Count-up (§4) | ~2.1s | `power1.out` | Slow enough to read each digit change |
| Suffix fly-in (§4) | 0.55s | `back.out(2)` | A little overshoot — reads as a "landing," used sparingly (only on tiny elements) |
| Page-transition close (§5) | 0.45s | `power3.in` | Accelerating — feels decisive |
| Page-transition open (§5) | 0.6s | `power3.out` | Decelerating — feels like a settle, not a snap |
| WebGL hover ease (§7) | 0.5s | `power2.out` | Same family as DOM hover zoom — keep hover responses consistent across DOM and canvas |

**Almost nothing on this site uses a bounce/elastic ease** except the
one deliberate exception (`back.out` on a small suffix glyph). Overusing
springy eases is what makes a site feel gimmicky rather than considered
— reserve them for one tiny, secondary flourish at most.

---

## 11. Checklist for adding a new animation to a project using this system

- [ ] Wrapped in `useGSAP`, not a bare `useEffect`
- [ ] First line checks `prefersReduced()` and returns/short-circuits to
      the final state
- [ ] Any tween on a DOM element that also has a CSS `:hover`/`:focus`
      transform includes `clearProps`
- [ ] Any `scrollTrigger` entrance has `once: true` unless it's genuinely
      meant to replay
- [ ] Any `scrollTrigger` with `scrub: true` uses `ease: "none"` (scrub
      tweens shouldn't also ease — the scroll position *is* the easing)
- [ ] `ScrollTrigger.refresh()` called after anything that changes page
      height/layout post-mount (route change, webfont load, image load,
      manual `style.height` changes)
- [ ] Cleanup function kills/removes anything created outside of
      `useGSAP`'s own auto-cleanup (manual `ScrollTrigger.create`,
      `Lenis` instances, raw event listeners)
