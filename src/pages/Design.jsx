import { useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { P, img, WEB_PROJECTS, prefersReduced } from "../data.js";
import { Reveal, TLink, useMouseTilt } from "../ui.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const PROCESS = [
  { k: "Look first", v: "We start from the pictures and the words, never from a template." },
  { k: "One accent", v: "A quiet frame so the work is the only loud thing on the page." },
  { k: "Design in the browser", v: "Figma for the thinking, real code for the deciding." },
  { k: "Ship and hand over", v: "Live site, source file, and a way for you to change it yourself." },
];

/* Straight vertical passes: each card rises bottom-to-top in its own
   lane, held at a fixed x offset (vw from centre) with a slight tilt (r),
   so they glide up past the pinned title at staggered horizontal spots. */
const LANES = [
  { x: -34, r: -3 },
  { x: 30, r: 3 },
  { x: -14, r: 2 },
  { x: 38, r: -4 },
  { x: 8, r: -2 },
  { x: -40, r: 4 },
  { x: 20, r: 2 },
];

/* One project tile in the archive: numbered header, cursor-tilting
   screenshot with a hover cue, then the caption. */
function ProjectCard({ w, n, reduced }) {
  const tilt = useMouseTilt(7);
  return (
    <TLink to={`/design/${w.slug}`} className="dlx-proj" data-cursor="Open"
      aria-label={`Open ${w.t}`}>
      <div className="dlx-proj-head mono">
        <span><span className="idx">{String(n).padStart(2, "0")}</span> / {w.tag}</span>
        <span>{w.year}</span>
      </div>
      <div ref={tilt} className="dlx-card">
        <img src={img(w.cover, 1400, reduced ? 900 : 1600)} alt={w.t} loading="lazy" />
        <span className="dlx-card-hint mono">View project <span className="arrow">→</span></span>
      </div>
      <div className="dlx-cap">
        <h3>{w.t}</h3>
        <span className="cat">{w.tool}</span>
      </div>
    </TLink>
  );
}

/* ---------- cinematic "Projects" scroll intro ----------
   The title pins in the centre while clickable project cards drift across
   the frame, scrubbed by scroll. Reduced motion falls back to a still
   title (the full archive below carries the work). */
function ProjectsScroll({ projects, reduced }) {
  const root = useRef(null);

  useGSAP(() => {
    if (reduced) return;
    const stage = root.current.querySelector(".dph-stage");
    const cards = gsap.utils.toArray(".dph-card", root.current);
    if (!cards.length) return;

    const vw = (n) => (window.innerWidth * n) / 100;
    const vh = (n) => (window.innerHeight * n) / 100;

    gsap.set(cards, { xPercent: -50, yPercent: -50 });

    const tl = gsap.timeline({
      defaults: { duration: 1, ease: "none" },
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => "+=" + window.innerHeight * 2.6,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    const OFF = 85; // vh off-screen, so a card fully clears top & bottom
    cards.forEach((el, i) => {
      const L = LANES[i % LANES.length];
      tl.fromTo(
        el,
        { x: () => vw(L.x), y: () => vh(OFF), rotation: L.r },
        { x: () => vw(L.x), y: () => vh(-OFF), rotation: L.r },
        i * 0.55,
      );
    });

    ScrollTrigger.refresh();
  }, { scope: root, dependencies: [reduced, projects.length] });

  return (
    <section className={`dprojhero${reduced ? " is-static" : ""}`} ref={root}
      aria-label="Projects">
      <div className="dph-stage">
        <div className="dph-title">
          <h1 className="dph-h">Projects</h1>
          <span className="dph-sub">Selected Works</span>
        </div>

        {!reduced && projects.map((w) => (
          <TLink key={w.slug} to={`/design/${w.slug}`} className="dph-card"
            data-cursor="Open" aria-label={`Open ${w.t}`}>
            <div className="dph-card-img">
              <img src={img(w.cover, 600, 750)} alt={w.t} loading="lazy" />
            </div>
            <div className="dph-card-cap">
              <strong>{w.t}</strong>
              <span className="mono">{w.tag} · {w.year}</span>
            </div>
          </TLink>
        ))}

        {!reduced && (
          <div className="dph-cue mono" aria-hidden="true">Scroll <i>↓</i></div>
        )}
      </div>
    </section>
  );
}

/* ==================================================================
   DESIGN — the web-design half of the portfolio.

   Opens on a cinematic, scroll-scrubbed "Projects" intro (clickable
   cards drift past a pinned title), then settles into the same
   editorial archive as before. Projects come straight from
   WEB_PROJECTS (Contentful / Drive).
   ================================================================== */
export default function Design() {
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);

  return (
    <motion.main ref={root} id="main" className="dlx"
      variants={page} initial="initial" animate="animate">

      <ProjectsScroll projects={WEB_PROJECTS} reduced={reduced} />

      <div className="dlx-wrap">
        {/* ---------- context + archive ---------- */}
        <header className="dlx-head">
          <div>
            <span className="dlx-kicker mono">[ Index ]</span>
            <h2 className="dlx-h2">Every project, in full.</h2>
            <p className="dlx-intro">
              Client sites, product UI and front-end explorations — designed and
              built by {P.photographer}, the same person behind the camera.
              Hover a card; it tilts.
            </p>
          </div>
        </header>

        <section className="dlx-archive">
          <div className="dlx-grid">
            {WEB_PROJECTS.map((w, i) => (
              <Reveal key={w.slug} className="dlx-cell" delay={(i % 2) * 0.06}>
                <ProjectCard w={w} n={i + 1} reduced={reduced} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- process ---------- */}
        <section className="dlx-craft">
          <div className="dlx-craft-head">
            <span className="dlx-kicker mono">[ Process ]</span>
            <h2 className="dlx-h2">How a build goes</h2>
          </div>
          <div className="dlx-craft-list">
            {PROCESS.map((s, i) => (
              <Reveal className="dlx-craft-row" key={s.k} delay={i * 0.04}>
                <h3><span className="idx mono">{String(i + 1).padStart(2, "0")}</span>{s.k}</h3>
                <p>{s.v}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- cross-links ---------- */}
        <section className="dlx-teaser">
          <TLink to="/photography" data-cursor="View">
            <span className="mono">The other half</span>
            <h3>{P.photoBrand}</h3>
            <p>Editorial, portrait and event sets — the full edits.</p>
            <span className="go mono">See the projects <span className="arrow">→</span></span>
          </TLink>
          <TLink to="/about" data-cursor="View">
            <span className="mono">Who's behind it</span>
            <h3>About {P.photographer}</h3>
            <p>How the two crafts feed each other, and what I'm booking now.</p>
            <span className="go mono">Read more <span className="arrow">→</span></span>
          </TLink>
        </section>

        {/* ---------- end ---------- */}
        <section className="dlx-cta">
          <Reveal>
            <h2 className="dlx-title">Got a site<br />that deserves better?</h2>
            <a className="dlx-mail" href={`mailto:${P.email}`}>{P.email} <span className="arrow">→</span></a>
          </Reveal>
          <div className="dlx-back">
            <TLink to="/" className="mono"><span className="arrow">←</span> Back to work</TLink>
          </div>
        </section>
      </div>
    </motion.main>
  );
}
