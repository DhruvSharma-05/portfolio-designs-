import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { AnimatePresence } from "motion/react";
import { CSS, THEME, P, prefersReduced } from "./data.js";
import { AppProvider } from "./context.js";
import { TLink, Logo, ContactModal } from "./ui.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import Home from "./pages/Home.jsx";
import WorkDetail from "./pages/WorkDetail.jsx";
import About from "./pages/About.jsx";
import Photography from "./pages/Photography.jsx";
import PhotoProject from "./pages/PhotoProject.jsx";
import Design from "./pages/Design.jsx";
import DesignProject from "./pages/DesignProject.jsx";
import NotFound from "./pages/NotFound.jsx";

/* Client delivery (see CLIENT-DELIVERY-POA.md). Both are code-split so
   none of the admin tooling or the delivery page ships to a normal
   visitor — the portfolio's bundle is unchanged by their presence. */
const Admin = lazy(() => import("./pages/Admin.jsx"));
const Client = lazy(() => import("./pages/Client.jsx"));

/* Primary navigation. `/` matches exactly; the others also light up on
   their detail pages (/photography/:slug, /design/:slug). */
const NAV = [
  { to: "/", label: "Home" },
  { to: "/design", label: "Design" },
  { to: "/photography", label: "Photography" },
  { to: "/about", label: "About" },
];

/* Scroll to an in-page section by id, using Lenis when it's running so
   the motion matches the rest of the site; falls back to native. Retries
   briefly because the target may still be mounting right after a route
   change. Reduced motion jumps instantly, and so does `immediate` — used
   when the jump happens behind the closed iris, where an animated scroll
   would be both invisible and fragile. */
function scrollToId(id, lenisRef, reduced, { immediate = false, tries = 20 } = {}) {
  const el = document.getElementById(id);
  if (!el) {
    if (tries > 0) {
      requestAnimationFrame(() => scrollToId(id, lenisRef, reduced, { immediate, tries: tries - 1 }));
    }
    return;
  }
  const now = immediate || reduced;
  // Lenis caches the page dimensions and clamps every scrollTo to that
  // cached limit. Straight after a route change the limit is still the
  // *previous* page's, so a jump deep into a taller page gets clipped to
  // the old page's bottom — re-measure first.
  lenisRef.current?.resize();
  if (lenisRef.current && !reduced) {
    lenisRef.current.scrollTo(el, { offset: -70, immediate: now });
  } else {
    // same -70 as the Lenis path, so the heading clears the masthead
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: now ? "auto" : "smooth" });
  }
}

/* ==================================================================
   SHELL — persists across route changes. Owns the smooth scroll +
   reading-progress bar, and the aperture page transition.
   ================================================================== */
