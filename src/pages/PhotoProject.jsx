import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { PHOTO_PROJECTS, img, srcSet, ratio, prefersReduced } from "../data.js";
import { Reveal, TLink, Lightbox } from "../ui.jsx";
import { useApp } from "../context.js";

const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ==================================================================
   PHOTO PROJECT — the full edit for one shoot.

   Three ways through the same set: a masonry grid, a snap-scrolling
   carousel roll, and a lightbox slideshow (click any frame, then arrow
   keys). Pager at the bottom walks to the neighbouring project.
   ================================================================== */
export default function PhotoProject() {
  const { slug } = useParams();
  const { go } = useApp();
  const [reduced] = useState(prefersReduced);
  const [lb, setLb] = useState(-1); // lightbox index, -1 = closed
  const root = useRef(null);
  const heroImg = useRef(null);

  const i = PHOTO_PROJECTS.findIndex((p) => p.slug === slug);
  const p = PHOTO_PROJECTS[i];

  // Unknown project → back to the photography index.
  useEffect(() => {
    if (i === -1) go("/photography");
  }, [i, go]);

  useGSAP(() => {
    if (reduced || !heroImg.current) return;
    gsap.set(heroImg.current, { scale: 1.12, transformOrigin: "50% 50%" });
    gsap.fromTo(heroImg.current, { yPercent: -5 }, {
      yPercent: 5, ease: "none",
      scrollTrigger: { trigger: heroImg.current, start: "top bottom", end: "bottom top", scrub: true },
    });
    ScrollTrigger.refresh();
  }, { scope: root, dependencies: [reduced, slug] });

  if (!p) return null;

  const prev = PHOTO_PROJECTS[(i - 1 + PHOTO_PROJECTS.length) % PHOTO_PROJECTS.length];
  const next = PHOTO_PROJECTS[(i + 1) % PHOTO_PROJECTS.length];

  return (
    <>
      <motion.main ref={root} id="main" className="detail wrap"
        variants={page} initial="initial" animate="animate">
        <TLink to="/photography" className="mono back">
          <span className="arrow">←</span> All photography
        </TLink>

        <div className="detail-head">
          <div>
            <div className="mono" style={{ marginBottom: 16 }}>{p.kind} — {p.year}</div>
            <h1>{p.t}</h1>
          </div>
          <div className="mono" style={{ color: "var(--accent)" }}>{p.exif}</div>
        </div>

        <figure className="pj-hero" style={{ aspectRatio: ratio(p.photos[0], 16, 9) }}>
          <img ref={heroImg} src={img(p.photos[0], 2000, 1125)} srcSet={srcSet(p.photos[0])}
            sizes="(max-width: 1180px) 100vw, 1180px" alt={p.t} />
        </figure>

        <div className="detail-grid">
          <Reveal>
            <p className="pj-intro">{p.intro}</p>
          </Reveal>
          <Reveal as="dl" className="spec" delay={0.08}>
            <div><dt className="mono">Location</dt><dd>{p.loc}</dd></div>
            <div><dt className="mono">Capture</dt><dd>{p.exif}</dd></div>
            <div><dt className="mono">Role</dt><dd>{p.role}</dd></div>
            <div><dt className="mono">Frames</dt><dd>{p.photos.length}</dd></div>
          </Reveal>
        </div>

        <p className="detail-note" style={{ marginTop: "6vh", color: "var(--dim)", fontSize: 16 }}>
          {p.note}
        </p>

        {/* ---------- carousel roll ---------- */}
        <section className="sec" style={{ marginTop: "6vh" }}>
          <div className="mono" style={{ marginBottom: 24 }}>The roll — drag or scroll</div>
          <Roll photos={p.photos} title={p.t} onOpen={setLb} />
        </section>

        {/* ---------- grid ---------- */}
        <section className="sec">
          <div className="mono" style={{ marginBottom: 24 }}>Full set — click any frame</div>
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

/* ---------------- carousel roll ----------------
   A snap-scrolling filmstrip with pointer drag and arrow buttons.
   Drag translates pointer movement into scrollLeft; snapping is turned
   off mid-drag so the strip doesn't fight the finger. */
function Roll({ photos, title, onOpen }) {
  const track = useRef(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: 0 });

  const down = (e) => {
    const t = track.current;
    drag.current = { on: true, x: e.clientX, left: t.scrollLeft, moved: 0 };
    t.classList.add("dragging");
    t.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    const d = drag.current;
    if (!d.on) return;
    const dx = e.clientX - d.x;
    d.moved = Math.abs(dx);
    track.current.scrollLeft = d.left - dx;
  };
  const up = () => {
    drag.current.on = false;
    track.current?.classList.remove("dragging");
  };

  const step = (dir) => {
    const t = track.current;
    const w = t.firstElementChild?.getBoundingClientRect().width || t.clientWidth;
    t.scrollBy({ left: dir * (w + 16), behavior: "smooth" });
  };

  return (
    <div className="roll">
      <div className="roll-track" ref={track}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {photos.map((s, n) => (
          <figure className="roll-fr" key={s + n}
            style={{ aspectRatio: ratio(s, 3, 2) }}
            onClick={() => { if (drag.current.moved < 6) onOpen(n); }}>
            <img src={img(s, 1400, 933)} srcSet={srcSet(s)} sizes="(max-width: 700px) 84vw, 62vw"
              alt={`${title}, frame ${n + 1}`} loading="lazy" />
          </figure>
        ))}
      </div>
      <div className="roll-nav">
        <button className="roll-btn" onClick={() => step(-1)} aria-label="Previous frame">←</button>
        <button className="roll-btn" onClick={() => step(1)} aria-label="Next frame">→</button>
      </div>
    </div>
  );
}
