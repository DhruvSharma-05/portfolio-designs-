import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import {
  P, img, srcSet, ratio, isLandscape, INTRO, TESTIMONIALS, TAGLINE, COLLAGE,
  PHOTO_PROJECTS, WEB_PROJECTS, HAS_REAL_WEB, hasPhoto, prefersReduced, ROLES,
} from "../data.js";
import { Reveal, TLink, FigmaFrame, Typewriter } from "../ui.jsx";
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

/* ==================================================================
   WORK — the front page. Deliberately slim: hero, the categorised
   gallery, the photography projects, and the room reserved for the
   design work. Everything about the person lives on /about.
   ================================================================== */
export default function Home() {
  useSeo("", "Photographer and web designer in Vancouver. Portraits, events and visual stories, plus UI/UX and web design in Figma. Shot and designed by the same person.");
  const { openContact } = useApp();
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);
  const stage = useRef(null);
  const hsxSec = useRef(null);
  const hsxTrack = useRef(null);
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

    /* The design run. The section is given extra height equal to the
       track's overflow, its child sticks to the top of the screen, and
       the track is translated by however far the section has scrolled —
       so downward scrolling reads as sideways travel and the page's own
       scrollbar stays honest about how long the section is.

       A plain transform on scroll rather than a GSAP pin: a pin rewrites
       the surrounding layout, and this section sits between two others
       that already own ScrollTriggers. Reduced motion has already
       returned above, which leaves the flat layout in place. */
    const track = hsxTrack.current;
    const sec = hsxSec.current;
    let dist = 0;
    /* Must match the flat layout's media query exactly, or the two
       disagree and the section is left half-wired: the height is set for
       a run the CSS isn't laying out. The height condition is what keeps
       landscape phones — wide, but 390px tall — on the swipe row. */
    const wide = () => window.matchMedia("(min-width: 820px) and (min-height: 620px)").matches;

    const onScroll = () => {
      if (!track || !sec || dist <= 0 || !wide()) return;
      const top = sec.getBoundingClientRect().top;   // 0 once the section is pinned
      track.style.transform = `translate3d(${-Math.min(Math.max(-top, 0), dist)}px,0,0)`;
    };
    const measure = () => {
      if (!track || !sec) return;
      if (!wide()) { sec.style.height = ""; track.style.transform = ""; dist = 0; return; }
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      sec.style.height = `${window.innerHeight + dist}px`;
      onScroll();
    };
    /* The brand reveal. Same shape as the run above — extra height on the
       section, a sticky child, progress read from how far the section has
       been scrolled — but what it drives is type size rather than travel.

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
    let lovDist = 0, lovTop = 0;

    const paint = (p) => {
      const vw = window.innerWidth;
      // one glyph fills the screen at the start; a headline at the end
      const from = vw * 2.2;
      const to = Math.max(56, Math.min(130, vw * 0.09));
      stage.style.setProperty("--fs", `${from * (to / from) ** p}px`);
      /* the handover, in the last fifth: the picture inside the letters
         goes out as flat ink comes in, so the section ends on type */
      const ink = Math.min(Math.max((p - 0.78) / 0.16, 0), 1);
      stage.style.setProperty("--ink-o", ink.toFixed(3));
      stage.style.setProperty("--shot-o", (1 - ink).toFixed(3));
      /* The opening. The mask's rect starts white — the whole canvas shows,
         which is the collage — and fading it out is what blackens
         everything except the letterforms. Nothing moves; the picture is
         the same picture throughout. This is also the only way to get that
         first beat out of a 300-weight face: its strokes are far narrower
         than the screen, so zooming "inside" a letter the way a heavy face
         allows would show black, not photograph. */
      const open = 1 - Math.min(Math.max((p - 0.06) / 0.3, 0), 1);
      stage.style.setProperty("--open", open.toFixed(3));
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
      // two screens of scroll to cross the zoom — one is over before the
      // word is legible, three is a visitor wondering if the page is stuck
      const stageH = stage.getBoundingClientRect().height;
      lovTop = parseFloat(getComputedStyle(root.current).getPropertyValue("--bar-h")) || 0;
      lovDist = Math.round(window.innerHeight * 2);
      lov.style.height = `${Math.round(stageH) + lovDist}px`;
      lovTiles(stage.getBoundingClientRect());
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
      const rect = stage.querySelector(".lov-open");
      if (rect) { rect.setAttribute("width", w); rect.setAttribute("height", h); }
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

    const measureAll = () => { measure(); lovMeasure(); };
    const onScrollAll = () => { onScroll(); lovScroll(); };

    measureAll();
    // the Figma embeds and the webfont land after first paint and change
    // the track's width, so the run is measured again once they have
    const settle = window.setTimeout(measureAll, 400);
    window.addEventListener("scroll", onScrollAll, { passive: true });
    window.addEventListener("resize", measureAll);

    ScrollTrigger.refresh();
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScrollAll);
      window.removeEventListener("resize", measureAll);
      if (sec) sec.style.height = "";
      if (track) track.style.transform = "";
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
                Vancouver based designer who loves beautiful things and blends
                creativity and technology into every screen.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* the two practices — stated immediately under the hero, so a cold
          visitor still learns inside one scroll that this is two crafts */}
      <section className="intro-sec" id="intro" aria-label="Practices">
        <div className="wrap">
          <Reveal>
            <p className="standfirst">
              Two practices, one pair of hands. Photographs made as{" "}
              <strong>lensofviraj</strong>, and the sites they live on designed
              by the same person.
              <i> Hire either. Hiring both is the point.</i>
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

      {/* design — the projects run sideways: the section holds the screen
          while the track slides, so each one is read at full size instead
          of shrunk into a two-up grid. Driver is in the useGSAP above. */}
      {HAS_REAL_WEB ? (
        <section className="hsx" id="design" ref={hsxSec}>
          <div className="hsx-sticky">
            {/* No Reveal on these cards: they sit inside a sticky frame and
                never cross a scroll threshold of their own, so a scroll
                reveal would leave them at opacity 0 for the whole run. The
                sideways travel is their entrance. */}
            <div className="hsx-track" ref={hsxTrack}>
              {/* the section's name and the one line worth reading, standing
                  where the run starts. The name is the heading here — an h2,
                  not a kicker over one — so it takes the size and the ink,
                  and the line under it steps back (see HEADINGS LEAD). */}
              <div className="hsx-intro">
                <h2 className="mono hsx-label">Design</h2>
                <p className="hsx-title">Prototyped, not mocked up.</p>
              </div>

              {/* The cards are wrapped so a phone can scroll them on their
                  own, with the panel above stacked out of the way. On the
                  desktop run this wrapper is display:contents — the cards
                  go straight back into the track's flex row and the panel
                  travels with them, exactly as if it weren't here. */}
              <div className="hsx-row">
              {WEB_PROJECTS.slice(0, 3).map((w) => (
                <TLink key={w.slug} to={`/design/${w.slug}`} className="wcard hsx-card"
                  aria-label={`Open ${w.t}`}>
                  <div className="browser">
                    <div className="browser-bar">
                      <span className="browser-dots" aria-hidden="true"><i /><i /><i /></span>
                      <span className="browser-url mono">
                        {w.embed ? `${w.t} · Figma prototype` : `${w.slug}.com`}
                      </span>
                      <span className="mono" style={{ opacity: 0.5 }}>{w.year || w.tool}</span>
                    </div>
                    {hasPhoto(w.cover) ? (
                      <div className="browser-view">
                        <img src={img(w.cover, 1200, reduced ? 825 : 2100)} srcSet={srcSet(w.cover)}
                          sizes="(max-width: 819px) 84vw, 720px"
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
                  <div className="wcard-cap">
                    <div>
                      <h3>{w.t}</h3>
                      <p>{w.intro}</p>
                    </div>
                    <span className="tool-badge mono">{w.tool}</span>
                  </div>
                </TLink>
              ))}

                <div className="hsx-more">
                  <TLink to="/design" className="extlink">
                    All design work <span className="arrow">→</span>
                  </TLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="sec" id="design">
          <div className="wrap sec-grid">
            <div className="sec-label mono">Design</div>
            <div>
              <Reveal className="reserved">
                <span className="mono">Reserved</span>
                <h3>The design work is on its way.</h3>
                <p>
                  This space is held for the design side: identities, layouts
                  and product prototypes. Projects appear here as they are
                  published.
                </p>
                <TLink to="/design" className="extlink">
                  Design work <span className="arrow">→</span>
                </TLink>
              </Reveal>
            </div>
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
              aria-label={`${P.photoBrand} — selected frames`}>
              <defs>
                {/* the id is document-wide: this section is rendered once, on
                    the home page. Two of them would collide. */}
                <mask id="lov-mask" maskUnits="userSpaceOnUse">
                  {/* the opening — white means "show everything". Fading it
                      out is what blackens the surround and leaves the
                      letters behind, without ever moving the picture. */}
                  <rect className="lov-open" fill="#fff" />
                  <text className="lov-cut" x="50%" y="50%" fill="#fff"
                    textAnchor="middle" dominantBaseline="central">{P.photoBrand}</text>
                </mask>
              </defs>
              {/* slice is SVG's object-fit: cover, so each frame crops to its
                  tile exactly as the collage grid crops it */}
              <g className="lov-canvas" mask="url(#lov-mask)">
                {shown && COLLAGE.map((f, i) => (
                  <image key={f.seed} className={`lov-tile lov-t${i + 1}`}
                    href={img(f.seed, 2000, 1250)} preserveAspectRatio="xMidYMid slice" />
                ))}
              </g>
              {/* the same word, same size, same place — flat ink, faded in as
                  the run settles. aria-hidden: the svg's label already says it */}
              <text className="lov-cut lov-ink" x="50%" y="50%" aria-hidden="true"
                textAnchor="middle" dominantBaseline="central">{P.photoBrand}</text>
            </svg>
          </div>
        </section>
      )}

      {/* photography — one card per collection, opening the gallery view */}
      <PhotoProjects />

      {/* the studio line — a quiet full-width statement between the work
          and the offer */}
      <section className="statement">
        <div className="wrap">
          <Reveal as="p">
            {TAGLINE.split(". ").map((s, i, a) => (
              <span className="st-line" key={i}>{s}{i < a.length - 1 ? "." : ""}</span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* what a client walks away with — framed on the two crafts Viraj
          does himself: photography and design */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">What you get</div>
          <div className="get-grid">
            {INTRO.offer.map((o, i) => (
              <Reveal className="get-card" key={o.k} delay={i * 0.06}>
                <span className="get-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{o.k}</h3>
                <p>{o.v}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* testimonials — client words, right before the closing CTA */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">Kind words</div>
          <div className="tmon-grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal className="tcard" key={i} delay={i * 0.06}>
                <blockquote>{t.q}</blockquote>
                <span className="mono tcard-by">{t.by}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* end */}
      <section className="end" id="contact">
        <div className="wrap">
          <Reveal>
            <h2 className="display">Bring me<br />the difficult one.</h2>
            <p className="standfirst" style={{ marginTop: 20 }}>
              Tell me about the shoot, the site, or both. A few lines is enough to start.
            </p>
            <div style={{ marginTop: 30 }}>
              <button type="button" className="extlink" onClick={openContact}>
                Contact me <span className="arrow">→</span>
              </button>
            </div>
          </Reveal>

          <Reveal as="dl" className="colophon">
            <div>
              <dt className="mono">Contact</dt>
              <dd>
                <a href={`mailto:${P.email}`}>{P.email}</a><br />
                <a href={`tel:${P.phone.replace(/[^+\d]/g, "")}`}>{P.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="mono">Based in</dt>
              <dd>{P.city} · {P.area}<br />{P.region}</dd>
            </div>
            <div>
              <dt className="mono">Elsewhere</dt>
              <dd>
                {P.socials.map((s) => (
                  <span key={s.href} style={{ display: "block" }}>
                    <a href={s.href} target="_blank" rel="noreferrer">
                      {s.k} · {s.v}
                    </a>
                  </span>
                ))}
              </dd>
            </div>
          </Reveal>

          <hr className="rule" style={{ marginTop: 44 }} />
          <div style={{ paddingTop: 18 }}>
            <span className="mono">© {P.name}</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ==================================================================
   PHOTOGRAPHY — one card per collection (wildlife / traditional / …),
   each opening its full gallery at /photography/:slug. The card just
   names the set and its size; the frames themselves live on the
   collection page rather than being previewed here.
   ================================================================== */
function PhotoProjects() {
  return (
    <section className="gwork" id="gallery" aria-label="Photography">
      <div className="wrap">
        <div className="gwork-head">
          <div className="mono">Photography</div>
          <TLink to="/photography" className="mono gwork-all">
            All collections <span className="arrow">→</span>
          </TLink>
        </div>

        <div className="projrow">
          {PHOTO_PROJECTS.map((p, n) => {
            // a landscape cover leaves a short card; stack a second frame
            // beneath it so the collection fills its column like the portraits
            const stack = isLandscape(p.photos[0]) && p.photos[1];
            return (
            <Reveal key={p.slug} delay={n * 0.06}>
              <TLink to={`/photography/${p.slug}`} className="projcard" aria-label={`Open ${p.t}`}>
                <div className="projshot" style={{ aspectRatio: ratio(p.photos[0], 4, 3) }}>
                  <img src={img(p.photos[0], 900, 675)} srcSet={srcSet(p.photos[0])}
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    alt={p.t} loading="lazy" />
                  {!stack && <span className="open">{p.photos.length} frames →</span>}
                </div>
                {stack && (
                  <div className="projshot" style={{ aspectRatio: ratio(p.photos[1], 4, 3) }}>
                    <img src={img(p.photos[1], 900, 675)} srcSet={srcSet(p.photos[1])}
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                      alt={`${p.t}, second frame`} loading="lazy" />
                    <span className="open">{p.photos.length} frames →</span>
                  </div>
                )}
                <div className="projcap">
                  <h3>{p.t}</h3>
                </div>
              </TLink>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
