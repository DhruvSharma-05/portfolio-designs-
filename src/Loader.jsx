import { useEffect, useRef, useState } from "react";
import { P, COLLAGE, img, prefersReduced } from "./data.js";

/* ==================================================================
   LOADER — the pause that buys the first screen its animation.

   The home page opens on a timed sequence (the name swells, the roles
   type themselves, the light drifts) and then hands over to the collage
   run, which zooms five photographs into a word. Both look wrong if
   they start before their assets are there: the hero types in a
   fallback face and reflows when Fraunces lands, and the collage begins
   its zoom over empty frames that pop in mid-run. This holds the door
   for as long as that actually takes and no longer.

   WHAT IT WAITS FOR — only things the first screen genuinely needs:

     · document.fonts.ready — the swell and the typewriter are both
       measured in the display face, so a late font swap is a visible
       reflow in the middle of an animation.
     · the collage frames — decoded, not merely fetched. decode() is
       the difference between "the bytes arrived" and "the browser can
       paint this without stalling a frame", which is the whole point
       when the next thing that happens is a scroll-linked zoom.

   AND THE THREE RULES IT OBEYS:

     1. It is capped (CAP_MS). A preloader that waits on a slow network
        is a blank page, which is worse than the reflow it prevents.
        Whatever hasn't arrived by then carries on loading behind the
        site — nothing here blocks anything, it only delays the reveal.
     2. It runs once a session. Refreshing to check a change, or coming
        back via the back button, should not cost the wait again.
     3. Under reduced motion it doesn't render at all. It exists to
        protect an animation that, in that mode, isn't playing.
   ================================================================== */

const CAP_MS = 3200;    // never hold the door longer than this
const MIN_MS = 650;     // ...nor flash it so briefly it reads as a glitch
const FILL_MS = 420;    // and always let the rail reach the end first
const SEEN = "cc:loaded";

/* The frames the collage will zoom. Only the ones actually painted —
   the mosaic drops to four tiles on a narrow screen (TILES_NARROW in
   Home.jsx), and there is no sense holding the door for a fifth nobody
   is about to see. */
function collageSources() {
  const narrow = typeof window !== "undefined"
    && window.matchMedia("(max-width: 720px)").matches;
  return COLLAGE.slice(0, narrow ? 4 : 5)
    .map((f) => img(f.seed, 2000, 1250))
    .filter(Boolean);
}

export default function Loader() {
  /* Read once, before the first paint, so the component either exists
     for this page load or never does — flipping it later would mean
     rendering a loader over a site that is already up. */
  const [live] = useState(() => {
    if (typeof window === "undefined" || prefersReduced()) return false;
    try { return !sessionStorage.getItem(SEEN); } catch { return true; }
  });
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!live) return;
    const started = performance.now();

    /* Progress is deliberately not a byte count. There is no honest one
       — fonts report nothing and decode() is all-or-nothing per image —
       so a "real" percentage would be a lie told precisely.

       It is the HIGHER of two things: how much of the work has actually
       finished, and a floor that creeps toward 88% across the cap. The
       floor stops the rail sitting dead still on a fast connection,
       where every job resolves at once; the work term is what lets it
       finish early when the work really is done.

       THE STEP IS COARSE AND CSS SMOOTHS IT — deliberately. This was an
       eased counter running off requestAnimationFrame, and it barely
       moved: the loader is on screen precisely while the main thread is
       busy parsing modules and decoding five 2000px photographs, so the
       frame callback was firing about three times a second and the
       counter crawled. Stepping the target a few times a second and
       letting a CSS transition carry the bar between steps takes the
       animation off the main thread entirely, which is the one place it
       can't be starved. */
    let work = 0;
    const step = () => {
      const elapsed = performance.now() - started;
      const floor = Math.min(88, (elapsed / CAP_MS) * 88);
      setPct(done.current ? 100 : Math.max(floor, work));
    };
    step();
    const beat = window.setInterval(step, 160);

    const finish = () => {
      if (done.current) return;
      done.current = true;
      step();
      /* hold the floor so the loader is a beat, not a flash, then let
         the exit transition play before the node goes */
      /* At least FILL_MS, whatever else has happened: done.current has
         only just pushed the target to 100, and leaving immediately
         would cut the rail off mid-travel — the one frame of the whole
         thing a visitor is actually watching. */
      const wait = Math.max(MIN_MS - (performance.now() - started), FILL_MS);
      window.setTimeout(() => {
        setLeaving(true);
        try { sessionStorage.setItem(SEEN, "1"); } catch { /* private mode */ }
        /* unmount only after the exit has played — leaving the node in
           the tree for its own transition is the whole reason `gone` is
           separate from `leaving` */
        window.setTimeout(() => setGone(true), 900);
      }, wait);
    };

    const jobs = [];
    // fonts: the hero is measured in them
    jobs.push(document.fonts ? document.fonts.ready : Promise.resolve());
    // the collage frames, decoded rather than merely fetched
    for (const src of collageSources()) {
      jobs.push(new Promise((res) => {
        const im = new Image();
        im.src = src;
        /* decode() rejects on some engines for images that are fine —
           a failed decode must not hold the door, so every outcome
           resolves */
        (im.decode ? im.decode() : Promise.resolve()).then(res, () => res());
        im.onerror = () => res();
      }));
    }

    let settled = 0;
    jobs.forEach((j) => j.then(() => {
      settled += 1;
      work = Math.min(96, (settled / jobs.length) * 96);
      if (settled === jobs.length) finish();
    }));

    const cap = window.setTimeout(finish, CAP_MS);
    return () => { window.clearInterval(beat); window.clearTimeout(cap); };
  }, [live]);

  if (!live || gone) return null;

  return (
    <div className="loadr" data-leaving={leaving ? "1" : undefined} aria-hidden="true">
      <div className="loadr-in">
        <span className="loadr-name">{P.name}</span>
        <span className="loadr-rail"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
        <span className="loadr-pct mono">{String(Math.round(pct)).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
