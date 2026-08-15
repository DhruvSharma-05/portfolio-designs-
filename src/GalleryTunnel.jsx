import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { THEME, PHOTO_POOL, img } from "./data.js";

/* ==================================================================
   GalleryTunnel — the hero's background. Ported from the Originkit
   "Gallery Tunnel" preset: a corridor of photo frames scrolling toward
   the camera forever.

   Stripped down from the source component for a hero that sits behind
   readable copy, not a standalone toy:
   - no cursor-following "Press to Start" pill, no click/hold speed
     boost, no cursor:none — the tunnel drifts on its own, same as the
     light pools it replaces, and never competes with the hero's own
     pointer affordances (the scroll cue link).
   - no hard-coded demo imagery, and no colour-slab filler either: every
     populated slab is a real synced photo from PHOTO_POOL. No synced
     photos ⇒ that slab just stays empty (the wireframe shows through),
     never a stock placeholder or a flat colour standing in for one.
   - fewer, bigger cells and a slower crawl than the source preset —
     grid 3 (not 4) and a quarter of its default speed, so the corridor
     reads as an ambient backdrop, not something racing past the copy.
   ================================================================== */

/* A wide slice of real frames, round-robin across collections already
   (PHOTO_POOL's own order) — the small variant, since these are seen
   at an angle, receding, never full-bleed. Every populated slab now
   shows one of these, so a bigger pool means less visible repetition. */
const TUNNEL_SEEDS = PHOTO_POOL.slice(0, 18);

const DEFAULTS = {
  background: THEME.bg,
  lineColor: THEME.dim,
  lineOpacity: 28,
  grid: 3,
  speed: 20,
  fade: 100,
  still: false,
};

const TUNNEL_WIDTH = 2;
const TUNNEL_HEIGHT = 1.8;
const SEGMENT_DEPTH = 1;
const NUM_SEGMENTS = 15;
const LINE_RADIUS = 0.003;
const SCROLL_TO_Z = 0.05;
const CAMERA_CHASE = 0.1;
const FADE_IN = 1;
/* MeshBasicMaterial is unlit — a photo reads exactly as bright as its own
   file, and the fog on top of that read as a little dull against the
   near-black ground. >1 is legal on an unlit material's color: the
   fragment shader multiplies it straight into the texture with nothing
   to clamp it before the canvas does, so this is a cheap uniform
   exposure lift rather than a filter over the whole scene. */
const IMAGE_BRIGHTNESS = 1.25;

const FOG_FAR = NUM_SEGMENTS * SEGMENT_DEPTH * 0.95;

