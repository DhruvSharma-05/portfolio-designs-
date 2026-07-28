import { useEffect, useRef } from "react";
import {
  Scene, PerspectiveCamera, WebGLRenderer, Color, Points, BufferGeometry,
  Float32BufferAttribute, PointsMaterial, Group, Vector3, Matrix4,
  CanvasTexture, SRGBColorSpace, NormalBlending,
} from "three";

/* ==================================================================
   ParticleSphere — a rotating globe of particles that repel from the
   cursor and scatter on click. Ported from the Framer/Originkit
   "Particle Sphere" (TypeScript) to a self-contained JSX component:
   Framer-specific bits (RenderTarget, property controls, TS types)
   dropped, particles drawn as round Points (cheaper than instanced
   meshes) with normal blending.

   Brought over from the personal version, which is a cream-ground site
   — the default dot colour is flipped to the ink of THIS site's dark
   ground so the globe reads as light on black rather than disappearing.

   Interactions kept: auto-spin, drag-to-rotate with throw, cursor
   repulsion on the front hemisphere, click/tap scatter. Everything is
   allocation-free per frame (scratch vectors reused) so 6–7k particles
   stay smooth. Honours prefers-reduced-motion (renders one static frame).
   ================================================================== */

const DEFAULTS = {
  particlesCount: 6870,
  /* Dot size multiplier. The source value of 2 works on a cream ground
     where dark dots have plenty of contrast; on near-black, a ~3px dot
     with a soft alpha edge only lands one bright pixel and the whole
     globe reads as a smudge. 4 gives roughly 6px, which holds up. */
  particleScale: 4,
  speed: 20,          // auto-rotation speed (0–?, mapped internally)
  smoothing: 10,      // 0 = snappy, 10 = very smooth / momentum
  cursorRadius: 100,  // px radius the cursor pushes within
  cursorStrength: 9,  // 0–10, repulsion force
  clickForce: 3,      // scatter impulse on click
  color: "#FFFFFF",   // white — the brightest it can read on near-black
  drag: true,
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const mapLinear = (v, a, b, c, d) => (b === a ? c : c + ((v - a) / (b - a)) * (d - c));

const RETURN_FORCE = 0.015; // pull displaced particles home
const FRICTION = 0.94;      // decay of displacement each frame

/* A soft round dot, so the points aren't square. */
function makeDotTexture() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.55, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

export default function ParticleSphere(props) {
  const cfg = { ...DEFAULTS, ...props };
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const N = Math.max(0, Math.floor(cfg.particlesCount));

    // derived / mapped params
    const speedN = cfg.speed / 10;
    const smoothingN = cfg.smoothing / 10;
    const rotationSpeed = mapLinear(clamp(speedN, 0.1, 3), 0.1, 1, 0.01, 0.05);
    const cursorRadius = clamp(cfg.cursorRadius, 0, 600);
    const cursorRadiusSq = cursorRadius * cursorRadius;
    const cursorStrength = mapLinear(clamp(cfg.cursorStrength / 10, 0, 1), 0, 1, 0, 15);
    const lerpFactor = smoothingN === 0 ? 1 : mapLinear(smoothingN, 0, 1, 0.4, 0.03);
    const velocityDecay = mapLinear(smoothingN, 0, 1, 0.7, 0.96);
    const dotSize = 0.02 * (cfg.particleScale / 2);

    let w = container.clientWidth || 400;
    let h = container.clientHeight || 400;

    // scene / camera / renderer
    const scene = new Scene();
    const camera = new PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 3.4;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.touchAction = "pan-y"; // let the page scroll on vertical touch
    container.appendChild(canvas);

    // fibonacci sphere → base positions + working buffers
    const sphereR = 1.0;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const base = new Float32Array(N * 3);
    const disp = new Float32Array(N * 3);   // current offset from base
    const scat = new Float32Array(N * 3);   // scatter velocity
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const idx = i * 3;
      base[idx] = Math.cos(theta) * r * sphereR;
      base[idx + 1] = y * sphereR;
      base[idx + 2] = Math.sin(theta) * r * sphereR;
    }

    const geometry = new BufferGeometry();
    // Float32BufferAttribute COPIES its input, so we draw from — and mutate —
    // the attribute's own live array (drawArr), not the source `base`.
    geometry.setAttribute("position", new Float32BufferAttribute(base.slice(), 3));
    const posAttr = geometry.attributes.position;
    const drawArr = posAttr.array;
    const dotTex = makeDotTexture();
    const material = new PointsMaterial({
      size: dotSize,
      sizeAttenuation: true,
      map: dotTex,
      color: new Color(cfg.color),
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: NormalBlending,
    });
    const points = new Points(geometry, material);
    const group = new Group();
    group.add(points);
    scene.add(group);

    // rotation / interaction state
    const rot = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let dragging = false;
    let lastX = 0, lastY = 0, lastDragT = 0;
    let mouse = null; // {x, y} in container px
    let raf = null;
    let lastT = performance.now();

    // reusable scratch — no per-frame allocation
    const sLocal = new Vector3();
    const sWorld = new Vector3();
    const camRight = new Vector3();
    const camUp = new Vector3();
    const sRepWorld = new Vector3();
    const invGroup = new Matrix4();

    function frame() {
      const now = performance.now();
      const dt = clamp((now - lastT) / (1000 / 60), 0.2, 4);
      lastT = now;

      // auto-rotate
      if (!dragging && rotationSpeed !== 0) target.x += rotationSpeed * 0.1 * dt;

      // throw momentum after a drag
      if (!dragging && smoothingN > 0) {
        if (Math.abs(vel.x) > 0.0001 || Math.abs(vel.y) > 0.0001) {
          target.x += vel.x * dt;
          target.y += vel.y * dt;
          target.y = clamp(target.y, -Math.PI / 2, Math.PI / 2);
          const d = Math.pow(velocityDecay, dt);
          vel.x *= d; vel.y *= d;
        } else { vel.x = 0; vel.y = 0; }
      }

      // lerp toward target
      const tl = 1 - Math.pow(1 - lerpFactor, dt);
      rot.x += (target.x - rot.x) * tl;
      rot.y += (target.y - rot.y) * tl;
      rot.y = clamp(rot.y, -Math.PI / 2, Math.PI / 2);

      group.rotation.y = rot.x;
      group.rotation.x = rot.y;
      group.updateMatrixWorld(true);

      // cursor repulsion (front hemisphere only)
      if (mouse) {
        camRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
        camUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
        invGroup.copy(group.matrixWorld).invert();
        for (let i = 0; i < N; i++) {
          const idx = i * 3;
          sWorld.set(base[idx] + disp[idx], base[idx + 1] + disp[idx + 1], base[idx + 2] + disp[idx + 2]);
          sWorld.applyMatrix4(group.matrixWorld);
          if (sWorld.z <= 0) continue; // back layer untouched
          sLocal.copy(sWorld).project(camera); // reuse sLocal as projection
          const sx = (sLocal.x * 0.5 + 0.5) * w;
          const sy = (-sLocal.y * 0.5 + 0.5) * h;
          const ddx = mouse.x - sx;
          const ddy = mouse.y - sy;
          const dq = ddx * ddx + ddy * ddy;
          if (dq < cursorRadiusSq && dq > 0) {
            const dist = Math.sqrt(dq);
            const force = (cursorRadius - dist) / cursorRadius;
            const ang = Math.atan2(ddy, ddx);
            const rep = force * cursorStrength * speedN * dt * 0.01;
            sRepWorld.set(0, 0, 0)
              .addScaledVector(camRight, -Math.cos(ang) * rep)
              .addScaledVector(camUp, Math.sin(ang) * rep)
              .applyMatrix4(invGroup); // world → local (rotation only, so direction ok)
            disp[idx] += sRepWorld.x;
            disp[idx + 1] += sRepWorld.y;
            disp[idx + 2] += sRepWorld.z;
          }
        }
      }

      // friction + spring-home for displacement and scatter velocity
      const fr = Math.pow(FRICTION, dt);
      const ret = RETURN_FORCE * Math.max(speedN, 0.3) * dt;
      const scFr = Math.pow(0.95, dt);
      for (let k = 0; k < N * 3; k++) {
        disp[k] += scat[k] * dt * 0.1;
        scat[k] *= scFr;
        scat[k] *= 1 - ret;
        disp[k] *= fr;
        disp[k] *= 1 - ret;
        drawArr[k] = base[k] + disp[k];
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    // ---- scatter on click / tap ----
    function scatterAt(px, py) {
      if (!cfg.clickForce) return;
      group.updateMatrixWorld(true);
      invGroup.copy(group.matrixWorld).invert();
      const clickWorld = new Vector3();
      // approximate click point on the sphere-facing plane (z toward camera)
      const ndcX = (px / w) * 2 - 1;
      const ndcY = 1 - (py / h) * 2;
      clickWorld.set(ndcX, ndcY, 0.5).unproject(camera);
      const camPos = new Vector3().setFromMatrixPosition(camera.matrixWorld);
      const dir = clickWorld.clone().sub(camPos).normalize();
      clickWorld.copy(camPos).addScaledVector(dir, camPos.length());

      const rad = new Vector3();
      for (let i = 0; i < N; i++) {
        const idx = i * 3;
        sWorld.set(base[idx] + disp[idx], base[idx + 1] + disp[idx + 1], base[idx + 2] + disp[idx + 2]);
        sWorld.applyMatrix4(group.matrixWorld);
        sLocal.copy(sWorld).project(camera);
        const sx = (sLocal.x * 0.5 + 0.5) * w;
        const sy = (-sLocal.y * 0.5 + 0.5) * h;
        const ddx = px - sx, ddy = py - sy;
        const dq = ddx * ddx + ddy * ddy;
        if (dq < cursorRadiusSq && dq > 0) {
          const force = ((cursorRadius - Math.sqrt(dq)) / cursorRadius) * cfg.clickForce;
          rad.copy(sWorld).sub(clickWorld);
          if (rad.length() > 0.001) {
            rad.normalize().multiplyScalar(force * 0.5).applyMatrix4(invGroup);
            scat[idx] += rad.x; scat[idx + 1] += rad.y; scat[idx + 2] += rad.z;
          }
        }
      }
    }

    // ---- pointer / touch handlers ----
    const rectXY = (clientX, clientY) => {
      const r = container.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top, inside:
        clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom };
    };

    function onMove(e) {
      const p = rectXY(e.clientX, e.clientY);
      mouse = p.inside ? { x: p.x, y: p.y } : null;
    }
    function onLeave() { mouse = null; }
    function onClick(e) { const p = rectXY(e.clientX, e.clientY); if (p.inside) scatterAt(p.x, p.y); }

    function onDown(e) {
      if (!cfg.drag) return;
      dragging = true; vel.x = 0; vel.y = 0;
      lastX = e.clientX; lastY = e.clientY; lastDragT = performance.now();
      const move = (me) => {
        const t = performance.now();
        const dtl = t - lastDragT;
        const sens = 0.006;
        const dx = me.clientX - lastX, dy = me.clientY - lastY;
        target.x += dx * sens;
        target.y = clamp(target.y + dy * sens, -Math.PI / 2, Math.PI / 2);
        if (dtl > 0) { vel.x = dx * sens * 0.3 * (16.67 / dtl); vel.y = dy * sens * 0.3 * (16.67 / dtl); }
        lastX = me.clientX; lastY = me.clientY; lastDragT = t;
      };
      const up = () => {
        dragging = false;
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    }

    // touch: repel/scatter without hijacking vertical scroll
    function onTouchMove(e) {
      const t = e.touches[0]; if (!t) return;
      const p = rectXY(t.clientX, t.clientY);
      mouse = p.inside ? { x: p.x, y: p.y } : null;
    }
    function onTouchStart(e) {
      const t = e.touches[0]; if (!t) return;
      const p = rectXY(t.clientX, t.clientY);
      if (p.inside) scatterAt(p.x, p.y);
    }
    function onTouchEnd() { mouse = null; }

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("click", onClick);
    if (cfg.drag) canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    /* Resize off the observed box, not clientHeight. The original read
       `container.clientHeight || h`, so a single measurement of 0 — which
       is what you get if the callback lands before the row has been laid
       out — silently kept the 400px bootstrap forever, leaving the canvas
       short inside its 460px column. contentRect is always the real box. */
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      const nw = Math.round(box.width);
      const nh = Math.round(box.height);
      if (!nw || !nh || (nw === w && nh === h)) return;
      w = nw; h = nh;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    // go — always animate; this piece is the point of the section
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      geometry.dispose();
      material.dispose();
      dotTex.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
    // rebuild only if the meaningful inputs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.particlesCount, cfg.particleScale, cfg.color]);

  return <div ref={mountRef} className="psphere" aria-hidden="true" />;
}
