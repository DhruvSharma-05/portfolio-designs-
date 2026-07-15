import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { P, img, ABOUT, prefersReduced } from "../data.js";
import { Reveal, TLink } from "../ui.jsx";

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
          <h1>{P.name}</h1>
          <p className="about-lead">
            {ABOUT.lead.split(" ").map((w, i) =>
              i === 0 ? <i key={i}>{w} </i> : w + " "
            )}
          </p>
        </div>
        <figure className="about-portrait">
          <img ref={portrait} src={img(ABOUT.portrait, 1000, 1250)} alt={`${P.name}, portrait`} />
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
