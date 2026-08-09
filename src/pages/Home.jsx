import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import {
  P, img, srcSet, projectCover, INTRO, TESTIMONIALS, TAGLINE, COLLAGE,
  PHOTO_PROJECTS, WEB_PROJECTS, HAS_REAL_WEB, hasPhoto, prefersReduced, ROLES,
  gridCols,
} from "../data.js";
import { Reveal, TLink, FigmaFrame, Typewriter, CenterHead, Timeline, Colophon } from "../ui.jsx";
import { useSeo } from "../seo.js";
import { useApp } from "../context.js";

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* Hero entrance timing, in seconds — one sequence, so the numbers live
   together rather than being scattered through the JSX.

   The studio name swells out of the frame (2.3s, the .mast-swell
   animation in the CSS); the role line crosses in while it is still
   growing, starts typing once it has cleared, and the sub follows it. */
const SWELL = 2.3;
const ROLES_IN = SWELL - 0.45;   // fades in under the name, before it goes
const ROLES_TYPE = SWELL + 0.05; // first keystroke — the frame is its own
const SUB_IN = SWELL + 0.35;

/* The word the collage resolves into. Not P.photoBrand any more: this
   canvas is the doorway into the photography work, and the section that
   fades in under it opens on the same word, so the run now hands the
   visitor a subject rather than a second brand name to learn. The
   practice is still named as Lensofviraj on /photography and in the bar.
   The capital is load-bearing: this word stands opposite "Design" as
   the other practice's name, and .lov-cut's old lowercase transform —
   right when it was a brand mark — set the two of them differently. */
const COLLAGE_WORD = "Photography";

/* The sentence the collage's word turns out to mean. It lives out here
   because it is rendered in two different places depending on whether
   there are photographs to build a collage from: inside the sticky
   canvas when there are, and as an ordinary section header above the
   collections when there aren't. */
const PHOTO_COPY = {
  title: "Every frame earns its place.",
  sub: "Shot on available light, graded for consistency, delivered ready to print or post — nothing leaves the set that wouldn't make the final cut.",
};

/* ==================================================================
   WORK — the front page.

   Every block below the hero is built from the same centred header — a
   headline with one word in the italic, a line of description, a call to
   action — over a grid whose columns divide the row exactly. See the
   CENTRED SECTION SYSTEM block in data.js and CenterHead in ui.jsx;
   nothing here lays out a section by hand.

   Everything about the person lives on /about.
   ================================================================== */
