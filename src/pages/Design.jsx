import { useRef, useState } from "react";
import { motion } from "motion/react";
import { P, img, WEB_PROJECTS, prefersReduced } from "../data.js";
import { Reveal, TLink } from "../ui.jsx";

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const PROCESS = [
  { k: "Look first", v: "We start from the pictures and the words, never from a template." },
  { k: "One accent", v: "A dark, quiet frame so the work is the only loud thing on the page." },
  { k: "Design in the browser", v: "Figma for the thinking, real code for the deciding." },
  { k: "Ship and hand over", v: "Live site, source file, and a way for you to change it yourself." },
];

/* ==================================================================
   DESIGN — the web-design half of the portfolio.

   Every project is a browser-chrome card whose screenshot scrolls
   inside its own frame on hover, so the grid previews whole pages
   rather than crops. Opening one goes to /design/:slug.
   ================================================================== */
export default function Design() {
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);

  return (
    <motion.main ref={root} id="main" className="wrap" style={{ paddingTop: "12vh" }}
      variants={page} initial="initial" animate="animate">
      {/* ---------- masthead ---------- */}
      <header>
        <div className="mono" style={{ marginBottom: 26 }}>
          Web design & build — {P.city}
        </div>
        <h1 className="display">Sites for<br />people who<br />make things.</h1>
        <div className="drawline" style={{ height: 1, background: "var(--accent)", marginTop: 40 }} />
        <div className="role" style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 18 }}>
          <span className="mono">Figma · Canva · React · Webflow</span>
          <span className="mono">Designed and built by the same person</span>
        </div>
      </header>

      {/* ---------- thesis ---------- */}
      <section className="band">
        <div className="thesis-grid">
          <Reveal>
            <p className="lead">
              A photographer who builds the site is a shortcut.
              <i> Nothing gets cropped in the handover.</i>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="aside">
            <p>
              Hover any project below — the screenshot scrolls inside its own browser frame,
              so you see the whole page, not a hero crop.
            </p>
            <p>Open one for the screens, the stack, and a link to the source file.</p>
          </Reveal>
        </div>
      </section>

      {/* ---------- project grid ---------- */}
      <section style={{ paddingBottom: "12vh" }}>
        <div className="wgrid">
          {WEB_PROJECTS.map((w, i) => (
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
                    <img src={img(w.cover, 1200, reduced ? 825 : 2100)} alt={`${w.t} — full page`} loading="lazy" />
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
      </section>

      {/* ---------- process ---------- */}
      <section className="sec">
        <div className="sec-grid">
          <div className="sec-label mono">How a build goes</div>
          <div>
            {PROCESS.map((s, i) => (
              <Reveal className="sl-row" key={s.k} delay={i * 0.04}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.k}</h3>
                <p>{s.v}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- cross-link to photography ---------- */}
      <section className="sec">
        <Reveal className="teaser">
          <TLink to="/photography">
            <span className="mono">The other half</span>
            <h3>Photography</h3>
            <p>Editorial, portrait and event sets — the full edits.</p>
            <span className="go mono">See the projects <span className="arrow">→</span></span>
          </TLink>
          <TLink to="/about">
            <span className="mono">Who's behind it</span>
            <h3>About {P.photographer}</h3>
            <p>How the two crafts feed each other, and what I'm booking now.</p>
            <span className="go mono">Read more <span className="arrow">→</span></span>
          </TLink>
        </Reveal>
      </section>

      {/* ---------- end ---------- */}
      <section className="end">
        <Reveal>
          <h2 className="display">Got a site<br />that deserves better?</h2>
          <a className="mail" href={`mailto:${P.email}`}>{P.email}</a>
        </Reveal>
        <div style={{ marginTop: 44 }}>
          <TLink to="/" className="mono back"><span className="arrow">←</span> Back to work</TLink>
        </div>
      </section>
    </motion.main>
  );
}
