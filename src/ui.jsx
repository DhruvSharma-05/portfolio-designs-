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
  // photography routes swap the C& monogram for the Lensofviraj mark
  if (photo) return <PhotoLogo />;

  return (
    <span className="logo">
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

/* ---------------- centred section header ----------------
   The one header shape every major block on the home page uses:
   headline, a line or two of description, an optional call to action —
   see the CENTRED SECTION SYSTEM block in data.js.

   `kicker` is the section's own word — Photography, Design — set in the
   accent face's italic ABOVE the headline. It is not the mono eyebrow
   that used to sit there and was removed: that one was an 11px caption
   restating the heading below it in a different typeface. This is the
   display face carrying the lockup's first line, and the headline under
   it drops its own italic word in exchange, so there is still exactly
   one italic per header. Sections that have nothing to name omit it.

   `title` takes a node rather than a string so a section can put ONE
   WORD in <span className="serif">. One, literally — the italic is
   there to catch the eye on the word the headline turns on, and an
   italic phrase ("as one", "handed over", "by them") is just a second
   voice reading half the line. Pick the word the sentence would lose
   most by dropping, and prefer the opening verb.

   `small` steps the headline down a size, for a section where the block
   underneath is the loud part.

   Under the headline are two optional tiers, and the point of them is
   that a section takes only the ones it has something to put in:

     lead  the one sentence, at full ink and the body weight
     sub   the longer explanation, a step lighter and dimmer

   So a section that needs the whole ladder passes both; one with a
   single explanation passes `sub` alone; and one whose headline says
   everything — the testimonials — passes neither and gets a headline
   with nothing under it. That is the shape, not an omission to fix.
   `cta` is optional on the same terms.

   The heading level is a prop because this is used for both a section
   inside the page (h2) and, potentially, a page's own opening (h1) —
   the ring of headings has to stay honest for a screen reader even
   though every one of these looks identical.

   THE HEADER REVEALS ITSELF, so it is not wrapped in a <Reveal>. A
   Reveal fades the whole block as one object, which is the wrong motion
   for a lockup: the kicker, the headline and the description arrive in
   that order when you read them and should arrive in that order when
   they appear. The display tier rises out of a mask — the letters are
   clipped and slide up into place, which is the one reveal that suits
   type this size — and the copy under it follows with a plain fade a
   fifth of a second later. Everything is one timeline off one
   ScrollTrigger, so the parts can never drift.

   `still` opts out entirely, for a header whose visibility is already
   being driven by something else: the photography lockup lives inside
   the collage's sticky frame and is faded in by that run's scroll
   progress, and a second animation fighting it would flicker. */
export function CenterHead({ kicker, title, lead, sub, cta, small, still, as: Tag = "h2", id }) {
  const ref = useRef(null);

  useGSAP(() => {
    if (still || prefersReduced()) return;
    const el = ref.current;
    const rise = el.querySelectorAll(".chead-line > span");
    const fade = el.querySelectorAll(".chead-lead, .chead-sub, .chead-cta");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
    /* 135%, not 100%: .chead-line carries padding below the text so
       descenders aren't clipped at rest, and overflow clips at the
       PADDING edge — at 100% the tail of a "g" would still be showing
       before it moved. */
    if (rise.length) {
      tl.from(rise, { yPercent: 135, duration: 1.05, ease: "power3.out",
        stagger: 0.1, clearProps: "transform" }, 0);
    }
    if (fade.length) {
      tl.from(fade, { opacity: 0, y: 14, duration: 0.8, ease: "power3.out",
        stagger: 0.08, clearProps: "transform,opacity" }, 0.22);
    }
  }, { scope: ref, dependencies: [still] });

  return (
    <div className="chead" ref={ref}>
      {kicker && (
        <p className="chead-kicker chead-line"><span>{kicker}</span></p>
      )}
      <Tag className={`chead-title${small ? " chead-title-sm" : ""}`} id={id}>
        <span className="chead-line"><span>{title}</span></span>
      </Tag>
      {lead && <p className="chead-lead">{lead}</p>}
      {sub && <p className="chead-sub">{sub}</p>}
      {cta && <div className="chead-cta">{cta}</div>}
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
        <p className="mono">Usually replies within 24 to 48 hours.</p>
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
        <span className="mono cf-reply">Usually replies within 24 to 48 hours.</span>
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
              hear your ideas. Fill out the form below.
            </p>
          </div>
          <button type="button" className="cmodal-x" onClick={onClose} aria-label="Close enquiry form">✕</button>
        </div>
        <ContactForm email={email} />
      </motion.div>
    </motion.div>
  );
}

/* ---------------- swipe ----------------
   Minimal horizontal touch-swipe: a drag past `threshold` px fires onLeft
   (swipe left → next) or onRight (swipe right → prev) once the finger
   lifts. Short taps and vertical scrolls fall under the threshold and are
   left alone, so they don't hijack normal scrolling or button clicks. */
// eslint-disable-next-line react-refresh/only-export-components -- hook, shared by Lightbox (below) and PhotoCarousel
export function useSwipe(onLeft, onRight, threshold = 40) {
  const x = useRef(null);
  return {
    onTouchStart: (e) => { x.current = e.touches[0].clientX; },
    onTouchEnd: (e) => {
      if (x.current == null) return;
      const dx = e.changedTouches[0].clientX - x.current;
      x.current = null;
      if (dx <= -threshold) onLeft?.();
      else if (dx >= threshold) onRight?.();
    },
  };
}

/* ---------------- shared animated primitives ----------------
   Reveal runs inside useGSAP (a scoped layout effect); under reduced
   motion it skips the animation and renders final state. */
/* `sel` + `stagger` animate the matching descendants one after another
   instead of the block as a whole — for something already built out of
   lines, like the studio tagline's .st-line spans, where moving the
   whole paragraph as one object throws away the shape it already has. */
/* ---------------- the footer ----------------
   The three standing facts — how to reach him, where he is, where else
   he is — then the rule and the copyright line. It closes every page,
   which is the point: /design and /photography used to stop at the
   contact button, so two of the five routes simply had no footer and a
   visitor who landed on one from a search had nowhere to find an email.

   `back` adds the way home on the same row as the copyright. The home
   page passes nothing, because it is home. */
export function Colophon({ back = false }) {
  return (
    <>
      <Reveal as="dl" className="colophon">
        <div>
          <dt className="mono">Contact</dt>
          <dd>
            <a href={`mailto:${P.email}`}>{P.email}</a><br />
            <a href={`tel:${P.phone.replace(/[^+\d]/g, "")}`}>{P.phone}</a>
          </dd>
        </div>
        <div>
          <dt className="mono">Based in</dt>
          <dd>{P.city} · {P.area}<br />{P.region}</dd>
        </div>
        <div>
          <dt className="mono">Elsewhere</dt>
          <dd>
            {P.socials.map((s) => (
              <span key={s.href} style={{ display: "block" }}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.k} · {s.v}
                </a>
              </span>
            ))}
          </dd>
        </div>
      </Reveal>

      <hr className="rule" style={{ marginTop: 44 }} />
      <div className="colophon-foot">
        <span className="mono">© {P.name}</span>
        {back && (
          <TLink to="/" className="mono back">
            <span className="arrow">←</span> Back to home
          </TLink>
        )}
      </div>
    </>
  );
}

