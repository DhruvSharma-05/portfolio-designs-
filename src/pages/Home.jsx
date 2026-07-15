import { useState, useEffect, useRef, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { P, img, FRAMES, SHEET, TICKER, METRICS, QUOTES, SHOTLIST, prefersReduced } from "../data.js";
import { Reveal, Counter, TLink } from "../ui.jsx";
import { useApp } from "../context.js";

/* Three.js is code-split so the hero text (the LCP) paints first. */
const HeroCanvas = lazy(() => import("../HeroCanvas.jsx"));
const DistortImage = lazy(() => import("../DistortImage.jsx"));

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* seeds for the sweeping horizontal gallery — swap for real frames */
const GALLERY = [...SHEET, "pf-01", "pf-04", "pf-02"];

export default function Home() {
  const { theme } = useApp();
  const [qi, setQi] = useState(0);
  const [heroActive, setHeroActive] = useState(true);
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);
  const heroRef = useRef(null);
  const galRef = useRef(null);
  const trackRef = useRef(null);

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

    /* pinned horizontal gallery: pin the section and translate the track
       by its overflow width as the user scrolls vertically. */
    const track = trackRef.current;
    if (track) {
      gsap.to(track, {
        x: () => -(track.scrollWidth - innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: galRef.current,
          start: "top top",
          end: () => "+=" + (track.scrollWidth - innerWidth),
          pin: true, scrub: 1, invalidateOnRefresh: true,
        },
      });
    }

    ScrollTrigger.refresh();
  }, { scope: root, dependencies: [reduced] });

  /* pause the hero canvas render loop once it scrolls off-screen */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroActive(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* quote slideshow */
  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 5200);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div ref={root} variants={page} initial="initial" animate="animate">
      {/* masthead */}
      <header className="mast" id="main" ref={heroRef}>
        <Suspense fallback={null}>
          <HeroCanvas accent={theme.accent} active={heroActive} reduced={reduced} />
        </Suspense>
        <div className="wrap">
          <div className="mono" style={{ marginBottom: 26 }}>
            {P.role} — {P.city} — booking 2026
          </div>
          <h1 className="display">
            {[...P.name].map((c, i) => (
              <span className="ch" key={i} style={{ animationDelay: `${0.25 + i * 0.04}s` }}>
                {c === " " ? " " : c}
              </span>
            ))}
          </h1>
          <div className="drawline" />
          <div className="role">
            <span className="mono">Available light. Clean grids. Shipped end to end.</span>
            <span className="mono">Scroll —</span>
          </div>
        </div>
      </header>

      {/* contact strip */}
      <div className="strip">
        <div className="strip-track">
          {[...SHEET, ...SHEET].map((s, i) => (
            <figure className="strip-fr" key={i}>
              <img src={img(s, 400, 264)} alt="" />
            </figure>
          ))}
        </div>
      </div>

      {/* ticker */}
      <div className="tick">
        <div className="tick-in">
          {[0, 1].map((k) => (
            <span key={k} style={{ display: "flex" }}>
              {TICKER.map((t) => <em key={t + k}>{t}</em>)}
            </span>
          ))}
        </div>
      </div>

      {/* thesis */}
      <section className="thesis">
        <div className="wrap thesis-grid">
          <Reveal>
            <p className="lead">
              I shoot, I grade, and I build the site the pictures live on.
              <i> One person, one decision, start to finish.</i>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="aside">
            <p>
              The switcher at the top of this page changes the accent, nothing else —
              because a portfolio should stay out of the way of the work.
            </p>
            <p>It's the same restraint I bring to a client build. Just made in public.</p>
          </Reveal>
        </div>
      </section>

      {/* work: sticky stacking cards → each opens a detail page */}
      <section className="wrap stack" id="work">
        {FRAMES.map((f, i) => (
          <Reveal className="card" key={f.seed} style={{ top: `${92 + i * 12}px`, zIndex: i + 1 }}>
            <div className="card-in">
              <TLink to={`/work/${f.seed}`} className="shot" aria-label={`Open ${f.t}`} data-cursor="View">
                <Suspense fallback={<img data-par src={img(f.seed, 1200, 900)} alt={f.t} />}>
                  <DistortImage src={img(f.seed, 1200, 900)} alt={f.t} />
                </Suspense>
                <span className="open">View project →</span>
              </TLink>
              <div className="cap">
                <div>
                  <span className="kind mono">{f.kind}</span>
                  <h2>{f.t}</h2>
                  <p>{f.note}</p>
                </div>
                <div className="meta">
                  <span className="mono">{f.loc}</span>
                  <span className="mono" style={{ color: "var(--accent)" }}>{f.exif}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* pinned horizontal gallery */}
      <section className={`gallery${reduced ? " scrollable" : ""}`} ref={galRef} aria-label="Selected frames">
        <div className="gallery-track" ref={trackRef}>
          <div className="gallery-head">
            <div className="mono" style={{ marginBottom: 18 }}>Selected frames</div>
            <h2>A scroll through the archive.</h2>
            <p>Drag or keep scrolling — a rolling edit of recent frames, not tied to any one project.</p>
          </div>
          {GALLERY.map((s, i) => (
            <figure className="gal-fr" key={s + i}>
              <img src={img(s, 900, 1200)} alt="" />
            </figure>
          ))}
        </div>
      </section>

      {/* metrics */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">The numbers</div>
          <Reveal className="metrics">
            {METRICS.map((m) => (
              <div className="metric" key={m.k}>
                <Counter to={m.v} suf={m.s} />
                <span className="mono">{m.k}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* quotes — Framer crossfade */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">What clients say</div>
          <div>
            <div className="slide">
              <AnimatePresence mode="wait">
                <motion.blockquote className="q" key={qi}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}>
                  <p><span style={{ color: "var(--accent)" }}>“</span>{QUOTES[qi].q}</p>
                  <footer className="mono">{QUOTES[qi].a} — {QUOTES[qi].r}</footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>
            <div className="dots">
              {QUOTES.map((q, i) => (
                <button key={i} className={`dot ${i === qi ? "on" : ""}`}
                  onClick={() => setQi(i)} aria-label={`Quote ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* services */}
      <section className="sec" id="services">
        <div className="wrap sec-grid">
          <div className="sec-label mono">What I'm hired for</div>
          <div>
            {SHOTLIST.map((s, i) => (
              <Reveal className="sl-row" key={s.k} delay={i * 0.04}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.k}</h3>
                <p>{s.v}</p>
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
            <MagneticMail email={P.email} reduced={reduced} />
          </Reveal>

          <Reveal as="dl" className="colophon">
            <div>
              <dt className="mono">Shot on</dt>
              <dd>Camera one · Camera two<br />Lens · Drone</dd>
            </div>
            <div>
              <dt className="mono">Built with</dt>
              <dd>Figma · React · Framer<br />Capture One · DaVinci</dd>
            </div>
            <div>
              <dt className="mono">Elsewhere</dt>
              <dd>Instagram<br />Behance</dd>
            </div>
            <div>
              <dt className="mono">Colophon</dt>
              <dd>Dark, minimal, type-led. One accent at a time — currently {theme.name}.</dd>
            </div>
          </Reveal>

          <hr className="rule" style={{ marginTop: 44 }} />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 18 }}>
            <span className="mono">© 2026 {P.name}</span>
            <span className="mono">Shot, designed and built by the same person</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* Magnetic email link — the label eases toward the cursor while hovered,
   a classic "cursor UX" micro-interaction, disabled under reduced motion. */
function MagneticMail({ email, reduced }) {
  const ref = useRef(null);
  const move = (e) => {
    if (reduced) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
    gsap.to(ref.current, { x, y, duration: 0.4, ease: "power3.out" });
  };
  const reset = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
  return (
    <a ref={ref} className="mail" href={`mailto:${email}`}
      onPointerMove={move} onPointerLeave={reset} style={{ willChange: "transform" }}>
      {email}
    </a>
  );
}
