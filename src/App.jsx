import { useState, useRef, useCallback, lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { CSS, THEME, P, prefersReduced } from "./data.js";
import { AppProvider } from "./context.js";
import { TLink, Cursor } from "./ui.jsx";
import Home from "./pages/Home.jsx";
import WorkDetail from "./pages/WorkDetail.jsx";
import About from "./pages/About.jsx";
import Photography from "./pages/Photography.jsx";
import PhotoProject from "./pages/PhotoProject.jsx";
import Design from "./pages/Design.jsx";
import DesignProject from "./pages/DesignProject.jsx";

/* The admin is code-split: none of it ships to normal visitors. */
const Admin = lazy(() => import("./pages/Admin.jsx"));

/* Primary navigation. `/` matches exactly; the others also light up on
   their detail pages (/photography/:slug, /design/:slug). */
const NAV = [
  { to: "/", label: "Work" },
  { to: "/photography", label: "Photography" },
  { to: "/design", label: "Design" },
  { to: "/about", label: "About" },
];

/* ==================================================================
   SHELL — persists across route changes. Owns the smooth scroll +
   reading-progress bar, and the aperture page transition.
   ================================================================== */
export default function App() {
  const [reduced] = useState(prefersReduced);
  const navigate = useNavigate();
  const location = useLocation();
  /* The admin is a tool, not part of the portfolio: no public nav, and
     no custom cursor (it hides the caret and makes forms miserable). */
  const isAdmin = location.pathname.startsWith("/admin");
  const progRef = useRef(null);
  const barRef = useRef(null);
  const irisRef = useRef(null);
  const lenisRef = useRef(null);
  const busy = useRef(false);

  /* Lenis smooth scroll (native scroll, so sticky keeps working) driven
     by GSAP's ticker, plus the reading-progress bar. Lives in the shell
     so it survives navigation; skipped under reduced motion. */
  useGSAP(() => {
    let lenis;
    if (!reduced) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      lenis.__raf = raf;
    }
    const st = ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        if (progRef.current) progRef.current.style.width = `${self.progress * 100}%`;
        /* Bar hides while scrolling down and comes straight back on the
           way up. Always shown near the top so it never starts hidden. */
        const bar = barRef.current;
        if (bar) bar.classList.toggle("hide", self.scroll() > 140 && self.direction === 1);
      },
    });
    return () => {
      st.kill();
      if (lenis) { gsap.ticker.remove(lenis.__raf); lenis.destroy(); lenisRef.current = null; }
    };
  }, { dependencies: [reduced] });

  /* Page transition: the accent iris closes over the screen, we swap the
     route + reset scroll while it's covered, then it opens to reveal the
     new page. Under reduced motion it's an instant navigation. */
  const go = useCallback((to) => {
    if (to === location.pathname) return;
    const finish = () => {
      navigate(to);
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
      // a programmatic jump to the top may not emit a scroll update, so
      // reveal the bar explicitly on every navigation
      barRef.current?.classList.remove("hide");
    };
    if (reduced || !irisRef.current) { finish(); return; }
    if (busy.current) return;
    busy.current = true;
    const lens = irisRef.current;
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .fromTo(lens, { scale: 0 }, { scale: 1.1, duration: 0.45, ease: "power3.in" })
      .add(finish)
      .to(lens, { duration: 0.08 })              // hold while the new page mounts
      .add(() => ScrollTrigger.refresh())
      .to(lens, { scale: 0, duration: 0.6, ease: "power3.out" });
  }, [navigate, location.pathname, reduced]);

  const vars = {
    "--bg": THEME.bg, "--panel": THEME.panel, "--ink": THEME.ink, "--dim": THEME.dim,
    "--rule": THEME.rule, "--accent": THEME.accent, "--filter": THEME.filter,
  };

  return (
    <AppProvider value={{ theme: THEME, go }}>
      <div className="pf" style={vars}>
        <style>{CSS}</style>

        <a className="skip" href="#main">Skip to content</a>
        {!isAdmin && <Cursor />}

        {/* aperture transition overlay */}
        <div className="iris" aria-hidden="true">
          <div className="iris-lens" ref={irisRef} />
        </div>

        {/* masthead bar */}
        <div className="bar" ref={barRef} hidden={isAdmin}>
          <div className="bar-in">
            <TLink to="/" className="mono brand">{P.name}</TLink>
            <nav className="nav mono" aria-label="Primary">
              {NAV.map((n) => (
                <TLink key={n.to} to={n.to}
                  aria-current={
                    (n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to))
                      ? "page" : undefined
                  }>
                  {n.label}
                </TLink>
              ))}
            </nav>
            <span className="mono barmeta">{P.city} — Booking 2026</span>
          </div>
          <div className="prog" ref={progRef} style={{ width: "0%" }} />
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:seed" element={<WorkDetail />} />
          <Route path="/photography" element={<Photography />} />
          <Route path="/photography/:slug" element={<PhotoProject />} />
          <Route path="/design" element={<Design />} />
          <Route path="/design/:slug" element={<DesignProject />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={
            <Suspense fallback={<main className="admin wrap"><p className="mono">Loading…</p></main>}>
              <Admin />
            </Suspense>
          } />
        </Routes>
      </div>
    </AppProvider>
  );
}
