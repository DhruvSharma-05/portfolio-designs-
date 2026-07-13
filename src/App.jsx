import { useState, useEffect } from "react";

/* ============================================================
   PHOTOGRAPHER PORTFOLIO — 9 DESIGN DIRECTIONS
   A client-facing selection tool. Every direction is a full,
   animated photography site with placeholder imagery.
   Swap PHOTOGRAPHER + the img() seeds for real content.
   ============================================================ */

const PHOTOGRAPHER = {
  name: "Your Name",
  handle: "@yourhandle",
  role: "Wildlife Photographer / Filmmaker",
  tagline: "Patiently observing the wild, one frame at a time",
  bio: "Wildlife photographer and filmmaker documenting animals, their habitats, and the moments that connect them. Conservation is the purpose; the frame is the invitation.",
  email: "you@yourdomain.com",
  phone: "(+00) 000 000 000",
  city: "Your City",
};

/* Stable wildlife-photo placeholders from LoremFlickr. Replace these with local
   image paths when the final portfolio photographs are ready. */
const WILDLIFE_SUBJECTS = {
  posterhero: "snow-leopard", atelierhero: "elephant", prismhero: "hummingbird",
  msplate: "wolf", bphero: "giraffe", archero: "tiger", rfhero: "elephant",
  rfme: "wildlife-photographer", rfbanner: "lion",
  "ov-redframe": "black-panther", "ov-darkroom": "snow-leopard", "ov-poster": "african-elephant",
  "ov-prism": "macaw", "ov-manuscript": "red-fox", "ov-blueprint": "giraffe",
  "ov-index": "zebra", "ov-atelier": "meerkat", "ov-arcade": "chameleon",
};
const img = (seed, w, h) => {
  const subject = WILDLIFE_SUBJECTS[seed] ?? seed;
  const lock = [...subject].reduce((total, char) => total + char.charCodeAt(0), 0);
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(subject)}?lock=${lock}`;
};
const GRAY = "?grayscale";

/* Shared wildlife sets keep every direction visually consistent. */
const LAND = ["elephant", "tiger", "lion", "giraffe", "zebra", "leopard"];
const EVENT = ["gorilla", "rhino", "cheetah"];
const PORTRAIT = ["red-fox", "polar-bear", "owl", "wolf"];
const STREET = ["flamingo", "penguin", "orangutan", "panda", "koala", "deer"];
const FILMS = [
  { t: "Wildlife Documentary", seed: "sea-turtle" },
  { t: "Safari Film", seed: "african-elephant" },
  { t: "Conservation Story", seed: "rainforest-wildlife" },
];

const GLOBAL = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Nunito:wght@400;600;700&family=Syne:wght@600;700;800&family=Manrope:wght@400;500;600&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Press+Start+2P&display=swap');
* { box-sizing: border-box; margin: 0; }
.pf-page { width: 100%; min-height: 100vh; animation: pageFade .5s ease both; }
.pf-page > header, .pf-page > section, .pf-page > footer { max-width: none !important; width: 100%; }
.pf-page a { text-decoration: none; color: inherit; }
.pf-page img { display: block; width: 100%; height: 100%; object-fit: cover; }
button { font: inherit; cursor: pointer; }

@keyframes pageFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
@keyframes riseBig { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: none; } }
@keyframes clipUp { from { transform: translateY(110%); } to { transform: none; } }
@keyframes shimmer { from { transform: translateX(-100%) skewX(-12deg); } to { transform: translateX(220%) skewX(-12deg); } }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes develop { from { filter: brightness(.15) saturate(0) contrast(1.6); opacity: 0; } to { filter: none; opacity: 1; } }
@keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.12); } }
@keyframes caret { 0%,45% { opacity: 1; } 50%,100% { opacity: 0; } }
@keyframes typing { from { width: 0; } to { width: 100%; } }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes popIn { 0% { opacity:0; transform: scale(.6) rotate(-6deg); } 70% { transform: scale(1.06) rotate(-1.5deg); } 100% { opacity:1; transform: scale(1) rotate(-1.5deg); } }
@keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(61,190,123,.55); } 70% { box-shadow: 0 0 0 12px rgba(61,190,123,0); } 100% { box-shadow: 0 0 0 0 rgba(61,190,123,0); } }
@keyframes glowDrift { 0%,100% { transform: translate(-8%,-4%) scale(1); } 50% { transform: translate(6%,5%) scale(1.15); } }
@keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes drawLine { from { width: 0; } to { width: 100%; } }
@keyframes blinkStep { 0%,55% { opacity: 1; } 56%,100% { opacity: 0; } }
@keyframes spriteHop { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes orbDrift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.2); } }
@keyframes trackIn { from { letter-spacing: .35em; opacity: 0; } to { letter-spacing: -0.02em; opacity: 1; } }
@keyframes glowPulse { 0%,100% { text-shadow: 0 0 18px rgba(255,42,32,.75), 0 0 55px rgba(255,42,32,.4); } 50% { text-shadow: 0 0 30px rgba(255,42,32,1), 0 0 90px rgba(255,42,32,.6); } }
@keyframes flicker { 0%,100% { opacity: 1; } 41% { opacity: 1; } 42% { opacity: .35; } 44% { opacity: 1; } 78% { opacity: 1; } 79% { opacity: .5; } 81% { opacity: 1; } }
@keyframes wipeReveal { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@keyframes playPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,.35); } 50% { transform: scale(1.08); box-shadow: 0 0 0 14px rgba(255,255,255,0); } }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
  .ix-type { width: 100% !important; border-right: none !important; }
  .rf-tile::after { display: none !important; }
}
`;

const enter = (delay, anim = "rise") => ({
  animation: `${anim} .7s cubic-bezier(.2,.7,.2,1) both`,
  animationDelay: `${delay}s`,
});

