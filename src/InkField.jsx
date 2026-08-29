import { useEffect, useRef } from "react";

/* ==================================================================
   InkField — the hero's background: a Navier-Stokes fluid the cursor
   stirs, in raw WebGL. Ported from Originkit's "Ink Flow Field"
   (TypeScript/Framer) and adapted to this site:

   - it paints **no background of its own**. The canvas clears to
     transparent and the display pass writes premultiplied alpha, so
     the page's own --bg is what shows through wherever the ink is
     thin. A layer that painted its own black over .pf would put a
     near-black rectangle a shade off the page colour behind the hero.
   - **the pointer is read off `window`**, not off this element. The
     hero's copy sits at z-index 3 over this layer and the layer is
     `pointer-events: none`, so a `pointermove` bound to the host
     would go dead the moment the cursor crossed the headline — which
     is the middle of the frame, i.e. exactly where you want to stir.
   - **it stops when it isn't being looked at**: off-screen (the page
     is four sections tall below the hero) or on a hidden tab. Twenty
     pressure iterations a frame is not something to leave running
     behind the footer.
   - the colours are the testimonial cards' own, not the demo's five
     saturated hues — see COLORS below.

   Gated in Home.jsx behind heavyVisualsAllowed() (≥900px) and not
   mounted at all under reduced motion: the field drifts on its own,
   so there is no still frame of it worth showing.
   ================================================================== */

/* Grid resolutions. Not props: a quality tier is this component's own
   business, and the sim reads identically at 128 whether the canvas is
   800 or 3000px wide. Dye runs finer than velocity because the eye
   reads the colour boundary, not the flow field. */
const SIM_RES = 128;
const DYE_RES = 512;
const PRESSURE_ITERATIONS = 20;
/* Pressure left over from last frame is a good first guess for this
   frame's solve; decaying it slightly is what stops the field ringing. */
const PRESSURE_DECAY = 0.8;
/* Velocity fades on its own so a stirred field comes to rest. Fixed:
   what a designer tunes is how long the *ink* lasts (`dissipation`),
   not how long the invisible field it rides on lasts. */
const VELOCITY_DISSIPATION = 0.2;
const CURL_AT_50 = 30;   // `swirl` 50 reproduces the source's confinement
/* Dye injected per SECOND, not per frame. A fixed amount per frame is
   twice as dense on a 120Hz display as on a 60Hz one, and a slow-moving
   source piles up until the core clips to flat white. */
const INJECT_RATE = 4.5;
/* The field starts empty, and an empty frame is what the visitor sees
   for the first second. These seed splats put ink on screen before the
   first frame; fixed positions and colours, never random, so two loads
   of the page look the same. */
const SEEDS = [
  [0.28, 0.62, 140, 60],
  [0.66, 0.38, -120, 90],
  [0.5, 0.5, 40, -140],
];
const DPR_CAP = 1.5;
const MAX_COLORS = 5;

/* The ink.

   The demo shipped five saturated hues, which is a palette of its own
   invented for one section. The site already owns exactly one set of
   colours — the testimonial cards' four mesh gradients — so the hero
   borrows from those rather than introducing a sixth thing to learn:
   every value below is lifted stop-for-stop out of a .tcard in
   data.js. Tone 0's jade is deliberately left out; green is the one
   family that has nowhere else to sit on this page.

     violet / deep violet   tone 2's `#8b5cf6 → #6633ee`
     rosewood / coral       tone 1's base and its third stop

   Two families, cool dominant. The dominance is set twice, because
   the two are read differently: **three of the five slots are cool**,
   and `pick()` walks the array as the run advances, so the field
   spends 60% of its time there — and **`w` scales each colour's dye**,
   which is what fixes the *light*. Coral is about 1.45× the luma of
   violet channel-for-channel, so an unweighted array would put the
   warm accent in front however few slots it took. Weighted, the cool
   pair carries ~70% of the lit area and the warm reads as the
   counterpoint it should be.

   `w` is not opacity: the dye is additive and the display pass rolls
   off softly, so halving it dims a filament without shrinking it. */