export default function GalleryTunnel(props) {
  const cfg = { ...DEFAULTS, ...props };
  const frameRef = useRef(null);
  const canvasRef = useRef(null);

  const urls = useMemo(
    () => TUNNEL_SEEDS.map((seed) => img(seed, 640)).filter(Boolean),
    [],
  );

  const speedRef = useRef(1);
  speedRef.current = Math.max(0, cfg.speed) / 100;

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(cfg.background);

    const fogNear = Math.min(
      FOG_FAR * (1 - Math.min(100, Math.max(0, cfg.fade)) / 100),
      FOG_FAR - 0.01,
    );
    scene.fog = new THREE.Fog(new THREE.Color(cfg.background), fogNear, FOG_FAR);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(cfg.lineColor),
      transparent: true,
      opacity: Math.min(100, Math.max(0, cfg.lineOpacity)) / 100,
    });

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const fading = [];

    let imageIndex = 0;
    let populateIndex = 0;
    let scrollPos = 0;
    let raf = 0;
    let last = 0;
    let alive = true;

    const hw = TUNNEL_WIDTH / 2;
    const hh = TUNNEL_HEIGHT / 2;

    const cols = Math.max(1, Math.round(cfg.grid));
    const rows = Math.max(1, Math.round(cfg.grid));
    const colW = TUNNEL_WIDTH / cols;
    const rowH = TUNNEL_HEIGHT / rows;

    const geoFloor = new THREE.PlaneGeometry(colW, SEGMENT_DEPTH);
    const geoWall = new THREE.PlaneGeometry(SEGMENT_DEPTH, rowH);

    const geoTubeZ = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -SEGMENT_DEPTH)),
      1, LINE_RADIUS, 8,
    );
    const geoTubeX = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(TUNNEL_WIDTH, 0, 0)),
      1, LINE_RADIUS, 8,
    );
    const geoTubeY = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, TUNNEL_HEIGHT, 0)),
      1, LINE_RADIUS, 8,
    );

    const imageMats = urls.map((url) => {
      const mat = new THREE.MeshBasicMaterial({
        transparent: true, opacity: 0, side: THREE.DoubleSide,
        color: new THREE.Color(IMAGE_BRIGHTNESS, IMAGE_BRIGHTNESS, IMAGE_BRIGHTNESS),
      });
      loader.load(
        url,
        (tex) => {
          if (!alive) { tex.dispose(); return; }
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          mat.map = tex;
          mat.needsUpdate = true;
          fading.push(mat);
        },
        undefined,
        () => {
          // a dead URL should cost a blank slab, not a broken tunnel
        },
      );
      return mat;
    });

    const tube = (geo, x, y, z = 0) => {
      const m = new THREE.Mesh(geo, lineMaterial);
      m.position.set(x, y, z);
      return m;
    };

    const SLOTS = [];
    {
      const z = -SEGMENT_DEPTH / 2;
      for (let i = 0; i < cols; i++) {
        const x = -hw + i * colW + colW / 2;
        SLOTS.push({ geo: geoFloor, pos: new THREE.Vector3(x, -hh, z), rot: new THREE.Euler(-Math.PI / 2, 0, 0) });
        SLOTS.push({ geo: geoFloor, pos: new THREE.Vector3(x, hh, z), rot: new THREE.Euler(Math.PI / 2, 0, 0) });
      }
      for (let i = 0; i < rows; i++) {
        const y = -hh + i * rowH + rowH / 2;
        SLOTS.push({ geo: geoWall, pos: new THREE.Vector3(-hw, y, z), rot: new THREE.Euler(0, Math.PI / 2, 0) });
        SLOTS.push({ geo: geoWall, pos: new THREE.Vector3(hw, y, z), rot: new THREE.Euler(0, -Math.PI / 2, 0) });
      }
    }

    function populate(group) {
      const takesSlabs = populateIndex % 2 === 0;
      populateIndex++;
      const slabs = group.userData.slabs;

      for (const slab of slabs) {
        /* no images synced ⇒ nothing to show here; the wireframe carries
           the segment on its own rather than filling in a placeholder */
        if (!takesSlabs || imageMats.length === 0 || Math.random() > 0.5) {
          slab.visible = false;
          continue;
        }
        slab.visible = true;
        slab.material = imageMats[imageIndex % imageMats.length];
        imageIndex++;
      }
    }

    function createSegment(z) {
      const group = new THREE.Group();
      group.position.z = z;

      for (let i = 0; i <= cols; i++) {
        const x = -hw + i * colW;
        group.add(tube(geoTubeZ, x, -hh));
        group.add(tube(geoTubeZ, x, hh));
      }
      for (let i = 1; i < rows; i++) {
        const y = -hh + i * rowH;
        group.add(tube(geoTubeZ, -hw, y));
        group.add(tube(geoTubeZ, hw, y));
      }
      group.add(tube(geoTubeX, -hw, -hh));
      group.add(tube(geoTubeX, -hw, hh));
      group.add(tube(geoTubeY, -hw, -hh));
      group.add(tube(geoTubeY, hw, -hh));

      const slabs = SLOTS.map((slot) => {
        // placeholder only — every slab starts hidden until populate() below
        const m = new THREE.Mesh(slot.geo, lineMaterial);
        m.position.copy(slot.pos);
        m.rotation.copy(slot.rot);
        m.visible = false;
        group.add(m);
        return m;
      });
      group.userData.slabs = slabs;

      populate(group);
      return group;
    }

    const segments = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const g = createSegment(-i * SEGMENT_DEPTH);
      scene.add(g);
      segments.push(g);
    }

    const resize = () => {
      const w = Math.max(1, frame.clientWidth);
      const h = Math.max(1, frame.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(frame);
    resize();

    const animate = (now) => {
      if (!alive) return;
      raf = requestAnimationFrame(animate);
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      scrollPos += speedRef.current;

      const want = -SCROLL_TO_Z * scrollPos;
      camera.position.z += CAMERA_CHASE * (want - camera.position.z);

      const span = NUM_SEGMENTS * SEGMENT_DEPTH;
      const z = camera.position.z;
      for (const seg of segments) {
        if (seg.position.z > z + SEGMENT_DEPTH) {
          let min = 0;
          for (const s of segments) min = Math.min(min, s.position.z);
          seg.position.z = min - SEGMENT_DEPTH;
          populate(seg);
        } else if (seg.position.z < z - span - SEGMENT_DEPTH) {
          let max = -999999;
          for (const s of segments) max = Math.max(max, s.position.z);
          seg.position.z = max + SEGMENT_DEPTH;
          populate(seg);
        }
      }

      for (let i = fading.length - 1; i >= 0; i--) {
        const m = fading[i];
        m.opacity = Math.min(1, m.opacity + dt / FADE_IN);
        if (m.opacity >= 1) fading.splice(i, 1);
      }

      renderer.render(scene, camera);
    };

    // one frame either way; the loop only starts if motion is wanted
    renderer.render(scene, camera);
    if (!cfg.still) raf = requestAnimationFrame(animate);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();

      geoFloor.dispose();
      geoWall.dispose();
      geoTubeZ.dispose();
      geoTubeX.dispose();
      geoTubeY.dispose();
      for (const m of imageMats) {
        m.map?.dispose();
        m.dispose();
      }
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [urls, cfg.background, cfg.lineColor, cfg.lineOpacity, cfg.grid, cfg.fade, cfg.still]);

  return (
    <div
      ref={frameRef}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
