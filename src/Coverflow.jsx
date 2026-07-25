import { useState, useEffect, useCallback, useRef } from "react";

/* ==================================================================
   COVERFLOW — a 3D cover-flow slideshow.

   The active card sits upright in the spotlight while its neighbours
   tilt back in perspective; click a card (or arrow-key) to bring it to
   centre, or let autoplay drift through. Ported to plain JSX from
   Tanya Prokofieva's Framer original (via Originkit), themed to match.
   ================================================================== */

const PERSPECTIVE = 1600;
const SCALE_STEP = 0.16;
const MAX_VISIBLE = 2;
// In a preserve-3d context paint order follows 3D position, not z-index,
// so the centre is pushed nearest the viewer and neighbours fall behind.
const DEPTH = 240;

function cssTransition(t) {
  const dur = t && typeof t.duration === "number" ? t.duration : 0.6;
  let ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const e = t?.ease;
  if (Array.isArray(e) && e.length === 4) {
    ease = `cubic-bezier(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]})`;
  } else if (typeof e === "string") {
    const map = { linear: "linear", easeIn: "ease-in", easeOut: "ease-out", easeInOut: "ease-in-out" };
    ease = map[e] || "ease";
  }
  return { dur, ease };
}

export default function Coverflow({
  slides = [],
  cardWidth = 440,
  cardHeight = 300,
  radius = 3,
  tilt = 12,
  sideTilt = 8,
  gap = 8,
  opacity = 60,
  transition = { duration: 0.7, delay: 2.6, ease: [0.22, 1, 0.36, 1] },
  autoplay = true,
  autoplayDirection = "rightToLeft",
  style,
}) {
  const list = slides.length ? slides : [];
  const n = list.length;
  const [active, setActive] = useState(0);

  useEffect(() => { setActive((a) => Math.max(0, Math.min(n - 1, a))); }, [n]);

  // Lock input while a card is mid-move so rapid clicks/keys don't stack up.
  const moveDur = typeof transition?.duration === "number" ? transition.duration : 0.6;
  const lockRef = useRef(false);
  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => { lockRef.current = false; }, Math.max(50, moveDur * 1000));
  }, [moveDur]);

  const step = useCallback((dir) => {
    if (lockRef.current) return;
    lock();
    setActive((a) => (((a + dir) % n) + n) % n);
  }, [n, lock]);

  const handleCardClick = useCallback((i) => {
    if (autoplay || lockRef.current) return;
    lock();
    setActive((a) => (i === a ? (a + 1) % n : i));
  }, [autoplay, n, lock]);

  // Autoplay — the transition's delay drives how long each card holds.
  const delay = typeof transition?.delay === "number" ? transition.delay : 2.5;
  useEffect(() => {
    if (!autoplay || n < 2) return;
    const ms = Math.max(0.3, delay) * 1000;
    const dir = autoplayDirection === "leftToRight" ? -1 : 1;
    const id = window.setInterval(() => step(dir), ms);
    return () => window.clearInterval(id);
  }, [autoplay, autoplayDirection, delay, n, step]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  }, [step]);

  const { dur, ease } = cssTransition(transition);
  const transitionCss = `transform ${dur}s ${ease}, opacity ${dur}s ${ease}`;
  const effectiveRadius =
    (Math.max(0, Math.min(20, radius)) / 20) * (Math.min(cardWidth, cardHeight) / 2);
  const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100;

  if (!n) return null;

  return (
    <div
      style={{
        ...(style || {}), position: "relative", width: "100%", height: "100%",
        minWidth: 320, minHeight: 320, display: "flex", alignItems: "center",
        justifyContent: "center", perspective: `${PERSPECTIVE}px`, overflow: "hidden", outline: "none",
      }}
      tabIndex={0} role="group" aria-roledescription="carousel" onKeyDown={onKeyDown}
    >
      <div style={{ position: "relative", width: cardWidth, height: cardHeight, transformStyle: "preserve-3d" }}>
        {list.map((slide, i) => {
          let rel = i - active;
          if (rel > n / 2) rel -= n;
          if (rel < -n / 2) rel += n;
          const ax = Math.abs(rel);
          const visible = ax <= MAX_VISIBLE;
          const isActive = rel === 0;
          const sc = Math.max(0.4, 1 - ax * SCALE_STEP);
          const tx = rel * (gap * 30);
          const tz = -ax * DEPTH;
          const ry = -rel * tilt;
          const rz = rel * sideTilt;
          const src = slide.image?.src || "";

          return (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              aria-label={slide.title}
              aria-hidden={!visible}
              style={{
                position: "absolute", left: "50%", top: "50%", width: cardWidth, height: cardHeight,
                borderRadius: effectiveRadius, overflow: "hidden", transformStyle: "preserve-3d",
                transformOrigin: "center center",
                transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
                transition: transitionCss, opacity: visible ? 1 : 0,
                cursor: autoplay || isActive ? "default" : "pointer",
                pointerEvents: visible && !autoplay ? "auto" : "none",
                backgroundColor: "#1a1a1a",
                boxShadow: "0 40px 90px -50px rgba(20,20,26,.55)",
              }}
            >
              {src ? (
                <img
                  src={src}
                  alt={slide.image?.alt || slide.title || ""}
                  draggable={false}
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: slide.image?.position || "center", display: "block", userSelect: "none" }}
                />
              ) : null}
              {/* dim overlay darkens the off-centre cards to spotlight the middle */}
              <div style={{ position: "absolute", inset: 0, background: "#000", opacity: isActive ? 0 : dim, transition: `opacity ${dur}s ${ease}`, pointerEvents: "none" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
