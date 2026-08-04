import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import {
  P, img, srcSet, ratio, isLandscape, INTRO, HERO_FRAMES, METRICS, TESTIMONIALS, TAGLINE,
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
  useSeo("", "Photographer and web designer in Vancouver. Portraits, events and visual stories, plus UI/UX and web design in Figma. Shot and designed by the same person.");
  const { openContact } = useApp();
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
        <HeroFrames frames={HERO_FRAMES} reduced={reduced}>
          <div className="wrap">
            <div className="mast-copy">
              <div className="mono" style={{ marginBottom: 22 }}>
                {P.photographer}
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
              <strong>lensofviraj</strong>, and the sites they live on designed
              by the same person.
              <i> Hire either. Hiring both is the point.</i>
            </p>
            <div className="drawline" />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="disciplines">
              {INTRO.does.map((d) => (
                <TLink key={d.to} to={d.to} className="disc">
                  <strong>{d.t}</strong>
                  <span className="mono go">Enter <span className="arrow">→</span></span>
                </TLink>
              ))}
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
                  This space is held for the design side: identities, layouts
                  and product prototypes. Projects appear here as they are
                  published.
                </p>
                <TLink to="/design" className="extlink">
                  Design work <span className="arrow">→</span>
                </TLink>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* the studio line — a quiet full-width statement between the work
          and the offer */}
      <section className="statement">
        <div className="wrap">
          <Reveal as="p">
            {TAGLINE.split(". ").map((s, i, a) => (
              <span className="st-line" key={i}>{s}{i < a.length - 1 ? "." : ""}</span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* what a client walks away with — framed on the two crafts Viraj
          does himself: photography and design */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">What you get</div>
          <div className="get-grid">
            {INTRO.offer.map((o, i) => (
              <Reveal className="get-card" key={o.k} delay={i * 0.06}>
                <span className="get-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{o.k}</h3>
                <p>{o.v}</p>
              </Reveal>
            ))}
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

      {/* testimonials — client words, right before the closing CTA */}
      <section className="sec">
        <div className="wrap sec-grid">
          <div className="sec-label mono">Kind words</div>
          <div className="tmon-grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal className="tcard" key={i} delay={i * 0.06}>
                <blockquote>{t.q}</blockquote>
                <span className="mono tcard-by">{t.by}</span>
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
            <p className="standfirst" style={{ marginTop: 20 }}>
              Tell me about the shoot, the site, or both. A few lines is enough to start.
            </p>
            <div style={{ marginTop: 30 }}>
              <button type="button" className="extlink" onClick={openContact}>
                Contact me <span className="arrow">→</span>
              </button>
            </div>
          </Reveal>

          <Reveal as="dl" className="colophon">
            <div>
              <dt className="mono">Contact</dt>
              <dd>
                <a href={`mailto:${P.email}`}>{P.email}</a><br />
                <a href={`tel:${P.phone.replace(/[^+\d]/g, "")}`}>{P.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="mono">Based in</dt>
              <dd>{P.city} · {P.area}<br />{P.region}</dd>
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
          <div style={{ paddingTop: 18 }}>
            <span className="mono">© {P.name}</span>
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
          {PHOTO_PROJECTS.map((p, n) => {
            // a landscape cover leaves a short card; stack a second frame
            // beneath it so the collection fills its column like the portraits
            const stack = isLandscape(p.photos[0]) && p.photos[1];
            return (
            <Reveal key={p.slug} delay={n * 0.06}>
              <TLink to={`/photography/${p.slug}`} className="projcard" aria-label={`Open ${p.t}`}>
                <div className="projshot" style={{ aspectRatio: ratio(p.photos[0], 4, 3) }}>
                  <img src={img(p.photos[0], 900, 675)} srcSet={srcSet(p.photos[0])}
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    alt={p.t} loading="lazy" />
                  {!stack && <span className="open">{p.photos.length} frames →</span>}
                </div>
                {stack && (
                  <div className="projshot" style={{ aspectRatio: ratio(p.photos[1], 4, 3) }}>
                    <img src={img(p.photos[1], 900, 675)} srcSet={srcSet(p.photos[1])}
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                      alt={`${p.t}, second frame`} loading="lazy" />
                    <span className="open">{p.photos.length} frames →</span>
                  </div>
                )}
                <div className="projcap">
                  <h3>{p.t}</h3>
                </div>
              </TLink>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
