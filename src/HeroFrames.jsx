import { useState, useRef, useEffect } from "react";
import { img, srcSet } from "./data.js";

/* ==================================================================
   HERO FRAMES — the home-page masthead.

   A full-bleed photograph behind the studio name, cross-fading through
   the set on its own. Nothing here is a control: the picture is
   atmosphere, and the only thing to act on is the scroll cue in the
   corner. Frames drift slowly the whole time so a held shot never
   looks like a stalled page.

   The reel pauses whenever the hero is off screen — no point paying
   for a timer and a repaint on a masthead nobody is looking at.
   ================================================================== */

/* ms each frame is held — the cross-fade in the CSS overlaps this, so a
   visitor sees the whole set inside a short look at the page. */
const HOLD = 3800;

export default function HeroFrames({ frames, reduced, onScrollDown, children }) {
  const [at, setAt] = useState(0);
  /* frames mount as they're reached, so the first paint fetches one
     hero image rather than the whole set */
  const [seen, setSeen] = useState(() => new Set([0]));
  const root = useRef(null);

  /* Whatever is on screen must be mounted — this is the correctness
     guard. The preload below is the optimisation; this is the floor. */
  useEffect(() => {
    setSeen((s) => (s.has(at) ? s : new Set(s).add(at)));
  }, [at]);

  /* Mount the next frame on idle, so it has decoded before its turn
     comes round without competing with the first frame, which is the LCP. */
  useEffect(() => {
    if (frames.length < 2) return;
    const next = (at + 1) % frames.length;
    if (seen.has(next)) return;
    // bound to window — a detached native function throws Illegal invocation
    const idle = window.requestIdleCallback?.bind(window) || ((fn) => setTimeout(fn, 300));
    const cancel = window.cancelIdleCallback?.bind(window) || clearTimeout;
    const id = idle(() => setSeen((s) => (s.has(next) ? s : new Set(s).add(next))));
    return () => cancel(id);
  }, [at, frames.length, seen]);

  /* The reel itself. Reduced motion opts out entirely rather than
     cutting between frames — auto-rotating content is the thing that
     preference is asking us not to do. */
  useEffect(() => {
    if (reduced || frames.length < 2) return;
    const el = root.current;
    let id = 0;
    const start = () => {
      if (!id) id = setInterval(() => setAt((n) => (n + 1) % frames.length), HOLD);
    };
    const stop = () => { clearInterval(id); id = 0; };

    if (!el || typeof IntersectionObserver === "undefined") {
      start();
      return stop;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(el);
    return () => { stop(); io.disconnect(); };
  }, [reduced, frames.length]);

  return (
    <div className="mast-stage" ref={root}>
      <div className="mast-frames" aria-hidden="true">
        {frames.map((f, n) => (
          seen.has(n) && (
            <div key={f.seed} className={`mast-frame${n === at ? " on" : ""}`}>
              <img src={img(f.seed, 2000, 1250)} srcSet={srcSet(f.seed)} sizes="100vw"
                alt="" fetchPriority={n === 0 ? "high" : "low"}
                decoding={n === 0 ? "sync" : "async"} draggable="false" />
            </div>
          )
        ))}
      </div>
      <div className="mast-scrim" />

      {children}

      <button type="button" className="mast-scroll mono" onClick={() => onScrollDown?.()}>
        Scroll <span className="mast-arrow" aria-hidden="true">↓</span>
      </button>
    </div>
  );
}
