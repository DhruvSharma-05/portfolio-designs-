import { useRef, useState } from "react";
import { motion } from "motion/react";
import { P, img, WEB_PROJECTS, prefersReduced } from "../data.js";
import { Reveal, TLink, useMouseTilt } from "../ui.jsx";

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

/* Alternate the frame proportion so the staggered grid reads on a
   diagonal instead of as a tidy matrix. */
const ratioOf = (n) => (n % 2 === 1 ? "portrait" : "wide");

/* One project tile: a numbered editorial header, a screenshot that tilts
   toward the cursor and reveals a "View" cue on hover, then the caption. */
function ProjectCard({ w, n, reduced }) {
  const tilt = useMouseTilt(7);
  const ratio = ratioOf(n);
  return (
    <TLink to={`/design/${w.slug}`} className="dlx-proj" data-cursor="Open"
      aria-label={`Open ${w.t}`}>
      <div className="dlx-proj-head mono">
        <span><span className="idx">{String(n).padStart(2, "0")}</span> / {w.tag}</span>
        <span>{w.year}</span>
      </div>
      <div ref={tilt} className={`dlx-card is-${ratio}`}>
        <img src={img(w.cover, 1200, reduced ? 825 : 1500)} alt={w.t} loading="lazy" />
        <span className="dlx-card-hint mono">View project <span className="arrow">→</span></span>
      </div>
      <div className="dlx-cap">
        <h3>{w.t}</h3>
        <span className="cat">{w.tool}</span>
      </div>
    </TLink>
  );
}

/* ==================================================================
   DESIGN — the web-design half of the portfolio.

   Light "editorial" theme (.dlx): warm paper, one orange accent, an
   Anton display, and a staggered, cursor-tilting archive. Projects come
   straight from WEB_PROJECTS (Contentful / Drive) — only the
   presentation is bespoke here.
   ================================================================== */
export default function Design() {
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);

  return (
    <motion.main ref={root} id="main" className="dlx"
      variants={page} initial="initial" animate="animate">
      <div className="dlx-wrap">
        {/* ---------- masthead ---------- */}
        <header className="dlx-head">
          <div>
            <span className="dlx-kicker mono">[ Archive ]</span>
            <h1 className="dlx-title">Design</h1>
            <p className="dlx-intro">
              A working archive of client sites, product UI and front-end
              explorations — designed and built by {P.photographer}, the same
              person behind the camera. Hover a card; it tilts.
            </p>
          </div>
        </header>

        {/* ---------- staggered project archive ---------- */}
        <section className="dlx-archive">
          <div className="dlx-grid">
            {WEB_PROJECTS.map((w, i) => (
              <Reveal key={w.slug} className="dlx-cell" delay={(i % 2) * 0.08}>
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
