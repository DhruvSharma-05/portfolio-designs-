import { useState, useEffect, useRef, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { P, img, INTRO, FRAMES, SHEET, TICKER, METRICS, QUOTES, SHOTLIST, WEB_PROJECTS, prefersReduced } from "../data.js";
import { Reveal, Metrics, TLink } from "../ui.jsx";
import { useApp } from "../context.js";

/* Three.js is code-split so the hero text (the LCP) paints first. */
const HeroCanvas = lazy(() => import("../HeroCanvas.jsx"));
const DistortImage = lazy(() => import("../DistortImage.jsx"));

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* seeds for the sweeping horizontal gallery: the contact sheet plus a
   few featured work frames, de-duplicated. */
const GALLERY = [...new Set([...SHEET, ...FRAMES.map((f) => f.seed)])].slice(0, 12);

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
            {P.photographer} — {P.role} — {P.city} — Booking 2026
          </div>

          {/* the studio name carries the masthead; the kicker and the
              standfirst below it say who is behind it and what he does */}
          <h1 className="display">
            {[...P.name].map((c, i) => (
              <span className="ch" key={i} style={{ animationDelay: `${0.25 + i * 0.04}s` }}>
                {c === " " ? " " : c}
              </span>
            ))}
          </h1>
          <div className="drawline" />

          <p className="standfirst">
            Two practices, one pair of hands. Photographs made as{" "}
            <strong>{P.photoBrand}</strong>, and the sites they live on designed
            and built by the same person.
            <i> Hire either. Hiring both is the point.</i>
          </p>

          {/* both doors stated above the fold, so a cold visitor can tell
              inside three seconds that this is two crafts and not one */}
          <div className="disciplines">
            {INTRO.does.map((d, i) => (
              <TLink key={d.to} to={d.to} className="disc" data-cursor="Enter">
                <span className="mono">{String(i + 1).padStart(2, "0")} — {d.k}</span>
                <strong>{d.brand}</strong>
                <span className="mono go">Enter <span className="arrow">→</span></span>
              </TLink>
            ))}
          </div>

          <div className="role">
            <span className="mono">Photography · Web design · Booking 2026</span>
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

      {/* who he is — the home page introduces the person before it
          shows a single project */}
      <section className="thesis">
        <div className="wrap thesis-grid">
          <Reveal>
            <p className="lead">
              {INTRO.lead.split(" ").slice(0, 3).join(" ")}
              <i> {INTRO.lead.split(" ").slice(3).join(" ")}</i>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="aside">
            {INTRO.body.map((t, i) => <p key={i}>{t}</p>)}
          </Reveal>
        </div>
      </section>

      {/* what he does — one panel per practice, each a door to its page */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">What he does</div>
          <div className="approach">
            {INTRO.does.map((d) => (
              <TLink key={d.to} to={d.to} data-cursor="Open">
                <h3>{d.k}</h3>
                <p>{d.v}</p>
                <span className="mono" style={{ color: "var(--accent)", display: "block", marginTop: 14 }}>
                  {d.brand} →
                </span>
              </TLink>
            ))}
          </div>
        </div>
      </section>

      {/* what you get — the client-facing promise, not a craft list */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">What you get</div>
          <div>
            {INTRO.offer.map((o, i) => (
              <Reveal className="sl-row" key={o.k} delay={i * 0.04}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <h3>{o.k}</h3>
                <p>{o.v}</p>
              </Reveal>
            ))}
          </div>
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

      {/* web design — the other craft, previewed in browser frames */}
      <section className="sec" id="design">
        <div className="wrap sec-grid">
          <div className="sec-label mono">Also on the web</div>
          <div>
            <Reveal>
              <h2 style={{ fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.04,
                fontSize: "clamp(26px, 3.6vw, 46px)", marginBottom: 14 }}>
                The pictures need somewhere to live.
              </h2>
              <p style={{ color: "var(--dim)", fontSize: 15, lineHeight: 1.72, maxWidth: "42ch", marginBottom: 36 }}>
                I design and build the sites too — hover a frame to scroll the whole page.
              </p>
            </Reveal>
            <div className="wgrid">
              {WEB_PROJECTS.slice(0, 2).map((w, i) => (
                <Reveal key={w.slug} delay={i * 0.06}>
                  <TLink to={`/design/${w.slug}`} className="wcard" data-cursor="View"
                    aria-label={`Open ${w.t}`}>
                    <div className="browser">
                      <div className="browser-bar">
                        <span className="browser-dots" aria-hidden="true"><i /><i /><i /></span>
                        <span className="browser-url mono">{w.slug}.com</span>
                        <span className="mono" style={{ opacity: 0.5 }}>{w.year}</span>
                      </div>
                      <div className="browser-view">
                        <img src={img(w.cover, 1200, reduced ? 825 : 2100)}
                          alt={`${w.t} — full page`} loading="lazy" />
                      </div>
                    </div>
                    <div className="wcard-cap">
                      <div>
                        <h3>{w.t}</h3>
                        <p>{w.intro}</p>
                      </div>
                      <span className="tool-badge mono">{w.tool}</span>
                    </div>
                  </TLink>
                </Reveal>
              ))}
            </div>
            <div style={{ marginTop: 34 }}>
              <TLink to="/design" className="extlink">
                All design work <span className="arrow">→</span>
              </TLink>
            </div>
          </div>
        </div>
      </section>

      {/* the two halves — split entry into each section */}
      <section className="sec">
        <div className="wrap">
          <Reveal className="teaser">
            <TLink to="/photography">
              <span className="mono">Photography — full archive</span>
              <h3>{P.photoBrand}</h3>
              <p>Editorial, portrait, landscape and event sets — each one opened as a complete edit.</p>
              <span className="go mono">Enter the archive <span className="arrow">→</span></span>
            </TLink>
            <TLink to="/design">
              <span className="mono">Design & build</span>
              <h3>Web design</h3>
              <p>Sites designed and shipped end to end, with the source file linked on every project.</p>
              <span className="go mono">See the builds <span className="arrow">→</span></span>
            </TLink>
          </Reveal>
        </div>
      </section>

      {/* metrics */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">The numbers</div>
          <Metrics items={METRICS} />
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
              <dd>Dark, minimal, type-led. Built so the pictures are the only bright thing on the page.</dd>
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
