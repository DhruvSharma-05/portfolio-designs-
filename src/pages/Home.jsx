import { useState, useEffect, useRef, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import {
  P, img, srcSet, ratio, INTRO, SHEET,
  PHOTO_PROJECTS, PHOTO_POOL, WEB_PROJECTS, HAS_REAL_WEB, hasPhoto, prefersReduced, heavyVisualsAllowed,
} from "../data.js";
import { Reveal, TLink, Lightbox, FigmaFrame, ContactForm } from "../ui.jsx";
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

      {/* photography — one card per collection, opening the gallery view */}
      <PhotoProjects />

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
            <p className="standfirst" style={{ marginTop: 20 }}>
              Tell me about the shoot, the site, or both — a few lines is enough to start.
            </p>
            <ContactForm email={P.email} />
            <div className="mono" style={{ marginTop: 20 }}>
              Prefer email? <a href={`mailto:${P.email}`} style={{ color: "var(--accent)" }}>{P.email}</a>
              {" · "}{P.phone} · {P.city}, {P.region}
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
   PHOTOGRAPHY — one card per collection (wildlife / traditional / …),
   each opening its full gallery at /photography/:slug. The frames are
   the content; the card just names the set and its size.
   ================================================================== */
function PhotoProjects() {
  const [lb, setLb] = useState(-1); // lightbox index into PHOTO_POOL, -1 = closed
  const [reduced] = useState(prefersReduced);

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
          {PHOTO_PROJECTS.map((p, n) => (
            <Reveal key={p.slug} delay={n * 0.06}>
              <TLink to={`/photography/${p.slug}`} className="projcard" aria-label={`Open ${p.t}`}>
                <div className="projshot" style={{ aspectRatio: ratio(p.photos[0], 4, 3) }}>
                  <img src={img(p.photos[0], 900, 675)} srcSet={srcSet(p.photos[0])}
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    alt={p.t} loading="lazy" />
                  <span className="open">{p.photos.length} frames →</span>
                </div>
                <div className="projcap">
                  <h3>{p.t}</h3>
                  <span className="mono">{p.kind}</span>
                </div>
              </TLink>
            </Reveal>
          ))}
        </div>

        {/* selected frames — a mix from every collection, click to enlarge */}
        {PHOTO_POOL.length > 0 && (
          <>
            <div className="mono gwork-sub">Selected frames</div>
            <div className="pgrid">
              {PHOTO_POOL.map((s, n) => (
                <figure key={s + n} onClick={() => setLb(n)}
                  role="button" tabIndex={0} aria-label={`Preview photo ${n + 1}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLb(n); } }}>
                  <span className="idx mono">{String(n + 1).padStart(2, "0")}</span>
                  <img src={img(s, 640)} srcSet={srcSet(s)}
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    alt="" loading="lazy" style={{ aspectRatio: ratio(s, 3, 4) }} />
                </figure>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {lb > -1 && (
          <Lightbox photos={PHOTO_POOL} title="Selected frames"
            index={lb} setIndex={setLb} reduced={reduced} single />
        )}
      </AnimatePresence>
    </section>
  );
}