/* ---------------- the scrolling timeline ----------------
   A rail down the middle of the column with the steps hung off it,
   alternating right and left, and exactly one of them lit at a time —
   the one the middle of the screen is currently inside. The rest sit
   back, dimmed and a shade smaller, so the page reads as one thing at a
   time rather than four competing for the same attention.

   It replaced a grid of bordered cards. Four numbered steps in four
   boxes is a layout that says "these are four separate things"; they
   are one sequence, and a line you travel down says that instead. No
   box, no border, no panel — just the type, which is also what makes
   the copy legible at this width.

   `items` is [{ k, v }] — the shape INTRO.offer, both PROCESS lists and
   ABOUT.approach already share.

   One scroll handler, rAF-throttled, drives both the rail's fill and
   which step is lit. An IntersectionObserver per step would be the
   obvious alternative and is worse here: the steps are tall and the
   band that decides "current" is a line, not a box, so the observer
   would need a -50%/-50% rootMargin and would still go quiet whenever
   the line sat in the gap between two of them. */
export function Timeline({ items, className = "" }) {
  const root = useRef(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const r = root.current;
    if (!r || !items.length) return;
    /* Under reduced motion nothing dims and nothing moves: every step
       is lit and the rail is drawn full. The list still reads in order,
       it just doesn't animate — which is the point of the preference. */
    if (prefersReduced()) {
      r.dataset.still = "on";
      r.style.setProperty("--prog", "100%");
      return;
    }
    let raf = 0;
    const read = () => {
      raf = 0;
      const box = r.getBoundingClientRect();
      const mid = window.innerHeight * 0.5;
      /* how far the middle of the screen has travelled through the list,
         as a fraction — this is the rail's fill */
      const p = Math.min(Math.max((mid - box.top) / (box.height || 1), 0), 1);
      r.style.setProperty("--prog", `${(p * 100).toFixed(2)}%`);
      /* the lit step is the LAST one whose top the middle has passed,
         so the first is lit on arrival and the change happens as each
         heading crosses the centre rather than when it leaves */
      const steps = r.querySelectorAll(".tline-step");
      let idx = 0;
      steps.forEach((el, i) => { if (el.getBoundingClientRect().top <= mid) idx = i; });
      setAt(idx);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items.length]);

  if (!items.length) return null;

  return (
    <ol className={`tline ${className}`} ref={root}>
      {/* the rail is one element with a fill inside it, not a border on
          the list: a border would stop at the last item's box and the
          line has to run the whole height */}
      <div className="tline-rail" aria-hidden="true"><i style={{ height: "var(--prog, 0%)" }} /></div>
      {items.map((s, i) => (
        <li className="tline-step" key={s.k}
          data-side={i % 2 === 0 ? "right" : "left"}
          data-on={i === at ? "1" : "0"}>
          <span className="tline-dot" aria-hidden="true" />
          <div className="tline-body">
            <span className="tline-n mono">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.k}</h3>
            <p>{s.v}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Reveal({ children, className = "", delay = 0, y = 18,
  sel, stagger = 0, as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (prefersReduced()) return;
    const targets = sel ? ref.current.querySelectorAll(sel) : ref.current;
    if (sel && !targets.length) return;
    gsap.from(targets, {
      opacity: 0, y, duration: 0.9, delay, ease: "power3.out",
      ...(stagger ? { stagger } : {}),
      /* GSAP leaves its inline transform behind when a tween finishes —
         `transform: translate(0px, 0px)` — and an inline declaration
         beats every rule in the stylesheet. That silently killed the
         hover lift on every card that was also a
         Reveal and hoverable: the card's :hover transform was there the
         whole time and could never win. clearProps hands the element
         back to CSS the moment the reveal is over. */
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
    });
  }, { scope: ref, dependencies: [sel, stagger] });
  return <Tag ref={ref} className={`rv ${className}`} {...rest}>{children}</Tag>;
}

/* ---------------- typewriter ----------------
   The hero's role line writes itself, backspaces, and writes the next
   role. One timeout at a time (not an interval) so each phase can set
   its own pace: typing is slower than erasing, and the finished word is
   held long enough to be read before it goes.

   The animated text is aria-hidden and the roles are read once from an
   off-screen copy — a screen reader announcing every keystroke would be
   unusable, and aria-label on a plain span isn't reliably exposed. */
const TYPE_MS = 65;   // per character while writing
const ERASE_MS = 30;  // per character while backspacing — always faster
const HOLD_MS = 2000; // the finished word, on screen
const GAP_MS = 380;   // empty line before the next word starts

export function Typewriter({ words, className = "", delay = 0 }) {
  const [reduced] = useState(prefersReduced);
  const [i, setI] = useState(0);          // which word
  const [n, setN] = useState(0);          // characters currently shown
  const [erasing, setErasing] = useState(false);
  /* the hero line fades in on a delay, so hold the first keystroke until
     it is actually on screen — otherwise it types behind opacity: 0 */
  const [started, setStarted] = useState(!delay);

  useEffect(() => {
    if (reduced || started) return;
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay, started, reduced]);

  useEffect(() => {
    if (reduced || !started) return;
    const word = words[i];
    const done = n === word.length;
    const ms = erasing ? (n ? ERASE_MS : GAP_MS) : done ? HOLD_MS : TYPE_MS;
    const t = setTimeout(() => {
      if (!erasing) return done ? setErasing(true) : setN(n + 1);
      if (n) return setN(n - 1);
      setErasing(false);
      setI((prev) => (prev + 1) % words.length);
    }, ms);
    return () => clearTimeout(t);
  }, [words, i, n, erasing, reduced, started]);

  // no motion: state the roles plainly rather than freezing mid-word
  if (reduced) {
    return <span className={className}>{words.join(" · ")}</span>;
  }

  return (
    <span className={className}>
      <span className="tw-sr">{words.join(", ")}</span>
      <span aria-hidden="true">
        {words[i].slice(0, n)}
        <i className="tw-caret" />
      </span>
    </span>
  );
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
  const swipe = useSwipe(() => shift(1), () => shift(-1));

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

      <div className="lb-stage" {...(!single ? swipe : {})}>
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
