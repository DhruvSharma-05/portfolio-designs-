import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

/* ==================================================================
   COVERFLOW CAROUSEL — a flat-slat cover-flow gallery.

   The active item is a big landscape card in the centre; every other
   item shrinks to a thin flat slat and FADES OUT toward the edges, so
   there's no dark "tile" left behind an incoming or outgoing frame.
   One rAF driver moves a single `pos` MotionValue; each card derives
   its x / size / opacity / z from that, so growth is locked to travel
   (a card grows as it slides to centre, shrinks as it leaves).

   Ported to plain JSX from Tanya Prokofieva's Framer/Originkit original;
   sizing is responsive (measured from the container) so the active card
   scales up to fill the stage. Honours prefers-reduced-motion.
   ================================================================== */

const RENDER_RANGE = 6;

/* card `index`'s signed distance from centre at position `pos`, wrapped
   into (-count/2, count/2] so the loop seam sits where opacity is 0. */
function relOf(index, pos, count) {
  let rel = (((index - pos) % count) + count) % count;
  if (rel > count / 2) rel -= count;
  return rel;
}
/* horizontal offset (px) from centre for a signed distance `rel` */
function xForRel(rel, s, gap) {
  const ar = Math.abs(rel);
  const c1 = s.activeWidth / 2 + gap + s.restWidth / 2;
  const pitch = s.restWidth + gap;
  const mag = ar <= 1 ? ar * c1 : c1 + (ar - 1) * pitch;
  return (rel < 0 ? -1 : 1) * mag;
}
const blendForRel = (rel) => Math.min(Math.abs(rel), 1);

/* one absolutely-positioned card; every visual property derives from the
   shared `pos` MotionValue via useTransform (no per-frame React renders). */
function Card({ item, index, pos, count, R, sizing, gap, radius, onSelect }) {
  const src = item?.srcUrl || item?.src || "";
  const x = useTransform(pos, (p) => xForRel(relOf(index, p, count), sizing, gap));
  const opacity = useTransform(pos, (p) => {
    const ar = Math.abs(relOf(index, p, count));
    return ar <= R ? 1 : ar >= R + 1 ? 0 : 1 - (ar - R);
  });
  const zIndex = useTransform(pos, (p) => Math.round(1000 - Math.abs(relOf(index, p, count)) * 100));
  const width = useTransform(pos, (p) => {
    const a = blendForRel(relOf(index, p, count));
    return sizing.activeWidth + (sizing.restWidth - sizing.activeWidth) * a;
  });
  const height = useTransform(pos, (p) => {
    const a = blendForRel(relOf(index, p, count));
    return sizing.activeHeight + (sizing.restHeight - sizing.activeHeight) * a;
  });
  const borderRadius = useTransform(pos, (p) => {
    const a = blendForRel(relOf(index, p, count));
    const w = sizing.activeWidth + (sizing.restWidth - sizing.activeWidth) * a;
    const h = sizing.activeHeight + (sizing.restHeight - sizing.activeHeight) * a;
    return (Math.max(0, Math.min(20, radius)) / 20) * (Math.min(w, h) / 2);
  });
  const boxShadow = useTransform(pos, (p) =>
    Math.abs(relOf(index, p, count)) < 0.5
      ? "0 30px 80px -30px rgba(20,16,12,0.55)"
      : "0 18px 50px -28px rgba(20,16,12,0.45)");

  return (
    <motion.div
      onClick={onSelect ? () => onSelect(index) : undefined}
      style={{ position: "absolute", left: "50%", top: "50%", x, zIndex, opacity,
        cursor: onSelect ? "pointer" : "default" }}
    >
      <motion.div style={{ x: "-50%", y: "-50%", width, height, borderRadius,
        overflow: "hidden", background: "var(--panel)", boxShadow }}>
        {src ? (
          <img src={src} alt={item?.alt || ""} draggable={false} loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover",
              objectPosition: item?.position || "center", display: "block",
              pointerEvents: "none", userSelect: "none" }} />
        ) : null}
      </motion.div>
    </motion.div>
  );
}

/* responsive sizing derived from the measured stage */
function computeSizing(W, H) {
  if (!W || !H) return { activeWidth: 900, activeHeight: 560, restWidth: 240, restHeight: 320 };
  let activeH = H * 0.94;
  let activeW = activeH * 1.6;                 // big ~16:10 landscape centre
  const maxW = W * 0.68;
  if (activeW > maxW) { activeW = maxW; activeH = activeW / 1.6; }
  const restW = Math.max(140, activeW * 0.3);
  const restH = Math.min(H * 0.74, activeH * 1.0);
  return { activeWidth: activeW, activeHeight: activeH, restWidth: restW, restHeight: restH };
}

