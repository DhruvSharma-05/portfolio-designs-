import { useRef, useState, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { P, img, srcSet, ABOUT, hasPhoto, prefersReduced, heavyVisualsAllowed } from "../data.js";
import { Reveal, TLink, SectionHead } from "../ui.jsx";
import { useSeo } from "../seo.js";
import { useApp } from "../context.js";

/* three.js is code-split and gated, same as DistortImage — the bio text
   is the content here, the globe is decoration. */
const ParticleSphere = lazy(() => import("../ParticleSphere.jsx"));

const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ==================================================================
   ABOUT — the long-form half of the site.

   Structure follows the personal-version build: bio beside a particle
   globe, then how-I-work and the timeline. This page is about the
   person; what a client walks away with and the headline numbers are a
   sales argument, so they live on the Work page instead.

   The closing block is deliberately left as it was — the same contact
   CTA and colophon as the rest of this site uses.
   ================================================================== */
export default function About() {
  useSeo("About Viraj Mehta", "Viraj Mehta is a designer and photographer in Vancouver, blending engineering, design and photography into digital products and visual stories.");
  const { openContact } = useApp();
  const [reduced] = useState(prefersReduced);
  const [heavy] = useState(heavyVisualsAllowed);
  const root = useRef(null);
  const portrait = useRef(null);
  const hasPortrait = hasPhoto(ABOUT.portrait);

  useGSAP(() => {
    if (reduced || !portrait.current) return;
    gsap.set(portrait.current, { scale: 1.12, transformOrigin: "50% 50%" });
    gsap.fromTo(portrait.current, { yPercent: -5 }, {
      yPercent: 5, ease: "none",
      scrollTrigger: { trigger: portrait.current, start: "top bottom", end: "bottom top", scrub: true },
    });
    ScrollTrigger.refresh();
  }, { scope: root, dependencies: [reduced] });

  return (
    <motion.main ref={root} id="main" className="about wrap"
      variants={page} initial="initial" animate="animate">
      <div className={`about-hero${hasPortrait ? "" : " no-portrait"}`}>
        <div>
          <div className="mono about-kicker">About</div>
          <h1>{P.photographer}</h1>
          <p className="about-lead">
            {ABOUT.lead.split(" ").map((w, i) =>
              i === 0 ? <i key={i}>{w} </i> : w + " "
            )}
          </p>
        </div>
        {hasPortrait && (
          <figure className="about-portrait">
            <img ref={portrait} src={img(ABOUT.portrait, 1000)} srcSet={srcSet(ABOUT.portrait)}
              sizes="(max-width: 820px) 100vw, 45vw" alt={`${P.photographer}, portrait`} />
          </figure>
        )}
      </div>

      {/* bio on the left, the globe you can push around on the right */}
      <div className="about-body">
        {heavy && (
          <div className="about-body-viz" aria-hidden="true">
            <Suspense fallback={null}><ParticleSphere still={reduced} /></Suspense>
          </div>
        )}
        <Reveal as="div" className="about-body-text">
          {ABOUT.body.map((p, i) => (
            <p key={i} className={i === 0 ? "lead-p" : ""}>{p}</p>
          ))}
        </Reveal>
      </div>

      {/* kit + availability — the practical facts a client wants up front */}
      <section className="about-kit">
        <Reveal as="dl" className="kitgrid">
          {ABOUT.kit.map((k) => (
            <div key={k.k}>
              <dt className="mono">{k.k}</dt>
              <dd>{k.v}</dd>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="invert-band">
        <div className="wrap">
          <SectionHead n="01">How I work</SectionHead>
          <Reveal className="approach">
            {ABOUT.approach.map((a, i) => (
              <div key={a.k}>
                <span className="approach-n mono">{String(i + 1).padStart(2, "0")}</span>
                <h3>{a.k}</h3>
                <p>{a.v}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="timeline">
        <SectionHead n="02">The short version</SectionHead>
        {ABOUT.timeline.map((t, i) => (
          <Reveal className="tl-row" key={t.y} delay={i * 0.05}>
            <b>{t.y}</b>
            <p>{t.t}</p>
          </Reveal>
        ))}
      </section>

      {/* closing block — unchanged from the rest of the site */}
      <section className="end" style={{ marginTop: "12vh" }}>
        <Reveal>
          <h2 className="display">Let's make<br />something.</h2>
          <div style={{ marginTop: 30 }}>
            <button type="button" className="extlink" onClick={openContact}>
              Contact me <span className="arrow">→</span>
            </button>
          </div>
        </Reveal>

        <Reveal as="dl" className="colophon" style={{ marginTop: 56 }}>
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

        <div style={{ marginTop: 44 }}>
          <TLink to="/" className="mono back"><span className="arrow">←</span> Back to home</TLink>
        </div>
      </section>
    </motion.main>
  );
}

