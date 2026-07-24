import { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { PHOTO_PROJECTS, img, srcSet, ratio, prefersReduced } from "../data.js";
import { Reveal, TLink } from "../ui.jsx";
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

        <figure className="pj-hero">
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

/* ---------------- lightbox slideshow ----------------
   Full-screen viewer with keyboard control (← → Esc) and dots. Locks
   page scroll while open so the page behind doesn't drift. Focus moves
   to the Close button on open, Tab cycles inside the dialog, and focus
   returns to the frame that opened it on close. */
function Lightbox({ photos, title, index, setIndex, reduced }) {
  const close = useCallback(() => setIndex(-1), [setIndex]);
  const shift = useCallback(
    (d) => setIndex((n) => (n + d + photos.length) % photos.length),
    [setIndex, photos.length],
  );
  const boxRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    boxRef.current?.querySelector(".lb-x")?.focus();
    const key = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") shift(1);
      if (e.key === "ArrowLeft") shift(-1);
      if (e.key === "Tab") {
        const items = boxRef.current?.querySelectorAll("button");
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        const active = document.activeElement;
        if (!boxRef.current.contains(active)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.documentElement.style.overflow = prevOverflow;
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus();
    };
  }, [close, shift]);

  return (
    <motion.div className="lb" ref={boxRef} role="dialog" aria-modal="true" aria-label={`${title} — frame viewer`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.3 }}>
      <div className="lb-bar">
        <span className="mono">{title} — {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
        <button className="lb-x" onClick={close} aria-label="Close viewer">Close ✕</button>
      </div>

      <div className="lb-stage">
        <button className="lb-arrow prev" onClick={() => shift(-1)} aria-label="Previous frame">←</button>
        <AnimatePresence mode="wait">
          <motion.img key={photos[index]} src={img(photos[index], 2000, 1400)}
            srcSet={srcSet(photos[index])} sizes="100vw"
            alt={`${title}, frame ${index + 1}`}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }} />
        </AnimatePresence>
        <button className="lb-arrow next" onClick={() => shift(1)} aria-label="Next frame">→</button>
      </div>

      <div className="lb-foot">
        {photos.map((s, n) => (
          <button key={s + n} className={`dot ${n === index ? "on" : ""}`}
            aria-current={n === index || undefined}
            onClick={() => setIndex(n)} aria-label={`Frame ${n + 1}`} />
        ))}
      </div>
    </motion.div>
  );
}
