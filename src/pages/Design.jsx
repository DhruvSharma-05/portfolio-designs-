import { useRef, useState } from "react";
import { motion } from "motion/react";
import { P, img, srcSet, WEB_PROJECTS, hasPhoto, prefersReduced } from "../data.js";
import { Reveal, TLink, SectionHead, FigmaFrame } from "../ui.jsx";
import { useSeo } from "../seo.js";
import { useApp } from "../context.js";

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

/* The browser-chrome preview shared by the hero and the grid — a synced
   cover screenshot when one exists (fastest), else a live Figma prototype
   (deferred via FigmaFrame), else a branded name/tag panel. The iframe is
   pointer-events:none so the whole card stays a single link. `sizes`
   differs between the wide hero slot and the narrower grid; `eager` mounts
   the embed immediately (hero only). */
function Preview({ w, reduced, sizes, eager = false }) {
  return (
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
            sizes={sizes} alt={`${w.t} full page`} loading="lazy" />
        </div>
      ) : w.embed && w.href ? (
        <FigmaFrame w={w} eager={eager} />
      ) : (
        <div className="browser-ph">
          <span className="browser-ph-name">{w.t}</span>
          <span className="mono">{w.tag}</span>
        </div>
      )}
    </div>
  );
}

/* ==================================================================
   DESIGN — the web-design half of the portfolio.

   A magazine-style index: a masthead that states the practice, one
   featured build shown large (a live Figma preview + the brief beside
   it), then the rest of the work as a numbered grid. Every card is a
   single link into /design/:slug.
   ================================================================== */
export default function Design() {
  useSeo("Web Design & Build", "UI/UX and web design by Viraj Mehta: interactive product prototypes and sites, designed and built end to end in Vancouver.");
  const { openContact } = useApp();
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);

  const [feat, ...rest] = WEB_PROJECTS;
  const total = String(WEB_PROJECTS.length).padStart(2, "0");

  return (
    <motion.main ref={root} id="main" className="wrap dz" style={{ paddingTop: "12vh" }}
      variants={page} initial="initial" animate="animate">
      {/* ---------- hero: headline + featured live preview ---------- */}
      <header className="dz-hero">
        <div className="dz-hero-copy">
          <div className="dz-kicker">
            <span className="mono">Design &amp; Build · {P.city}</span>
            <span className="mono">{total} selected projects</span>
          </div>
          <h1>Sites &amp; apps,<br />drawn and<br />shipped whole.</h1>
          <div className="drawline" style={{ height: 1, background: "var(--accent)", marginTop: 34 }} />
          <div className="dz-role">
            <span className="mono">Figma · Canva · React · Webflow</span>
          </div>
          {feat && (
            <TLink to={`/design/${feat.slug}`} className="dz-open mono dz-hero-cta">
              Open {feat.t} <span className="arrow">→</span>
            </TLink>
          )}
        </div>

        {feat && (
          <TLink to={`/design/${feat.slug}`} className="dz-hero-media" aria-label={`Open ${feat.t}`}>
            <span className="mono dz-hero-tag">Featured · {feat.tag}</span>
            <Preview w={feat} reduced={reduced} sizes="(max-width: 900px) 100vw, 50vw" eager />
          </TLink>
        )}
      </header>

      {/* ---------- the rest of the work ---------- */}
      {rest.length > 0 && (
        <section className="dz-work-sec">
          <SectionHead>More work</SectionHead>
          <div className="dz-grid">
            {rest.map((w, i) => (
              <Reveal key={w.slug} delay={i * 0.06}>
                <TLink to={`/design/${w.slug}`} className="dz-card" aria-label={`Open ${w.t}`}>
                  <Preview w={w} reduced={reduced} sizes="(max-width: 760px) 100vw, 33vw" />
                  <div className="dz-card-cap">
                    <div className="dz-card-line">
                      <span className="dz-card-idx mono">{String(i + 2).padStart(2, "0")}</span>
                      <h3>{w.t}</h3>
                      <span className="dz-arrow" aria-hidden="true"><span className="arrow">→</span></span>
                    </div>
                    <p>{w.intro}</p>
                  </div>
                </TLink>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------- process ---------- */}
      <section className="sec">
        <div className="sec-grid">
          <div className="sec-label mono">How a build goes</div>
          {/* no reveal on these — the rows just sit there, and the only
              motion is the hover lift */}
          <div>
            {PROCESS.map((s, i) => (
              <div className="sl-row" key={s.k}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.k}</h3>
                <p>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- cross-link to photography ---------- */}
      <section className="sec">
        <Reveal className="teaser">
          <TLink to="/photography">
            <span className="mono">The other half</span>
            <h3>{P.photoBrand}</h3>
            <p>Editorial, portrait and event sets. The full edits.</p>
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
          <div style={{ marginTop: 30 }}>
            <button type="button" className="extlink" onClick={openContact}>
              Contact me <span className="arrow">→</span>
            </button>
          </div>
          <div className="mono" style={{ marginTop: 18 }}>
            or email <a href={`mailto:${P.email}`} style={{ color: "var(--accent)" }}>{P.email}</a>
          </div>
        </Reveal>
        <div style={{ marginTop: 44 }}>
          <TLink to="/" className="mono back"><span className="arrow">←</span> Back to work</TLink>
        </div>
      </section>
    </motion.main>
  );
}