const COLORS = [
  { hex: "#8B5CF6", w: 1 },      // violet — .tcard tone 2
  { hex: "#6633EE", w: 1.1 },    // deep violet — same card's far stop;
  { hex: "#8B5CF6", w: 1 },      //   lifted, its luma is the lowest here
  { hex: "#BE6786", w: 0.75 },   // rosewood — tone 1's base
  { hex: "#F98F7B", w: 0.55 },   // coral — tone 1's third stop
];

/* WebGL2 / WebGL1 numeric enums, spelled out so the context can stay
   typed as one thing. Nothing below calls a WebGL2-only *method* — only
   these formats differ — so a WebGL1 context is used through exactly
   the subset it also implements. */
const GL_RGBA16F = 0x881a;
const GL_HALF_FLOAT = 0x140b;       // WebGL2
const GL_HALF_FLOAT_OES = 0x8d61;   // OES_texture_half_float

/* ------------------------------------------------------------------ shaders */

/* One vertex shader for every pass. It also hands the fragment stage the
   four neighbour coordinates, so the finite-difference passes
   (divergence, curl, pressure) never compute a texel offset themselves. */
const VERT = `
precision highp float;
attribute vec2 aPos;
uniform vec2 uTexel;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* Semi-Lagrangian advection. MANUAL_FILTERING is defined at compile time
   when the platform can't LINEAR-filter a half-float texture; a NEAREST
   fetch here turns every filament into a staircase within a second. */
const FRAG_ADVECT = `
precision highp float;
uniform sampler2D uVel;
uniform sampler2D uSrc;
uniform vec2 uTexel;     // velocity grid texel
uniform vec2 uTexelSrc;  // source grid texel (the dye grid is finer)
uniform float uDt;
uniform float uDiss;
varying vec2 vUv;