export default function CoverflowCarousel({
  images = [],
  gap = 26,
  radius = 2.4,
  showArrows = true,
  dots = false,
  autoplay = false,
  autoplayDirection = "rightToLeft",
  moveDur = 0.5,
  dwell = 1.6,
}) {
  const list = images.length ? images : [];
  const count = Math.max(1, list.length);

  // measure the stage so the active card fills it
  const stageRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const sizing = useMemo(() => computeSizing(size.w, size.h), [size.w, size.h]);

  const R = Math.max(1, Math.min(RENDER_RANGE, Math.floor(count / 2) - 1));

  // ---- single rAF driver: moves `pos` toward `target`, self-stops when idle
  const pos = useMotionValue(0);
  const targetRef = useRef(0);
  const rafRef = useRef(null);
  const lastTRef = useRef(null);
  const autoplayingRef = useRef(false);
  const dirRef = useRef(1);
  const dwellAccRef = useRef(0);
  const moveDurRef = useRef(moveDur); moveDurRef.current = moveDur;
  const dwellRef = useRef(dwell); dwellRef.current = dwell;

  const tick = useCallback((t) => {
    const last = lastTRef.current ?? t;
    const dt = Math.min((t - last) / 1000, 1 / 30);
    lastTRef.current = t;

    const cur = pos.get();
    const diff = targetRef.current - cur;
    const dur = Math.max(0.08, moveDurRef.current);
    const stepAmt = (1 / dur) * dt;
    const arriving = Math.abs(diff) <= stepAmt;

    if (arriving) {
      pos.set(targetRef.current);
      if (autoplayingRef.current) {
        dwellAccRef.current += dt;
        if (dwellAccRef.current >= Math.max(0, dwellRef.current)) {
          dwellAccRef.current = 0;
          targetRef.current += dirRef.current;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      rafRef.current = null;
      lastTRef.current = null;
      return;
    }
    pos.set(cur + Math.sign(diff) * stepAmt);
    rafRef.current = requestAnimationFrame(tick);
  }, [pos]);

  const ensureRunning = useCallback(() => {
    if (rafRef.current == null) {
      lastTRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const goNext = useCallback(() => { targetRef.current += 1; ensureRunning(); }, [ensureRunning]);
  const goPrev = useCallback(() => { targetRef.current -= 1; ensureRunning(); }, [ensureRunning]);
  const goTo = useCallback((index) => {
    const cur = targetRef.current;
    let d = ((index - cur) % count + count) % count;
    if (d > count / 2) d -= count;
    targetRef.current = cur + d;
    ensureRunning();
  }, [ensureRunning, count]);

  useEffect(() => () => {
    // Reset the handle, not just cancel — else a StrictMode remount sees a
    // stale non-null handle and ensureRunning() never restarts the loop
    // (which killed autoplay and the arrows in dev).
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTRef.current = null;
  }, []);

  // autoplay: flag the rAF loop (time-based pacing lives inside tick)
  useEffect(() => {
    const on = autoplay && count > 1;
    autoplayingRef.current = on;
    if (on) {
      dirRef.current = autoplayDirection === "leftToRight" ? -1 : 1;
      dwellAccRef.current = 0;
      ensureRunning();
    }
    return () => { autoplayingRef.current = false; };
  }, [autoplay, autoplayDirection, count, ensureRunning]);

  // active index for the dots — updates only when the rounded slot changes
  const [active, setActive] = useState(0);
  useEffect(() => {
    const unsub = pos.on("change", (v) => {
      const idx = ((Math.round(v) % count) + count) % count;
      setActive((a) => (a === idx ? a : idx));
    });
    return unsub;
  }, [pos, count]);

  // keyboard nav (when not autoplaying)
  const hoverRef = useRef(false);
  useEffect(() => {
    if (autoplay) return;
    const onKey = (e) => {
      if (!hoverRef.current) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [autoplay, goPrev, goNext]);

  const selectable = !autoplay;

  if (!count) return null;

  return (
    <div className="cfc" tabIndex={0}
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
      onFocus={() => { hoverRef.current = true; }}
      onBlur={() => { hoverRef.current = false; }}>
      <div className="cfc-stage" ref={stageRef}
        style={{ "--cfc-inner": `${sizing.activeWidth / 2 + gap}px` }}>
        {list.map((im, i) => (
          <Card key={i} item={im} index={i} pos={pos} count={count} R={R}
            sizing={sizing} gap={gap} radius={radius}
            onSelect={selectable ? goTo : undefined} />
        ))}

        {showArrows && count > 1 && (
          <>
            <button type="button" className="cfc-arrow prev" aria-label="Previous frame"
              onPointerDown={(e) => e.stopPropagation()} onClick={goPrev}>‹</button>
            <button type="button" className="cfc-arrow next" aria-label="Next frame"
              onPointerDown={(e) => e.stopPropagation()} onClick={goNext}>›</button>
          </>
        )}
      </div>

      {dots && count > 1 && (
        <div className="cfc-dots" role="tablist" aria-label="Frames">
          {list.map((_, i) => (
            <button key={i} type="button" className={`cfc-dot ${i === active ? "on" : ""}`}
              aria-current={i === active || undefined} aria-label={`Frame ${i + 1}`}
              onClick={() => goTo(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
