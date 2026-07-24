import { useRef, useState } from "react";
import { motion } from "motion/react";
<<<<<<< Updated upstream
import { P, img, WEB_PROJECTS, prefersReduced } from "../data.js";
import { Reveal, TLink } from "../ui.jsx";
=======
import { P, img, srcSet, WEB_PROJECTS, prefersReduced } from "../data.js";
import { Reveal, TLink, useMouseTilt } from "../ui.jsx";
>>>>>>> Stashed changes

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

const FILTERS = ["All", "Delivered", "Concept"];

/* A project counts as "Delivered" once it has a live URL (or the admin
   set an explicit status); everything else reads as a "Concept". Keeps
   the filter honest against whatever Contentful / Drive actually holds
   instead of hard-coding a status per project. */
const categoryOf = (w) =>
  w.status === "Delivered" || w.status === "Concept"
    ? w.status
    : (w.live && String(w.live).trim()) ? "Delivered" : "Concept";

/* Delivered work leans portrait, concepts run wide — the same rhythm as
   the reference, but driven off the derived category. */
const ratioOf = (w) => (categoryOf(w) === "Delivered" ? "portrait" : "wide");

/* One project tile: the numbered editorial header, a screenshot that
   tilts toward the cursor, then the caption. */
function ProjectCard({ w, n, reduced }) {
  const tilt = useMouseTilt(7);
  const ratio = ratioOf(w);
  return (
    <TLink to={`/design/${w.slug}`} className="dlx-proj" data-cursor="Open"
      aria-label={`Open ${w.t}`}>
      <div className="dlx-proj-head mono">
        <span><span className="idx">{String(n).padStart(2, "0")}</span> / {categoryOf(w)}</span>
        <span>{w.year}</span>
      </div>
      <div ref={tilt} className={`dlx-card is-${ratio}`}>
        <img src={img(w.cover, 1200, reduced ? 825 : 1500)} srcSet={srcSet(w.cover)}
          sizes="(max-width: 820px) 100vw, 46vw" alt={w.t} loading="lazy" />
      </div>
      <div className="dlx-cap">
        <h3>{w.t}</h3>
        <span className="cat">{w.tag}</span>
      </div>
    </TLink>
  );
}

/* ==================================================================
   DESIGN — the web-design half of the portfolio.

   Scoped light "editorial" theme (.dlx): warm paper, one orange accent,
   an Anton display, and a staggered, cursor-tilting archive. Projects
   still come straight from WEB_PROJECTS (Contentful / Drive); only the
   presentation changed. Delivered vs Concept is derived, not authored.
   ================================================================== */
export default function Design() {
  const [reduced] = useState(prefersReduced);
  const [filter, setFilter] = useState("All");
  const root = useRef(null);

  const shown = WEB_PROJECTS.filter((w) => filter === "All" || categoryOf(w) === filter);

  return (
    <motion.main ref={root} id="main" className="dlx"
      variants={page} initial="initial" animate="animate">
<<<<<<< Updated upstream
      {/* ---------- masthead ---------- */}
      <header>
        <div className="mono" style={{ marginBottom: 26 }}>
          Web design & build by {P.photographer} — {P.city}
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
=======
      <div className="dlx-wrap">
        {/* ---------- masthead + filters ---------- */}
        <header className="dlx-head">
>>>>>>> Stashed changes
          <div>
            <span className="dlx-kicker mono">[ Archive ]</span>
            <h1 className="dlx-title">Design</h1>
            <p className="dlx-intro">
              A working archive of delivered client sites and front-end
              explorations — designed and built by {P.photographer}, the same
              person behind the camera. Hover a card; it tilts.
            </p>
          </div>
          <div className="dlx-tabs" role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f}
                className={`dlx-tab mono ${filter === f ? "on" : ""}`}
                onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </header>

        {/* ---------- staggered project archive ---------- */}
        <section className="dlx-archive">
          <div className="dlx-grid">
            {shown.map((w, i) => (
              <Reveal key={w.slug} className="dlx-cell" delay={(i % 2) * 0.08}>
                <ProjectCard w={w} n={i + 1} reduced={reduced} />
              </Reveal>
            ))}
          </div>
          {shown.length === 0 && (
            <p className="dlx-empty mono">Nothing in this filter yet.</p>
          )}
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