#ifdef MANUAL_FILTERING
vec4 bilerp(sampler2D s, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(s, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(s, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(s, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(s, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}
#endif

void main() {
  vec2 coord = vUv - uDt * texture2D(uVel, vUv).xy * uTexel;
  // Clamp the back-trace to the source texture's interior. CLAMP_TO_EDGE
  // already stops a fetch leaving the texture, but the half-texel margin
  // is what stops a bilinear fetch straddling the border and dragging the
  // edge row inward as a smear. It also keeps uTexelSrc live in BOTH
  // branches: a uniform only referenced inside the #ifdef is optimised
  // out on the linear path, and getUniformLocation then returns null for
  // a name that is not a typo.
  vec2 halfTexel = uTexelSrc * 0.5;
  coord = clamp(coord, halfTexel, 1.0 - halfTexel);
#ifdef MANUAL_FILTERING
  vec4 src = bilerp(uSrc, coord, uTexelSrc);
#else
  vec4 src = texture2D(uSrc, coord);
#endif
  // Exponential-ish decay written as a divide: stable at any dt, and it
  // can never push a channel negative the way (1 - diss * dt) can.
  gl_FragColor = src / (1.0 + uDiss * uDt);
}
`;

/* Free-slip walls: a neighbour sampled outside the grid is replaced by
   the centre value with its normal component reversed, so flow slides
   along the edge instead of piling into it. */
const FRAG_DIVERGENCE = `
precision highp float;
uniform sampler2D uVel;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  float l = texture2D(uVel, vL).x;
  float r = texture2D(uVel, vR).x;
  float t = texture2D(uVel, vT).y;
  float b = texture2D(uVel, vB).y;
  vec2 c = texture2D(uVel, vUv).xy;
  if (vL.x < 0.0) l = -c.x;
  if (vR.x > 1.0) r = -c.x;
  if (vT.y > 1.0) t = -c.y;
  if (vB.y < 0.0) b = -c.y;
  gl_FragColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}
`;

const FRAG_CURL = `
precision highp float;
uniform sampler2D uVel;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  float l = texture2D(uVel, vL).y;
  float r = texture2D(uVel, vR).y;
  float t = texture2D(uVel, vT).x;
  float b = texture2D(uVel, vB).x;
  gl_FragColor = vec4(0.5 * (r - l - t + b), 0.0, 0.0, 1.0);
}
`;

/* Vorticity confinement: push each texel along the gradient of |curl|,
   scaled by the signed curl, so an eddy the advection was flattening
   gets its spin paid back. The 1e-4 floor guards the denominator — a
   still field has zero gradient everywhere and this normalize would be
   0/0. */
const FRAG_VORTICITY = `
precision highp float;
uniform sampler2D uVel;
uniform sampler2D uCurl;
uniform float uCurlAmt;
uniform float uDt;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  float l = texture2D(uCurl, vL).x;
  float r = texture2D(uCurl, vR).x;
  float t = texture2D(uCurl, vT).x;
  float b = texture2D(uCurl, vB).x;
  float c = texture2D(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
  force /= max(length(force), 1e-4);
  force *= uCurlAmt * c;
  force.y *= -1.0;

  vec2 vel = texture2D(uVel, vUv).xy + force * uDt;
  // Half-float tops out around 65504; clamping well under it keeps a
  // runaway splat from writing an Inf that poisons every later pass.
  gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
}
`;

const FRAG_PRESSURE = `
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  float l = texture2D(uPressure, vL).x;
  float r = texture2D(uPressure, vR).x;
  float t = texture2D(uPressure, vT).x;
  float b = texture2D(uPressure, vB).x;
  float div = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((l + r + t + b - div) * 0.25, 0.0, 0.0, 1.0);
}
`;

const FRAG_GRADIENT = `
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uVel;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  float l = texture2D(uPressure, vL).x;
  float r = texture2D(uPressure, vR).x;
  float t = texture2D(uPressure, vT).x;
  float b = texture2D(uPressure, vB).x;
  vec2 vel = texture2D(uVel, vUv).xy - vec2(r - l, t - b);
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

/* Multiply the whole target by a scalar. Used for the pressure decay. */
const FRAG_CLEAR = `
precision highp float;
uniform sampler2D uTex;
uniform float uValue;
varying vec2 vUv;
void main() {
  gl_FragColor = uValue * texture2D(uTex, vUv);
}
`;

/* A gaussian blob added to whatever is already in the target. The same
   shader injects colour into the dye and force into the velocity — the
   only difference is which texture is bound and what uColor holds. */
const FRAG_SPLAT = `
precision highp float;
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
}
`;

/* Dye → screen. The output is premultiplied and the alpha is the ink's
   own brightness, so the page's --bg shows through wherever the ink is
   thin and the canvas never paints its own black over it.

   ⚠ **The rolloff scales all three channels by one factor. It must
   not be applied per channel.** The source did `c = c / (1 + c*0.8)`,
   which compresses the biggest channel hardest — so as a splat gets
   denser its colour is squeezed *out* of it, and the core of every
   filament converges on white. Measured: stirring over one spot drove
   the brightest composited pixel to rgb(236,236,236), 0% saturation.
   That is the worst of both worlds, because the densest ink is where
   you most want the colour and it is also what sets the contrast
   floor under the copy.

   Rolling the brightness off instead — one scale factor, from the
   largest channel — keeps the hue exactly at any density and bounds
   the peak at 1/KNEE. The ink now goes deep violet where it is thick,
   not white, and the worst case is a number that can be reasoned
   about rather than whatever the sampler happened to catch. */
/* Bounds the peak at 1/KNEE, and it is the honest lever for the worst
   case. Nudging the scrim instead chases noise: the worst pixel is
   whatever the densest core happened to be that run, so 46% and 58%
   bands measured the same within +-0.1. Raising KNEE pulls the bright
   cores down and leaves the broad field alone (for small m the scale
   is ~1), which is exactly the shape of the problem — the field was
   never too bright on average, only at the cores. */
const KNEE = 2.3;    // peak channel = 1/2.3 = 0.43, so a core never blows out
const FRAG_DISPLAY = `
precision highp float;
uniform sampler2D uTex;
uniform float uGain;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(uTex, vUv).rgb * uGain;
  float m = max(c.r, max(c.g, c.b));
  c *= 1.0 / (1.0 + m * ${KNEE.toFixed(2)});
  float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
  gl_FragColor = vec4(c, a);
}
`;

/* ------------------------------------------------------------------ helpers */

function parseColor(input) {
  if (!input) return [0, 0, 0];
  const s = input.trim();
  const fn = s.match(/rgba?\(([^)]+)\)/i);
  if (fn) {
    const p = fn[1].split(",").map((v) => parseFloat(v.trim()));
    return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255];
  }
  let h = s.replace("#", "");
  if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
  h = h.padEnd(6, "0");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

