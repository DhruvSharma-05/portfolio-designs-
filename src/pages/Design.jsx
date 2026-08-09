import { useRef, useState } from "react";
import { motion } from "motion/react";
import { P, img, srcSet, WEB_PROJECTS, hasPhoto, prefersReduced } from "../data.js";
import { Reveal, TLink, CenterHead, FigmaFrame, Timeline, Colophon } from "../ui.jsx";
import { useSeo } from "../seo.js";
import { useApp } from "../context.js";

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const PROCESS = [
  { k: "Understand first", v: "We start with the story, the audience, and the feeling the product should create, never with a template." },
  { k: "Shape the direction", v: "A quiet visual system, strong typography, and deliberate spacing so the work stays in focus." },
  { k: "Prototype the experience", v: "Every screen is built in Figma and connected into a clickable prototype, allowing the experience to be tested before development." },
  { k: "Deliver for build", v: "You receive the organized Figma file, prototype link, and developer-ready assets for a smooth handoff." },
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
   featured project shown large (a live Figma preview + the brief
   beside it), then the rest of the work as a numbered grid. Every card
   is a single link into /design/:slug.

   Viraj designs; he does not build. Every line of copy here has to
   stop at the handover — prototypes, files and specs, never shipped
   sites or code. See the INTRO note in data.js.
   ================================================================== */
export default function Design() {
  useSeo("Design", "UI/UX and web design by Viraj Mehta, Vancouver: apps and sites designed screen by screen in Figma, handed over as interactive prototypes ready to build.");
  const { openContact } = useApp();
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);

  const [feat, ...rest] = WEB_PROJECTS;

  return (
    <motion.main ref={root} id="main" className="wrap dz" style={{ paddingTop: "12vh" }}
      variants={page} initial="initial" animate="animate">
      {/* ---------- hero: headline + featured live preview ---------- */}
      <header className="dz-hero">
        <div className="dz-hero-copy">
          <div className="dz-kicker">
            <span className="mono">UI/UX &amp; Web Design</span>
          </div>
          {/* three short lines, ~13 characters each: at the clamp's 92px
              ceiling a longer one wraps and orphans a word of its own */}
          <h1>Sites &amp; apps,<br />drawn before<br />they&rsquo;re built.</h1>
          <div className="drawline" style={{ height: 1, background: "var(--accent)", marginTop: 34 }} />
          <div className="dz-role">
            <span className="mono">Figma · Canva · Prototyping · Design systems</span>
          </div>
        </div>

        {/* the CTA is a sibling of the preview link, not a child: an <a>
            inside an <a> is invalid, and it belongs under the thing it
            opens rather than across the page in the copy column */}
        {feat && (
          <div className="dz-hero-media">
            {/* No "Featured · {tag}" label above the frame: the browser bar
                inside it already reads "TrackHer · Figma prototype", so the
                two stacked mono rows repeated "prototype" and "design" at
                each other — and "More work" heading the section below is
                what says this one was featured. */}
            <TLink to={`/design/${feat.slug}`} className="dz-hero-shot"
              aria-label={`Open ${feat.t}`}>
              <Preview w={feat} reduced={reduced} sizes="(max-width: 900px) 100vw, 50vw" eager />
            </TLink>
            <TLink to={`/design/${feat.slug}`} className="dz-open mono dz-hero-cta">
              Open {feat.t} <span className="arrow">→</span>
            </TLink>
          </div>
        )}
      </header>

      {/* ---------- the rest of the work ---------- */}
      {rest.length > 0 && (
        <section className="dz-work-sec">
          <CenterHead small title={<>More <span className="serif">work</span>.</>} />
          <div className="dz-grid">
            {rest.map((w, i) => (
              <Reveal key={w.slug} delay={i * 0.06}>
                <TLink to={`/design/${w.slug}`} className="dz-card" aria-label={`Open ${w.t}`}>
                  {/* 33vw was the old hint and it was wrong between 760 and
                      ~1000px, where .dz-grid's minmax(300px,1fr) lays out
                      TWO columns of ~46vw, not three — so a tablet asked for
                      a third of the screen and got a file too small for the
                      slot it landed in. Three columns only form past ~1000px,
                      and .wrap caps them at ~360px. */}
                  <Preview w={w} reduced={reduced}
                    sizes="(max-width: 760px) 92vw, (max-width: 1000px) 46vw, 360px" />
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

      {/* ---------- process ----------
          A sequence, so it reads as one: a rail down the middle with the
          four steps hung off it, alternating, one lit at a time. See
          Timeline in ui.jsx. It was a left-aligned numbered list beside
          a sticky mono label, then briefly a grid of cards — both of
          which said "four separate things" about four steps that are
          one. */}
      <section className="csec">
        <CenterHead title={<>How a project <span className="serif">goes</span>.</>} />
        <Timeline items={PROCESS} />
      </section>

      {/* ---------- cross-link to photography ---------- */}
      <section className="sec">
        <Reveal className="teaser">
          <TLink to="/photography">
            <h3>Photography</h3>
            <span className="go mono">See the projects <span className="arrow">→</span></span>
          </TLink>
          <TLink to="/about">
            <h3>About {P.photographer}</h3>
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
        </Reveal>
        <Colophon back />
      </section>
    </motion.main>
  );
}
