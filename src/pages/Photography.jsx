import {
  useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback, lazy, Suspense,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import {
  P, img, srcSet, ratio, FEATURED, PHOTO_PROJECTS, PHOTO_POOL, projectCover,
  prefersReduced, heavyVisualsAllowed,
} from "../data.js";
import { Reveal, TLink, SectionHead } from "../ui.jsx";
import { useSeo } from "../seo.js";
import { useApp } from "../context.js";

const DistortImage = lazy(() => import("../DistortImage.jsx"));

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const HOLD = 5400; // ms per hero slide — matches the tick-fill keyframe

/* ==================================================================
   PHOTOGRAPHY — the photo half of the portfolio.

   Hero: a crossfading slideshow of each project's opening frame, so it
   doubles as a table of contents. Below: one card per project in plain
   vertical flow, each opening /photography/:slug.
   ================================================================== */
export default function Photography() {
  useSeo("Photography", "Portrait, event and visual-story photography by Viraj Mehta (Lensofviraj), Vancouver: traditional, wildlife and modern collections, each shown as a complete edit.");
  const { openContact } = useApp();
  const [i, setI] = useState(0);
  const [reduced] = useState(prefersReduced);
  const [heavy] = useState(heavyVisualsAllowed);
  const root = useRef(null);

  /* autoplay — restarts whenever the index changes, so a manual pick
     gets a full slide of time before the next advance. */
  useEffect(() => {
    if (reduced || FEATURED.length < 2) return;
    const t = setTimeout(() => setI((n) => (n + 1) % FEATURED.length), HOLD);
    return () => clearTimeout(t);
  }, [i, reduced]);

  /* parallax + hover zoom on the project cards, same as the home stack */
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
    ScrollTrigger.refresh();
  }, { scope: root, dependencies: [reduced] });

  const f = FEATURED[i];

  return (
    <motion.div ref={root} variants={page} initial="initial" animate="animate">
      {/* ---------- hero slideshow ---------- */}
      <header className="phero" id="main">
        <div className="phero-stage" aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.figure className="phero-fr" key={f.seed}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 1.1, ease: "easeInOut" }}>
              <motion.img src={img(f.seed, 2000, 1200)} srcSet={srcSet(f.seed)} sizes="100vw" alt=""
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: reduced ? 0 : 8, ease: "linear" }} />
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="wrap phero-in">
          <div className="phero-cap">
            <AnimatePresence mode="wait">
              <motion.div key={f.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}>
                <h1>{f.t}</h1>
                {(f.loc || f.year) && (
                  <div className="sub">
                    {f.loc && <span className="mono">{f.loc}</span>}
                    {f.year && <span className="mono" style={{ color: "var(--accent)" }}>{f.year}</span>}
                  </div>
                )}
                <TLink to={`/photography/${f.slug}`} className="phero-open">
                  Open project <span className="arrow">→</span>
                </TLink>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="phero-foot">
            <div className="ticks" role="tablist" aria-label="Featured projects">
              {FEATURED.map((s, n) => (
                <button key={s.slug} className="tick-btn" role="tab"
                  aria-current={n === i} aria-label={s.t}
                  onClick={() => setI(n)}><i /></button>
              ))}
            </div>
            <span className="mono phero-count">
              <b>{String(i + 1).padStart(2, "0")}</b> / {String(FEATURED.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </header>

      {/* ---------- the practice, named ---------- */}
      <section className="wrap band">
        <Reveal>
          <div className="mono" style={{ marginBottom: 20 }}>
            Photography by {P.photographer}
          </div>
          <h2>{P.photoBrand}</h2>
          <p className="band-lead">
            Every photograph begins long before I press the shutter. Understanding
            people, light, and emotion is just as important as the camera itself.
          </p>
          <p>
            The photography half of {P.name}. Each set below is a single body of
            work, shot, selected and graded as one. Open any of them for the full edit.
          </p>
        </Reveal>
      </section>

      {/* ---------- frames carousel ---------- */}
      <section className="wrap" aria-label="Selected frames">
        <PhotoCarousel photos={CAROUSEL} reduced={reduced} />
      </section>

      {/* ---------- project stack ----------
           the heading sits outside .stack, which is a flex column — inside
           it the label would pick up the 34px card gap */}
      <section className="wrap" style={{ paddingTop: "11vh" }}>
        <SectionHead>Projects</SectionHead>
        <div className="stack">
          {PHOTO_PROJECTS.map((p, n) => {
            /* no inline aspect-ratio: every .shot uses the one fixed 3/2
               from the stylesheet, so the cards match down the page */
            const cover = projectCover(p);
            return (
            <Reveal className="card" key={p.slug} delay={n * 0.06}>
              <div className="card-in">
                <TLink to={`/photography/${p.slug}`} className="shot"
                  aria-label={`Open ${p.t}`}>
                  {heavy ? (
                    <Suspense fallback={
                      <img data-par src={img(cover, 1200, 800)} srcSet={srcSet(cover)}
                        sizes="(max-width: 860px) 100vw, 55vw" alt={p.t} />
                    }>
                      <DistortImage src={img(cover, 1200, 800)} srcSet={srcSet(cover)}
                        sizes="(max-width: 860px) 100vw, 55vw" alt={p.t} />
                    </Suspense>
                  ) : (
                    <img data-par src={img(cover, 1200, 800)} srcSet={srcSet(cover)}
                      sizes="(max-width: 860px) 100vw, 55vw" alt={p.t} />
                  )}
                  <span className="open">{p.photos.length} frames →</span>
                </TLink>
                <div className="cap">
                  <div>
                    <h2>{p.t}</h2>
                    <p>{p.note || p.intro}</p>
                  </div>
                  {/* only when there's something to say: the frame count is
                      already on the cover badge, so no fallback here */}
                  {(p.loc || p.year) && (
                    <div className="meta">
                      <span className="mono">{[p.loc, p.year].filter(Boolean).join(" · ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- end ---------- */}
      <section className="end">
        <div className="wrap">
          <Reveal>
            <h2 className="display">Shooting<br />this year?</h2>
            <div style={{ marginTop: 30 }}>
              <button type="button" className="extlink" onClick={openContact}>
                Contact me <span className="arrow">→</span>
              </button>
            </div>
          </Reveal>
          <div style={{ marginTop: 44 }}>
            <TLink to="/" className="mono back"><span className="arrow">←</span> Back to work</TLink>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ==================================================================
   PHOTO CAROUSEL — a coverflow of the pooled frames.

   The active frame sits centred at full size with its neighbours
   peeking in from either edge, dimmed and scaled back; the arrows ride
   over them. Clicking a neighbour brings it to the middle.

   Every slide is the same HEIGHT and takes its width from the
   photograph's own aspect ratio, so a portrait is a tall narrow card
   and a landscape a wide one — both whole, neither cropped or zoomed.
   Because the slides differ in width, the track can't be centred by
   arithmetic; it's positioned from the measured offset of the active
   slide. Scaling is done with transform only, which keeps layout width
   constant so that measurement stays valid mid-animation.

   Runs on its own and pauses while you're pointing at it or while it's
   off screen; the arrows step through by hand.
   ================================================================== */
/* distinct from HOLD above, which paces the hero slideshow */
const CAR_HOLD = 4200; // ms per carousel frame

/* A short reel, not the whole library — enough to show the range without
   turning the page into a contact sheet. PHOTO_POOL is already
   round-robin across the collections, so a slice off the front is an
   even mix of them rather than one set followed by the next. */
const CAROUSEL = PHOTO_POOL.slice(0, 12);

const SLIDE_MS = 800; // must match the .pcar-track transition

function PhotoCarousel({ photos, reduced }) {
  const N = photos.length;
  /* The set is laid out three times over and we live in the middle copy,
     so there is always another frame waiting on both sides: rolling off
     the last picture just steps onto the first, one slide's worth of
     travel, instead of rewinding the whole track. Once the move has
     finished we re-seat the index into the middle copy again with the
     transition switched off — the same photograph is already centred, so
     the jump is invisible. */
  const loop = useMemo(() => [...photos, ...photos, ...photos], [photos]);
  const [idx, setIdx] = useState(N);
  const [snap, setSnap] = useState(false); // re-seat without animating
  const [shift, setShift] = useState(0);
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);

  const step = useCallback((d) => setIdx((n) => n + d), []);

  /* centre the active slide: measured, because slide widths vary with
     each photograph's aspect ratio */
  useLayoutEffect(() => {
    const place = () => {
      const stage = stageRef.current;
      const slide = trackRef.current?.children[idx];
      if (!stage || !slide) return;
      setShift(stage.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2));
    };
    place();
    const ro = new ResizeObserver(place);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [idx, N]);

  // drifted out of the middle copy → hop back once the slide has landed
  useEffect(() => {
    if (idx >= 2 * N || idx < N) {
      const t = setTimeout(() => {
        setSnap(true);
        setIdx((i) => (i >= 2 * N ? i - N : i + N));
      }, SLIDE_MS + 20);
      return () => clearTimeout(t);
    }
  }, [idx, N]);

  // the un-animated hop has painted; put the transition back
  useLayoutEffect(() => {
    if (!snap) return;
    const r = requestAnimationFrame(() => setSnap(false));
    return () => cancelAnimationFrame(r);
  }, [snap]);

  /* Keeps running while you look at it — an earlier version paused on
     hover, which just made it look frozen for anyone whose cursor was
     resting on the picture. The only thing that stops it is scrolling
     it off screen, so it isn't burning frames in the background. */
  useEffect(() => {
    if (reduced || N < 2) return;
    const el = rootRef.current;
    let id = 0;
    const start = () => { if (!id) id = setInterval(() => setIdx((n) => n + 1), CAR_HOLD); };
    const stop = () => { clearInterval(id); id = 0; };
    if (!el || typeof IntersectionObserver === "undefined") { start(); return stop; }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.2 });
    io.observe(el);
    return () => { stop(); io.disconnect(); };
  }, [reduced, N]);

  if (!N) return null;

  return (
    <div className="pcar" ref={rootRef}>
      <div className="pcar-stage" ref={stageRef}>
        <div className="pcar-track" ref={trackRef}
          style={{ transform: `translateX(${shift}px)`, transition: snap ? "none" : undefined }}>
          {loop.map((s, n) => {
            const on = n === idx;
            const near = Math.abs(n - idx) <= 2;   // only these are fetched
            return (
              <button type="button" key={s + "-" + n}
                className={`pcar-slide${on ? " on" : ""}`}
                style={{ aspectRatio: ratio(s, 3, 2) }}
                aria-label={on ? undefined : `Show frame ${(n % N) + 1}`}
                aria-current={on || undefined}
                tabIndex={on ? -1 : 0}
                onClick={() => setIdx(n)}>
                {/* sizes is set for the widest case — a landscape slide runs
                    ~995px at this height, and a 640w file visibly softens at
                    that size. Portraits over-fetch a little; the centre frame
                    being crisp is worth it. */}
                {near && (
                  <img src={img(s, 1400, 1400)} srcSet={srcSet(s)}
                    sizes="(max-width: 900px) 92vw, 78vw"
                    alt={on ? `Selected frame ${(n % N) + 1} of ${N}` : ""}
                    loading={n === N ? "eager" : "lazy"} draggable="false" />
                )}
              </button>
            );
          })}
        </div>

        <button type="button" className="pcar-arrow prev" onClick={() => step(-1)}
          aria-label="Previous frame">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" className="pcar-arrow next" onClick={() => step(1)}
          aria-label="Next frame">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
