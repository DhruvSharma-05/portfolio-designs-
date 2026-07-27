import { useRef, useMemo, useState, Suspense, Component } from "react";
import { Canvas, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { heavyVisualsAllowed } from "./data.js";

/* ==================================================================
   DISTORT IMAGE — a WebGL hover-ripple on a work photo.

   Robust by construction: a plain <img> sits underneath and the canvas
   renders on top. If WebGL, the shader, or the texture (e.g. a CORS-
   blocked remote placeholder) fails, the canvas simply stays transparent
   and the real photo shows through — no blank card, ever.

   Only mounts on a fine pointer with motion allowed (hover is the whole
   point); touch / reduced-motion get the plain image. This module is
   itself only ever lazy-imported when heavyVisualsAllowed() already
   passed at the call site (see Home.jsx/Photography.jsx) — the check
   here is a second, cheap confirmation, not the first gate (that
   would be too late: the chunk is already fetched by the time code
   inside it can run).
   ================================================================== */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uMouse;      // pointer in 0..1 plane space
  uniform float uHover;     // 0..1 eased
  uniform vec2 uUvScale;    // background-size: cover mapping
  uniform vec2 uUvOffset;
  varying vec2 vUv;

  void main() {
    vec2 dir = vUv - uMouse;
    float dist = length(dir);
    float infl = uHover * smoothstep(0.45, 0.0, dist);
    vec2 push = dir * infl * 0.12;                 // shove pixels away from the cursor
    vec2 uv = (vUv - push) * uUvScale + uUvOffset;
    float shift = infl * 0.01;                     // subtle chromatic split
    float r = texture2D(uTex, uv + vec2(shift, 0.0)).r;
    float g = texture2D(uTex, uv).g;
    float b = texture2D(uTex, uv - vec2(shift, 0.0)).b;
    gl_FragColor = vec4(vec3(r, g, b) * 0.97, 1.0);
  }
`;

function Plane({ url }) {
  const tex = useLoader(THREE.TextureLoader, url);
  const { viewport, size, invalidate } = useThree();
  const uMouse = useRef();

  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return {
      uTex: { value: tex },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uUvScale: { value: new THREE.Vector2(1, 1) },
      uUvOffset: { value: new THREE.Vector2(0, 0) },
    };
  }, [tex]);
  uMouse.current = uniforms.uMouse.value;

  /* background-size: cover, computed in JS so the crop is exact */
  useMemo(() => {
    const im = tex.image;
    if (!im) return;
    const ca = size.width / size.height;
    const ia = im.width / im.height;
    let sx = 1, sy = 1;
    if (ia > ca) sx = ca / ia; else sy = ia / ca;
    uniforms.uUvScale.value.set(sx, sy);
    uniforms.uUvOffset.value.set((1 - sx) / 2, (1 - sy) / 2);
    invalidate();
  }, [tex, size.width, size.height, uniforms, invalidate]);

  const ease = (to) =>
    gsap.to(uniforms.uHover, { value: to, duration: 0.5, ease: "power2.out", onUpdate: invalidate });

  return (
    <mesh
      scale={[viewport.width, viewport.height, 1]}
      onPointerOver={() => ease(1)}
      onPointerOut={() => ease(0)}
      onPointerMove={(e) => { if (e.uv) { uMouse.current.set(e.uv.x, e.uv.y); invalidate(); } }}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} />
    </mesh>
  );
}

/* Catches WebGL-unavailable / Canvas-init errors → render nothing, so the
   underlying <img> is the graceful fallback. */
class CanvasGuard extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function DistortImage({ src, srcSet, sizes, alt }) {
  const [use3d] = useState(heavyVisualsAllowed);
  if (!use3d) return <img data-par src={src} srcSet={srcSet} sizes={sizes} alt={alt} />;
  return (
    <>
      <img className="distort-fallback" src={src} srcSet={srcSet} sizes={sizes} alt={alt} />
      <CanvasGuard>
        <Canvas
          className="distort-canvas"
          aria-hidden="true"
          frameloop="demand"
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <Suspense fallback={null}>
            <Plane url={src} />
          </Suspense>
        </Canvas>
      </CanvasGuard>
    </>
  );
}