/* A palette entry is either a plain hex string (weight 1) or a
   { hex, w } pair. The weight is folded into the dye here rather than
   applied at injection, so a caller passing bare strings gets the
   obvious behaviour and nothing downstream has to know about it. */
function swatch(entry) {
  const c = parseColor(typeof entry === "string" ? entry : entry.hex);
  const w = typeof entry === "string" ? 1 : (entry.w ?? 1);
  return [c[0] * w, c[1] * w, c[2] * w];
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("InkField shader:", gl.getShaderInfoLog(sh));
  }
  return sh;
}

function makePass(gl, frag, names, defines) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, defines + frag);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("InkField link:", gl.getProgramInfoLog(prog));
    return null;
  }
  const u = {};
  for (let i = 0; i < names.length; i++) u[names[i]] = gl.getUniformLocation(prog, names[i]);
  return { prog, u };
}

function makeTarget(gl, w, h, fmt) {
  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!tex || !fbo) return null;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, fmt.filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, fmt.filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, fmt.format, fmt.type, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { tex, fbo, w, h, texelX: 1 / w, texelY: 1 / h };
}

function makeDouble(gl, w, h, fmt) {
  const a = makeTarget(gl, w, h, fmt);
  const b = makeTarget(gl, w, h, fmt);
  if (!a || !b) return null;
  const d = {
    read: a,
    write: b,
    swap: () => { const t = d.read; d.read = d.write; d.write = t; },
  };
  return d;
}

/* ----------------------------------------------------------------- component */

