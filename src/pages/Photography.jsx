import { useState, useEffect, useRef, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { P, img, FEATURED, PHOTO_PROJECTS, SHEET, prefersReduced } from "../data.js";
import { Reveal, TLink } from "../ui.jsx";

const DistortImage = lazy(() => import("../DistortImage.jsx"));

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const HOLD = 5400; // ms per hero slide — matches the tick-fill keyframe

/* ==================================================================
   PHOTOGRAPHY — the photo half of the portfolio.

   Hero: a crossfading slideshow of each project's opening frame, so it
   doubles as a table of contents. Below: the same sticky stacking
   cards the home page uses, one per project, opening /photography/:slug.
   ================================================================== */
export default function Photography() {
  const [i, setI] = useState(0);
  const [reduced] = useState(prefersReduced);
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
              <motion.img src={img(f.seed, 2000, 1200)} alt=""
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: reduced ? 0 : 8, ease: "linear" }} />
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="wrap phero-in">
          <div className="phero-top">
            <span className="mono">Photography — selected projects</span>
            <span className="mono">{P.city} — booking 2026</span>
          </div>

          <div className="phero-cap">
            <AnimatePresence mode="wait">
              <motion.div key={f.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}>
                <h1>{f.t}</h1>
                <div className="sub">
                  <span className="mono">{f.kind}</span>
                  <span className="mono">{f.loc}</span>
                  <span className="mono" style={{ color: "var(--accent)" }}>{f.year}</span>
                </div>
                <TLink to={`/photography/${f.slug}`} className="phero-open" data-cursor="Open">
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

      {/* ---------- intro band ---------- */}
      <section className="wrap band">
        <Reveal>
          <h2>Projects, not a feed.</h2>
          <p>
            Each set below is a single body of work — shot, selected and graded as one.
            Open any of them for the full edit.
          </p>
        </Reveal>
      </section>

      {/* ---------- project stack ---------- */}
      <section className="wrap stack" style={{ paddingTop: "6vh" }}>
        {PHOTO_PROJECTS.map((p, n) => (
          <Reveal className="card" key={p.slug} style={{ top: `${92 + n * 12}px`, zIndex: n + 1 }}>
            <div className="card-in">
              <TLink to={`/photography/${p.slug}`} className="shot"
                aria-label={`Open ${p.t}`} data-cursor="View">
                <Suspense fallback={<img data-par src={img(p.photos[0], 1200, 900)} alt={p.t} />}>
                  <DistortImage src={img(p.photos[0], 1200, 900)} alt={p.t} />
                </Suspense>
                <span className="open">{p.photos.length} frames →</span>
              </TLink>
              <div className="cap">
                <div>
                  <span className="kind mono">{p.kind}</span>
                  <h2>{p.t}</h2>
                  <p>{p.note}</p>
                </div>
                <div className="meta">
                  <span className="mono">{p.loc} — {p.year}</span>
                  <span className="mono" style={{ color: "var(--accent)" }}>{p.exif}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ---------- contact strip ---------- */}
      <div className="strip">
        <div className="strip-track">
          {[...SHEET, ...SHEET].map((s, n) => (
            <figure className="strip-fr" key={n}>
              <img src={img(s, 400, 264)} alt="" />
            </figure>
          ))}
        </div>
      </div>

      {/* ---------- end ---------- */}
      <section className="end">
        <div className="wrap">
          <Reveal>
            <h2 className="display">Shooting<br />this year?</h2>
            <a className="mail" href={`mailto:${P.email}`}>{P.email}</a>
          </Reveal>
          <div style={{ marginTop: 44 }}>
            <TLink to="/" className="mono back"><span className="arrow">←</span> Back to work</TLink>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
