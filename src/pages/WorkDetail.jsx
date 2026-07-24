import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import { FRAMES, img, srcSet, prefersReduced } from "../data.js";
import { Reveal, TLink } from "../ui.jsx";
import { useApp } from "../context.js";

const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function WorkDetail() {
  const { seed } = useParams();
  const { go } = useApp();
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);
  const figImg = useRef(null);

  const i = FRAMES.findIndex((f) => f.seed === seed);
  const f = FRAMES[i];

  // Unknown project → bounce back to the work list.
  useEffect(() => {
    if (i === -1) go("/");
  }, [i, go]);

  useGSAP(() => {
    if (reduced || !figImg.current) return;
    gsap.set(figImg.current, { scale: 1.12, transformOrigin: "50% 50%" });
    gsap.fromTo(figImg.current, { yPercent: -5 }, {
      yPercent: 5, ease: "none",
      scrollTrigger: { trigger: figImg.current, start: "top bottom", end: "bottom top", scrub: true },
    });
    ScrollTrigger.refresh();
  }, { scope: root, dependencies: [reduced, seed] });

  if (!f) return null;

  const prev = FRAMES[(i - 1 + FRAMES.length) % FRAMES.length];
  const next = FRAMES[(i + 1) % FRAMES.length];

  return (
    <motion.main ref={root} id="main" className="detail wrap"
      variants={page} initial="initial" animate="animate">
      <TLink to="/" className="mono back">
        <span className="arrow">←</span> All work
      </TLink>

      <div className="detail-head">
        <div>
          <div className="mono" style={{ marginBottom: 16 }}>{f.kind}</div>
          <h1>{f.t}</h1>
        </div>
        <div className="mono" style={{ color: "var(--accent)" }}>{f.exif}</div>
      </div>

      <figure className="detail-fig">
        <img ref={figImg} src={img(f.seed, 1600, 1067)} srcSet={srcSet(f.seed)}
          sizes="(max-width: 1180px) 100vw, 1180px" alt={f.t} />
      </figure>

      <div className="detail-grid">
        <Reveal>
          <p className="detail-note">{f.note}</p>
        </Reveal>
        <Reveal as="dl" className="spec" delay={0.08}>
          <div><dt className="mono">Location</dt><dd>{f.loc}</dd></div>
          <div><dt className="mono">Capture</dt><dd>{f.exif}</dd></div>
          <div><dt className="mono">Role</dt><dd>{f.role}</dd></div>
          <div><dt className="mono">Year</dt><dd>{f.year}</dd></div>
        </Reveal>
      </div>

      <nav className="pager">
        <TLink to={`/work/${prev.seed}`}>
          <span className="mono">← Previous</span>
          <strong>{prev.t}</strong>
        </TLink>
        <TLink to={`/work/${next.seed}`} className="next">
          <span className="mono">Next →</span>
          <strong>{next.t}</strong>
        </TLink>
      </nav>
    </motion.main>
  );
}
