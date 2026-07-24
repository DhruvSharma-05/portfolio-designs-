import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { P, prefersReduced } from "./data.js";
import { useApp } from "./context.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Internal link that triggers the aperture page transition instead of a
   hard navigation. Renders a real <a href> so keyboard / middle-click /
   "open in new tab" still behave. */
export function TLink({ to, children, className, ...rest }) {
  const { go } = useApp();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/* The C& monogram, inlined so it can be animated: on load the outline
   draws itself (stroke-dashoffset, normalised via pathLength) and the
   fill then "develops" in; hovering the brand gives it a small
   lens-focus twist (CSS in data.js). viewBox is the path's tight
   bounding box, so the mark fills its frame with no dead canvas. */
const LOGO_PATH = "M13601.01 7399.82c51.36,550.69 45.2,1101.39 0,1652.13l-861.97 -5.81 -202.08 -635.26c-382.96,-696.11 -1154.99,-923.24 -2207.5,-812.25 -1758.3,269.41 -3004.63,1226.91 -3616.47,3037.17 -383.62,1406.37 -324.94,2773.98 138.86,4106.13 402.92,1001.85 1159.38,1619.03 2182.96,1945.53 789.43,308.57 1532.45,391.36 2247.63,338.44 -265.06,-362.71 -410.55,-811.57 -469.6,-1322.7 -26.57,-635.87 178,-1193.05 582.51,-1682.19l684.1 -784.56c-391.51,-691.76 -461.76,-1470.16 -36.98,-2382.05 580.92,-841.33 1437.94,-1130.48 2505.06,-999.36 1685.84,372.04 887,1950.08 -258.82,2522.56 147.04,-261.24 299.18,-521.47 306.33,-810.69 140.24,-1002.74 -786.89,-1222.76 -1362.03,-471.25 -472.04,743.76 -373.84,1605.91 -51.24,2514.64 750.11,1021.43 1560.1,1970.14 2438.61,2835.66 476.47,-792.85 704.16,-1507.47 646.62,-2447.37 325.41,14.81 477.7,505.15 457.97,1418.07 1.1,336.78 -294.09,785.62 -623.15,1402.61l1139.01 906.25 -479.82 582.25 -1044.96 -976.84c-898.32,695.41 -2890.17,1127.08 -3744.7,229.96 -526.27,279.5 -1132,361.54 -1755.56,402.22 -1843.68,-76.02 -3453.7,-847.76 -4629.62,-2912.11 -777.17,-1689.4 -729.69,-3460.2 -83.76,-5290.03 775.39,-1697.29 2122.34,-2647.16 3979.45,-2929.89 1648.22,-146.94 3004.82,62.76 4119.15,568.74zm1849.97 5514.61c545.17,-179.01 1141.85,-262.75 1778.26,-272.97l452.94 0c97.23,6.42 119.8,122.11 84.88,321.91 -36.02,192.83 -69.04,832.76 -225.86,827.45 -239.96,-36.96 -474.97,-121.67 -712.45,-182.51 -358.58,-102.54 -716.77,-151.3 -1074.25,-114.62 -496.59,70.74 -955.12,225.71 -1376.44,462.99 -217,130.9 -308.85,26.86 -234.87,-147.23 281.96,-399.89 724.11,-694.12 1307.79,-895.02zm-3779.98 2416.92c181.57,-624.18 574.76,-1347.87 783.79,-1338.97 843.56,1036.89 1762.56,2015.29 2790.58,2909.21 -625.91,467.01 -1702.35,780.79 -2615.23,304.5 -831.26,-435.64 -1068.47,-1091.08 -959.14,-1874.74z";

export function Logo() {
  // Replaying the draw-in every so often (not just once on load) — remount
  // the mark + wordmark via a changing key so the CSS animations (which use
  // animation-fill-mode: forwards and only ever run once per element)
  // restart clean. Skipped under reduced motion.
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (prefersReduced()) return;
    const id = setInterval(() => setReplay((n) => n + 1), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="logo" key={replay}>
      <svg className="logo-mark" viewBox="4749 6624 13113 11894"
        role="img" aria-label={P.name} focusable="false">
        <path d={LOGO_PATH} pathLength="1" />
      </svg>
      {/* the wordmark cascades in as the mark's fill develops; the svg
          above already carries the accessible name, so hide this copy */}
      <span className="logo-word" aria-hidden="true">
        {[...P.name].map((c, i) => (
          <b key={i} style={{ animationDelay: `${0.85 + i * 0.03}s` }}>
            {c === " " ? " " : c}
          </b>
        ))}
      </span>
    </span>
  );
}

/* ---------------- shared animated primitives ----------------
   Reveal and Counter run inside useGSAP (a scoped layout effect); under
   reduced motion they skip the animation and render final state. */
export function Reveal({ children, className = "", delay = 0, y = 18, as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (prefersReduced()) return;
    gsap.from(ref.current, {
      opacity: 0, y, duration: 0.9, delay, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
    });
  }, { scope: ref });
  return <Tag ref={ref} className={`rv ${className}`} {...rest}>{children}</Tag>;
}

/* ---------------- figures block ----------------
   Counting is only worth doing if it happens in front of the reader.

   Deliberately NOT ScrollTrigger: the pinned horizontal gallery sits
   directly above this block and inflates the scroll distance, so a
   scroll-position trigger fires while the figures are still off-screen
   and the count is over before they arrive. An IntersectionObserver
   asks the browser the only question that matters — is this actually
   on screen — and is immune to any pinning above it.

   One observer drives every counter, so they start in perfect sync. */
const COUNT_DUR = 2.1;

export function Metrics({ items }) {
  const ref = useRef(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) { setRun(true); el.classList.add("in"); return; }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setRun(true);
        el.classList.add("in");   // drives the accent sweep in the CSS
        io.disconnect();
      },
      { threshold: 0.35 },        // a third of the block visible = really here
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="metrics" ref={ref}>
      {items.map((m, i) => (
        <div className="metric" key={m.k}>
          {/* small stagger so they cascade in and land together */}
          <Counter to={m.v} suf={m.s} run={run} delay={i * 0.09} />
          <span className="mono">{m.k}</span>
        </div>
      ))}
    </div>
  );
}

/* Counts 0 → `to` once `run` flips true. The suffix (%, wks) is its own
   span so it can fly in as the number lands, rather than sitting there
   through the whole count. */
function Counter({ to, suf, run = true, delay = 0 }) {
  const [n, setN] = useState(0);
  const sufRef = useRef(null);
  const ref = useRef(null);

  useGSAP(() => {
    if (!run) return;
    if (prefersReduced()) { setN(to); return; }

    const box = { n: 0 };
    gsap.to(box, {
      n: to, duration: COUNT_DUR, delay,
      ease: "power1.out",           // gentle enough that the climb stays readable
      onUpdate: () => setN(Math.round(box.n)),
    });

    if (suf && sufRef.current) {
      gsap.from(sufRef.current, {
        opacity: 0, xPercent: -40, duration: 0.55, ease: "back.out(2)",
        delay: delay + COUNT_DUR * 0.62,
      });
    }
  }, { scope: ref, dependencies: [run] });

  return <b ref={ref}>{n}<span className="suf" ref={sufRef}>{suf}</span></b>;
}
