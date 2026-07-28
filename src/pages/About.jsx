import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { P, img, srcSet, ABOUT, prefersReduced } from "../data.js";
import { Reveal, TLink, SectionHead } from "../ui.jsx";
import { useApp } from "../context.js";

const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function About() {
  const { openContact } = useApp();
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);
  const portrait = useRef(null);

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
      <div className="about-hero">
        <div>
          <div className="mono about-kicker">About — {P.city}</div>
          <h1>{P.photographer}</h1>
          <p className="about-lead">
            {ABOUT.lead.split(" ").map((w, i) =>
              i === 0 ? <i key={i}>{w} </i> : w + " "
            )}
          </p>
          <div className="about-tags">
            <span className="mono">Designer</span>
            <span className="mono">Photographer</span>
            <span className="mono" style={{ color: "var(--accent)" }}>Booking 2026</span>
          </div>
        </div>
        <figure className="about-portrait">
          <img ref={portrait} src={img(ABOUT.portrait, 1000, 1250)} srcSet={srcSet(ABOUT.portrait)}
            sizes="(max-width: 820px) 100vw, 45vw" alt={`${P.photographer}, portrait`} />
          <figcaption className="mono">{P.city}, {P.region} — Lensofviraj</figcaption>
        </figure>
      </div>

      <Reveal as="div" className="about-body">
        {ABOUT.body.map((p, i) => (
          <p key={i} className={i === 0 ? "lead-p" : ""}>{p}</p>
        ))}
      </Reveal>

      <section>
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
              <a href={`mailto:${P.email2}`}>{P.email2}</a><br />
              <a href={`tel:${P.phone.replace(/[^+\d]/g, "")}`}>{P.phone}</a>
            </dd>
          </div>
          <div>
            <dt className="mono">Based in</dt>
            <dd>{P.city}<br />{P.region}</dd>
          </div>
          <div>
            <dt className="mono">Elsewhere</dt>
            <dd>
              {P.socials.map((s) => (
                <span key={s.href} style={{ display: "block" }}>
                  <a href={s.href} target="_blank" rel="noreferrer">
                    {s.k} — {s.v}
                  </a>
                </span>
              ))}
            </dd>
          </div>
        </Reveal>

        <div style={{ marginTop: 44 }}>
          <TLink to="/" className="mono back"><span className="arrow">←</span> Back to work</TLink>
        </div>
      </section>
    </motion.main>
  );
}
