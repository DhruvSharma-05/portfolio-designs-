import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { P, img, srcSet, figmaEmbed, prefersReduced } from "./data.js";
import { useApp } from "./context.js";
// inlined (not <img src>) so the page actually runs its CSS animation —
// CSS animations inside an <img>-referenced SVG don't play.
import virajSvg from "./assets/logo-viraj.svg?raw";

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

/* On the photography routes the bar shows the Lensofviraj photography
   mark instead of the C& studio monogram. Drop the file at
   public/logo-viraj.svg (or .png / .webp) — light/transparent art so it
   reads on the dark bar — and it's picked up automatically; until then
   the "Lensofviraj" wordmark stands in. */
function PhotoLogo() {
  // key by pathname isn't needed — a fresh mount on entering /photography
  // re-injects the SVG, so its entrance animation replays each visit.
  return (
    <span className="logo logo-photo" role="img" aria-label={P.photoBrand}
      dangerouslySetInnerHTML={{ __html: virajSvg }} />
  );
}

export function Logo({ photo = false }) {
  // Replaying the draw-in every so often (not just once on load) — remount
  // the mark + wordmark via a changing key so the CSS animations (which use
  // animation-fill-mode: forwards and only ever run once per element)
  // restart clean. Skipped under reduced motion.
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (photo || prefersReduced()) return;
    const id = setInterval(() => setReplay((n) => n + 1), 15000);
    return () => clearInterval(id);
  }, [photo]);

  // photography routes swap the C& monogram for the Lensofviraj mark
  if (photo) return <PhotoLogo />;

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

/* ---------------- deferred Figma preview ----------------
   A live Figma prototype preview that only mounts its (heavy) iframe once
   the card is near the viewport — so a page never loads more than it needs
   at once and offscreen cards cost nothing until you scroll to them. Until
   then the branded name/tag panel stands in (and stays behind the iframe as
   its load placeholder). `eager` forces an immediate mount for
   above-the-fold slots. The iframe is pointer-events:none / tabIndex -1 so
   the whole card stays a single link to the detail page. */
export function FigmaFrame({ w, eager = false }) {
  const ref = useRef(null);
  const [show, setShow] = useState(eager);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setShow(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } },
      { rootMargin: "600px" }, // start loading well before it scrolls into view
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div className="figbox" ref={ref}>
      <div className="browser-ph figbox-fallback">
        <span className="browser-ph-name">{w.t}</span>
        <span className="mono">{w.tag}</span>
      </div>
      {show && (
        <iframe className="figbox-frame" title={`${w.t} Figma preview`}
          src={figmaEmbed(w.href)} loading="lazy" tabIndex={-1} />
      )}
    </div>
  );
}

/* ---------------- section header ----------------
   A numbered label with a rule that draws itself across when the header
   scrolls into view. Gives every section the same strong, quiet anchor
   so the page reads as a rhythm instead of a flat stack of text. */
export function SectionHead({ n, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) { el.classList.add("in"); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="shead" ref={ref}>
      {n && <span className="shead-n mono">{n}</span>}
      <span className="shead-label mono">{children}</span>
      <span className="shead-rule" aria-hidden="true" />
    </div>
  );
}

/* ---------------- contact form ----------------
   Real enquiry form for a static site: it POSTs to a form-backend
   service (Formspree) that emails Viraj — no server of our own. The
   endpoint id lives in VITE_FORMSPREE_ID; until that's set the form
   degrades to the plain mailto link, so nothing is ever broken. A
   hidden `_gotcha` honeypot catches bots (Formspree drops it silently). */
