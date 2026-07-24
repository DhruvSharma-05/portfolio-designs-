import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { P, img, srcSet, ABOUT, INTRO, SHOTLIST, METRICS, QUOTES, prefersReduced } from "../data.js";
import { Reveal, TLink, Metrics } from "../ui.jsx";

const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function About() {
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
          <div className="mono" style={{ marginBottom: 22 }}>About — {P.city}</div>
          <h1>{P.photographer}</h1>
          <p className="about-lead">
            {ABOUT.lead.split(" ").map((w, i) =>
              i === 0 ? <i key={i}>{w} </i> : w + " "
            )}
          </p>
        </div>
        <figure className="about-portrait">
          <img ref={portrait} src={img(ABOUT.portrait, 1000, 1250)} srcSet={srcSet(ABOUT.portrait)}
            sizes="(max-width: 820px) 100vw, 45vw" alt={`${P.photographer}, portrait`} />
        </figure>
      </div>

      <Reveal as="div" className="about-body">
        {ABOUT.body.map((p, i) => <p key={i}>{p}</p>)}
      </Reveal>

      <section>
        <div className="mono" style={{ marginBottom: 24 }}>How I work</div>
        <Reveal className="approach">
          {ABOUT.approach.map((a) => (
            <div key={a.k}>
              <h3>{a.k}</h3>
              <p>{a.v}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="timeline">
        <div className="mono" style={{ marginBottom: 24 }}>The short version</div>
        {ABOUT.timeline.map((t, i) => (
          <Reveal className="tl-row" key={t.y} delay={i * 0.05}>
            <b>{t.y}</b>
            <p>{t.t}</p>
          </Reveal>
        ))}
      </section>

      {/* what a client walks away with — moved here from the Work page,
          which now stays about the work itself */}
      <section style={{ marginTop: "10vh" }}>
        <div className="mono" style={{ marginBottom: 24 }}>What you get</div>
        <div>
          {INTRO.offer.map((o, i) => (
            <Reveal className="sl-row" key={o.k} delay={i * 0.04}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <h3>{o.k}</h3>
              <p>{o.v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "10vh" }}>
        <div className="mono" style={{ marginBottom: 24 }}>What I'm hired for</div>
        <div>
          {SHOTLIST.map((s, i) => (
            <Reveal className="sl-row" key={s.k} delay={i * 0.04}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.k}</h3>
              <p>{s.v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "10vh" }}>
        <div className="mono" style={{ marginBottom: 24 }}>The numbers</div>
        <Metrics items={METRICS} />
      </section>

      <section style={{ marginTop: "10vh" }}>
        <div className="mono" style={{ marginBottom: 24 }}>What clients say</div>
        <Quotes />
      </section>

      <section className="end" style={{ marginTop: "12vh" }}>
        <Reveal>
          <h2 className="display">Let's make<br />something.</h2>
          <a className="mail" href={`mailto:${P.email}`}>{P.email}</a>
        </Reveal>
        <div style={{ marginTop: 44 }}>
          <TLink to="/" className="mono back"><span className="arrow">←</span> Back to work</TLink>
        </div>
      </section>
    </motion.main>
  );
}

/* Client quotes — the crossfading slideshow that used to sit on the
   Work page. Autoplays; the dots jump straight to a quote. */
function Quotes() {
  const [qi, setQi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % QUOTES.length), 5200);
    return () => clearInterval(t);
  }, []);
  return (
    <div>
      <div className="slide">
        <AnimatePresence mode="wait">
          <motion.blockquote className="q" key={qi}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5, ease: "easeOut" }}>
            <p><span style={{ color: "var(--accent)" }}>“</span>{QUOTES[qi].q}</p>
            <footer className="mono">{QUOTES[qi].a} — {QUOTES[qi].r}</footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="dots">
        {QUOTES.map((q, i) => (
          <button key={i} className={`dot ${i === qi ? "on" : ""}`}
            onClick={() => setQi(i)} aria-label={`Quote ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
