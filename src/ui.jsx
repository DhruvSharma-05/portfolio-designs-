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

/* Brand logo for the bar. Probes public/ for logo.svg → logo.png →
   logo.webp and shows the first one that loads; until a file exists it
   falls back to the studio wordmark. Drop the file in public/ and
   refresh — no code change needed. */
export function Logo() {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      for (const cand of ["/logo.svg", "/logo.png", "/logo.webp"]) {
        const ok = await new Promise((res) => {
          const probe = new Image();
          probe.onload = () => res(true);
          probe.onerror = () => res(false);
          probe.src = cand;
        });
        if (!alive) return;
        if (ok) { setSrc(cand); return; }
      }
    })();
    return () => { alive = false; };
  }, []);
  return src ? <img className="logo-img" src={src} alt={P.name} /> : <>{P.name}</>;
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

/* Custom cursor: a blend-mode dot that follows the pointer and grows —
   showing a "View" label — over anything marked [data-cursor] (and a
   smaller grow over plain links/buttons). Only activates for a fine
   pointer with motion allowed; touch and reduced-motion keep the native
   cursor untouched. */
export function Cursor() {
  const dot = useRef(null);
  const label = useRef(null);
  useGSAP(() => {
    const el = dot.current;
    if (prefersReduced() || matchMedia("(pointer: coarse)").matches) return;

    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

    const move = (e) => { xTo(e.clientX); yTo(e.clientY); };
    const reveal = () => gsap.to(el, { opacity: 1, duration: 0.3 });
    const over = (e) => {
      const t = e.target.closest("[data-cursor], a, button");
      if (!t) { el.classList.remove("is-hover", "is-view"); label.current.textContent = ""; return; }
      const txt = t.getAttribute("data-cursor");
      el.classList.add("is-hover");
      el.classList.toggle("is-view", !!txt);
      label.current.textContent = txt || "";
    };

    document.documentElement.classList.add("cursor-on");
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointermove", reveal, { once: true, passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    return () => {
      document.documentElement.classList.remove("cursor-on");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
    };
  }, []);

  return <div className="cursor" ref={dot} aria-hidden="true"><span className="cursor-label" ref={label} /></div>;
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
export function Counter({ to, suf, run = true, delay = 0 }) {
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
