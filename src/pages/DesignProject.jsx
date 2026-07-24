import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { WEB_PROJECTS, img, srcSet, ratio, prefersReduced } from "../data.js";
import { Reveal, TLink } from "../ui.jsx";
import { useApp } from "../context.js";

const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ==================================================================
   DESIGN PROJECT — one build, end to end.

   Browser-framed hero, the brief, the spec, a link out to the source
   file (Figma / Canva / live), then every screen at full width.
   ================================================================== */
export default function DesignProject() {
  const { slug } = useParams();
  const { go } = useApp();
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);

  const i = WEB_PROJECTS.findIndex((w) => w.slug === slug);
  const w = WEB_PROJECTS[i];

  // Unknown project → back to the design index.
  useEffect(() => {
    if (i === -1) go("/design");
  }, [i, go]);

  /* gentle parallax on each screen as it passes through the viewport */
  useGSAP(() => {
    if (reduced) return;
    gsap.utils.toArray(".screen img").forEach((el) => {
      gsap.set(el, { scale: 1.08, transformOrigin: "50% 50%" });
      gsap.fromTo(el, { yPercent: -4 }, {
        yPercent: 4, ease: "none",
        scrollTrigger: { trigger: el.closest(".screen"), start: "top bottom", end: "bottom top", scrub: true },
      });
    });
    ScrollTrigger.refresh();
  }, { scope: root, dependencies: [reduced, slug] });

  if (!w) return null;

  const prev = WEB_PROJECTS[(i - 1 + WEB_PROJECTS.length) % WEB_PROJECTS.length];
  const next = WEB_PROJECTS[(i + 1) % WEB_PROJECTS.length];

  return (
    <motion.main ref={root} id="main" className="detail wrap"
      variants={page} initial="initial" animate="animate">
      <TLink to="/design" className="mono back">
        <span className="arrow">←</span> All design work
      </TLink>

      <div className="detail-head">
        <div>
          <div className="mono" style={{ marginBottom: 16 }}>{w.tag} — {w.year}</div>
          <h1>{w.t}</h1>
        </div>
        <div className="mono" style={{ color: "var(--accent)" }}>{w.role}</div>
      </div>

      {/* browser-framed hero screen */}
      <div className="browser">
        <div className="browser-bar">
          <span className="browser-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="browser-url mono">{w.slug}.com</span>
          <span className="mono" style={{ opacity: 0.5 }}>{w.tool}</span>
        </div>
        <div className="browser-view">
          <img src={img(w.cover, 1600, reduced ? 1100 : 2800)} srcSet={srcSet(w.cover)}
            sizes="(max-width: 1180px) 100vw, 1180px" alt={`${w.t} — full page`} />
        </div>
      </div>

      <div className="detail-grid">
        <Reveal>
          <p className="pj-intro">{w.intro}</p>
          <p style={{ color: "var(--dim)", lineHeight: 1.72, fontSize: 15, marginTop: 22, maxWidth: "44ch" }}>
            {w.note}
          </p>
          <div style={{ marginTop: 30 }}>
            <a className="extlink" href={w.href || undefined} target="_blank" rel="noreferrer noopener"
              aria-disabled={w.href ? undefined : "true"}>
              {w.href ? `Open in ${w.tool}` : `${w.tool} file — private`} <span className="arrow">↗</span>
            </a>
          </div>
          {w.live && (
            <div style={{ marginTop: 14 }}>
              <a className="mono" href={w.live} target="_blank" rel="noreferrer noopener"
                style={{ color: "var(--accent)" }}>Visit the live site ↗</a>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.08}>
          <dl className="spec">
            {w.specs.map((s) => (
              <div key={s.k}><dt className="mono">{s.k}</dt><dd>{s.v}</dd></div>
            ))}
            <div><dt className="mono">Year</dt><dd>{w.year}</dd></div>
          </dl>
          <div className="stack-pills" style={{ marginTop: 26 }}>
            {w.stack.map((s) => <span className="pill" key={s}>{s}</span>)}
          </div>
        </Reveal>
      </div>

      {/* every screen, full width */}
      <section className="sec" style={{ marginTop: "4vh" }}>
        <div className="mono" style={{ marginBottom: 24 }}>The screens</div>
        <div className="screens">
          {w.shots.map((s, n) => (
            <Reveal className="screen" key={s + n} delay={0.04}
              style={{ aspectRatio: ratio(s, 1600, 1000) }}>
              <img src={img(s, 1600, 1000)} srcSet={srcSet(s)} sizes="(max-width: 1180px) 100vw, 1180px"
                alt={`${w.t}, screen ${n + 1}`} loading="lazy" />
            </Reveal>
          ))}
        </div>
      </section>

      <nav className="pager">
        <TLink to={`/design/${prev.slug}`}>
          <span className="mono">← Previous</span>
          <strong>{prev.t}</strong>
        </TLink>
        <TLink to={`/design/${next.slug}`} className="next">
          <span className="mono">Next →</span>
          <strong>{next.t}</strong>
        </TLink>
      </nav>
    </motion.main>
  );
}