export default function App() {
  const [reduced] = useState(prefersReduced);
  /* the enquiry form is a modal owned by the shell, so every page can
     open it through `openContact` without mounting its own copy */
  const [contactOpen, setContactOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const progRef = useRef(null);
  const irisRef = useRef(null);
  const lenisRef = useRef(null);
  const topRef = useRef(null);
  const barRef = useRef(null);
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
        topRef.current?.classList.toggle("show", self.scroll() > 600);
      },
    });
    return () => {
      st.kill();
      if (lenis) { gsap.ticker.remove(lenis.__raf); lenis.destroy(); lenisRef.current = null; }
    };
  }, { dependencies: [reduced] });

  /* Direct load / reload of a URL that carries a #hash (e.g. someone
     pastes "/#contact") — scroll to that section once mounted. */
  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id) requestAnimationFrame(() => scrollToId(id, lenisRef, reduced));
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Page transition: the accent iris closes over the screen, we swap the
     route + reset scroll while it's covered, then it opens to reveal the
     new page. Under reduced motion it's an instant navigation. */
  const go = useCallback((to) => {
    // `to` may carry a #hash (e.g. "/#contact"): split it off so the
    // route compares on pathname, and the hash becomes a scroll target.
    const [path, hash] = to.split("#");
    const dest = path || "/";
    // Same page + a hash → just scroll to the section, no transition.
    if (dest === location.pathname && hash) { scrollToId(hash, lenisRef, reduced); return; }
    if (dest === location.pathname) return;
    const finish = () => {
      navigate(dest);
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };
    /* Honour a #hash only *after* the new page has mounted and
       ScrollTrigger has re-measured it: a refresh restores the scroll
       position it recorded, so a scroll started before it gets snapped
       back. The jump itself is instant — it happens behind the closed
       iris, so the section is simply what the iris opens onto. */
    const jump = () => {
      if (hash) scrollToId(hash, lenisRef, reduced, { immediate: true });
    };
    if (reduced || !irisRef.current) {
      finish();
      requestAnimationFrame(() => { ScrollTrigger.refresh(); jump(); });
      return;
    }
    if (busy.current) return;
    busy.current = true;
    const lens = irisRef.current;
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .fromTo(lens, { scale: 0 }, { scale: 1.1, duration: 0.45, ease: "power3.in" })
      .add(finish)
      .to(lens, { duration: 0.08 })              // hold while the new page mounts
      .add(() => { ScrollTrigger.refresh(); jump(); })
      .to(lens, { scale: 0, duration: 0.6, ease: "power3.out" });
  }, [navigate, location.pathname, reduced]);

  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);

  /* The admin is a tool, not part of the portfolio: it gets none of the
     public chrome — no nav, no "Contact me" CTA, no back-to-top. The
     client delivery page keeps the bar so it still reads as Viraj's
     site, which is the whole point of delivering from his own domain. */
  const isAdmin = location.pathname.startsWith("/admin");

  /* a route change behind the modal (browser back, say) shouldn't leave
     it hanging over the new page */
  useEffect(() => { setContactOpen(false); }, [location.pathname]);

  const vars = {
    "--bg": THEME.bg, "--panel": THEME.panel, "--ink": THEME.ink, "--dim": THEME.dim,
    "--rule": THEME.rule, "--accent": THEME.accent, "--filter": THEME.filter,
  };

  return (
    <AppProvider value={{ theme: THEME, go, openContact }}>
      <div className="pf" style={vars}>
        <style>{CSS}</style>

        <a className="skip" href="#main">Skip to content</a>

        {/* aperture transition overlay */}
        <div className="iris" aria-hidden="true">
          <div className="iris-lens" ref={irisRef} />
        </div>

        {/* masthead bar — sticky, always on screen */}
        <div className="bar" ref={barRef} hidden={isAdmin}>
          <div className="bar-in">
            <TLink to="/" className="mono brand" aria-label={`${P.name} home`}>
              <Logo photo={location.pathname.startsWith("/photography")} />
            </TLink>
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
              <button type="button" onClick={openContact}>Contact me</button>
            </nav>
          </div>
          <div className="prog" ref={progRef} style={{ width: "0%" }} />
        </div>

        {/* enquiry form — one shared modal for the whole site */}
        <AnimatePresence>
          {contactOpen && (
            <ContactModal email={P.email} onClose={closeContact} reduced={reduced} />
          )}
        </AnimatePresence>

        {/* back to top — fades in once you're a scroll past the fold */}
        {!isAdmin && (
          <button type="button" className="totop" ref={topRef} aria-label="Back to top"
            onClick={() => {
              if (reduced || !lenisRef.current) {
                window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
                return;
              }
              lenisRef.current.scrollTo(0, { duration: 1 });
            }}>
            <span className="arrow" aria-hidden="true">↑</span>
          </button>
        )}

        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work/:seed" element={<WorkDetail />} />
            <Route path="/photography" element={<Photography />} />
            <Route path="/photography/:slug" element={<PhotoProject />} />
            <Route path="/design" element={<Design />} />
            <Route path="/design/:slug" element={<DesignProject />} />
            <Route path="/about" element={<About />} />
            {/* client delivery — /client asks for a code, /client/:code
                opens that gallery straight from a link */}
            <Route path="/client" element={
              <Suspense fallback={<main className="client wrap"><p className="mono">Loading…</p></main>}>
                <Client />
              </Suspense>
            } />
            <Route path="/client/:code" element={
              <Suspense fallback={<main className="client wrap"><p className="mono">Loading…</p></main>}>
                <Client />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<main className="admin wrap"><p className="mono">Loading…</p></main>}>
                <Admin />
              </Suspense>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </AppProvider>
  );
}