export default function InkField({
  colors = COLORS,
  speed = 50,
  dissipation = 38,
  swirl = 50,
  drift = 28,
  reach = 42,
  force = 60,
  /* The display gain — one of the three things keeping this ambient,
     with `w` on the palette and the scrim in .mast-ink::before.

     This dial sets the ink's *reach* — how much of the frame it
     lights. What bounds its peak is KNEE above; what protects the
     copy is the shape of the scrim in .mast-ink::before. All three
     were tuned together, and none of them means much alone: the
     field sat at 0.52 and then 0.65 while the scrim was one
     frame-wide pool, and it still read as grey haze — the pool, not
     the gain, was what dulled it. Against bands cut to the copy's own
     boxes, 0.85 clears AA on every tier by more than 0.65 did against
     the pool. Any further change needs the same measurement; see that
     note for the method, and for the two ways of measuring it wrong. */
  intensity = 0.85,
}) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);

  /* Every live input goes through this ref: the GL context is built once
     on mount and must never be torn down because a number changed. */
  const live = useRef(null);
  live.current = { colors, speed, dissipation, swirl, drift, reach, force, intensity };

  /* Pointer in normalised texture space plus the frame delta that becomes
     the injected force. `moved` gates the first splat, so a load with the
     cursor already parked over the hero doesn't fire one at (0,0). */
  const pointer = useRef({ x: 0.5, y: 0.5, dx: 0, dy: 0, down: 0, moved: 0 });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const opts = {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    };
    /* WebGL2 first: one extension call buys renderable half-float AND
       linear filtering of it. WebGL1 needs three separate extensions and
       may still refuse to filter, which is what MANUAL_FILTERING is for. */
    let isGL2 = true;
    let gl = canvas.getContext("webgl2", opts);
    if (!gl) {
      isGL2 = false;
      gl = canvas.getContext("webgl", opts);
    }
    if (!gl) return;

    let linear = false;
    let renderable = false;
    if (isGL2) {
      renderable = !!gl.getExtension("EXT_color_buffer_float")
        || !!gl.getExtension("EXT_color_buffer_half_float");
      linear = !!gl.getExtension("OES_texture_float_linear") || renderable;
    } else {
      renderable = !!gl.getExtension("OES_texture_half_float")
        && !!gl.getExtension("EXT_color_buffer_half_float");
      linear = !!gl.getExtension("OES_texture_half_float_linear");
    }
    /* No renderable float target anywhere: the sim can't run. Returning
       here leaves an empty transparent layer, so the hero is simply the
       type on the page's black — which is what it was before this
       existed, not a hole. */
    if (!renderable) return;

    const fmt = {
      internal: isGL2 ? GL_RGBA16F : gl.RGBA,
      format: gl.RGBA,
      type: isGL2 ? GL_HALF_FLOAT : GL_HALF_FLOAT_OES,
      filter: linear ? gl.LINEAR : gl.NEAREST,
    };
    const defines = linear ? "" : "#define MANUAL_FILTERING\n";

    /* ---- passes ---- */
    const advect = makePass(gl, FRAG_ADVECT,
      ["uVel", "uSrc", "uTexel", "uTexelSrc", "uDt", "uDiss"], defines);
    const divergence = makePass(gl, FRAG_DIVERGENCE, ["uVel", "uTexel"], "");
    const curl = makePass(gl, FRAG_CURL, ["uVel", "uTexel"], "");
    const vorticity = makePass(gl, FRAG_VORTICITY,
      ["uVel", "uCurl", "uCurlAmt", "uDt", "uTexel"], "");
    const pressure = makePass(gl, FRAG_PRESSURE,
      ["uPressure", "uDivergence", "uTexel"], "");
    const gradient = makePass(gl, FRAG_GRADIENT, ["uPressure", "uVel", "uTexel"], "");
    const clearPass = makePass(gl, FRAG_CLEAR, ["uTex", "uValue", "uTexel"], "");
    const splat = makePass(gl, FRAG_SPLAT,
      ["uTarget", "uAspect", "uColor", "uPoint", "uRadius", "uTexel"], "");
    const display = makePass(gl, FRAG_DISPLAY, ["uTex", "uGain", "uTexel"], "");
    if (!advect || !divergence || !curl || !vorticity || !pressure
      || !gradient || !clearPass || !splat || !display) return;

    /* ---- fullscreen quad ---- */
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const blit = (target) => {
      if (target) {
        gl.viewport(0, 0, target.w, target.h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      } else {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const bind = (tex, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      return unit;
    };

    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    /* ---- framebuffers, rebuilt on resize (never the context) ---- */
    let vel = null, dye = null, prs = null, div = null, crl = null;
    let aspect = 1;
    let built = "";

    const dispose = () => {
      const all = [vel?.read, vel?.write, dye?.read, dye?.write, prs?.read, prs?.write, div, crl];
      for (const t of all) {
        if (!t) continue;
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fbo);
      }
      vel = dye = prs = null;
      div = crl = null;
    };

    const buildTargets = (w, h) => {
      const key = w + "x" + h;
      if (key === built) return;
      dispose();
      aspect = w / Math.max(1, h);
      const simW = aspect >= 1 ? Math.round(SIM_RES * aspect) : SIM_RES;
      const simH = aspect >= 1 ? SIM_RES : Math.round(SIM_RES / aspect);
      const dyeW = aspect >= 1 ? Math.round(DYE_RES * aspect) : DYE_RES;
      const dyeH = aspect >= 1 ? DYE_RES : Math.round(DYE_RES / aspect);
      vel = makeDouble(gl, simW, simH, fmt);
      dye = makeDouble(gl, dyeW, dyeH, fmt);
      prs = makeDouble(gl, simW, simH, fmt);
      div = makeTarget(gl, simW, simH, fmt);
      crl = makeTarget(gl, simW, simH, fmt);
      built = key;
    };

    /* ---- sizing: measure the element ---- */
    let cssW = 0, cssH = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cssW = canvas.clientWidth || host.clientWidth || 0;
      cssH = canvas.clientHeight || host.clientHeight || 0;
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      buildTargets(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ---- pointer, read off the window ----
       The rect is re-read per event rather than cached, because the hero
       moves under the cursor as the page scrolls. Outside the hero the
       trail is dropped (moved = 0), so crossing back in doesn't inject
       one enormous splat spanning the distance travelled outside. */
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const nx = (e.clientX - r.left) / r.width;
      const ny = 1 - (e.clientY - r.top) / r.height;
      const p = pointer.current;
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) { p.moved = 0; return; }
      if (p.moved) {
        p.dx += (nx - p.x) * r.width;
        p.dy += (ny - p.y) * r.height;
      }
      p.x = nx;
      p.y = ny;
      p.moved = 1;
    };
    const onDown = () => { pointer.current.down = 1; };
    const onUp = () => { pointer.current.down = 0; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    /* ---- loop ---- */
    let raf = 0;
    let last = performance.now();
    let clock = 0;        // scaled sim time, drives the autonomous path
    let colorPhase = 0;
    let seeded = false;
    /* Autonomous path state, so its force is a real frame-to-frame delta
       rather than a guess — the drift stirs the field exactly the way a
       pointer does. */
    let ax = 0.5, ay = 0.5;

    const doSplat = (px, py, fx, fy, col, radius, ink) => {
      if (!vel || !dye) return;
      gl.useProgram(splat.prog);
      gl.uniform1f(splat.u.uAspect, aspect);
      gl.uniform2f(splat.u.uPoint, px, py);
      gl.uniform1f(splat.u.uRadius, radius);

      gl.uniform1i(splat.u.uTarget, bind(vel.read.tex, 0));
      gl.uniform3f(splat.u.uColor, fx, fy, 0);
      blit(vel.write);
      vel.swap();

      gl.uniform1i(splat.u.uTarget, bind(dye.read.tex, 0));
      gl.uniform3f(splat.u.uColor, col[0] * ink, col[1] * ink, col[2] * ink);
      blit(dye.write);
      dye.swap();
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dtReal = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      if (cssW <= 0 || cssH <= 0) {
        resize();
        if (cssW <= 0 || cssH <= 0) return;
      }
      if (!vel || !dye || !prs || !div || !crl) return;

      const L = live.current;
      const scale = Math.max(0, L.speed) / 50;   // 50 is the source's rate
      const dt = dtReal * scale;
      clock += dt;

      const pal = Array.isArray(L.colors) && L.colors.length > 0
        ? L.colors.slice(0, MAX_COLORS)
        : COLORS;
      colorPhase += dt * 0.25;
      const pick = (t) => swatch(pal[Math.floor(Math.abs(t) * pal.length) % pal.length]);

      /* Reach is a percent of the frame: 0 a pinprick, 100 a splat about
         a third of the short side across. Squared, because the shader
         divides dot(p, p) by it. */
      const r = 0.008 + (Math.max(0, L.reach) / 100) * 0.16;
      const radius = r * r;

      /* ---- inputs ---- */
      if (!seeded) {
        seeded = true;
        for (let i = 0; i < SEEDS.length; i++) {
          const s = SEEDS[i];
          doSplat(s[0], s[1], s[2], s[3], pick(i / SEEDS.length), radius, 1.1);
        }
      }

      const p = pointer.current;
      if (p.moved && (Math.abs(p.dx) > 0.01 || Math.abs(p.dy) > 0.01)) {
        const gain = (L.force / 100) * 0.9 * (1 + p.down);
        doSplat(p.x, p.y, p.dx * gain, p.dy * gain,
          pick(colorPhase + p.x), radius, dtReal * INJECT_RATE);
      }
      p.dx = 0;
      p.dy = 0;

      /* The autonomous stirrer: two incommensurate frequencies, so the
         path never repeats inside a visit and the field never settles
         into a standing pattern. It is what keeps the hero alive before
         the visitor has moved the mouse at all. */
      if (L.drift > 0) {
        const nx = 0.5 + 0.32 * Math.sin(clock * 0.55) * Math.cos(clock * 0.17);
        const ny = 0.5 + 0.28 * Math.sin(clock * 0.43 + 1.7);
        const fx = (nx - ax) * (cssW || 1) * (L.drift / 100) * 1.6;
        const fy = (ny - ay) * (cssH || 1) * (L.drift / 100) * 1.6;
        ax = nx;
        ay = ny;
        if (Math.abs(fx) > 0.01 || Math.abs(fy) > 0.01) {
          doSplat(nx, ny, fx, fy, pick(colorPhase),
            radius * 0.8, dtReal * INJECT_RATE * (L.drift / 100));
        }
      }

      /* ---- solve ---- */
      const setTexel = (pass, t) => gl.uniform2f(pass.u.uTexel, t.texelX, t.texelY);

      gl.useProgram(curl.prog);
      setTexel(curl, vel.read);
      gl.uniform1i(curl.u.uVel, bind(vel.read.tex, 0));
      blit(crl);

      gl.useProgram(vorticity.prog);
      setTexel(vorticity, vel.read);
      gl.uniform1i(vorticity.u.uVel, bind(vel.read.tex, 0));
      gl.uniform1i(vorticity.u.uCurl, bind(crl.tex, 1));
      gl.uniform1f(vorticity.u.uCurlAmt, (L.swirl / 50) * CURL_AT_50);
      gl.uniform1f(vorticity.u.uDt, dt);
      blit(vel.write);
      vel.swap();

      gl.useProgram(divergence.prog);
      setTexel(divergence, vel.read);
      gl.uniform1i(divergence.u.uVel, bind(vel.read.tex, 0));
      blit(div);

      gl.useProgram(clearPass.prog);
      setTexel(clearPass, prs.read);
      gl.uniform1i(clearPass.u.uTex, bind(prs.read.tex, 0));
      gl.uniform1f(clearPass.u.uValue, PRESSURE_DECAY);
      blit(prs.write);
      prs.swap();

      gl.useProgram(pressure.prog);
      setTexel(pressure, prs.read);
      gl.uniform1i(pressure.u.uDivergence, bind(div.tex, 0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressure.u.uPressure, bind(prs.read.tex, 1));
        blit(prs.write);
        prs.swap();
      }

      gl.useProgram(gradient.prog);
      setTexel(gradient, vel.read);
      gl.uniform1i(gradient.u.uPressure, bind(prs.read.tex, 0));
      gl.uniform1i(gradient.u.uVel, bind(vel.read.tex, 1));
      blit(vel.write);
      vel.swap();

      gl.useProgram(advect.prog);
      setTexel(advect, vel.read);
      gl.uniform2f(advect.u.uTexelSrc, vel.read.texelX, vel.read.texelY);
      gl.uniform1f(advect.u.uDt, dt);
      gl.uniform1f(advect.u.uDiss, VELOCITY_DISSIPATION);
      gl.uniform1i(advect.u.uVel, bind(vel.read.tex, 0));
      gl.uniform1i(advect.u.uSrc, bind(vel.read.tex, 0));
      blit(vel.write);
      vel.swap();

      /* Dye advects on the VELOCITY texel — that is the grid the
         back-trace walks — but fetches on its own, finer texel. */
      gl.uniform2f(advect.u.uTexel, vel.read.texelX, vel.read.texelY);
      gl.uniform2f(advect.u.uTexelSrc, dye.read.texelX, dye.read.texelY);
      // dissipation is "how fast the ink fades", so higher = shorter
      gl.uniform1f(advect.u.uDiss, (Math.max(1, L.dissipation) / 100) * 2.2);
      gl.uniform1i(advect.u.uVel, bind(vel.read.tex, 0));
      gl.uniform1i(advect.u.uSrc, bind(dye.read.tex, 1));
      blit(dye.write);
      dye.swap();

      /* ---- present ---- */
      gl.useProgram(display.prog);
      gl.uniform2f(display.u.uTexel, dye.read.texelX, dye.read.texelY);
      gl.uniform1i(display.u.uTex, bind(dye.read.tex, 0));
      gl.uniform1f(display.u.uGain, L.intensity);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    /* ---- run only while it is on screen and the tab is visible ----
       The page is several sections tall below the hero, and twenty
       pressure iterations a frame is not something to leave running
       behind the footer. `last` is reset on resume, so the first frame
       back doesn't integrate the whole time spent away. */
    let running = false;
    let visible = true;   // IntersectionObserver's first callback settles this
    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      pointer.current.moved = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start(); else stop();
    });
    io.observe(host);
    const onVis = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener("visibilitychange", onVis);

    /* A lost context leaves every call below throwing once a frame.
       Park the loop instead; restoration would need the whole build
       again, which is what a remount already does. */
    const onLost = (e) => { e.preventDefault(); stop(); visible = false; };
    canvas.addEventListener("webglcontextlost", onLost);

    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      gl.deleteBuffer(quad);
      dispose();
    };
  }, []);

  return (
    <div className="inkfield" ref={hostRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
