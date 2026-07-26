import { useState, useEffect, useRef, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import {
  P, img, srcSet, ratio, INTRO, SHEET,
  GALLERY_CATS, GALLERY_ITEMS, WEB_PROJECTS, HAS_REAL_WEB, hasPhoto, figmaEmbed, prefersReduced, heavyVisualsAllowed,
} from "../data.js";
import { Reveal, TLink, Lightbox } from "../ui.jsx";
import { useApp } from "../context.js";

/* Three.js is code-split so the hero text (the LCP) paints first. */
const HeroCanvas = lazy(() => import("../HeroCanvas.jsx"));

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* Hero entrance timing: the headline fades/rises in first (HEADLINE_DELAY,
   duration matches .hero-reveal's .6s in the CSS), then the supporting
   copy, CTAs and drawline cascade in after it settles at HEADLINE_DONE. */
const HEADLINE_DELAY = 0.1;
const HEADLINE_DONE = HEADLINE_DELAY + 0.6;

/* ==================================================================
   WORK — the front page. Deliberately slim: hero, the categorised
   gallery, the photography projects, and the room reserved for the
   design work. Everything about the person lives on /about.
   ================================================================== */
export default function Home() {
  const { theme } = useApp();
  const [heroActive, setHeroActive] = useState(true);
  const [reduced] = useState(prefersReduced);
  const [heavy] = useState(heavyVisualsAllowed);
  const root = useRef(null);
  const heroRef = useRef(null);

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

  return (
    <motion.div ref={root} variants={page} initial="initial" animate="animate">
      {/* masthead */}
      <header className="mast" id="main" ref={heroRef}>
        {heavy && (
          <Suspense fallback={null}>
            <HeroCanvas accent={theme.accent} active={heroActive} reduced={reduced} />
          </Suspense>
        )}
        <div className="wrap">
          <div className="mono" style={{ marginBottom: 26 }}>
            {P.photographer} — {P.role} — {P.city} — Booking 2026
          </div>

          {/* the studio name carries the masthead; the kicker and the
              standfirst below it say who is behind it and what he does */}
          <h1 className="display hero-reveal" style={{ "--rd": `${HEADLINE_DELAY}s` }}>
            {P.name}
          </h1>
          <div className="drawline" style={{ "--line-delay": `${HEADLINE_DONE}s` }} />

          {/* supporting content waits for the headline to finish composing
              (HEADLINE_DONE) so the primary hero text resolves before the
              secondary copy and CTAs do, not after */}
          <p className="standfirst hero-reveal" style={{ "--rd": `${HEADLINE_DONE}s` }}>
            Two practices, one pair of hands. Photographs made as{" "}
            <strong>{P.photoBrand}</strong>, and the sites they live on designed
            and built by the same person.
            <i> Hire either. Hiring both is the point.</i>
          </p>

          {/* both doors stated above the fold, so a cold visitor can tell
              inside three seconds that this is two crafts and not one */}
          <div className="disciplines hero-reveal" style={{ "--rd": `${HEADLINE_DONE + 0.08}s` }}>
            {INTRO.does.map((d, i) => (
              <TLink key={d.to} to={d.to} className="disc">
                <span className="mono">{String(i + 1).padStart(2, "0")} — {d.k}</span>
                <strong>{d.brand}</strong>
                <span className="mono go">Enter <span className="arrow">→</span></span>
              </TLink>
            ))}
          </div>

          <div className="role hero-reveal" style={{ "--rd": `${HEADLINE_DONE + 0.16}s` }}>
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
              <img src={img(s, 400, 264)} srcSet={srcSet(s)}
                sizes="(max-width: 640px) 160px, 210px" alt="" />
            </figure>
          ))}
        </div>
      </div>

      {/* gallery — four categories, no captions */}
      <Gallery />

      {/* design — real projects once they're published; until then the
          space is visibly held for them */}
      <section className="sec" id="design">
        <div className="wrap sec-grid">
          <div className="sec-label mono">Design</div>
          <div>
            {HAS_REAL_WEB ? (
              <>
                <div className="wgrid">
                  {WEB_PROJECTS.slice(0, 2).map((w, i) => (
                    <Reveal key={w.slug} delay={i * 0.06}>
                      <TLink to={`/design/${w.slug}`} className="wcard"
                        aria-label={`Open ${w.t}`}>
                        <div className="browser">
                          <div className="browser-bar">
                            <span className="browser-dots" aria-hidden="true"><i /><i /><i /></span>
                            <span className="browser-url mono">
                              {w.embed ? `${w.t} — Figma prototype` : `${w.slug}.com`}
                            </span>
                            <span className="mono" style={{ opacity: 0.5 }}>{w.year || w.tool}</span>
                          </div>
                          {hasPhoto(w.cover) ? (
                            <div className="browser-view">
                              <img src={img(w.cover, 1200, reduced ? 825 : 2100)} srcSet={srcSet(w.cover)}
                                sizes="(max-width: 760px) 100vw, 50vw"
                                alt={`${w.t} — full page`} loading="lazy" />
                            </div>
                          ) : w.embed && w.href ? (
                            <div className="figbox">
                              <div className="browser-ph figbox-fallback">
                                <span className="browser-ph-name">{w.t}</span>
                                <span className="mono">{w.tag}</span>
                              </div>
                              <iframe className="figbox-frame" title={`${w.t} — Figma preview`}
                                src={figmaEmbed(w.href)} loading="lazy" tabIndex={-1} />
                            </div>
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
                    </Reveal>
                  ))}
                </div>
                <div style={{ marginTop: 34 }}>
                  <TLink to="/design" className="extlink">
                    All design work <span className="arrow">→</span>
                  </TLink>
                </div>
              </>
            ) : (
              <Reveal className="reserved">
                <span className="mono">Reserved</span>
                <h3>The design work is on its way.</h3>
                <p>
                  This space is held for the design &amp; build side — identities,
                  layouts and shipped sites. Projects appear here as they are
                  published.
                </p>
                <TLink to="/design" className="extlink">
                  Design &amp; build <span className="arrow">→</span>
                </TLink>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* end */}
      <section className="end" id="contact">
        <div className="wrap">
          <Reveal>
            <h2 className="display">Bring me<br />the difficult one.</h2>
            <MagneticMail email={P.email} reduced={reduced} />
            <div className="mono" style={{ marginTop: 18 }}>
              {P.phone} — {P.city}, {P.region}
            </div>
          </Reveal>

          <Reveal as="dl" className="colophon">
            <div>
              <dt className="mono">Contact</dt>
              <dd>
                <a href={`mailto:${P.email}`}>{P.email}</a><br />
                <a href={`mailto:${P.email2}`}>{P.email2}</a><br />
                <a href={`tel:${P.phone.replace(/[^+\d]/g, "")}`}>{P.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="mono">Built with</dt>
              <dd>Figma · React · Framer<br />Capture One · DaVinci</dd>
            </div>
            <div>
              <dt className="mono">Elsewhere</dt>
              <dd>
                {P.socials.map((s) => (
                  <span key={s.href} style={{ display: "block" }}>
                    <a href={s.href} target="_blank" rel="noreferrer">
                      {s.k} — {s.v}
                    </a>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="mono">Colophon</dt>
              <dd>Dark, minimal, type-led. Built so the pictures are the only bright thing on the page.</dd>
            </div>
          </Reveal>

          <hr className="rule" style={{ marginTop: 44 }} />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 18 }}>
            <span className="mono">© 2026 {P.name}</span>
            <span className="mono">{P.city}, {P.region} — Booking 2026</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ==================================================================
   GALLERY — four category tabs over a captionless masonry grid.
   Simple on purpose: the frames are the content, nothing explains
   them. Starts on the first category that actually has photos.
   ================================================================== */
function Gallery() {
  const [cat, setCat] = useState(
    () => GALLERY_CATS.find((c) => GALLERY_ITEMS.some((g) => g.cat === c)) ?? GALLERY_CATS[0],
  );
  const [lb, setLb] = useState(-1); // lightbox index, -1 = closed
  const [reduced] = useState(prefersReduced);
  const shots = GALLERY_ITEMS.filter((g) => g.cat === cat);
  const seeds = shots.map((g) => g.seed);

  // switching category closes any open preview so its index can't go stale
  const pick = (c) => { setLb(-1); setCat(c); };

  return (
    <section className="gwork" id="gallery" aria-label="Gallery">
      <div className="wrap">
        <div className="gwork-head">
          <div className="mono">Gallery</div>
          <div className="gtabs" role="group" aria-label="Gallery categories">
            {GALLERY_CATS.map((c) => (
              <button key={c} className="gtab" aria-pressed={c === cat} onClick={() => pick(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {shots.length ? (
          <div className="pgrid" key={cat}>
            {shots.map((g, n) => (
              <figure key={g.seed} onClick={() => setLb(n)}
                role="button" tabIndex={0} aria-label={`Preview photo ${n + 1}`}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLb(n); } }}>
                <img src={img(g.seed, 640)} srcSet={srcSet(g.seed)}
                  sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                  alt="" loading="lazy" style={{ aspectRatio: ratio(g.seed, 3, 4) }} />
              </figure>
            ))}
          </div>
        ) : (
          <div className="gempty mono">{cat} — photos arriving soon</div>
        )}
      </div>

      <AnimatePresence>
        {lb > -1 && (
          <Lightbox photos={seeds} title={cat} index={lb} setIndex={setLb} reduced={reduced} single />
        )}
      </AnimatePresence>
    </section>
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
