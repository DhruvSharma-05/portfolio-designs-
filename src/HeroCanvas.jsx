import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ==================================================================
   HERO CANVAS — a lightweight accent-tinted particle field.

   Intentionally restrained to match the "one accent at a time"
   design: soft points in a flattened sphere, a slow perpetual spin,
   and a gentle parallax tilt toward the pointer. No models, no
   textures — just a BufferGeometry of points, so it stays cheap.

   Behaviour:
   · accent  — recolours the points (driven by the theme switcher)
   · active  — pauses the render loop when the hero scrolls off-screen
   · reduced — honours prefers-reduced-motion: renders one static frame
   ================================================================== */

const COUNT = 900;

function Field({ accent, reduced, pointer }) {
  const tilt = useRef(null); // pointer parallax
  const spin = useRef(null); // perpetual rotation

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // bias toward the centre, then flatten on Y for a disc-like drift
      const r = Math.pow(Math.random(), 0.6) * 6.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    // clamp delta so a backgrounded tab doesn't jump on return
    const d = Math.min(delta, 0.05);
    if (spin.current && !reduced) spin.current.rotation.y += d * 0.04;
    if (tilt.current) {
      const tx = reduced ? 0 : pointer.current.y * 0.18;
      const ty = reduced ? 0 : pointer.current.x * 0.22;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * 0.04;
      tilt.current.rotation.y += (ty - tilt.current.rotation.y) * 0.04;
    }
  });

  return (
    <group ref={tilt}>
      <points ref={spin}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#278837"
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function HeroCanvas({ accent = "#E4E4E7", active = true, reduced = false }) {
  const pointer = useRef({ x: 0, y: 0 });

  // Track the pointer at the window level: the canvas itself is
  // pointer-events:none so it never steals clicks/selection from the hero.
  useEffect(() => {
    if (reduced) return;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <Canvas
      className="hero-canvas"
      aria-hidden="true"
      camera={{ position: [0, 0, 9], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : active ? "always" : "never"}
    >
      <Field accent={accent} reduced={reduced} pointer={pointer} />
    </Canvas>
  );
}
