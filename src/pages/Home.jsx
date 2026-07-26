import { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import {
  P, img, focus, INTRO, SHEET,
  GALLERY_CATS, GALLERY_ITEMS, WEB_PROJECTS, prefersReduced,
} from "../data.js";
import { Reveal, TLink, SlideHeading } from "../ui.jsx";

const page = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* Hero entrance timing: the headline fades/rises in first (HEADLINE_DELAY,
   duration matches .hero-reveal's .6s in the CSS), then the supporting
   copy, CTAs and drawline cascade in after it settles at HEADLINE_DONE. */
const HEADLINE_DELAY = 0.1;
const HEADLINE_DONE = HEADLINE_DELAY + 0.6;

/* ==================================================================
   WORK — the front page. Deliberately slim: hero, the categorised
   gallery, the photography projects, and the room reserved for the
   design work. Everything about the person lives on /about.
   ================================================================== */
export default function Home() {
  const [reduced] = useState(prefersReduced);
  const root = useRef(null);
  const hsxRef = useRef(null);
  const hsxTrack = useRef(null);

  /* image parallax + hover zoom, owned by GSAP and scoped to this page
     so the ScrollTriggers are torn down when we navigate away. */
  useGSAP(() => {
    // image parallax + hover zoom (skipped under reduced motion)
    if (!reduced) {
      gsap.utils.toArray("[data-par]").forEach((el) => {
        const shot = el.closest(".shot") || el;
        gsap.set(el, { scale: 1.14, transformOrigin: "50% 50%" });
        gsap.fromTo(el, { yPercent: -6 }, {
          yPercent: 6, ease: "none",
          scrollTrigger: { trigger: shot, start: "top bottom", end: "bottom top", scrub: true },
        });
        const zoom = gsap.quickTo(el, "scale", { duration: 0.6, ease: "power2.out" });
        shot.addEventListener("pointerenter", () => zoom(1.19));
        shot.addEventListener("pointerleave", () => zoom(1.14));
      });
    }

    // design teaser: slide the sticky track sideways from the section's own
    // scroll position. Plain transform, no GSAP pin/scrub (which kept
    // breaking the layout). Desktop only; mobile is a native swipe row (CSS).
    const track = hsxTrack.current;
    const sec = hsxRef.current;
    let dist = 0;
    const isDesktop = () => window.matchMedia("(min-width: 820px)").matches;
    const onScroll = () => {
      if (!track || !sec || dist <= 0 || !isDesktop()) { if (track) track.style.transform = ""; return; }
      const top = sec.getBoundingClientRect().top;      // 0 when section hits the top
      const x = Math.min(Math.max(-top, 0), dist);
      track.style.transform = `translate3d(${-x}px,0,0)`;
    };
    const measure = () => {
      if (!track || !sec) return;
      if (!isDesktop()) { sec.style.height = ""; track.style.transform = ""; dist = 0; return; }
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      // extra height = slide distance, so scrolling past the section drives it
      sec.style.height = `${window.innerHeight + dist}px`;
      onScroll();
    };
    measure();
    const settle = window.setTimeout(measure, 300);      // re-measure once images/fonts land
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    ScrollTrigger.refresh();
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (sec) sec.style.height = "";
      if (track) track.style.transform = "";
    };
  }, { scope: root, dependencies: [reduced] });

  return (
    <motion.div ref={root} variants={page} initial="initial" animate="animate">
      {/* masthead */}
      <header className="mast" id="main">
        <div className="wrap">
          <div className="mono" style={{ marginBottom: 26 }}>
            {P.photographer} — {P.role} — {P.city} — Booking 2026
          </div>

          {/* the studio name carries the masthead; the kicker and the
              standfirst below it say who is behind it and what he does */}
          <h1 className="display hero-reveal" style={{ "--rd": `${HEADLINE_DELAY}s` }}>
            {P.name}
          </h1>
          <div className="drawline" style={{ "--line-delay": `${HEADLINE_DONE}s` }} />

          {/* supporting content waits for the headline to finish composing
              (HEADLINE_DONE) so the primary hero text resolves before the
              secondary copy and CTAs do, not after */}
          <p className="standfirst hero-reveal" style={{ "--rd": `${HEADLINE_DONE}s` }}>
            Photographer and designer based in Vancouver — a Computer Engineering
            mind with a decade behind the camera. Pictures made as{" "}
            <strong>{P.photoBrand}</strong>, and the sites they live on designed
            and built by the same hands.
            <i> Hire either. Hiring both is the point.</i>
          </p>

          {/* both doors stated above the fold, so a cold visitor can tell
              inside three seconds that this is two crafts and not one */}
          <div className="disciplines hero-reveal" style={{ "--rd": `${HEADLINE_DONE + 0.08}s` }}>
            {INTRO.does.map((d, i) => (
              <TLink key={d.to} to={d.to} className="disc">
                <span className="mono">{String(i + 1).padStart(2, "0")} — {d.k}</span>
                <strong>{d.brand}</strong>
                <span className="mono go">Enter <span className="arrow">→</span></span>
              </TLink>
            ))}
          </div>

          <div className="role hero-reveal" style={{ "--rd": `${HEADLINE_DONE + 0.16}s` }}>
            <span className="mono">Photography · Web design · Booking 2026</span>
            <span className="mono">Scroll —</span>
          </div>
        </div>
      </header>

      {/* contact strip */}
      <div className="strip">
        <div className="strip-track">
          {[...SHEET, ...SHEET].map((s, i) => (
            <figure className="strip-fr" key={i}>
              <img src={img(s, 400, 264)} alt="" style={{ objectPosition: focus(s) }} />
            </figure>
          ))}
        </div>
      </div>

      {/* gallery — four categories, no captions */}
      <Gallery />

      {/* web design — a pinned horizontal scroll: an intro panel, then the
          project cards glide sideways as you scroll down */}
      <section className="hsx" id="design" ref={hsxRef}>
        <div className="hsx-sticky">
        <div className="hsx-track" ref={hsxTrack}>
          <div className="hsx-intro">
            <span className="mono" style={{ color: "var(--accent)" }}>[ Web design ]</span>
            <h2 className="display hsx-title">Sites &amp; apps,<br />built to ship.</h2>
            <p className="hsx-sub">
              Client sites, product UI and Figma concepts — designed and built by
              the same hands behind the camera.
            </p>
            <span className="mono hsx-scroll">Scroll <span className="arrow">→</span></span>
          </div>

          {WEB_PROJECTS.map((w) => (
            <TLink key={w.slug} to={`/design/${w.slug}`} className="hsx-card" aria-label={`Open ${w.t}`}>
              <div className="hsx-shot">
                <img src={img(w.cover, 1200, 750)} alt={w.t} loading="lazy" />
              </div>
              <div className="hsx-cap">
                <h3>{w.t}</h3>
                <p>{w.note}</p>
                <div className="hsx-tags">
                  {w.tag && <span className="hsx-tag">{w.tag}</span>}
                  {w.tool && <span className="hsx-tag">{w.tool}</span>}
                  {w.status && <span className="hsx-tag">{w.status}</span>}
                </div>
              </div>
            </TLink>
          ))}

          <div className="hsx-more">
            <TLink to="/design" className="extlink">
              See all design work <span className="arrow">→</span>
            </TLink>
          </div>
        </div>
        </div>
      </section>

      {/* end — the closing CTA; the shared SiteFooter follows (shell-owned) */}
      <section className="end invert" id="contact">
        <div className="wrap">
          <Reveal>
            <SlideHeading lines={["Bring me", "the difficult one."]} />
            <MagneticMail email={P.email} reduced={reduced} />
            <div className="mono" style={{ marginTop: 18 }}>
              {P.phone} — {P.city}, {P.region}
            </div>
          </Reveal>
        </div>
      </section>
    </motion.div>
  );
}

/* ==================================================================
   GALLERY — four category tabs over a captionless masonry grid.
   Simple on purpose: the frames are the content, nothing explains
   them. Starts on the first category that actually has photos.
   ================================================================== */
/* Greedy justified-rows layout (Flickr / Google Photos style): scale each
   photo to a target row height, pack a row until it overflows the
   container width, then scale that row down so it sits flush left-to-right
   — every photo keeps its exact aspect ratio, nothing is ever cropped.
   The last, partial row keeps the target height and stays left-aligned. */
function justifyRows(items, containerW, targetH, gap) {
  if (!containerW) return [];
  const rows = [];
  let row = [];
  let sumAr = 0;
  for (const it of items) {
    row.push(it);
    sumAr += it.ar;
    const gaps = gap * (row.length - 1);
    if (sumAr * targetH + gaps >= containerW) {
      const h = (containerW - gaps) / sumAr;
      rows.push({ h, items: row.map((r) => ({ ...r, w: r.ar * h })) });
      row = [];
      sumAr = 0;
    }
  }
  if (row.length) {
    rows.push({ h: targetH, items: row.map((r) => ({ ...r, w: r.ar * targetH })) });
  }
  return rows;
}

function Gallery() {
  const [cat, setCat] = useState(
    () => GALLERY_CATS.find((c) => GALLERY_ITEMS.some((g) => g.cat === c)) ?? GALLERY_CATS[0],
  );
  const shots = GALLERY_ITEMS.filter((g) => g.cat === cat);

  /* measure the container so the rows can be laid out to its real width */
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const GAP = 16;
  const targetH = width && width < 640 ? 280 : 460;
  const rows = justifyRows(shots, width, targetH, GAP);

  return (
    <section className="gwork invert" id="gallery" aria-label="Gallery">
      <div className="wrap">
        <div className="gwork-head">
          <div className="mono">Gallery</div>
          <div className="gtabs" role="group" aria-label="Gallery categories">
            {GALLERY_CATS.map((c) => (
              <button key={c} className="gtab" aria-pressed={c === cat} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {shots.length ? (
          <div className="jgal" ref={wrapRef}>
            {rows.map((r, ri) => (
              <div className="jrow" key={ri} style={{ height: r.h, gap: GAP }}>
                {r.items.map((it) => (
                  <figure className="jfig" key={it.seed} style={{ width: it.w }}>
                    <img src={img(it.seed, 900)} alt="" loading="lazy" style={{ objectPosition: focus(it.seed) }} />
                  </figure>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="gempty mono">{cat} — photos arriving soon</div>
        )}
      </div>
    </section>
  );
}

/* Magnetic email link — the label eases toward the cursor while hovered,
   a classic "cursor UX" micro-interaction, disabled under reduced motion. */
function MagneticMail({ email, reduced }) {
  const ref = useRef(null);
  const move = (e) => {
    if (reduced) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
    gsap.to(ref.current, { x, y, duration: 0.4, ease: "power3.out" });
  };
  const reset = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
  return (
    <a ref={ref} className="mail" href={`mailto:${email}`}
      onPointerMove={move} onPointerLeave={reset} style={{ willChange: "transform" }}>
      {email}
    </a>
  );
}