/* ---------------- 1. POSTER — kinetic type, contact-sheet grid ---------------- */
function Poster() {
  const series = [
    { n: "Northern Light", t: "Landscape series · 24 frames", y: "2026", seed: LAND[0] },
    { n: "Mimi Lounge", t: "Event coverage · Nightlife", y: "2025", seed: EVENT[0] },
    { n: "Faces of the Market", t: "Portrait series", y: "2025", seed: PORTRAIT[0] },
    { n: "Concrete Hours", t: "Street · Black & white", y: "2024", seed: STREET[0] },
  ];
  const ticker = "BOOKING 2026 — EDITORIAL — EVENTS — PORTRAITS — TRAVEL — ";
  return (
    <div className="pf-page" style={{ background: "#EDEBE4", color: "#111", fontFamily: "'Archivo', sans-serif", overflowX: "hidden" }}>
      <style>{`
        .po-line { overflow: hidden; }
        .po-line > span { display: inline-block; animation: clipUp .8s cubic-bezier(.2,.8,.2,1) both; }
        .po-hero { position: relative; height: 46vh; min-height: 260px; overflow: hidden; }
        .po-hero img { animation: slowZoom 18s ease-in-out infinite alternate; }
        .po-item { border-top: 3px solid #111; padding: 18px 0; display: grid; grid-template-columns: 84px 1fr auto; gap: 18px; align-items: center; transition: padding-left .2s, background .2s, color .2s; }
        .po-item:hover { padding-left: 12px; background: #1533E0; color: #EDEBE4; }
        .po-thumb { width: 84px; height: 62px; overflow: hidden; filter: grayscale(1); transition: filter .25s; }
        .po-item:hover .po-thumb { filter: none; }
        .po-name { font-family: 'Archivo Black'; font-size: clamp(22px,4.4vw,50px); text-transform: uppercase; letter-spacing: -0.02em; line-height: 1; }
        .po-marquee { display: flex; white-space: nowrap; animation: marquee 18s linear infinite; }
        .po-marquee span { font-family: 'Archivo Black'; font-size: 20px; letter-spacing: .06em; padding-right: 8px; }
        .po-sheet { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 6px; }
        .po-sheet div { aspect-ratio: 3/2; overflow: hidden; }
        .po-sheet img { filter: grayscale(1) contrast(1.1); transition: filter .3s, transform .3s; }
        .po-sheet div:hover img { filter: none; transform: scale(1.05); }
      `}</style>
      <header style={{ display: "flex", justifyContent: "space-between", padding: "18px 24px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", ...enter(0.05) }}>
        <span>{PHOTOGRAPHER.name}</span><span>Photographer</span><span style={{ color: "#1533E0" }}>{PHOTOGRAPHER.city}</span>
      </header>
      <section style={{ padding: "5vh 24px 4vh" }}>
        <h1 style={{ fontFamily: "'Archivo Black'", textTransform: "uppercase", lineHeight: 0.92, letterSpacing: "-0.03em", fontSize: "clamp(46px,10.5vw,142px)" }}>
          <div className="po-line"><span style={{ animationDelay: ".15s" }}>Loud light,</span></div>
          <div className="po-line"><span style={{ animationDelay: ".3s", color: "#1533E0" }}>quiet frames.</span></div>
        </h1>
      </section>
      <div className="po-hero" style={enter(0.4)}>
        <img src={img("posterhero", 1600, 800, GRAY)} alt="Hero photograph" />
      </div>
      <div style={{ background: "#1533E0", color: "#EDEBE4", padding: "12px 0", overflow: "hidden", ...enter(0.55) }}>
        <div className="po-marquee"><span>{ticker.repeat(3)}</span><span aria-hidden="true">{ticker.repeat(3)}</span></div>
      </div>
      <section style={{ padding: "40px 24px 20px" }}>
        {series.map((w, i) => (
          <div key={w.n} className="po-item" style={enter(0.6 + i * 0.1)}>
            <div className="po-thumb"><img src={img(w.seed, 200, 150)} alt={w.n} /></div>
            <div>
              <div className="po-name">{w.n}</div>
              <div style={{ fontSize: 12.5, marginTop: 5, textTransform: "uppercase", letterSpacing: "0.1em" }}>{w.t}</div>
            </div>
            <div style={{ fontFamily: "'Archivo Black'", fontSize: 18 }}>{w.y}</div>
          </div>
        ))}
        <div style={{ borderTop: "3px solid #111" }} />
      </section>
      <section style={{ padding: "20px 24px 50px" }}>
        <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Contact sheet</div>
        <div className="po-sheet">
          {STREET.map((s) => <div key={s}><img src={img(s, 400, 280, GRAY)} alt="" /></div>)}
        </div>
      </section>
      <footer style={{ background: "#111", color: "#EDEBE4", padding: "44px 24px" }}>
        <div style={{ fontFamily: "'Archivo Black'", fontSize: "clamp(24px,4.6vw,50px)", textTransform: "uppercase", wordBreak: "break-word" }}>{PHOTOGRAPHER.email}</div>
        <div style={{ marginTop: 14, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5c76ff" }}>Currently booking</div>
      </footer>
    </div>
  );
}

/* ---------------- 2. DARKROOM — prints develop from black ---------------- */
function Darkroom() {
  const shots = [...LAND, ...STREET].slice(0, 8);
  const titles = ["Sea Fog", "Dune Study", "Pine Hill", "Coastline", "Valley Mist", "Salt Flat", "Alleyway", "Market, 6 AM"];
  return (
    <div className="pf-page" style={{ background: "#141311", color: "#E9E4DA", fontFamily: "'Jost', sans-serif", fontWeight: 300, position: "relative", overflow: "hidden" }}>
      <style>{`
        .dr-glow { position: absolute; width: 60vw; height: 60vw; max-width: 700px; max-height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(200,155,90,.10), transparent 65%); top: -12%; right: -12%; animation: glowDrift 14s ease-in-out infinite; pointer-events: none; }
        .dr-card { aspect-ratio: 4/5; position: relative; overflow: hidden; animation: develop 1.6s ease both; }
        .dr-card img { animation: slowZoom 20s ease-in-out infinite alternate; }
        .dr-card figcaption { position: absolute; left: 14px; bottom: 12px; font-size: 13px; letter-spacing: .08em; opacity: 0; transform: translateY(6px); transition: all .3s; z-index: 1; text-shadow: 0 2px 12px #000; }
        .dr-card:hover figcaption { opacity: 1; transform: none; }
        .dr-card:hover { outline: 1px solid #C89B5A; outline-offset: 3px; }
        .dr-rule { width: 0; height: 1px; background: #C89B5A; margin: 22px auto 0; animation: drRule 1.2s .9s ease both; }
        @keyframes drRule { to { width: 72px; } }
      `}</style>
      <div className="dr-glow" />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px", borderBottom: "1px solid #2a2823", ...enter(0.05) }}>
        <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, fontStyle: "italic" }}>{PHOTOGRAPHER.name}</span>
        <nav style={{ display: "flex", gap: 24, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <a href="#">Work</a><a href="#">Prints</a><a href="#" style={{ color: "#C89B5A" }}>Contact</a>
        </nav>
      </header>
      <section style={{ textAlign: "center", padding: "11vh 24px 7vh", position: "relative" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C89B5A", ...enter(0.2) }}>Photography — {PHOTOGRAPHER.city}</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond'", fontWeight: 400, fontSize: "clamp(44px,8vw,96px)", lineHeight: 1.05, marginTop: 18, ...enter(0.35, "riseBig") }}>
          Light is the only<br /><em>subject.</em>
        </h1>
        <div className="dr-rule" />
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, padding: "0 28px 64px", maxWidth: 1140, margin: "0 auto", position: "relative" }}>
        {shots.map((s, i) => (
          <figure key={s} className="dr-card" style={{ animationDelay: `${0.5 + i * 0.13}s`, margin: 0 }}>
            <img src={img(s, 640, 800)} alt={titles[i]} />
            <figcaption>{titles[i]}</figcaption>
          </figure>
        ))}
      </section>
      <footer style={{ borderTop: "1px solid #2a2823", padding: "40px 28px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 14, position: "relative" }}>
        <span style={{ fontFamily: "'Cormorant Garamond'", fontStyle: "italic", fontSize: 20 }}>{PHOTOGRAPHER.email}</span>
        <span style={{ color: "#8b857a" }}>Available for editorial & commissions</span>
      </footer>
    </div>
  );
}

/* ---------------- 3. INDEX — clean, scannable, typing cursor ---------------- */
function Index() {
  const projects = [
    { name: "Northern Light", desc: "Six weeks along the fjords, shot on 35mm. Selected for two group shows.", tag: "Landscape · 2026", seed: LAND[1] },
    { name: "Mimi Lounge", desc: "A full night of a bar's life — neon, motion, and the last customer out.", tag: "Event · 2025", seed: EVENT[1] },
    { name: "Studio Sessions", desc: "Ongoing portrait series with musicians and dancers, one light and a wall.", tag: "Portrait · Ongoing", seed: PORTRAIT[1] },
  ];
  return (
    <div className="pf-page" style={{ background: "#F3F4FB", color: "#23263B", fontFamily: "'IBM Plex Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        .ix-type { font-family: 'IBM Plex Mono'; color: #545ECC; font-size: 14px; white-space: nowrap; overflow: hidden; display: inline-block; max-width: 100%; border-right: 2px solid #545ECC; padding-right: 4px; animation: typing 1.4s steps(20) .3s both, caret 1s step-end infinite; }
        .ix-card { background:#fff; border:1px solid #D9DCF0; border-radius:12px; overflow:hidden; display:grid; grid-template-columns: 210px 1fr; transition: transform .15s, box-shadow .15s; }
        .ix-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(84,94,204,.14); }
        .ix-card figure { margin:0; overflow:hidden; }
        .ix-card img { transition: transform .4s; }
        .ix-card:hover img { transform: scale(1.06); }
        .ix-tag { font-family:'IBM Plex Mono'; font-size:12px; color:#545ECC; background:#E8EAFB; padding:3px 8px; border-radius:5px; }
        .ix-strip { display:grid; grid-template-columns: repeat(auto-fit,minmax(120px,1fr)); gap:8px; }
        .ix-strip div { aspect-ratio:1/1; border-radius:8px; overflow:hidden; }
        .ix-strip img { transition: transform .35s; }
        .ix-strip div:hover img { transform: scale(1.08); }
        @media (max-width: 560px) { .ix-card { grid-template-columns: 1fr; } .ix-card figure { height: 170px; } }
      `}</style>
      <header style={{ maxWidth: 900, margin: "0 auto", padding: "26px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", ...enter(0.05) }}>
        <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 500 }}>~/{PHOTOGRAPHER.name.toLowerCase().replace(/\s/g, "")}</span>
        <nav style={{ display: "flex", gap: 20, fontSize: 14 }}>
          <a href="#">Work</a><a href="#">About</a><a href="#" style={{ color: "#545ECC", fontWeight: 600 }}>Hire me</a>
        </nav>
      </header>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "7vh 24px 5vh" }}>
        <span className="ix-type">// photographer</span>
        <h1 style={{ fontSize: "clamp(32px,5.2vw,54px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.12, marginTop: 12, ...enter(0.45) }}>
          {PHOTOGRAPHER.name} shoots landscapes, events, and portraits — and cuts the films that go with them.
        </h1>
        <p style={{ marginTop: 16, fontSize: 17, lineHeight: 1.6, color: "#565A78", maxWidth: 560, ...enter(0.6) }}>
          Available for editorial, brand, and event work. Fast turnaround, honest color, no filters you didn't ask for.
        </p>
      </section>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 40px", display: "grid", gap: 16 }}>
        {projects.map((p, i) => (
          <article key={p.name} className="ix-card" style={enter(0.75 + i * 0.14)}>
            <figure><img src={img(p.seed, 500, 400)} alt={p.name} /></figure>
            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{p.name}</span>
                <span className="ix-tag">{p.tag}</span>
              </div>
              <p style={{ marginTop: 10, color: "#565A78", lineHeight: 1.55, fontSize: 14.5 }}>{p.desc}</p>
            </div>
          </article>
        ))}
      </section>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px", ...enter(1.2) }}>
        <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, color: "#545ECC", marginBottom: 10 }}>// recent frames</div>
        <div className="ix-strip">
          {STREET.slice(0, 6).map((s) => <div key={s}><img src={img(s, 300, 300)} alt="" /></div>)}
        </div>
      </section>
      <footer style={{ borderTop: "1px solid #D9DCF0", padding: "30px 24px", textAlign: "center", fontFamily: "'IBM Plex Mono'", fontSize: 13, color: "#565A78" }}>
        {PHOTOGRAPHER.email} — Instagram — Prints
      </footer>
    </div>
  );
}

/* ---------------- 4. ATELIER — warm, polaroid-ish, bobbing tiles ---------------- */
function Atelier() {
  const pieces = [
    { t: "Golden Hour", s: LAND[2], c: "#F6C1B4" }, { t: "Studio No. 4", s: PORTRAIT[2], c: "#BFD8C0" },
    { t: "Wedding, June", s: EVENT[2], c: "#F3D9A4" }, { t: "Slow Mornings", s: STREET[2], c: "#C9C4E8" },
  ];
  return (
    <div className="pf-page" style={{ background: "#FBF6EE", color: "#3A2E28", fontFamily: "'Nunito', sans-serif", overflow: "hidden" }}>
      <style>{`
        .at-frame { border: 2px solid #3A2E28; border-radius: 22px; background: #fff; padding: 10px 10px 0; box-shadow: 4px 4px 0 #3A2E28; animation: bob 5.5s ease-in-out infinite; transition: transform .2s, box-shadow .2s; }
        .at-frame:hover { animation-play-state: paused; transform: translate(-3px,-3px) rotate(-1.5deg); box-shadow: 8px 8px 0 #3A2E28; }
        .at-frame .ph { aspect-ratio: 1/1; border-radius: 14px; overflow: hidden; }
        .at-frame .cap { padding: 10px 4px 12px; font-weight: 700; font-size: 15px; }
        .at-sticker { background: #BFD8C0; border-radius: 14px; padding: 0 14px; display: inline-block; animation: popIn .7s cubic-bezier(.3,1.4,.5,1) .55s both; }
        .at-pill { border:2px solid #3A2E28; border-radius:999px; padding:10px 22px; font-weight:700; background:#F6C1B4; box-shadow: 3px 3px 0 #3A2E28; display:inline-block; transition: transform .15s, box-shadow .15s; }
        .at-pill:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 #3A2E28; }
        .at-hero { border: 2px solid #3A2E28; border-radius: 26px; overflow: hidden; height: 40vh; min-height: 240px; box-shadow: 6px 6px 0 #3A2E28; }
      `}</style>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 26px", ...enter(0.05) }}>
        <span style={{ fontFamily: "'Fraunces'", fontWeight: 700, fontSize: 22 }}>{PHOTOGRAPHER.name.toLowerCase()} ✿</span>
        <a href="#" className="at-pill" style={{ fontSize: 14 }}>Book a shoot</a>
      </header>
      <section style={{ textAlign: "center", padding: "7vh 24px 5vh" }}>
        <h1 style={{ fontFamily: "'Fraunces'", fontWeight: 600, fontSize: "clamp(38px,7vw,78px)", lineHeight: 1.15, ...enter(0.2) }}>
          Photographs for<br /><span className="at-sticker">gentle</span> stories
        </h1>
        <p style={{ fontSize: 17, maxWidth: 460, margin: "20px auto 0", lineHeight: 1.6, ...enter(0.7) }}>
          Weddings, families, and slow travel — shot warm, edited light, delivered fast.
        </p>
      </section>
      <section style={{ padding: "0 26px", maxWidth: 980, margin: "0 auto", ...enter(0.45) }}>
        <div className="at-hero"><img src={img("atelierhero", 1400, 700)} alt="Featured wildlife photograph" /></div>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, padding: "46px 26px 60px", maxWidth: 980, margin: "0 auto" }}>
        {pieces.map((p, i) => (
          <div key={p.t} className="at-frame" style={{ background: p.c, animationDelay: `${i * -1.3}s` }}>
            <div className="ph"><img src={img(p.s, 500, 500)} alt={p.t} /></div>
            <div className="cap">{p.t}</div>
          </div>
        ))}
      </section>
      <footer style={{ background: "#3A2E28", color: "#FBF6EE", textAlign: "center", padding: "44px 24px" }}>
        <div style={{ fontFamily: "'Fraunces'", fontSize: "clamp(22px,4vw,38px)", fontWeight: 600 }}>{PHOTOGRAPHER.email}</div>
        <div style={{ marginTop: 10, fontSize: 14, opacity: 0.8 }}>Taking bookings for next season</div>
      </footer>
    </div>
  );
}

/* ---------------- 5. PRISM — video-led, living gradients ---------------- */
function Prism() {
  const reels = [
    { t: "Afterglow — Title Sequence", d: "Main titles · 45s", seed: FILMS[0].seed, g: "linear-gradient(135deg,#FF5E8A,#7B5CFF)" },
    { t: "Coastline — Travel Film", d: "Director / DP · 3 min", seed: FILMS[1].seed, g: "linear-gradient(135deg,#33D6C8,#3B82F6)" },
    { t: "Brand Loops ×6", d: "Social package", seed: FILMS[2].seed, g: "linear-gradient(135deg,#F7B733,#FC4A1A)" },
  ];
  return (
    <div className="pf-page" style={{ background: "#0B0A14", color: "#EDEBFA", fontFamily: "'Manrope', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        .pr-orb { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .5; animation: orbDrift 12s ease-in-out infinite; pointer-events: none; }
        .pr-grad { background: linear-gradient(90deg,#FF5E8A,#7B5CFF,#33D6C8,#FF5E8A); background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: gradientMove 7s ease infinite; }
        .pr-card { border-radius: 16px; padding: 2px; background: linear-gradient(135deg, rgba(255,255,255,.28), rgba(255,255,255,.05)); transition: transform .2s; }
        .pr-card:hover { transform: translateY(-4px); }
        .pr-inner { border-radius: 14px; background: rgba(18,16,32,.92); padding: 14px; height: 100%; }
        .pr-thumb { position: relative; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
        .pr-thumb img { opacity: .78; transition: opacity .3s, transform .5s; }
        .pr-card:hover .pr-thumb img { opacity: 1; transform: scale(1.05); }
        .pr-thumb .tint { position: absolute; inset: 0; mix-blend-mode: overlay; opacity: .55; }
        .pr-play { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .pr-play span { width: 46px; height: 46px; border-radius: 50%; background: rgba(255,255,255,.92); color: #12101f; display: flex; align-items: center; justify-content: center; animation: playPulse 2.4s ease-in-out infinite; }
        .pr-hero { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 21/9; }
        .pr-hero img { opacity: .55; animation: slowZoom 18s ease-in-out infinite alternate; }
      `}</style>
      <div className="pr-orb" style={{ width: 380, height: 380, background: "#7B5CFF", top: "-8%", left: "-6%" }} />
      <div className="pr-orb" style={{ width: 300, height: 300, background: "#FF5E8A", bottom: "6%", right: "-4%", animationDelay: "-6s" }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px", position: "relative", ...enter(0.05) }}>
        <span style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 20 }}>{PHOTOGRAPHER.name.toUpperCase().replace(/\s/g, "")}.MOV</span>
        <nav style={{ display: "flex", gap: 22, fontSize: 14, color: "#B9B4D9" }}>
          <a href="#">Reel</a><a href="#">Stills</a><a href="#" style={{ color: "#EDEBFA" }}>Contact</a>
        </nav>
      </header>
      <section style={{ padding: "9vh 28px 5vh", maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        <h1 style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: "clamp(40px,7.6vw,88px)", lineHeight: 1.02, letterSpacing: "-0.02em", ...enter(0.2, "riseBig") }}>
          Stills that move,<br /><span className="pr-grad">films that stay.</span>
        </h1>
        <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.6, color: "#B9B4D9", maxWidth: 520, ...enter(0.45) }}>
          Photographer and video editor. Brand films, travel documentaries, and the color grade that ties them together.
        </p>
      </section>
      <section style={{ padding: "0 28px", maxWidth: 1000, margin: "0 auto", position: "relative", ...enter(0.55) }}>
        <div className="pr-hero">
          <img src={img("prismhero", 1600, 700)} alt="Showreel still" />
          <div className="pr-play"><span>▶</span></div>
        </div>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18, padding: "46px 28px 70px", maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        {reels.map((r, i) => (
          <div key={r.t} className="pr-card" style={enter(0.75 + i * 0.15)}>
            <div className="pr-inner">
              <div className="pr-thumb">
                <img src={img(r.seed, 640, 360)} alt={r.t} />
                <div className="tint" style={{ backgroundImage: r.g }} />
                <div className="pr-play"><span>▶</span></div>
              </div>
              <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 15 }}>{r.t}</div>
              <div style={{ fontSize: 13, color: "#8f89b3", marginTop: 5 }}>{r.d}</div>
            </div>
          </div>
        ))}
      </section>
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.1)", padding: "38px 28px", textAlign: "center", position: "relative" }}>
        <span className="pr-grad" style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: "clamp(22px,4vw,36px)" }}>{PHOTOGRAPHER.email}</span>
      </footer>
    </div>
  );
}

/* ---------------- 6. MANUSCRIPT — photo essays, literary ---------------- */
function Manuscript() {
  const essays = [
    { t: "Northern Light: Six Weeks on the Fjords", w: "Photo essay · 24 frames", y: "2026", seed: LAND[3] },
    { t: "The Last Customer at Mimi Lounge", w: "Reportage · 18 frames", y: "2025", seed: EVENT[0] },
    { t: "Notes on Photographing Strangers", w: "Essay · 6 min read", y: "2025", seed: PORTRAIT[3] },
    { t: "Concrete Hours", w: "Street series · B&W", y: "2024", seed: STREET[5] },
  ];
  return (
    <div className="pf-page" style={{ background: "#FBFAF6", color: "#22304A", fontFamily: "'Libre Caslon Text', serif" }}>
      <style>{`
        .ms-rule { height: 2px; background: #22304A; animation: drawLine 1s .7s cubic-bezier(.4,0,.2,1) both; }
        .ms-item { display: grid; grid-template-columns: 110px 1fr auto; gap: 18px; align-items: center; padding: 18px 0; border-bottom: 1px solid #E4E1D6; }
        .ms-item figure { margin:0; width:110px; height:82px; overflow:hidden; filter: sepia(.2) contrast(1.05); transition: filter .3s; }
        .ms-item:hover figure { filter: none; }
        .ms-item h3 { font-weight: 400; font-size: clamp(17px,2.3vw,23px); position: relative; display: inline; }
        .ms-item h3::after { content: ""; position: absolute; left: 0; bottom: -3px; height: 2px; width: 0; background: #B33A3A; transition: width .35s ease; }
        .ms-item:hover h3::after { width: 100%; }
        .ms-drop::first-letter { font-size: 3.4em; float: left; line-height: .8; padding: 6px 10px 0 0; color: #B33A3A; font-weight: 700; }
        .ms-pilcrow { color: #B33A3A; animation: blinkStep 1.2s step-end infinite; }
        .ms-plate { margin: 34px 0 6px; height: 46vh; min-height: 260px; overflow: hidden; }
        .ms-plate img { filter: sepia(.15); animation: slowZoom 22s ease-in-out infinite alternate; }
        @media (max-width: 560px) { .ms-item { grid-template-columns: 1fr; } .ms-item figure { width:100%; height:150px; } }
      `}</style>
      <header style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "baseline", ...enter(0.05) }}>
        <span style={{ fontStyle: "italic", fontSize: 20 }}>{PHOTOGRAPHER.name}</span>
        <span style={{ fontSize: 12.5, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'IBM Plex Sans', sans-serif", color: "#8a8478" }}>Photographer · Essayist</span>
      </header>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "8vh 24px 2vh" }}>
        <h1 style={{ fontWeight: 700, fontSize: "clamp(34px,6vw,60px)", lineHeight: 1.14, ...enter(0.2) }}>
          Pictures, in the right order.<span className="ms-pilcrow">¶</span>
        </h1>
        <div className="ms-rule" style={{ maxWidth: 120, marginTop: 20 }} />
        <div className="ms-plate"><img src={img("msplate", 1200, 700)} alt="Featured plate" /></div>
        <p style={{ fontSize: 12.5, fontFamily: "'IBM Plex Sans', sans-serif", color: "#8a8478" }}>Plate I — Northern Light, 2026</p>
        <p className="ms-drop" style={{ marginTop: 26, fontSize: 18, lineHeight: 1.75, ...enter(0.5) }}>
          {PHOTOGRAPHER.bio} Every series here comes with the writing that made sense of it — because a photograph and its story are rarely finished apart.
        </p>
      </section>
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 70px" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'IBM Plex Sans', sans-serif", color: "#8a8478", marginBottom: 6, ...enter(0.6) }}>Selected series</div>
        {essays.map((e, i) => (
          <div key={e.t} className="ms-item" style={enter(0.7 + i * 0.1)}>
            <figure><img src={img(e.seed, 300, 220)} alt={e.t} /></figure>
            <div>
              <h3>{e.t}</h3>
              <div style={{ fontSize: 13, marginTop: 8, fontFamily: "'IBM Plex Sans', sans-serif", color: "#8a8478" }}>{e.w}</div>
            </div>
            <span style={{ fontStyle: "italic", color: "#8a8478" }}>{e.y}</span>
          </div>
        ))}
      </section>
      <footer style={{ background: "#22304A", color: "#FBFAF6", textAlign: "center", padding: "44px 24px" }}>
        <div style={{ fontStyle: "italic", fontSize: "clamp(20px,3.5vw,30px)" }}>{PHOTOGRAPHER.email}</div>
        <div style={{ marginTop: 10, fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif", opacity: 0.75 }}>Commissions, prints, and long assignments</div>
      </footer>
    </div>
  );
}