export default function Home() {
  useSeo("", "Photographer and web designer in Vancouver. Portraits, events and visual stories, plus UI/UX and web design in Figma. Shot and designed by the same person.");
  const { openContact } = useApp();
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);
  const stage = useRef(null);
  const lovSec = useRef(null);
  const lovStage = useRef(null);

  /* The five frames are SVG <image>, which has no loading="lazy" — so
     without this they would all be fetched at first paint, well above the
     fold's worth of bytes. Same gate FigmaFrame uses for its embeds: mount
     them once the section is within a screen or so of view. */
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (shown) return;
    const el = lovSec.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  /* The one pool of light that isn't on a timer: it follows the cursor,
     trailing rather than sticking to it, so it reads as a lamp being
     carried past the name rather than a dot glued to the pointer.

     It also lights what it passes. The pool itself is deliberately almost
     invisible; the thing a visitor actually notices is the ambient pool
     it comes near brightening, which is the `--near` each drifter reads.
     That means measuring the drifters, which is the one bit of this that
     costs anything — see MEASURE_EVERY.

     Written straight to the nodes' style out of a rAF — routing a
     pointermove through React state would re-render the whole page on
     every mouse pixel. */
  useEffect(() => {
    /* the listeners go on the stage, not the light — the light layer is
       pointer-events:none and would never see a move */
    const el = stage.current;
    if (reduced || !el) return;
    const layer = el.querySelector(".mast-light");
    const spot = el.querySelector(".mast-spot");
    const pools = [...layer.querySelectorAll("i")].map((n) => ({ n, cx: 0, cy: 0, near: 0 }));
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, away = true, tick = 0, reach = 600, off = false;

    /* The drifters are moved by a CSS animation, so their position is only
       knowable by asking layout — and a getBoundingClientRect is a layout
       flush. Four of them 60 times a second would be the most expensive
       thing on the page, and pointless: these pools cross the screen over
       20 seconds, so ten reads a second is already far finer than the
       motion. Between reads the falloff is computed against the last
       known centres, which is imperceptibly stale. */
    const MEASURE_EVERY = 6;
    const measure = () => {
      const r = el.getBoundingClientRect();
      /* scrolled past — the pointer can still be "inside" the hero as far
         as boundary events go, and there is no sense lighting a frame
         nobody is looking at */
      off = r.bottom <= 0 || r.top >= window.innerHeight;
      // how far the cursor's influence carries, in the frame's own terms
      reach = Math.max(r.width, r.height) * 0.5;
      pools.forEach((p) => {
        const b = p.n.getBoundingClientRect();
        p.cx = b.left + b.width / 2 - r.left;
        p.cy = b.top + b.height / 2 - r.top;
      });
    };

    const frame = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      if (tick++ % MEASURE_EVERY === 0) measure();
      /* Each drifter eases toward its own target brightness rather than
         snapping to it, so a fast mouse leaves a swell behind it instead
         of a flicker. `dark` is the resting state — pointer gone, or the
         hero scrolled away — and the ease carries the pools back down to
         it, which is why the loop keeps running for a moment after the
         cursor leaves rather than cutting. */
      const dark = away || off;
      let easing = false;
      pools.forEach((p) => {
        const d = Math.hypot(x - p.cx, y - p.cy);
        const want = dark ? 0 : Math.max(0, 1 - d / reach);
        p.near += (want - p.near) * 0.07;
        p.n.style.setProperty("--near", p.near.toFixed(3));
        if (Math.abs(want - p.near) > 0.004) easing = true;
      });

      const settled = Math.abs(tx - x) < 0.4 && Math.abs(ty - y) < 0.4;
      raf = (dark && settled && !easing) ? 0 : requestAnimationFrame(frame);
    };
    const move = (e) => {
      /* Asked of the event, not of a media query: a touch-screen laptop
         answers `pointer: coarse` to matchMedia even while a mouse is
         driving it, which switched the spotlight off on exactly the
         machines that have a cursor to follow. A finger still can't
         drag the light around — it just isn't pointerType "mouse". */
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      /* Arriving — first load, or back from the tab next door. The light
         is placed under the cursor before it is lit, so it fades up where
         the pointer actually is instead of sweeping in from wherever it
         was left. This has to run on every arrival, not just the first
         one: gating it on a seen-once flag left the light dark for the
         rest of the visit once the pointer had wandered off. */
      if (away) {
        away = false;
        x = tx; y = ty;
        spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        layer.dataset.spot = "on";
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const leave = () => { away = true; layer.dataset.spot = ""; };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* image parallax + hover zoom, owned by GSAP and scoped to this page
     so the ScrollTriggers are torn down when we navigate away. */
  useGSAP(() => {
    if (reduced) return;
    gsap.utils.toArray("[data-par]").forEach((el) => {
      const shot = el.closest(".shot") || el;
      gsap.set(el, { scale: 1.14, transformOrigin: "50% 50%" });
      gsap.fromTo(el, { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: shot, start: "top bottom", end: "bottom top", scrub: true },
      });
      const zoom = gsap.quickTo(el, "scale", { duration: 0.6, ease: "power2.out" });
      shot.addEventListener("pointerenter", () => zoom(1.19));
      shot.addEventListener("pointerleave", () => zoom(1.14));
    });

    /* The brand reveal: extra height on the section, a sticky child,
       progress read from how far the section has been scrolled — and
       what it drives is type size rather than travel.

       The zoom is geometric (start × ratio^p), not linear: a linear
       interpolation from 3000px to 130px spends its first half between
       3000 and 1500, which are the same picture, and then crosses the
       readable sizes in a blink. Multiplying by a constant factor each
       frame is what makes the rate of zoom look even.

       This runs on phones too. It is a tall section with a sticky child,
       so it scrolls natively and stays under the visitor's thumb — the
       thing worth refusing on a phone is a hijacked scroll direction,
       which this isn't. Reduced motion has returned above, leaving the
       CSS default (--p: 1), which is the settled end state. */
    const lov = lovSec.current;
    const stage = lovStage.current;
    let lovDist = 0, lovTop = 0, lovWipe = null;

    /* The run is now two acts inside one sticky frame. The first is the
       zoom that turns the collage into the word; the second holds that
       word on screen and brings the sentence up underneath it. So the
       progress the section reports is split: `z` drives the zoom over
       the opening ZOOM_END of it, and `c` drives the copy over the tail.
       The word does not leave — it lifts a little to make the room. */
    const ZOOM_END = 0.62;  // the word has fully resolved by here
    const COPY_IN = 0.68;   // ...and the sentence starts arriving here
    const COPY_FULL = 0.92;
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

    const paint = (p) => {
      const vw = window.innerWidth;
      const z = clamp01(p / ZOOM_END);
      // one glyph fills the screen at the start; a headline at the end
      const from = vw * 2.2;
      const to = Math.max(56, Math.min(130, vw * 0.09));
      stage.style.setProperty("--fs", `${from * (to / from) ** z}px`);
      /* the handover, in the last fifth of the zoom: the picture inside
         the letters goes out as flat ink comes in, so the act ends on type */
      const ink = clamp01((z - 0.78) / 0.16);
      stage.style.setProperty("--ink-o", ink.toFixed(3));
      stage.style.setProperty("--shot-o", (1 - ink).toFixed(3));
      /* The opening: the surround is eaten from the edges inward, so the
         collage is whole, then closing, then only the letters. 1.2 is
         where the gradient's solid core still clears the corners of the
         frame (the box's corner sits 0.707 out, and the core is 0.62 of
         the radius); 0 is gone. The last thing to go is the middle of the
         screen, which is the one place a hole appearing out of nowhere
         would be noticed. */
      const wipe = 1 - clamp01((z - 0.06) / 0.3);
      if (lovWipe) lovWipe.setAttribute("r", (1.2 * wipe).toFixed(4));

      /* Act two. The copy fades up from below and the word rises out of
         the middle to clear the space for it — a fraction of the stage's
         own height, so the two stay apart at any viewport. It starts
         after `ink` has finished, so the sentence never arrives over a
         word that is still a photograph. */
      const c = clamp01((p - COPY_IN) / (COPY_FULL - COPY_IN));
      const ease = c * c * (3 - 2 * c);   // smoothstep, so it settles
      stage.style.setProperty("--copy-o", ease.toFixed(3));
      stage.style.setProperty("--lift", `${(-ease * stage.clientHeight * 0.17).toFixed(1)}px`);
    };
    const lovScroll = () => {
      if (!lov || !stage || lovDist <= 0) return;
      /* the stage sticks under the bar, not at the top of the screen, so
         the run starts when the section reaches the bar — not a viewport
         edge the section never touches */
      const top = lov.getBoundingClientRect().top;
      paint(Math.min(Math.max((lovTop - top) / lovDist, 0), 1));
    };
    const lovMeasure = () => {
      if (!lov || !stage) return;
      /* Three screens, not two. Two was the whole budget when the run
         ended on the word; the same two now buy the zoom (it is
         ZOOM_END of the total) and the third pays for reading the
         sentence that arrives after it. */
      const box = stage.getBoundingClientRect();
      lovWipe = stage.querySelector("#lov-wipe");
      lovTop = parseFloat(getComputedStyle(root.current).getPropertyValue("--bar-h")) || 0;
      lovDist = Math.round(window.innerHeight * 3);
      lov.style.height = `${Math.round(box.height) + lovDist}px`;
      lovTiles(box);
      lovScroll();
    };
    /* The mosaic. Written as px attributes rather than percentages because
       each tile is inset by a pixel, so the stage's rule colour shows
       through as the same hairline the collage grid draws — and because
       CSS geometry properties (x/y/width/height on SVG) aren't safe across
       browsers, which rules out doing the breakpoint in a media query. */
    const TILES_WIDE = [
      [0, 0, 2 / 3, 2 / 3], [2 / 3, 0, 1 / 3, 2 / 3], [0, 2 / 3, 1 / 3, 1 / 3],
      [1 / 3, 2 / 3, 1 / 3, 1 / 3], [2 / 3, 2 / 3, 1 / 3, 1 / 3],
    ];
    // a phone gets two columns and one frame fewer — five on a 390px screen
    // are stamps, and the point of the canvas is seeing the work
    const TILES_NARROW = [
      [0, 0, 1, 1 / 3], [0, 1 / 3, 1 / 2, 1 / 3], [1 / 2, 1 / 3, 1 / 2, 1 / 3],
      [0, 2 / 3, 1, 1 / 3], null,
    ];
    const lovTiles = ({ width: w, height: h }) => {
      stage.querySelectorAll(".lov-open, .lov-bed").forEach((r) => {
        r.setAttribute("width", w);
        r.setAttribute("height", h);
      });
      const plan = window.matchMedia("(max-width: 720px)").matches ? TILES_NARROW : TILES_WIDE;
      stage.querySelectorAll(".lov-tile").forEach((el, i) => {
        const t = plan[i];
        if (!t) { el.style.display = "none"; return; }
        el.style.display = "";
        el.setAttribute("x", t[0] * w + 1);
        el.setAttribute("y", t[1] * h + 1);
        el.setAttribute("width", Math.max(0, t[2] * w - 2));
        el.setAttribute("height", Math.max(0, t[3] * h - 2));
      });
    };

    lovMeasure();
    // the webfont lands after first paint and changes the stage's height,
    // so the run is measured again once it has
    const settle = window.setTimeout(lovMeasure, 400);
    window.addEventListener("scroll", lovScroll, { passive: true });
    window.addEventListener("resize", lovMeasure);

    ScrollTrigger.refresh();
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", lovScroll);
      window.removeEventListener("resize", lovMeasure);
      if (lov) lov.style.height = "";
    };
    /* `shown` is in here because the mosaic's tiles mount when the
       observer above fires, and a tile with no geometry attributes is a
       tile with no size — the driver has to run again to lay them out. */
  }, { scope: root, dependencies: [reduced, shown] });

  return (
    <motion.div ref={root} variants={page} initial="initial" animate="animate">
      {/* masthead — the studio name opens the page and gets out of the
          way; what stays is the one thing a visitor needs, which craft
          this is. Everything that used to crowd it in here now has its
          own room in .intro-sec below. */}
      <header className="mast" id="main">
        <div className="mast-stage" ref={stage}>
          {/* light behind the copy — three pools drifting on their own slow
              cycles, and one that follows the cursor. See .mast-light. */}
          <div className="mast-light" aria-hidden="true">
            <i /><i /><i />
            <span className="mast-spot" />
          </div>

          <div className="wrap">
            <div className="mast-copy">
              {/* the name swells out of this row and the roles take it over,
                  so the two share one line — see .mast-swell */}
              <div className="mast-line">
                <h1 className={`display${reduced ? "" : " mast-swell"}`}>{P.name}</h1>
                {/* the three crafts, written out one after the other */}
                <div className="mast-roles hero-reveal" style={{ "--rd": `${ROLES_IN}s` }}>
                  <Typewriter words={ROLES} delay={reduced ? 0 : ROLES_TYPE} />
                </div>
              </div>

              <p className="mast-sub hero-reveal" style={{ "--rd": `${SUB_IN}s` }}>
                {/* the sentence carries its own quote marks — see
                    .mast-quote for why they can't sit on the paragraph */}
                <span className="mast-quote">Simplicity is the ultimate sophistication.</span>
                <span className="mast-sub-by mono">— Leonardo da Vinci</span>
              </p>
            </div>
          </div>

          {/* A small, always-visible cue makes the first scroll feel
              intentional. It is an ordinary anchor, so it remains useful
              with JavaScript or motion disabled. */}
          <a className="mast-scroll mono" href="#intro">
            <span>Scroll to explore</span>
            <i aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* The two practices. Four words, because the two doors under them
          already name the crafts and the collage below already spells
          out lensofviraj — so the only thing left for this line to say
          is the thing the doors can't: that one person does both.

          It used to be four sentences doing that job, and the last of
          them ("Hire either. Hiring both is the point.") was the kind of
          line every studio site has. */}
      <section className="intro-sec" id="intro" aria-label="Practices">
        <div className="wrap">
          <Reveal>
            <p className="standfirst">
              One pair of <span className="serif">hands</span>.
            </p>
            <div className="drawline" />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="disciplines">
              {INTRO.does.map((d) => (
                <TLink key={d.to} to={d.to} className="disc">
                  <strong>{d.t}</strong>
                  <span className="mono go">Enter <span className="arrow">→</span></span>
                </TLink>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* a room's width of quiet before the work starts */}
      {/* design — one prototype at a time, the project names as the
          switch. See DesignShowcase below for why it is not a grid. */}
      {HAS_REAL_WEB ? (
        <DesignShowcase />
      ) : (
        <section className="csec" id="design">
          <div className="wrap">
              <CenterHead
                title={<>The design work is <span className="serif">on its way</span>.</>}
                sub="This space is held for the design side: identities, layouts and product prototypes. Projects appear here as they are published."
                cta={
                  <TLink to="/design" className="extlink">
                    Design work <span className="arrow">→</span>
                  </TLink>
                }
              />
          </div>
        </section>
      )}

      {/* One screen of frames that becomes the brand. It opens as the
          collage — five photographs, exactly the visible page — and as the
          section is scrolled through, everything outside the letterforms
          goes black and the word shrinks out of the picture to a headline.

          One canvas, masked. Not a picture plus a second copy of itself
          clipped to the type: that is two layers to keep in registration,
          and it reads as two images however carefully they are aligned.
          The mask means what is inside the letters and what is outside are
          the same pixels. Driven from the useGSAP block above. */}
      {COLLAGE.length > 0 && (
        <section className="lov" ref={lovSec} aria-label="Frames">
          <div className="lov-stage" ref={lovStage}>
            <svg className="lov-svg" role="img" focusable="false"
              aria-label={`${COLLAGE_WORD} — selected frames`}>
              <defs>
                {/* The opening is a wipe, not a fade. Fading the surround out
                    dims the whole picture uniformly on the way, and a
                    half-strength copy of the same photograph behind the
                    letters makes them read as translucent even though they
                    are at full strength throughout. Closing this circle in
                    from the edges instead means every pixel is either the
                    photograph at 100% or black — nothing is ever a haze. */}
                <radialGradient id="lov-wipe" r="1.2">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="0.62" stopColor="#fff" />
                  <stop offset="0.82" stopColor="#000" />
                </radialGradient>
                {/* the id is document-wide: this section is rendered once, on
                    the home page. Two of them would collide. */}
                <mask id="lov-mask" maskUnits="userSpaceOnUse">
                  {/* white means "show everything" — so this is the surround,
                      shrinking, and the text below is what stays behind */}
                  <rect className="lov-open" fill="url(#lov-wipe)" />
                  <text className="lov-cut" x="50%" y="50%" fill="#fff"
                    textAnchor="middle" dominantBaseline="central">{COLLAGE_WORD}</text>
                </mask>
              </defs>
              {/* slice is SVG's object-fit: cover, so each frame crops to its
                  tile exactly as the collage grid crops it */}
              <g className="lov-canvas" mask="url(#lov-mask)">
                {/* the hairlines between frames, showing through the 1px
                    inset on each tile. Inside the mask, not behind it: it
                    belongs to the picture, and as the stage background it
                    made everything the mask takes away a lifted grey
                    instead of the page's black. */}
                <rect className="lov-bed" fill="var(--rule)" />
                {shown && COLLAGE.map((f, i) => (
                  <image key={f.seed} className={`lov-tile lov-t${i + 1}`}
                    href={img(f.seed, 2000, 1250)} preserveAspectRatio="xMidYMid slice" />
                ))}
              </g>
              {/* the same word, same size, same place — flat ink, faded in as
                  the run settles. aria-hidden: the svg's label already says it */}
              <text className="lov-cut lov-ink" x="50%" y="50%" aria-hidden="true"
                textAnchor="middle" dominantBaseline="central">{COLLAGE_WORD}</text>
            </svg>

            {/* Act two, inside the same sticky frame: the word stays put
                and this comes up underneath it. There is no kicker on
                this header — the collage's own word is the kicker, and
                repeating it here would be the second "Photography" on
                one screen. Opacity and lift are driven by --copy-o from
                paint() above. */}
            <div className="lov-copy">
              <div className="wrap">
                {/* The kicker only appears under reduced motion. Normally
                    the collage's own word is the kicker and printing it
                    again here would be two "Photography"s on one screen —
                    but with motion off the zoom never runs, the word is
                    never cut out of the frames, and then this header does
                    have to name its own section. */}
                {/* still: this lockup's visibility is already driven by
                    the collage run's own scroll progress (--copy-o), and
                    a reveal timeline fighting that would flicker */}
                <CenterHead
                  still
                  kicker={reduced ? "Photography" : undefined}
                  title={PHOTO_COPY.title}
                  sub={PHOTO_COPY.sub}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* photography — one card per collection, opening the gallery view */}
      <PhotoProjects />

      {/* the studio line — a quiet full-width statement between the work
          and the offer */}
      <section className="statement">
        <div className="wrap">
          {/* the two sentences arrive one after the other rather than as
              one block — they are already separate lines, and the second
              is the answer to the first */}
          <Reveal as="p" sel=".st-line" stagger={0.14} y={22}>
            {TAGLINE.split(". ").map((s, i, a) => (
              <span className="st-line" key={i}>{s}{i < a.length - 1 ? "." : ""}</span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* what a client walks away with — framed on the two crafts Viraj
          does himself: photography and design. Four items, so .cgrid-2:
          two full rows, no stagger and no odd card out. */}
      <section className="csec">
        <div className="wrap">
          <CenterHead
            title={<><span className="serif">Finished</span> work, handed over.</>}
            sub="The same standard on both halves of the job — what leaves here is ready to use, in the sizes and the files you need."
          />
          <Timeline items={INTRO.offer} />
        </div>
      </section>

      {/* testimonials — client words, right before the closing CTA */}
      <Testimonials />

      {/* end */}
      <section className="end" id="contact">
        <div className="wrap">
          <Reveal>
            <h2 className="display">
              Bring me<br />the <span className="serif">difficult</span> one.
            </h2>
            <p className="standfirst" style={{ marginTop: 20 }}>
              Tell me about the shoot, the site, or both. A few lines is enough to start.
            </p>
            <div className="end-cta">
              <button type="button" className="extlink" onClick={openContact}>
                Contact me <span className="arrow">→</span>
              </button>
            </div>
          </Reveal>

          <Colophon />
        </div>
      </section>
    </motion.div>
  );
}

/* ==================================================================
   DESIGN SHOWCASE — one prototype at a time, names as the switch.

   This replaced a three-up grid of project cards, and the reason was
   the copy rather than the layout. intro, tag, role and tool are the
   same placeholder string on every entry in WEB_PROJECTS and year is
   empty, so three cards side by side differed only in their title and
   read as one card printed three times — with "Figma" appearing nine
   times across the row, which the copy rule in CLAUDE.md forbids
   outright. One project on screen fixes that without a word being
   invented, because there is nothing left to repeat, and it hands the
   whole column to a single prototype instead of splitting it in three.

   ONLY THE PROJECTS THAT HAVE BEEN LOOKED AT ARE MOUNTED. A Figma
   embed is an iframe loading a whole editor runtime; three of them on
   the home page is three of those, and two would have been for
   prototypes nobody had asked to see. `seen` grows as tabs are visited
   and panels are never unmounted after that — so the first paint costs
   one embed, and going back to a project already looked at is instant
   rather than a reload.
   ================================================================== */
function DesignShowcase() {
  const items = WEB_PROJECTS.slice(0, 3);
  const [at, setAt] = useState(0);
  // which panels exist in the DOM — the active one plus everything
  // already visited. Never shrinks; see the note above.
  const [seen, setSeen] = useState(() => new Set([0]));
  const tabs = useRef(null);

  const go = (n) => {
    const i = (n + items.length) % items.length;
    setAt(i);
    setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
  };

  /* Roving arrow keys, the standard tablist behaviour. Without it the
     row is a mouse-only control: Tab alone lands on each button but
     never changes the panel, and the arrow keys — which is what anyone
     using a keyboard reaches for on tabs — do nothing at all. */
  const onKey = (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = (at + d + items.length) % items.length;
    go(i);
    tabs.current?.children[i]?.focus();
  };

  if (!items.length) return null;
  const shape = items[at]?.shape === "phone" ? "phone" : "wide";

  return (
    <section className="csec dshow" id="design" data-shape={shape}>
      {/* the header keeps the reading measure; the work below it gets
          the wide column — see .wrap-wide */}
      <div className="wrap">
        {/* same lockup as the photography one: the section's word in the
            italic, the headline plain under it, the description in
            Inter. The headline gives up its own italic word — the kicker
            is the one italic in the header. No <Reveal> around it:
            CenterHead reveals its own rungs in order. */}
        <CenterHead
          kicker="Design"
          title="Prototyped, not mocked up."
          sub="Every screen wired and made clickable in Figma before a line of code exists — tested against real flows, specced and ready for a developer to pick up."
        />
      </div>

      <div className="wrap wrap-wide">
        <Reveal>
          <div className="dshow-tabs" role="tablist" aria-label="Design projects"
            ref={tabs} onKeyDown={onKey}>
            {items.map((w, i) => (
              <button key={w.slug} type="button" role="tab" className="dshow-tab"
                aria-selected={i === at} aria-controls={`dshow-${w.slug}`}
                /* only the active tab is a tab stop — Tab moves past the
                   row, the arrows move within it */
                tabIndex={i === at ? 0 : -1}
                onClick={() => go(i)}>
                {w.t}
              </button>
            ))}
          </div>

          <div className="dshow-stage">
            {items.map((w, i) => (!seen.has(i) ? null : (
              <div className="dshow-panel" key={w.slug} id={`dshow-${w.slug}`}
                role="tabpanel" data-on={i === at ? "1" : "0"}
                aria-label={w.t}
                /* the inactive panels are still painted (they are
                   crossfaded, not swapped) so they have to be taken out
                   of the accessibility tree by hand, and their link out
                   of the tab order — see tabIndex on the TLink below */
                aria-hidden={i === at ? undefined : "true"}>
                <TLink to={`/design/${w.slug}`} className="wcard"
                  aria-label={`Open ${w.t}`} tabIndex={i === at ? 0 : -1}>
                  <div className="browser">
                    <div className="browser-bar">
                      <span className="browser-dots" aria-hidden="true"><i /><i /><i /></span>
                      {/* the bar carries the name and nothing else. It used
                          to end with {w.year || w.tool}, and with year empty
                          on every project that was a second "Figma" a few
                          centimetres from the first. */}
                      <span className="browser-url mono">
                        {w.embed ? `${w.t} · Figma prototype` : `${w.slug}.com`}
                      </span>
                    </div>
                    {hasPhoto(w.cover) ? (
                      <div className="browser-view">
                        {/* the stage is either a 460px phone column or the
                            full 1340px wide column — see .dshow[data-shape] */}
                        <img src={img(w.cover, 1600)} srcSet={srcSet(w.cover)}
                          sizes="(min-width: 900px) 1284px, 92vw"
                          alt={`${w.t} full page`} loading="lazy" />
                      </div>
                    ) : w.embed && w.href ? (
                      <FigmaFrame w={w} />
                    ) : (
                      <div className="browser-ph">
                        <span className="browser-ph-name">{w.t}</span>
                        <span className="mono">{w.tag}</span>
                      </div>
                    )}
                  </div>
                </TLink>
              </div>
            )))}
          </div>

          {/* the call to action moves below the work — after you have seen
              something, rather than before */}
          <div className="dshow-cta">
            <TLink to="/design" className="extlink">
              All designs <span className="arrow">→</span>
            </TLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ==================================================================
   TESTIMONIALS — three cards that hold, then slide one place left.

   The rhythm is hold → slide → hold: the row sits still long enough to
   read a quote (HOLD_MS), then travels exactly one card in SLIDE_MS, so
   the middle card takes the left position, the right one takes the
   middle, and a new card arrives from the right. It is not a conveyor —
   copy moving under the eye can't be read, which is what a continuous
   drift got wrong.

   IT NEVER RUNS BACKWARDS, and that is what the repeated markup is for.
   Stepping forward forever means that at the last quote the row would
   have to return to the first, and every way of doing that shows:
   scrolling back is the whole row reversing, jumping back is a stutter.
   So the list is repeated — `copies` of it, enough to overflow the rail
   twice — and the position is written out modulo the width of one copy.
   Passing the end of a copy lands on the identical frame at the start
   of the next, so there is nothing to see.

   `pos` is therefore kept UNBOUNDED and only wrapped at the moment it
   is written to scrollLeft. Wrapping it in place would put a
   discontinuity inside the slide, and a tween across it would run the
   row backwards through the whole rail to get to a position one card
   ahead. It is renormalised by whole copies once a step completes,
   which keeps it small without ever moving it mid-tween.

   One rAF owns scrollLeft, so the slide, the arrows and a drag cannot
   write over each other. It also ADOPTS scroll it did not cause — a
   trackpad swipe, a touch fling, a Tab onto an off-screen card — by
   comparing against the last value it wrote itself.
   ================================================================== */
const HOLD_MS = 5500;   // how long a set of three stays still to be read
const SLIDE_MS = 720;   // the travel itself: one card, ease-in-out

const wrap = (v, m) => ((v % m) + m) % m;
// slow at both ends, quickest in the middle — a slide, not a drift
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function Testimonials() {
  const rail = useRef(null);
  const [reduced] = useState(prefersReduced);
  /* Enough repeats of the list to fill the rail and still have a whole
     copy in hand to wrap into. Measured, because it depends on the card
     width and the viewport — two copies is right on a desktop, more if
     someone cuts TESTIMONIALS down to one quote. */
  const [copies, setCopies] = useState(2);
  /* None of these are state: they are read and written inside one rAF,
     and a re-render per frame is exactly what this is avoiding. */
  const pos = useRef(0);       // px along the repeated row, unbounded
  const wrote = useRef(-1);    // the last scrollLeft we set ourselves
  const tween = useRef(null);  // { from, to, start } while a slide runs
  const nextAt = useRef(0);    // when the next slide is due
  const held = useRef(false);  // someone is reading or dragging: hold

  const n = TESTIMONIALS.length;

  /* one card plus one gutter — measured, not assumed, because the card's
     flex-basis and the gap are both clamps that change with the viewport */
  const step = useCallback(() => {
    const r = rail.current;
    const first = r?.firstElementChild;
    if (!first) return 0;
    const gap = parseFloat(getComputedStyle(r).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  }, []);

  /* Start a slide to the next card boundary in `dir`. Measured off the
     tween's destination rather than the live position, so pressing an
     arrow twice quickly queues two cards instead of the second press
     re-targeting the card the first one is still travelling through. */
  const slide = useCallback((dir) => {
    const s = step();
    if (!s) return;
    const base = tween.current ? tween.current.to : pos.current;
    tween.current = {
      from: pos.current,
      to: Math.round(base / s) * s + dir * s,
      start: performance.now(),
    };
  }, [step]);

  // how many copies it takes to cover the rail and leave one to wrap into
  useEffect(() => {
    const fit = () => {
      const r = rail.current;
      const s = step();
      if (!r || !s || !n) return;
      setCopies(Math.max(2, Math.ceil(r.clientWidth / (s * n)) + 1));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [step, n]);

  /* The loop. Runs only while the section is on screen — a rAF nobody is
     looking at is a phone's battery burning below the fold. */
  useEffect(() => {
    const r = rail.current;
    if (!r || !n) return;
    let raf = 0, vis = true;
    nextAt.current = performance.now() + HOLD_MS;

    const io = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([e]) => {
          vis = e.isIntersecting;
          /* Coming back into view restarts the hold rather than firing
             the slide that came due while the section was off screen —
             otherwise scrolling down to it is met with a card already
             moving, which reads as the page glitching. */
          if (vis) nextAt.current = performance.now() + HOLD_MS;
        }, { threshold: 0 })
      : null;
    io?.observe(r);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const s = step();
      const span = s * n;
      if (!span) return;

      /* scroll we did not cause — trackpad, touch, focus — is adopted
         rather than fought. Rebased into pos's own cycle so the row
         carries on from where the hand left it instead of leaping a
         whole copy. > 1.5px because scrollLeft is rounded to device
         pixels and our own write comes back a fraction off. */
      if (wrote.current >= 0 && Math.abs(r.scrollLeft - wrote.current) > 1.5) {
        pos.current += r.scrollLeft - wrap(pos.current, span);
        tween.current = null;
        nextAt.current = now + HOLD_MS;
      }

      if (tween.current) {
        const { from, to, start } = tween.current;
        const k = reduced ? 1 : Math.min(1, (now - start) / SLIDE_MS);
        pos.current = from + (to - from) * easeInOut(k);
        if (k >= 1) {
          pos.current = to;
          tween.current = null;
          nextAt.current = now + HOLD_MS;
          // renormalise between steps, never during one
          if (pos.current >= span) pos.current -= span;
          else if (pos.current < 0) pos.current += span;
        }
      } else if (!held.current && !reduced && vis && now >= nextAt.current) {
        slide(1);
      }

      const next = wrap(pos.current, span);
      if (Math.abs(next - wrote.current) > 0.01) {
        r.scrollLeft = next;
        wrote.current = r.scrollLeft;
      }
    };

    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); io?.disconnect(); };
  }, [step, n, reduced, slide]);

  /* Mouse drag. A finger already throws this rail around natively;
     without this a mouse could only use the arrows, which is the poorer
     half of the interaction on the machines that have a cursor.

     Mouse and primary button only — a pen or a touch would otherwise get
     this handler AND the browser's own panning, and travel twice as far
     as the hand did. Releasing settles onto the nearest card rather than
     leaving the row parked between two. */
  useEffect(() => {
    const r = rail.current;
    if (!r) return;
    let id = null, x0 = 0, from = 0;

    const down = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      id = e.pointerId; x0 = e.clientX; from = pos.current;
      held.current = true;
      tween.current = null;
      r.dataset.drag = "on";
      r.setPointerCapture(id);
    };
    const move = (e) => {
      if (e.pointerId !== id) return;
      e.preventDefault();
      pos.current = from - (e.clientX - x0);
    };
    const up = (e) => {
      if (e.pointerId !== id) return;
      id = null; held.current = false;
      delete r.dataset.drag;
      const s = step();
      // settle on a card, and give the reader a full hold before moving
      if (s) tween.current = { from: pos.current, to: Math.round(pos.current / s) * s, start: performance.now() };
    };

    r.addEventListener("pointerdown", down);
    r.addEventListener("pointermove", move);
    r.addEventListener("pointerup", up);
    r.addEventListener("pointercancel", up);
    return () => {
      r.removeEventListener("pointerdown", down);
      r.removeEventListener("pointermove", move);
      r.removeEventListener("pointerup", up);
      r.removeEventListener("pointercancel", up);
    };
  }, [step]);

  if (!n) return null;
  const hold = () => { held.current = true; };
  const release = () => { held.current = false; nextAt.current = performance.now() + HOLD_MS; };

  return (
    <section className="csec" aria-label="Client words">
      <div className="wrap">
        {/* Headline only, and a size down: here the headline introduces
            the block rather than carrying it — the quotes underneath are
            what the visitor came to read. */}
        <CenterHead small title={<><span className="serif">Read</span> what people say</>} />
      </div>

      <div className="wrap wrap-wide">
        <Reveal>
          {/* tabIndex: a scroll container is only keyboard-scrollable
              once it can hold focus, and the arrows below are a mouse
              affordance rather than the whole of the interaction */}
          <div className="tmon-rail" ref={rail}
            tabIndex={0} aria-label="Client words, scrollable"
            onPointerEnter={hold} onPointerLeave={release}
            onFocus={hold} onBlur={release}>
            {Array.from({ length: copies }, (_, c) =>
              TESTIMONIALS.map((t, i) => (
                /* Only the first copy is real to a screen reader. The
                   rest exist so the row has somewhere to wrap to, and
                   reading four quotes three times over is not a
                   carousel, it is a stutter. */
                <figure className="tcard" key={`${c}-${i}`} data-tone={i % 4}
                  aria-hidden={c > 0 ? "true" : undefined}>
                  <blockquote>{t.q}</blockquote>
                  <figcaption className="mono tcard-by">{t.by}</figcaption>
                </figure>
              )),
            )}
          </div>
        </Reveal>

        {/* No disabled state: the row is a loop, so there is always a
            next and always a previous. */}
        <div className="tmon-nav">
          <button type="button" aria-label="Previous quotes" onClick={() => slide(-1)}>
            <Chevron dir="left" />
          </button>
          <button type="button" aria-label="Next quotes" onClick={() => slide(1)}>
            <Chevron dir="right" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/* ==================================================================
   PHOTOGRAPHY — one card per collection (wildlife / traditional / …),
   each opening its full gallery at /photography/:slug. The card just
   names the set and its size; the frames themselves live on the
   collection page rather than being previewed here.
   ================================================================== */
function PhotoProjects() {
  // no collections synced yet — nothing to name or link to
  if (!PHOTO_PROJECTS.length) return null;
  return (
    <section className="gwork" id="gallery" aria-label="Photography">
      {/* Normally this section opens straight onto the collections: the
          header for it is the .lov canvas above, which holds the word
          "photography" on screen and brings the sentence up underneath
          it inside its own sticky frame. With no photographs there is no
          collage to carry that, so the same copy is rendered here as an
          ordinary header — and only then does it need the kicker back. */}
      {COLLAGE.length === 0 && (
        <div className="wrap">
          <CenterHead kicker="Photography" title={PHOTO_COPY.title} sub={PHOTO_COPY.sub} />
        </div>
      )}

      {/* the frames get the wide column; the copy above keeps the
          reading measure — see .wrap-wide */}
      <div className="wrap wrap-wide">
        {/* Collections are published from Contentful, so how many there
            are is not knowable here — gridCols picks the column count
            that divides them exactly rather than letting auto-fit strand
            the last card alone in a half-empty row. */}
        <div className={`cgrid cgrid-${gridCols(PHOTO_PROJECTS.length)}`}>
          {PHOTO_PROJECTS.map((p, n) => {
            /* One frame in one fixed box, exactly as /photography's stack
               does it. Each cover used to carry its own aspect ratio, and
               a landscape one got a second frame stacked under it to make
               up the height — which meant no two cards in the row were
               ever the same shape or the same height, and the titles
               landed at three different places along the bottom.
               projectCover picks a landscape frame where the collection
               has one, so the 4/3 box crops as little as possible. */
            const cover = projectCover(p);
            return (
            <Reveal key={p.slug} delay={n * 0.06}>
              <TLink to={`/photography/${p.slug}`} className="projcard" aria-label={`Open ${p.t}`}>
                <div className="projshot">
                  <img src={img(cover, 900, 675)} srcSet={srcSet(cover)}
                    sizes="(max-width: 900px) 100vw, 33vw"
                    alt={p.t} loading="lazy" />
                  <span className="open">{p.photos.length} frames →</span>
                </div>
                <div className="projcap">
                  <h3>{p.t}</h3>
                </div>
              </TLink>
            </Reveal>
            );
          })}
        </div>

        {/* below the work, same as the design section's — the beat above
            is a statement and a call to action would have undercut it */}
        <div className="dshow-cta">
          <TLink to="/photography" className="extlink">
            All collections <span className="arrow">→</span>
          </TLink>
        </div>
      </div>
    </section>
  );
}
