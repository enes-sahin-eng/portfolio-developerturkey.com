"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { loadPortrait, type PortraitData } from "./portraitData";

const vertexShader = /* glsl */ `
  attribute vec3 aRandom;
  attribute float aLum;

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uAssemble;

  varying float vLum;
  varying float vBust;
  varying float vArrive;

  void main() {
    // Points arrive staggered from a loose cloud, so the face forms rather than fades in.
    float arrive = clamp(uAssemble * 1.35 - aRandom.z * 0.35, 0.0, 1.0);
    arrive = arrive * arrive * (3.0 - 2.0 * arrive);
    vec3 scatter = vec3(aRandom.x * 1.6, aRandom.y * 1.2, aRandom.z * 1.4 - 0.4);
    vec3 pos = mix(position + scatter, position, arrive);

    // A slow breath, so the figure never reads as a still image.
    pos.z += sin(uTime * 0.7 + aRandom.x * 3.0) * 0.012;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio / -mv.z;

    vLum = aLum;
    // The body dissolves downward instead of ending on the photo's hard edge.
    vBust = smoothstep(-0.5, -0.24, position.y);
    vArrive = arrive;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform float uOpacity;

  varying float vLum;
  varying float vBust;
  varying float vArrive;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;
    float edge = smoothstep(0.25, 0.05, d);
    // Hair near black, sweater mid grey: the face reads first on a light ground.
    vec3 color = mix(uInk, vec3(0.56, 0.58, 0.62), smoothstep(0.12, 0.95, vLum));
    gl_FragColor = vec4(color, edge * uOpacity * vBust * (0.25 + 0.75 * vArrive));
  }
`;

export function PortraitGuide({
  height,
  pointer,
  lowPower,
  assemble = "static",
  size = 16,
  pixelRatio,
}: {
  height: number;
  pointer?: { current: { x: number; y: number } };
  lowPower: boolean;
  /** "clock" forms the figure after mount; "static" shows it already formed. */
  assemble?: "clock" | "static";
  size?: number;
  pixelRatio?: number;
}) {
  const [data, setData] = useState<PortraitData | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const bornAt = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPortrait(lowPower ? 132 : 210)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lowPower]);

  // Created once. Per frame values are written to the uniforms the material
  // actually holds, never to a render scoped copy: a second render in
  // development can hand the material a different object than the hook keeps.
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uSize: { value: size },
    uPixelRatio: { value: 1 },
    uAssemble: { value: assemble === "static" ? 1 : 0 },
    uInk: { value: new THREE.Color("#10131a") },
    uOpacity: { value: 1 },
  }));

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const u = material.uniforms as typeof uniforms;
    u.uTime.value += delta;
    u.uSize.value = size;
    u.uPixelRatio.value = pixelRatio ?? Math.min(state.viewport.dpr, 2);

    if (assemble === "clock") {
      if (bornAt.current === null) bornAt.current = state.clock.elapsedTime;
      const t = (state.clock.elapsedTime - bornAt.current - 0.6) / 2.4;
      u.uAssemble.value = Math.min(1, Math.max(0, t));
    } else {
      u.uAssemble.value = 1;
    }

    const group = groupRef.current;
    if (!group) return;
    const px = pointer?.current.x ?? 0;
    const py = pointer?.current.y ?? 0;
    const sway = Math.sin(state.clock.elapsedTime * 0.25) * 0.06;
    // The head turns toward the pointer on both axes. Pointer y is negative at
    // the top of the screen, and a negative x rotation lifts the face: up is up.
    group.rotation.y += (px * 0.35 + sway - group.rotation.y) * 0.05;
    group.rotation.x += (py * 0.16 - group.rotation.x) * 0.05;
  });

  if (!data) return null;

  return (
    <group ref={groupRef}>
      <points scale={height} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[data.random, 3]} />
          <bufferAttribute attach="attributes-aLum" args={[data.luminance, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}
