import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import {
  P, img, srcSet, ratio, INTRO, HERO_FRAMES, METRICS,
  PHOTO_PROJECTS, WEB_PROJECTS, HAS_REAL_WEB, hasPhoto, prefersReduced,
} from "../data.js";
import { Reveal, TLink, FigmaFrame, Metrics } from "../ui.jsx";
import { useSeo } from "../seo.js";
import { useApp } from "../context.js";
import HeroFrames from "../HeroFrames.jsx";

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
  useSeo("", "Photographer and web designer in Vancouver. Portraits, events and visual stories, plus web design and build — shot, designed and shipped by the same person. Booking 2026.");
  const { openContact, go } = useApp();
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);

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

  return (
    <motion.div ref={root} variants={page} initial="initial" animate="animate">
      {/* masthead — a frame the visitor pulls focus on, carrying only the
          studio name and one line. Everything that used to crowd it in
          here now has its own room in .intro-sec below. */}
      <header className="mast" id="main">
        {/* the cue reuses the shell's hash scroll, so it lands with the
            same easing as every other in-page jump on the site */}
        <HeroFrames frames={HERO_FRAMES} reduced={reduced}
          onScrollDown={() => go("/#intro")}>
          <div className="wrap">
            <div className="mast-copy">
              <div className="mono" style={{ marginBottom: 22 }}>
                {P.photographer} · {P.city}
              </div>
              <h1 className="display hero-reveal" style={{ "--rd": `${HEADLINE_DELAY}s` }}>
                {P.name}
              </h1>
              <p className="mast-sub hero-reveal" style={{ "--rd": `${HEADLINE_DONE}s` }}>
                Photographs, and the sites they live on. Made by the same pair of hands.
              </p>
            </div>
          </div>
        </HeroFrames>
      </header>

      {/* the two practices — stated immediately under the hero, so a cold
          visitor still learns inside one scroll that this is two crafts */}
      <section className="intro-sec" id="intro" aria-label="Practices">
        <div className="wrap">
          <Reveal>
            <p className="standfirst">
              Two practices, one pair of hands. Photographs made as{" "}
              <strong>{P.photoBrand}</strong>, and the sites they live on designed
              and built by the same person.
              <i> Hire either. Hiring both is the point.</i>
            </p>
            <div className="drawline" />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="disciplines">
              {INTRO.does.map((d, i) => (
                <TLink key={d.to} to={d.to} className="disc">
                  <span className="mono">{String(i + 1).padStart(2, "0")} · {d.k}</span>
                  <strong>{d.brand}</strong>
                  <span className="mono go">Enter <span className="arrow">→</span></span>
                </TLink>
              ))}
            </div>
            <div className="role">
              <span className="mono">{P.role} · {P.city} · Booking 2026</span>
            </div>
          </Reveal>
        </div>
      </section>

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
                              {w.embed ? `${w.t} · Figma prototype` : `${w.slug}.com`}
                            </span>
                            <span className="mono" style={{ opacity: 0.5 }}>{w.year || w.tool}</span>
                          </div>
                          {hasPhoto(w.cover) ? (
                            <div className="browser-view">
                              <img src={img(w.cover, 1200, reduced ? 825 : 2100)} srcSet={srcSet(w.cover)}
                                sizes="(max-width: 760px) 100vw, 50vw"
                                alt={`${w.t} full page`} loading="lazy" />
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
                  This space is held for the design &amp; build side: identities,
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

      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">The numbers</div>
          <div>
            <Metrics items={METRICS} />
          </div>
        </div>
      </section>

      {/* end */}
      <section className="end" id="contact">
        <div className="wrap">
          <Reveal>
            <h2 className="display">Bring me<br />the difficult one.</h2>
            <p className="standfirst" style={{ marginTop: 20 }}>
              Tell me about the shoot, the site, or both. A few lines is enough to start.
            </p>
            <div style={{ marginTop: 30 }}>
              <button type="button" className="extlink" onClick={openContact}>
                Contact me <span className="arrow">→</span>
              </button>
            </div>
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
                      {s.k} · {s.v}
                    </a>
                  </span>
                ))}
              </dd>
            </div>
          </Reveal>

          <hr className="rule" style={{ marginTop: 44 }} />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 18 }}>
            <span className="mono">© 2026 {P.name}</span>
            <span className="mono">{P.city}, {P.region} · Booking 2026</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ==================================================================
   PHOTOGRAPHY — one card per collection (wildlife / traditional / …),
   each opening its full gallery at /photography/:slug. The card just
   names the set and its size; the frames themselves live on the
   collection page rather than being previewed here.
   ================================================================== */
function PhotoProjects() {
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
      </div>
    </section>
  );
}