/* ---------------- 7. BLUEPRINT — architectural photography, drafting lines ---------------- */
function Blueprint() {
  const plates = [
    { no: "PL-101", t: "Facade Studies", d: "Architecture · 12 frames · 2025", seed: STREET[5] },
    { no: "PL-207", t: "Vertical City", d: "Skyline series · 2025", seed: STREET[2] },
    { no: "PL-314", t: "Negative Space", d: "Minimal · Ongoing", seed: STREET[3] },
  ];
  return (
    <div className="pf-page" style={{
      background: "#123C63", color: "#EAF2FA", fontFamily: "'Jost', sans-serif", fontWeight: 300,
      backgroundImage: "linear-gradient(rgba(234,242,250,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(234,242,250,.06) 1px, transparent 1px)",
      backgroundSize: "36px 36px",
    }}>
      <style>{`
        .bp-dim { height: 1px; background: repeating-linear-gradient(90deg,#8FB8DC 0 8px, transparent 8px 14px); animation: drawLine 1.2s .5s ease both; position: relative; }
        .bp-dim::before, .bp-dim::after { content: ""; position: absolute; top: -5px; width: 1px; height: 11px; background: #8FB8DC; }
        .bp-dim::before { left: 0; } .bp-dim::after { right: 0; }
        .bp-plate { border: 1px solid rgba(143,184,220,.5); padding: 14px; position: relative; background: rgba(10,38,64,.55); transition: background .2s, border-color .2s; }
        .bp-plate:hover { background: rgba(16,52,86,.9); border-color: #EAF2FA; }
        .bp-plate::before { content: attr(data-no); position: absolute; top: -9px; left: 14px; background: #123C63; padding: 0 8px; font-family: 'IBM Plex Mono'; font-size: 12px; color: #8FB8DC; letter-spacing: .1em; }
        .bp-plate figure { margin: 0 0 14px; aspect-ratio: 4/3; overflow: hidden; }
        .bp-plate img { filter: grayscale(1) brightness(.9) contrast(1.15); transition: filter .35s, transform .5s; }
        .bp-plate:hover img { filter: none; transform: scale(1.04); }
        .bp-corner { position: absolute; width: 10px; height: 10px; border: 1px solid #8FB8DC; }
        .bp-hero { border: 1px solid rgba(143,184,220,.6); padding: 8px; margin-top: 30px; }
        .bp-hero div { height: 42vh; min-height: 240px; overflow: hidden; }
        .bp-hero img { filter: grayscale(1) contrast(1.1); }
      `}</style>
      <header style={{ display: "flex", justifyContent: "space-between", padding: "22px 28px", fontFamily: "'IBM Plex Mono'", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8FB8DC", ...enter(0.05) }}>
        <span>{PHOTOGRAPHER.name} — Photographer</span>
        <span>Plate set / 2026</span>
      </header>
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "8vh 28px 4vh" }}>
        <h1 style={{ fontWeight: 300, fontSize: "clamp(36px,6.5vw,74px)", lineHeight: 1.08, ...enter(0.2, "riseBig") }}>
          Architecture, shot <span style={{ borderBottom: "1px solid #8FB8DC" }}>square</span><br />and lit by accident.
        </h1>
        <div className="bp-dim" style={{ maxWidth: 320, marginTop: 26 }} />
        <p style={{ marginTop: 22, fontSize: 16, lineHeight: 1.65, color: "#BFD5E8", maxWidth: 520, ...enter(0.55) }}>
          Architectural and interiors photography for studios, developers, and magazines. Measured, patient, and delivered to spec.
        </p>
        <div className="bp-hero" style={enter(0.6)}>
          <div><img src={img("bphero", 1400, 700, GRAY)} alt="Featured architecture photograph" /></div>
        </div>
      </section>
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "20px 28px 70px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 26 }}>
        {plates.map((p, i) => (
          <div key={p.no} className="bp-plate" data-no={p.no} style={enter(0.7 + i * 0.15)}>
            <div className="bp-corner" style={{ top: -1, right: -1, borderLeft: "none", borderBottom: "none" }} />
            <div className="bp-corner" style={{ bottom: -1, left: -1, borderRight: "none", borderTop: "none" }} />
            <figure><img src={img(p.seed, 600, 450)} alt={p.t} /></figure>
            <div style={{ fontSize: 20, fontWeight: 400 }}>{p.t}</div>
            <div style={{ marginTop: 6, fontFamily: "'IBM Plex Mono'", fontSize: 12.5, color: "#8FB8DC" }}>{p.d}</div>
          </div>
        ))}
      </section>
      <footer style={{ borderTop: "1px solid rgba(143,184,220,.4)", padding: "36px 28px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontFamily: "'IBM Plex Mono'", fontSize: 13, color: "#8FB8DC", textTransform: "uppercase" }}>
        <span>{PHOTOGRAPHER.email}</span>
        <span>Scale 1:1 — all frames as shot</span>
      </footer>
    </div>
  );
}

/* ---------------- 8. ARCADE — film-photography, CRT & pixel ---------------- */
function Arcade() {
  const rolls = [
    { t: "ROLL 01: NIGHT CITY", d: "Cinestill 800T · pushed 1 stop", c: "#7CE38B", seed: EVENT[0] },
    { t: "ROLL 02: COAST", d: "Portra 400 · 35mm", c: "#FF6B9D", seed: LAND[3] },
    { t: "ROLL 03: FACES", d: "HP5+ · developed at home", c: "#5AD6FF", seed: PORTRAIT[0] },
  ];
  return (
    <div className="pf-page" style={{ background: "#101528", color: "#E8ECFF", fontFamily: "'IBM Plex Mono', monospace", position: "relative" }}>
      <style>{`
        .ar-scan { position: fixed; inset: 0; pointer-events: none; z-index: 5; background: repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 2px, transparent 2px 4px); }
        .ar-sprite { display: inline-block; animation: spriteHop 1s steps(2) infinite; }
        .ar-start { animation: blinkStep 1.1s step-end infinite; color: #7CE38B; }
        .ar-card { border: 3px solid; padding: 12px; background: #171D36; box-shadow: 6px 6px 0 rgba(0,0,0,.45); transition: transform .12s; }
        .ar-card:hover { transform: translate(-3px,-3px); }
        .ar-card figure { margin: 0 0 12px; aspect-ratio: 4/3; overflow: hidden; }
        .ar-card img { filter: saturate(1.3) contrast(1.15); transition: transform .35s; }
        .ar-card:hover img { transform: scale(1.05); }
        .ar-hp { height: 10px; background: repeating-linear-gradient(90deg, currentColor 0 12px, transparent 12px 16px); margin-top: 12px; animation: drawLine .9s ease both; }
        .ar-track { border-top: 3px dashed #2A3358; }
        .ar-hero { border: 4px solid #2A3358; max-width: 720px; margin: 26px auto 0; aspect-ratio: 16/9; overflow: hidden; }
        .ar-hero img { filter: saturate(1.25) contrast(1.2); }
      `}</style>
      <div className="ar-scan" />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", fontSize: 13, ...enter(0.05) }}>
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: 11 }}>{PHOTOGRAPHER.name.toUpperCase().replace(/\s/g, "")}.EXE</span>
        <span>36 EXP · HI-SCORE 999999</span>
      </header>
      <section style={{ textAlign: "center", padding: "8vh 24px 5vh" }}>
        <div style={{ fontSize: 34, ...enter(0.15) }}><span className="ar-sprite">📷</span></div>
        <h1 style={{ fontFamily: "'Press Start 2P'", fontSize: "clamp(17px,4vw,38px)", lineHeight: 1.6, marginTop: 18, ...enter(0.3) }}>
          I SHOOT FILM<br />AND SCAN IT<br /><span style={{ color: "#FF6B9D" }}>MYSELF</span>
        </h1>
        <p style={{ marginTop: 20, fontSize: 14.5, lineHeight: 1.7, maxWidth: 480, margin: "20px auto 0", color: "#9AA3CC", ...enter(0.55) }}>
          Analog photographer. Neon, grain, and happy accidents. Available for shoots that don't need to look perfect.
        </p>
        <div className="ar-hero" style={enter(0.6)}>
          <img src={img("archero", 1200, 675)} alt="Featured film frame" />
        </div>
        <div className="ar-start" style={{ marginTop: 24, fontSize: 13.5, letterSpacing: "0.2em", ...enter(0.75) }}>▶ PRESS START TO VIEW ROLLS</div>
      </section>
      <div className="ar-track" style={{ margin: "0 24px" }} />
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 22, padding: "42px 24px 70px", maxWidth: 980, margin: "0 auto" }}>
        {rolls.map((g, i) => (
          <div key={g.t} className="ar-card" style={{ borderColor: g.c, color: g.c, ...enter(0.5 + i * 0.15) }}>
            <figure><img src={img(g.seed, 600, 450)} alt={g.t} /></figure>
            <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, lineHeight: 1.7 }}>{g.t}</div>
            <div style={{ marginTop: 8, fontSize: 12.5, color: "#9AA3CC" }}>{g.d}</div>
            <div className="ar-hp" style={{ animationDelay: `${0.8 + i * 0.2}s` }} />
          </div>
        ))}
      </section>
      <footer style={{ borderTop: "3px solid #2A3358", padding: "34px 24px", textAlign: "center", fontSize: 13 }}>
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: 10 }}>CONTACT: {PHOTOGRAPHER.email.toUpperCase()}</span>
        <div style={{ marginTop: 12, color: "#9AA3CC" }}>INSERT COIN (OR JUST EMAIL)</div>
      </footer>
    </div>
  );
}

