import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { PHOTO_PROJECTS, img, srcSet, ratio, prefersReduced } from "../data.js";
import { Reveal, TLink, CenterHead, Lightbox } from "../ui.jsx";
import { useSeo } from "../seo.js";
import { useApp } from "../context.js";

const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ==================================================================
   PHOTO PROJECT — the full edit for one shoot.

   The set shown as a masonry gallery grid; click any frame for the
   lightbox slideshow (then arrow keys). Pager at the bottom walks to the
   neighbouring project.
   ================================================================== */
export default function PhotoProject() {
  const { slug } = useParams();
  const { go } = useApp();
  const [reduced] = useState(prefersReduced);
  const [lb, setLb] = useState(-1); // lightbox index, -1 = closed
  const root = useRef(null);

  const i = PHOTO_PROJECTS.findIndex((p) => p.slug === slug);
  const p = PHOTO_PROJECTS[i];

  // Unknown project → back to the photography index.
  useEffect(() => {
    if (i === -1) go("/photography");
  }, [i, go]);

  useSeo(
    p ? `${p.t} · Photography` : "Photography",
    p ? (p.note || p.intro || `${p.t}, a photography set by Viraj Mehta in the Lower Mainland, British Columbia.`) : "",
  );

  /* No parallax on the hero: it worked by scaling the picture to 1.12 and
     sliding it, which is a zoom, and only reads at all when the frame is
     cropped. The frame is shown whole now, so both go. */

  if (!p) return null;

  const prev = PHOTO_PROJECTS[(i - 1 + PHOTO_PROJECTS.length) % PHOTO_PROJECTS.length];
  const next = PHOTO_PROJECTS[(i + 1) % PHOTO_PROJECTS.length];

  return (
    <>
      <motion.main ref={root} id="main" className="detail detail-pj wrap"
        variants={page} initial="initial" animate="animate">
        <TLink to="/photography" className="mono back">
          <span className="arrow">←</span> All photography
        </TLink>

        <div className="detail-head">
          <div>
            {p.year && (
              <div className="mono" style={{ marginBottom: 16 }}>{p.year}</div>
            )}
            <h1>{p.t}</h1>
          </div>
        </div>

        {/* the ratio lives on the img, not the figure: the figure just
            shrink-wraps whatever size the img resolves to, so it hugs the
            picture instead of parking it in the middle of a black panel */}
        <figure className="pj-hero">
          <img src={img(p.photos[0], 2000, 1125)} srcSet={srcSet(p.photos[0])}
            sizes="(max-width: 1180px) 100vw, 1180px" alt={p.t}
            style={{ aspectRatio: ratio(p.photos[0], 16, 9) }} />
        </figure>

        {/* .detail-grid with one child. It keeps the 56px it sits below
            the hero; the single-column collapse and the centring are in
            the .detail-pj rules in data.js, not here — the grid is still
            two columns on the other detail pages. */}
        <div className="detail-grid">
          <Reveal>
            <p className="pj-intro">{p.intro}</p>
          </Reveal>
        </div>

        {p.note && (
          <Reveal>
            <p className="detail-note" style={{ marginTop: "6vh", color: "var(--dim)", fontSize: 16 }}>
              {p.note}
            </p>
          </Reveal>
        )}

        {/* ---------- grid ----------
            was a bare mono row, the last label on the site standing in
            for a heading; it takes the centred lockup like everything
            else now, with the instruction as its description */}
        <section className="csec">
          <CenterHead small
            title={<>The <span className="serif">full</span> set.</>}
            sub="Click any frame to open it." />
          <div className="pgrid">
            {p.photos.map((s, n) => (
              <figure key={s + n} onClick={() => setLb(n)}
                role="button" tabIndex={0} aria-label={`Open frame ${n + 1}`}
                style={{ aspectRatio: ratio(s, 900, n % 3 === 1 ? 1200 : 700) }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLb(n); } }}>
                <span className="idx mono">{String(n + 1).padStart(2, "0")}</span>
                <img src={img(s, 900, n % 3 === 1 ? 1200 : 700)} srcSet={srcSet(s)}
                  sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                  alt={`${p.t}, frame ${n + 1}`} loading="lazy" />
              </figure>
            ))}
          </div>
        </section>

        <nav className="pager">
          <TLink to={`/photography/${prev.slug}`}>
            <span className="mono">← Previous</span>
            <strong>{prev.t}</strong>
          </TLink>
          <TLink to={`/photography/${next.slug}`} className="next">
            <span className="mono">Next →</span>
            <strong>{next.t}</strong>
          </TLink>
        </nav>
      </motion.main>

      <AnimatePresence>
        {lb > -1 && (
          <Lightbox photos={p.photos} title={p.t} index={lb} setIndex={setLb} reduced={reduced} />
        )}
      </AnimatePresence>
    </>
  );
}

