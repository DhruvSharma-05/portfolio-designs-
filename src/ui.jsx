import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReduced } from "./data.js";
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

export function Counter({ to, suf }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useGSAP(() => {
    if (prefersReduced()) { setN(to); return; }
    const box = { n: 0 };
    gsap.to(box, {
      n: to, duration: 1.6, ease: "power2.out",
      onUpdate: () => setN(Math.round(box.n)),
      scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
    });
  }, { scope: ref });
  return <b ref={ref}>{n}{suf}</b>;
}