/* ---------------- 9. REDFRAME — glowing red editorial (from your references) ---------------- */
function Redframe() {
  const RED = "#FF2A20";
  const label = (txt) => (
    <div style={{ fontFamily: "'Archivo Black'", color: RED, fontSize: 20, lineHeight: 1.15, marginBottom: 16, textShadow: "0 0 20px rgba(255,42,32,.55)" }}>
      {txt.split(" ").map((w) => <div key={w}>{w}</div>)}
    </div>
  );
  const Tile = ({ seed, ratio, delay, w = 700, h = 500, alt = "" }) => (
    <div className="rf-tile" style={{ aspectRatio: ratio, "--wd": `${delay}s` }}>
      <img src={img(seed, w, h)} alt={alt} />
    </div>
  );
  return (
    <div className="pf-page" style={{ background: "#0A0A0A", color: "#EDEAE2", fontFamily: "'Archivo', sans-serif", overflow: "hidden" }}>
      <style>{`
        .rf-hero-type { font-family: 'Archivo Black'; color: ${RED}; text-transform: uppercase; line-height: .9; font-size: clamp(50px,13.5vw,180px); animation: trackIn 1.1s cubic-bezier(.2,.8,.2,1) both, glowPulse 3.2s ease-in-out 1.1s infinite; }
        .rf-tile { position: relative; overflow: hidden; }
        .rf-tile img { transition: transform .6s ease; }
        .rf-tile:hover img { transform: scale(1.07); }
        .rf-tile::after { content: ""; position: absolute; inset: 0; background: #0A0A0A; transform-origin: right; animation: wipeReveal .85s cubic-bezier(.6,0,.2,1) both; animation-delay: var(--wd,.3s); z-index: 1; }
        .rf-flicker { font-family: 'Archivo Black'; color: ${RED}; text-transform: uppercase; font-size: clamp(30px,6.4vw,76px); animation: flicker 4s linear infinite, glowPulse 3.2s ease-in-out infinite; }
        .rf-play { width: 54px; height: 54px; border-radius: 50%; background: #fff; color: #111; display: flex; align-items: center; justify-content: center; font-size: 17px; animation: playPulse 2.4s ease-in-out infinite; position: absolute; top: 50%; left: 50%; margin: -27px 0 0 -27px; z-index: 2; }
        .rf-meta { display: flex; justify-content: space-between; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #8f8b82; }
        .rf-cta { font-family: 'Archivo Black'; color: ${RED}; text-transform: uppercase; font-size: clamp(38px,7.5vw,90px); line-height: .95; animation: glowPulse 3.2s ease-in-out infinite; }
      `}</style>

      <header className="rf-meta" style={{ padding: "18px 26px", ...enter(0.05) }}>
        <span>{PHOTOGRAPHER.name}</span><span>2026</span>
      </header>

      <section style={{ textAlign: "center" }}>
        <div className="rf-hero-type">Portfolio</div>
        <div className="rf-tile" style={{ height: "36vh", minHeight: 220, marginTop: 22, "--wd": ".5s" }}>
          <img src={img("rfhero", 1800, 800)} alt="Hero landscape" />
        </div>
        <div style={{ borderTop: "1px solid #262626", borderBottom: "1px solid #262626", padding: "18px 26px", textAlign: "left", ...enter(0.8) }}>
          <div style={{ fontFamily: "'Archivo Black'", fontSize: "clamp(17px,3.2vw,30px)", textTransform: "uppercase" }}>{PHOTOGRAPHER.role}</div>
          <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#8f8b82", marginTop: 8 }}>{PHOTOGRAPHER.tagline}</div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 28, padding: "52px 26px", maxWidth: 1020, margin: "0 auto" }}>
        <div className="rf-tile" style={{ aspectRatio: "3/4", "--wd": ".4s" }}>
          <img src={img("rfme", 700, 950)} alt="Portrait of the photographer" />
          <div style={{ position: "absolute", left: 16, bottom: 14, zIndex: 2, fontFamily: "'Archivo Black'", color: RED, fontSize: "clamp(24px,3.6vw,38px)", lineHeight: 1, textTransform: "uppercase", textShadow: "0 0 22px rgba(255,42,32,.7)" }}>
            {PHOTOGRAPHER.name.split(" ").map((w) => <div key={w}>{w}</div>)}
          </div>
        </div>
        <div style={enter(0.35)}>
          <h2 style={{ fontFamily: "'Archivo Black'", fontSize: 22, marginBottom: 12 }}>My Profile</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#c9c5bb" }}>{PHOTOGRAPHER.bio}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 26 }}>
            {[
              ["Skills", ["Photoshop / Lightroom", "DaVinci Resolve", "Premiere Pro", "Drone / Gimbal"]],
              ["Expertise", ["Color Grading", "Photography", "Video Editing", "Visual Identity"]],
            ].map(([h, items]) => (
              <div key={h}>
                <div style={{ fontFamily: "'Archivo Black'", fontSize: 15, borderBottom: "2px solid #EDEAE2", paddingBottom: 6, marginBottom: 10 }}>{h}</div>
                {items.map((s) => <div key={s} style={{ fontSize: 13, color: "#c9c5bb", padding: "3px 0" }}>{s}</div>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "0 26px 56px", maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          <span style={{ fontFamily: "'Archivo Black'", fontSize: 20 }}>My<br />Works.</span>
          <span className="rf-flicker">Photography</span>
        </div>
        <Tile seed="rfbanner" ratio="21/9" delay={0.3} w={1600} h={700} alt="Featured landscape" />
        <div style={{ marginTop: 34 }}>
          {label("Landscape Photography")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            {LAND.map((s, i) => <Tile key={s} seed={s} ratio="4/3" delay={0.15 + i * 0.1} w={500} h={375} />)}
          </div>
        </div>
        <div style={{ marginTop: 42 }}>
          {label("Event Photography")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
            {EVENT.map((s, i) => <Tile key={s} seed={s} ratio="16/10" delay={0.15 + i * 0.12} w={600} h={375} />)}
          </div>
          <p style={{ fontSize: 13, color: "#8f8b82", marginTop: 14, maxWidth: 470, lineHeight: 1.6 }}>
            From composition to lighting to atmosphere — giving each space and moment its character.
          </p>
        </div>
      </section>

      <section style={{ background: "#F2EEE3", color: "#161512", padding: "52px 26px 58px" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          {label("Portrait Photography")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            {PORTRAIT.map((s, i) => <Tile key={s} seed={s} ratio="3/4" delay={0.15 + i * 0.12} w={500} h={660} />)}
          </div>
          <p style={{ fontSize: 13.5, color: "#6b675e", marginTop: 18, maxWidth: 450, lineHeight: 1.65 }}>
            A portrait is more than a pretty face — it's emotion, the essence of a person, and their confidence pushed to the limit.
          </p>
        </div>
      </section>

      <section style={{ padding: "56px 26px 64px", maxWidth: 1020, margin: "0 auto", textAlign: "center" }}>
        <div className="rf-flicker">Videography</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, marginTop: 32, textAlign: "left" }}>
          {FILMS.map((v, i) => (
            <div key={v.t}>
              <div className="rf-tile" style={{ aspectRatio: "16/9", "--wd": `${0.2 + i * 0.12}s` }}>
                <img src={img(v.seed, 640, 360)} alt={v.t} />
                <div className="rf-play">▶</div>
              </div>
              <div style={{ fontFamily: "'Archivo Black'", color: RED, fontSize: 14, marginTop: 10 }}>{v.t}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #262626" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto", padding: "40px 26px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, alignItems: "center" }}>
          <div style={{ fontSize: 13 }}>
            {[["Phone", PHOTOGRAPHER.phone], ["E-mail", PHOTOGRAPHER.email], ["Instagram", PHOTOGRAPHER.handle]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #262626", padding: "10px 0" }}>
                <strong>{k}</strong><span style={{ color: "#c9c5bb" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="rf-cta">Work<br />With Me!</div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- DIRECTION METADATA ---------------- */
const DESIGNS = [
  {
    id: "redframe", name: "Redframe", C: Redframe,
    concept: "Glowing red editorial on black. The hero type snaps together and breathes like neon, photos are revealed by cinematic wipes, and a cream break sets the portraits apart.",
    bestFor: "Best if you shoot everything — landscapes, events, portraits, and film — and want one bold showcase for all of it.",
    type: "Archivo Black + Archivo",
    palette: ["#0A0A0A", "#FF2A20", "#F2EEE3", "#2F5D4A"],
    feel: ["Neon", "Editorial", "Cinematic"],
  },
  {
    id: "darkroom", name: "Darkroom", C: Darkroom,
    concept: "Quiet luxury. Every print develops out of black like it's in the tray, then drifts in a slow perpetual zoom.",
    bestFor: "Best if the images are the whole story and you want a gallery, not a website.",
    type: "Cormorant Garamond + Jost",
    palette: ["#141311", "#E9E4DA", "#C89B5A"],
    feel: ["Elegant", "Moody", "Gallery"],
  },
  {
    id: "poster", name: "Poster", C: Poster,
    concept: "Bold and editorial. Kinetic headlines, a scrolling booking ticker, and a contact sheet that colors in on hover.",
    bestFor: "Best if you want to look established and in demand from the first second.",
    type: "Archivo Black + Archivo",
    palette: ["#EDEBE4", "#111111", "#1533E0"],
    feel: ["Bold", "Kinetic", "High-contrast"],
  },
  {
    id: "prism", name: "Prism", C: Prism,
    concept: "Video-led. A hue-shifting headline, drifting light orbs, and a showreel hero with pulsing play buttons.",
    bestFor: "Best if video and color grading are half your business.",
    type: "Syne + Manrope",
    palette: ["#0B0A14", "#FF5E8A", "#7B5CFF", "#33D6C8"],
    feel: ["Vivid", "Showreel", "Modern"],
  },
  {
    id: "manuscript", name: "Manuscript", C: Manuscript,
    concept: "Photo essays. A drop cap, a blinking pilcrow, and red-ink underlines that draw themselves across each series title.",
    bestFor: "Best if you write about your work and shoot long-form documentary series.",
    type: "Libre Caslon + Plex Sans",
    palette: ["#FBFAF6", "#22304A", "#B33A3A"],
    feel: ["Literary", "Documentary", "Quiet"],
  },
  {
    id: "blueprint", name: "Blueprint", C: Blueprint,
    concept: "A drawing set come to life. Grid paper, numbered plates, dimension lines that draft themselves, and photos that go from grayscale to color on hover.",
    bestFor: "Best if you shoot architecture and interiors for studios and developers.",
    type: "Jost + Plex Mono",
    palette: ["#123C63", "#EAF2FA", "#8FB8DC"],
    feel: ["Precise", "Architectural", "Trustworthy"],
  },
  {
    id: "index", name: "Index", C: Index,
    concept: "Clean and scannable. A typing cursor, cascading project cards, and a recent-frames strip at the bottom.",
    bestFor: "Best if commercial clients need to judge your work in thirty seconds.",
    type: "IBM Plex Sans + Plex Mono",
    palette: ["#F3F4FB", "#23263B", "#545ECC"],
    feel: ["Clean", "Commercial", "Fast"],
  },
  {
    id: "atelier", name: "Atelier", C: Atelier,
    concept: "Warm and human. Photos sit in thick polaroid frames that gently bob, and the hero word pops in like a sticker.",
    bestFor: "Best for weddings, families, and lifestyle — where being likeable wins the booking.",
    type: "Fraunces + Nunito",
    palette: ["#FBF6EE", "#3A2E28", "#F6C1B4", "#BFD8C0"],
    feel: ["Warm", "Friendly", "Lifestyle"],
  },
  {
    id: "arcade", name: "Arcade", C: Arcade,
    concept: "CRT nostalgia for analog shooters. Scanlines, a hopping camera sprite, blinking PRESS START, and rolls presented as pixel-bordered cartridges.",
    bestFor: "Best if you shoot film and your personality is the pitch.",
    type: "Press Start 2P + Plex Mono",
    palette: ["#101528", "#7CE38B", "#FF6B9D", "#5AD6FF"],
    feel: ["Retro", "Analog", "Playful"],
  },
];

const STORAGE_KEY = "photographer-direction-choice";

/* ---------------- SHELL ---------------- */
export default function PhotographerPortfolioSelector() {
  const [view, setView] = useState("overview");
  const [choice, setChoice] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const savedChoice = window.localStorage.getItem(STORAGE_KEY);
        if (savedChoice) setChoice(JSON.parse(savedChoice));
      } catch (e) { /* nothing saved yet */ }
    })();
  }, []);

  const saveChoice = async (id) => {
    const c = { id, notes: notes.trim(), at: new Date().toISOString() };
    setChoice(c);
    setShowConfirm(false);
    setView("overview");
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) { console.error(e); }
  };

  const clearChoice = async () => {
    setChoice(null);
    setNotes("");
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  };

  const activeIdx = DESIGNS.findIndex((d) => d.id === view);
  const active = activeIdx >= 0 ? DESIGNS[activeIdx] : null;
  const chosen = choice ? DESIGNS.find((d) => d.id === choice.id) : null;

  if (active) {
    const Current = active.C;
    const prev = DESIGNS[(activeIdx + DESIGNS.length - 1) % DESIGNS.length];
    const next = DESIGNS[(activeIdx + 1) % DESIGNS.length];
    return (
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <style>{GLOBAL}</style>
        <div style={{ position: "sticky", top: 0, zIndex: 60, background: "#0F0F10", color: "#fff", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", flexWrap: "wrap" }}>
          <button onClick={() => { setView("overview"); setShowConfirm(false); }} style={btn(false)}>← All directions</button>
          <span style={{ fontSize: 13, color: "#aaa" }}>
            {String(activeIdx + 1).padStart(2, "0")} / {String(DESIGNS.length).padStart(2, "0")} — <strong style={{ color: "#fff" }}>{active.name}</strong>
          </span>
          <span style={{ flex: 1 }} />
          <button onClick={() => setView(prev.id)} style={btn(false)}>‹ {prev.name}</button>
          <button onClick={() => setView(next.id)} style={btn(false)}>{next.name} ›</button>
          <button
            onClick={() => setShowConfirm(true)}
            style={{ ...btn(true), background: "#3DBE7B", borderColor: "#3DBE7B", color: "#0F0F10", fontWeight: 600, animation: choice?.id === active.id ? "none" : "pulseRing 2.2s ease-out infinite" }}
          >
            {choice?.id === active.id ? "✓ Selected" : "Select this direction"}
          </button>
        </div>

        {showConfirm && (
          <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "pageFade .25s ease both" }}>
            <div style={{ background: "#fff", color: "#1a1a1e", borderRadius: 14, padding: 28, maxWidth: 440, width: "100%", animation: "rise .35s cubic-bezier(.2,.8,.2,1) both" }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Choose “{active.name}”?</h2>
              <p style={{ marginTop: 8, fontSize: 14, color: "#555", lineHeight: 1.5 }}>{active.concept}</p>
              <label style={{ display: "block", marginTop: 18, fontSize: 13, fontWeight: 600 }}>
                Anything you'd like changed? (optional)
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. love it, but can the red be a little deeper?"
                  rows={3}
                  style={{ width: "100%", marginTop: 6, padding: 10, border: "1px solid #ccc", borderRadius: 8, font: "inherit", fontWeight: 400, resize: "vertical" }}
                />
              </label>
              <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                <button onClick={() => setShowConfirm(false)} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}>Keep browsing</button>
                <button onClick={() => saveChoice(active.id)} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "#3DBE7B", color: "#0F0F10", fontWeight: 600 }}>Confirm choice</button>
              </div>
            </div>
          </div>
        )}
        <Current />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: "#F5F4F1", minHeight: "100vh", color: "#1a1a1e" }}>
      <style>{GLOBAL}</style>
      <style>{`
        .ov-card { background:#fff; border:1px solid #E2E0DB; border-radius:16px; overflow:hidden; display:flex; flex-direction:column; transition: transform .2s, box-shadow .2s; }
        .ov-card:hover { transform: translateY(-5px); box-shadow: 0 18px 36px rgba(0,0,0,.10); }
        .ov-thumb { position: relative; height: 150px; overflow: hidden; }
        .ov-thumb img { width:100%; height:100%; object-fit:cover; transition: transform .5s; }
        .ov-card:hover .ov-thumb img { transform: scale(1.06); }
        .ov-strip { position:absolute; left:0; right:0; bottom:0; display:flex; height:8px; }
        .ov-chip { font-size:12px; border:1px solid #DDD; border-radius:999px; padding:3px 10px; color:#555; }
        .ov-cta { width:100%; padding:11px 0; border-radius:10px; border:1px solid #1a1a1e; background:#1a1a1e; color:#fff; font-weight:600; font-size:14px; position:relative; overflow:hidden; }
        .ov-cta::after { content:""; position:absolute; inset:0; width:40%; background:linear-gradient(105deg, transparent, rgba(255,255,255,.25), transparent); transform:translateX(-120%) skewX(-12deg); transition: transform .5s ease; }
        .ov-cta:hover::after { transform: translateX(280%) skewX(-12deg); }
        .ov-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:28px; max-width:860px; }
        .ov-step { border-left:2px solid #1a1a1e; padding:2px 0 2px 12px; font-size:13px; color:#6a665d; line-height:1.45; }
        .ov-step strong { display:block; color:#1a1a1e; font-size:13px; margin-bottom:2px; }
        @media (max-width:620px) { .ov-steps { grid-template-columns:1fr; gap:10px; } }
      `}</style>

      <header style={{ width: "100%", margin: 0, padding: "56px clamp(24px, 6vw, 120px) 8px" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8478", ...enter(0.05) }}>Wildlife photography portfolio · 9 design directions</p>
        <h1 style={{ fontSize: "clamp(30px,5vw,48px)", fontWeight: 600, letterSpacing: "-0.02em", marginTop: 10, ...enter(0.15) }}>
          Choose the direction for your website
        </h1>
        <p style={{ marginTop: 12, fontSize: 16, color: "#5a564e", maxWidth: 640, lineHeight: 1.6, ...enter(0.3) }}>
          Each option is a complete, animated wildlife-photography website with its own visual character. Open a direction to explore it full size, then select the one that feels most like your work. Your final photographs and copy will be added after the design is chosen.
        </p>
        <div className="ov-steps" style={enter(0.4)}>
          <div className="ov-step"><strong>01 — Explore</strong>Preview every design in full.</div>
          <div className="ov-step"><strong>02 — Choose</strong>Select your preferred direction.</div>
          <div className="ov-step"><strong>03 — Refine</strong>Leave notes for any changes you want.</div>
        </div>
      </header>

      {chosen && (
        <div style={{ width: "100%", margin: "20px 0 0", padding: "0 clamp(24px, 6vw, 120px)", ...enter(0.1) }}>
          <div style={{ background: "#E7F6EE", border: "1px solid #A9E0C3", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 15 }}>
              ✓ You selected <strong>{chosen.name}</strong>{choice.notes ? <> — “{choice.notes}”</> : null}
            </span>
            <span style={{ flex: 1 }} />
            <button onClick={() => setView(chosen.id)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #3DBE7B", background: "#fff", fontSize: 13 }}>View again</button>
            <button onClick={clearChoice} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #ccc", background: "transparent", fontSize: 13, color: "#666" }}>Change my mind</button>
          </div>
        </div>
      )}

      <main style={{ width: "100%", margin: 0, padding: "32px clamp(24px, 6vw, 120px) 70px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
        {DESIGNS.map((d, i) => (
          <div key={d.id} className="ov-card" style={enter(0.35 + i * 0.09, "riseBig")}>
            <button onClick={() => setView(d.id)} className="ov-thumb" style={{ border: "none", padding: 0, display: "block", width: "100%" }} aria-label={`Preview ${d.name}`}>
              <img src={img(`ov-${d.id}`, 700, 400)} alt="" />
              <span className="ov-strip">
                {d.palette.map((c) => <span key={c} style={{ flex: 1, background: c }} />)}
              </span>
            </button>
            <div style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 13, color: "#999" }}>{String(i + 1).padStart(2, "0")}</span>
                <h2 style={{ fontSize: 22, fontWeight: 600 }}>{d.name}</h2>
                {choice?.id === d.id && <span style={{ marginLeft: "auto", fontSize: 12, background: "#3DBE7B", color: "#fff", borderRadius: 999, padding: "3px 10px", fontWeight: 600 }}>Selected</span>}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3d3a34" }}>{d.concept}</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "#7a756b" }}>{d.bestFor}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {d.feel.map((f) => <span key={f} className="ov-chip">{f}</span>)}
              </div>
              <div style={{ fontSize: 12.5, color: "#8a8478" }}>Type: {d.type}</div>
              <div style={{ marginTop: "auto", paddingTop: 12 }}>
                <button onClick={() => setView(d.id)} className="ov-cta">Explore this design →</button>
              </div>
            </div>
          </div>
        ))}
      </main>

      <footer style={{ textAlign: "center", padding: "0 24px 48px", fontSize: 13, color: "#8a8478" }}>
        Can't decide? Pick two — elements from a runner-up can usually be folded into the winner.
      </footer>
    </div>
  );
}

function btn(primary) {
  return {
    border: "1px solid " + (primary ? "#fff" : "#3a3a3d"),
    background: primary ? "#fff" : "transparent",
    color: primary ? "#0F0F10" : "#d5d5d8",
    borderRadius: 8, padding: "7px 14px", fontSize: 13, whiteSpace: "nowrap",
  };
}