export function ContactForm({ email }) {
  const id = import.meta.env.VITE_FORMSPREE_ID;
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error

  // No endpoint configured yet → graceful fallback to the email link.
  if (!id) return <a className="mail" href={`mailto:${email}`}>{email}</a>;

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${id}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (res.ok) { setStatus("ok"); form.reset(); }
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "ok") {
    return (
      <div className="form-done" role="status">
        <p className="pj-intro">Thanks. Your message is in.</p>
        <p className="mono">Usually replies within 24 hours.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <input type="hidden" name="_subject" value="New enquiry · Crafted & Captured" />
      <div className="cf-row">
        <label className="cf-field">
          <span className="mono">Name</span>
          <input name="name" type="text" required autoComplete="name" placeholder="John Doe" />
        </label>
        <label className="cf-field">
          <span className="mono">Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="someone@example.com" />
        </label>
      </div>
      <label className="cf-field">
        <span className="mono">What are you looking for?</span>
        <select name="service" required defaultValue="">
          <option value="" disabled>Select one…</option>
          <option>Portrait Photography</option>
          <option>Event Photography</option>
          <option>Product Photography</option>
          <option>UI/UX Design</option>
          <option>Website Design</option>
          <option>Other</option>
        </select>
      </label>
      <label className="cf-field">
        <span className="mono">Message</span>
        <textarea name="message" rows={4} required
          placeholder="Tell me about your project, preferred date, location, and any ideas you have." />
      </label>
      {/* honeypot — hidden from people, tempting to bots */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off"
        className="cf-hp" aria-hidden="true" />
      <div className="cf-foot">
        <button className="extlink" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"} <span className="arrow">→</span>
        </button>
        {status === "error" && (
          <span className="mono cf-err">
            That didn't send. Please email <a href={`mailto:${email}`}>{email}</a> instead.
          </span>
        )}
      </div>
      <div className="cf-after">
        <span className="mono cf-reply">Usually replies within 24 hours.</span>
        <SocialIcons />
      </div>
    </form>
  );
}

/* Instagram + LinkedIn, drawn from P.socials so the links stay in one place.
   Line-style glyphs to sit quietly beside the reply note. */
function SocialIcons() {
  const href = (k) => P.socials.find((s) => s.k === k)?.href;
  const ig = href("Instagram");
  const li = href("LinkedIn");
  return (
    <div className="cf-social">
      {ig && (
        <a href={ig} target="_blank" rel="noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      )}
      {li && (
        <a href={li} target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2.5" />
            <path d="M7 10.5V17" />
            <path d="M7 7.2v.01" />
            <path d="M11 17v-3.5a2 2 0 0 1 4 0V17" />
            <path d="M11 10.5V17" />
          </svg>
        </a>
      )}
    </div>
  );
}

/* ---------------- contact modal ----------------
   The enquiry form now has one home: a centred dialog over a blurred
   page, opened from the masthead CTA and the "Contact me" button at the
   foot of every page. The form inside is the same ContactForm — the
   Formspree wiring is untouched.

   Locks page scroll, moves focus to the first field, traps Tab inside
   the panel, restores focus to whatever opened it, and closes on Esc or
   a click on the backdrop. */
export function ContactModal({ email, onClose, reduced }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    /* focus the first field rather than the close button — someone who
       opened this came to type, not to leave */
    panelRef.current?.querySelector("input, textarea")?.focus();

    const key = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll(
        "a[href], button:not([disabled]), input:not([tabindex='-1']), textarea",
      );
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      if (!panelRef.current.contains(active)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", key);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.documentElement.style.overflow = prevOverflow;
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus();
    };
  }, [onClose]);

  return (
    <motion.div className="cmodal" role="dialog" aria-modal="true" aria-labelledby="cmodal-title"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div className="cmodal-panel" ref={panelRef}
        initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.99 }}
        transition={{ duration: reduced ? 0 : 0.34, ease: [0.2, 0.8, 0.2, 1] }}>
        <div className="cmodal-head">
          <div>
            <h2 id="cmodal-title">Tell me about your vision</h2>
            <p className="cmodal-sub">
              Whether it's a photoshoot, a website, or a creative collaboration, I'd love to
              hear your ideas. Fill out the form below and I'll get back to you within 24 hours.
            </p>
          </div>
          <button type="button" className="cmodal-x" onClick={onClose} aria-label="Close enquiry form">✕</button>
        </div>
        <ContactForm email={email} />
        <div className="mono cmodal-foot">
          Prefer email? <a href={`mailto:${email}`}>{email}</a> · {P.phone}
        </div>
      </motion.div>
    </motion.div>
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

/* ---------------- lightbox / preview ----------------
   Full-screen viewer. Locks page scroll while open so the page behind
   doesn't drift. Focus moves to the Close button on open, Tab cycles
   inside the dialog, and focus returns to the frame that opened it.

   Two modes, one component:
   • carousel (default) — ← → Esc, prev/next arrows and a dot rail, for
     browsing every frame in a photo project.
   • single ({ single }) — just the one clicked photo, Esc or click the
     backdrop to close. No arrows, no dots. Used by the Work gallery.

   Pass a seed list, a title, and the [index, setIndex] pair driving it
   (-1 = closed). Wrap the render in <AnimatePresence> so the exit fade
   plays. */
export function Lightbox({ photos, title, index, setIndex, reduced, single = false }) {
  const close = useCallback(() => setIndex(-1), [setIndex]);
  const shift = useCallback(
    (d) => setIndex((n) => (n + d + photos.length) % photos.length),
    [setIndex, photos.length],
  );
  const boxRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    boxRef.current?.querySelector(".lb-x")?.focus();
    const key = (e) => {
      if (e.key === "Escape") close();
      if (!single && e.key === "ArrowRight") shift(1);
      if (!single && e.key === "ArrowLeft") shift(-1);
      if (e.key === "Tab") {
        const items = boxRef.current?.querySelectorAll("button");
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        const active = document.activeElement;
        if (!boxRef.current.contains(active)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.documentElement.style.overflow = prevOverflow;
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus();
    };
  }, [close, shift, single]);

  return (
    <motion.div className="lb" ref={boxRef} role="dialog" aria-modal="true" aria-label={`${title} photo viewer`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
      onClick={single ? (e) => { if (e.target === e.currentTarget) close(); } : undefined}>
      <div className="lb-bar">
        <span className="mono">
          {single ? title : `${title} · ${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`}
        </span>
        <button className="lb-x" onClick={close} aria-label="Close viewer">Close ✕</button>
      </div>

      <div className="lb-stage">
        {!single && (
          <button className="lb-arrow prev" onClick={() => shift(-1)} aria-label="Previous frame">←</button>
        )}
        <AnimatePresence mode="wait">
          <motion.img key={photos[index]} src={img(photos[index], 2000, 1400)}
            srcSet={srcSet(photos[index])} sizes="100vw"
            alt={single ? title : `${title}, frame ${index + 1}`}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }} />
        </AnimatePresence>
        {!single && (
          <button className="lb-arrow next" onClick={() => shift(1)} aria-label="Next frame">→</button>
        )}
      </div>

      {!single && (
        <div className="lb-foot">
          {photos.map((s, n) => (
            <button key={s + n} className={`dot ${n === index ? "on" : ""}`}
              aria-current={n === index || undefined}
              onClick={() => setIndex(n)} aria-label={`Frame ${n + 1}`} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
