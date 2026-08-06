import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import {
  P, img, srcSet, ratio, isLandscape, INTRO, TESTIMONIALS, TAGLINE,
  PHOTO_PROJECTS, WEB_PROJECTS, HAS_REAL_WEB, hasPhoto, prefersReduced, ROLES,
} from "../data.js";
import { Reveal, TLink, FigmaFrame, Typewriter } from "../ui.jsx";
import { useSeo } from "../seo.js";
import { useApp } from "../context.js";

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* Hero entrance timing, in seconds — one sequence, so the numbers live
   together rather than being scattered through the JSX.

   The studio name swells out of the frame (2.3s, the .mast-swell
   animation in the CSS); the role line crosses in while it is still
   growing, starts typing once it has cleared, and the sub follows it. */
const SWELL = 2.3;
const ROLES_IN = SWELL - 0.45;   // fades in under the name, before it goes
const ROLES_TYPE = SWELL + 0.05; // first keystroke — the frame is its own
const SUB_IN = SWELL + 0.35;

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
  const stage = useRef(null);

  /* The one pool of light that isn't on a timer: it follows the cursor,
     trailing rather than sticking to it, so it reads as a lamp being
     carried past the name rather than a dot glued to the pointer.

     It also lights what it passes. The pool itself is deliberately almost
     invisible; the thing a visitor actually notices is the ambient pool
     it comes near brightening, which is the `--near` each drifter reads.
     That means measuring the drifters, which is the one bit of this that
     costs anything — see MEASURE_EVERY.

     Written straight to the nodes' style out of a rAF — routing a
     pointermove through React state would re-render the whole page on
     every mouse pixel. */
  useEffect(() => {
    /* the listeners go on the stage, not the light — the light layer is
       pointer-events:none and would never see a move */
    const el = stage.current;
    if (reduced || !el) return;
    const layer = el.querySelector(".mast-light");
    const spot = el.querySelector(".mast-spot");
    const pools = [...layer.querySelectorAll("i")].map((n) => ({ n, cx: 0, cy: 0, near: 0 }));
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, away = true, tick = 0, reach = 600, off = false;

    /* The drifters are moved by a CSS animation, so their position is only
       knowable by asking layout — and a getBoundingClientRect is a layout
       flush. Four of them 60 times a second would be the most expensive
       thing on the page, and pointless: these pools cross the screen over
       20 seconds, so ten reads a second is already far finer than the
       motion. Between reads the falloff is computed against the last
       known centres, which is imperceptibly stale. */
    const MEASURE_EVERY = 6;
    const measure = () => {
      const r = el.getBoundingClientRect();
      /* scrolled past — the pointer can still be "inside" the hero as far
         as boundary events go, and there is no sense lighting a frame
         nobody is looking at */
      off = r.bottom <= 0 || r.top >= window.innerHeight;
      // how far the cursor's influence carries, in the frame's own terms
      reach = Math.max(r.width, r.height) * 0.5;
      pools.forEach((p) => {
        const b = p.n.getBoundingClientRect();
        p.cx = b.left + b.width / 2 - r.left;
        p.cy = b.top + b.height / 2 - r.top;
      });
    };

    const frame = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      if (tick++ % MEASURE_EVERY === 0) measure();
      /* Each drifter eases toward its own target brightness rather than
         snapping to it, so a fast mouse leaves a swell behind it instead
         of a flicker. `dark` is the resting state — pointer gone, or the
         hero scrolled away — and the ease carries the pools back down to
         it, which is why the loop keeps running for a moment after the
         cursor leaves rather than cutting. */
      const dark = away || off;
      let easing = false;
      pools.forEach((p) => {
        const d = Math.hypot(x - p.cx, y - p.cy);
        const want = dark ? 0 : Math.max(0, 1 - d / reach);
        p.near += (want - p.near) * 0.07;
        p.n.style.setProperty("--near", p.near.toFixed(3));
        if (Math.abs(want - p.near) > 0.004) easing = true;
      });

      const settled = Math.abs(tx - x) < 0.4 && Math.abs(ty - y) < 0.4;
      raf = (dark && settled && !easing) ? 0 : requestAnimationFrame(frame);
    };
    const move = (e) => {
      /* Asked of the event, not of a media query: a touch-screen laptop
         answers `pointer: coarse` to matchMedia even while a mouse is
         driving it, which switched the spotlight off on exactly the
         machines that have a cursor to follow. A finger still can't
         drag the light around — it just isn't pointerType "mouse". */
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      /* Arriving — first load, or back from the tab next door. The light
         is placed under the cursor before it is lit, so it fades up where
         the pointer actually is instead of sweeping in from wherever it
         was left. This has to run on every arrival, not just the first
         one: gating it on a seen-once flag left the light dark for the
         rest of the visit once the pointer had wandered off. */
      if (away) {
        away = false;
        x = tx; y = ty;
        spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        layer.dataset.spot = "on";
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const leave = () => { away = true; layer.dataset.spot = ""; };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

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
      {/* masthead — the studio name opens the page and gets out of the
          way; what stays is the one thing a visitor needs, which craft
          this is. Everything that used to crowd it in here now has its
          own room in .intro-sec below. */}
      <header className="mast" id="main">
        <div className="mast-stage" ref={stage}>
          {/* light behind the copy — three pools drifting on their own slow
              cycles, and one that follows the cursor. See .mast-light. */}
          <div className="mast-light" aria-hidden="true">
            <i /><i /><i />
            <span className="mast-spot" />
          </div>

          <div className="wrap">
            <div className="mast-copy">
              {/* the name swells out of this row and the roles take it over,
                  so the two share one line — see .mast-swell */}
              <div className="mast-line">
                <h1 className={`display${reduced ? "" : " mast-swell"}`}>{P.name}</h1>
                {/* the three crafts, written out one after the other */}
                <div className="mast-roles hero-reveal" style={{ "--rd": `${ROLES_IN}s` }}>
                  <Typewriter words={ROLES} delay={reduced ? 0 : ROLES_TYPE} />
                </div>
              </div>

              <p className="mast-sub hero-reveal" style={{ "--rd": `${SUB_IN}s` }}>
                Vancouver based designer who loves beautiful things and blends
                creativity and technology into every screen.
              </p>
            </div>
          </div>
        </div>
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

      {/* photography — one card per collection, opening the gallery view */}
      <PhotoProjects />

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
