import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { P, img, focus, FEATURED, PHOTO_PROJECTS, SHEET, prefersReduced } from "../data.js";
import { Reveal, TLink } from "../ui.jsx";
import Coverflow from "../Coverflow.jsx";

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const HOLD = 5400; // ms per hero slide — matches the tick-fill keyframe

/* One stacking project card: it sticks near the top while the next card
   rides up and overlaps it, scaling down a touch as it recedes behind.
   Shows three frames from the set — two stacked on the left, one large
   on the right. */
function PhotoCard({ p, n, total, reduced }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const targetScale = 1 - (total - 1 - n) * 0.04;
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : targetScale]);

  const big = p.photos[0];
  const a = p.photos[1] || p.photos[0];
  const b = p.photos[2] || p.photos[1] || p.photos[0];

  return (
    <div ref={ref} className="pcard-wrap" style={{ top: `calc(84px + ${n * 20}px)`, zIndex: n + 1 }}>
      <motion.article className="pcard" style={{ scale }}>
        <div className="pcard-head">
          <span className="pcard-num">{String(n + 1).padStart(2, "0")}</span>
          <span className="pcard-badge mono">{p.kind}</span>
          <h3 className="pcard-name">{p.t}</h3>
          <TLink to={`/photography/${p.slug}`} className="pcard-open mono" data-cursor="Open"
            aria-label={`Open ${p.t}`}>
            View set <span className="arrow">→</span>
          </TLink>
        </div>

        <TLink to={`/photography/${p.slug}`} className="pcard-media" data-cursor="Open"
          aria-label={`Open ${p.t}`}>
          <span className="pcard-col">
            <span className="pcard-img sm"><img src={img(a, 900, 620)} alt="" loading="lazy" style={{ objectPosition: focus(a) }} /></span>
            <span className="pcard-img md"><img src={img(b, 900, 900)} alt="" loading="lazy" style={{ objectPosition: focus(b) }} /></span>
          </span>
          <span className="pcard-img big"><img src={img(big, 1500, 1050)} alt={p.t} loading="lazy" style={{ objectPosition: focus(big) }} /></span>
        </TLink>
      </motion.article>
    </div>
  );
}

/* ==================================================================
   PHOTOGRAPHY — the photo half of the portfolio.

   Hero: a crossfading slideshow of each project's opening frame, so it
   doubles as a table of contents. Below: sticky stacking project cards
   — each overlaps the previous as you scroll — opening /photography/:slug.
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

  const f = FEATURED[i];
  /* highlight reel for the coverflow — the gallery frames, subject-framed */
  const reel = SHEET.slice(0, 12).map((s) => ({ image: { src: img(s, 900), position: focus(s) } }));

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
                style={{ objectPosition: focus(f.seed) }}
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: reduced ? 0 : 8, ease: "linear" }} />
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="wrap phero-in">
          <div className="phero-top">
            <span className="mono" style={{ color: "var(--accent)" }}>
              {P.photoBrand} — the photography practice
            </span>
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
          <p>
            The photography half of {P.name}. Each set below is a single body of
            work — shot, selected and graded as one. Open any of them for the full edit.
          </p>
        </Reveal>
      </section>

      {/* ---------- coverflow reel ---------- */}
      <section className="cflow-sec" aria-label="Selected frames">
        <Coverflow slides={reel} autoplay={!reduced} />
      </section>

      {/* ---------- projects heading ---------- */}
      <section className="wrap" style={{ paddingTop: "6vh" }}>
        <span className="mono" style={{ color: "var(--accent)" }}>[ Selected sets ]</span>
        <h2 className="display" style={{ marginTop: 12, fontSize: "clamp(46px, 9vw, 128px)" }}>Projects</h2>
      </section>

      {/* ---------- project stack (sticky, overlapping cards) ---------- */}
      <section className="wrap pstack">
        {PHOTO_PROJECTS.map((p, n) => (
          <PhotoCard key={p.slug} p={p} n={n} total={PHOTO_PROJECTS.length} reduced={reduced} />
        ))}
      </section>

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
