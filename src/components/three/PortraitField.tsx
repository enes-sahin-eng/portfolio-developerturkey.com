"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

const SRC = "/media/portrait.png";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Sampling grid width. About 30k live points once transparent pixels drop out. */
const SAMPLE_W = 210;
const ALPHA_CUTOFF = 40;

/** World height of the figure at scale 1. */
const FIGURE_HEIGHT = 4.2;

/**
 * Page geometry measured in the browser (see Scene). The cloud is placed
 * against the real layout, so it clears the copy at every screen width
 * instead of being tuned to one monitor. Vertical close values are document
 * coordinates: the closing bust is pinned to its slot and scrolls with it.
 */
export type SceneLayout = {
  ready: boolean;
  /** Viewport x where the hero copy's actual ink ends. */
  heroRight: number;
  closeLeft: number;
  closeRight: number;
  /** Document y just under the last line of contact copy. */
  closeAfter: number;
  /** Document y of the footer rule. */
  closeFloor: number;
  docHeight: number;
};

/** A phone has no room beside the copy, so it gets its own fixed composition. */
const PHONE = {
  hero: { x: 0.5, y: 0.236 },
  read: { x: 0.5, y: 0.3 },
  close: { x: 0.5, y: 0.42 },
  scale: 0.58,
  closeOpacity: 0.16,
} as const;

type Sampled = {
  portrait: Float32Array;
  rows: Float32Array;
  lattice: Float32Array;
  random: Float32Array;
  luminance: Float32Array;
  width: number;
  count: number;
};

async function sample(url: string, gridW: number): Promise<Sampled> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  await image.decode();
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error(`Portrait image has no natural size: ${url}`);
  }

  const gridH = Math.round((gridW * image.naturalHeight) / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = gridW;
  canvas.height = gridH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, gridW, gridH);
  const { data } = ctx.getImageData(0, 0, gridW, gridH);

  const portrait: number[] = [];
  const rows: number[] = [];
  const lattice: number[] = [];
  const random: number[] = [];
  const luminance: number[] = [];

  const height = FIGURE_HEIGHT;
  const width = (height * gridW) / gridH;

  const kept: { x: number; y: number; lum: number }[] = [];
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const i = (y * gridW + x) * 4;
      if (data[i + 3] < ALPHA_CUTOFF) continue;
      const lum = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;
      kept.push({ x, y, lum });
    }
  }

  // Lattice dimensions: a tidy 3D grid the cloud reorganises into.
  const side = Math.ceil(Math.cbrt(kept.length));

  kept.forEach((point, index) => {
    const nx = (point.x / (gridW - 1) - 0.5) * width;
    const ny = -(point.y / (gridH - 1) - 0.5) * height;
    // Relief from luminance gives the cloud real depth, so rotation reads as 3D.
    const nz = (point.lum - 0.5) * 0.85;

    portrait.push(nx, ny, nz);

    // Lines of code: y snaps to a row, x spreads along that row.
    const rowH = height / 34;
    const row = Math.round(ny / rowH) * rowH;
    rows.push(nx * 1.12 + (point.lum - 0.5) * 0.9, row, nz * 0.3);

    const lx = index % side;
    const ly = Math.floor(index / side) % side;
    const lz = Math.floor(index / (side * side));
    const step = 5.2 / side;
    lattice.push((lx - side / 2) * step, (ly - side / 2) * step, (lz - side / 2) * step);

    random.push(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random());
    luminance.push(point.lum);
  });

  return {
    portrait: new Float32Array(portrait),
    rows: new Float32Array(rows),
    lattice: new Float32Array(lattice),
    random: new Float32Array(random),
    luminance: new Float32Array(luminance),
    width,
    count: kept.length,
  };
}

const vertexShader = /* glsl */ `
  attribute vec3 aRows;
  attribute vec3 aLattice;
  attribute vec3 aRandom;
  attribute float aLum;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vLum;
  varying float vDepth;
  varying float vBust;

  void main() {
    // Four beats: the person, the code it breaks into, the system it settles
    // into, and the person again at the close.
    float toRows    = smoothstep(0.10, 0.30, uProgress);
    float toLattice = smoothstep(0.28, 0.50, uProgress);
    float regather  = smoothstep(0.78, 0.96, uProgress);

    vec3 pos = position;
    pos = mix(pos, aRows, toRows);
    pos = mix(pos, aLattice, toLattice);
    pos = mix(pos, position, regather);

    // Turbulence only while the cloud is genuinely broken up.
    float unrest = toRows * (1.0 - toLattice) * (1.0 - regather);
    float t = uTime * 0.5;
    pos += vec3(
      sin(t + aRandom.x * 6.2831) * 0.10,
      cos(t * 0.8 + aRandom.y * 6.2831) * 0.05,
      sin(t * 1.2 + aRandom.z * 6.2831) * 0.16
    ) * unrest;

    // A slow breath while the portrait is whole.
    float whole = clamp((1.0 - toRows) + regather, 0.0, 1.0);
    pos.z += sin(uTime * 0.7 + aRandom.x * 3.0) * 0.05 * whole;

    // The lattice sits further back so copy in front of it stays readable.
    float back = toLattice * (1.0 - regather);
    pos.z -= back * 1.4;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = uSize * mix(1.0, 1.3, unrest);
    gl_PointSize = size * uPixelRatio * (1.0 / -mv.z);

    vLum = aLum;
    vDepth = clamp(-mv.z, 0.0, 40.0);
    // Whenever the figure is whole it reads as a bust: the body dissolves
    // downward instead of ending on the hard edge of the source photo.
    vBust = mix(1.0, smoothstep(-2.1, -1.05, position.y), whole);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uProgress;

  varying float vLum;
  varying float vDepth;
  varying float vBust;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;
    float edge = smoothstep(0.25, 0.05, d);

    // Full tonal range against a light ground: hair reads near black, the
    // sweater reads as mid grey, so the face is legible before anything else.
    vec3 color = mix(uInk, vec3(0.56, 0.58, 0.62), smoothstep(0.12, 0.95, vLum));

    // A minority of points pick up the accent while the cloud is broken up.
    float heat = smoothstep(0.12, 0.36, uProgress) * (1.0 - smoothstep(0.52, 0.8, uProgress));
    color = mix(color, uAccent, step(0.78, vLum) * heat);

    float fade = 1.0 - smoothstep(8.0, 22.0, vDepth);
    gl_FragColor = vec4(color, edge * uOpacity * mix(0.4, 1.0, fade) * vBust);
  }
`;

export function PortraitField({
  progress,
  pointer,
  layout,
  ink,
  accent,
  lowPower,
  compact,
}: {
  progress: MotionValue<number>;
  pointer: { current: { x: number; y: number } };
  layout: MutableRefObject<SceneLayout>;
  ink: string;
  accent: string;
  /** Sampling density and point size. */
  lowPower: boolean;
  /** Phone composition. Independent of lowPower: a weak desktop keeps desktop layout. */
  compact: boolean;
}) {
  const [data, setData] = useState<Sampled | null>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  useEffect(() => {
    let cancelled = false;
    sample(SRC, lowPower ? 132 : SAMPLE_W)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lowPower]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: lowPower ? 17 : 20 },
      uPixelRatio: { value: 1 },
      uInk: { value: new THREE.Color(ink) },
      uAccent: { value: new THREE.Color(accent) },
      uOpacity: { value: 1 },
    }),
    [ink, accent, lowPower],
  );

  useEffect(() => {
    uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
  }, [uniforms, lowPower, size]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    const cloud = pointsRef.current;
    if (!material || !cloud || !data) return;

    const p = progress.get();
    material.uniforms.uProgress.value += (p - material.uniforms.uProgress.value) * 0.08;
    material.uniforms.uTime.value += delta;

    const eased = material.uniforms.uProgress.value;
    const away = smoothstep(0.09, 0.24, eased);
    const back = smoothstep(0.78, 0.96, eased);

    const { width: worldW, height: worldH } = state.viewport;
    const { width: vw, height: vh } = state.size;
    const pxPerUnit = vh / worldH;
    const figureW = data.width * pxPerUnit;
    const figureH = FIGURE_HEIGHT * pxPerUnit;
    const toWorld = (px: number, py: number) => ({
      x: (px / vw - 0.5) * worldW,
      y: (0.5 - py / vh) * worldH,
    });

    const m = layout.current;
    let heroPx: { x: number; y: number };
    let readPx: { x: number; y: number };
    let closePx: { x: number; y: number };
    let heroScale: number;
    let closeScale: number;
    let closeOpacity: number;

    if (compact) {
      heroPx = { x: PHONE.hero.x * vw, y: PHONE.hero.y * vh };
      readPx = { x: PHONE.read.x * vw, y: PHONE.read.y * vh };
      closePx = { x: PHONE.close.x * vw, y: PHONE.close.y * vh };
      heroScale = PHONE.scale;
      closeScale = heroScale;
      closeOpacity = PHONE.closeOpacity;
    } else if (!m.ready) {
      // Measurement missing (a page without the layout hooks): keep a desktop
      // composition from fixed proportions rather than falling into the phone one.
      heroPx = { x: 0.7255 * vw, y: 0.456 * vh };
      readPx = { x: 0.88 * vw, y: 0.5 * vh };
      closePx = { x: 0.43 * vw, y: 0.77 * vh };
      heroScale = Math.min(1, worldW / 8);
      closeScale = heroScale * 0.58;
      closeOpacity = 0.85;
    } else {
      // Hero: into the space right of where the copy's ink actually ends,
      // fitted to that space. It may bleed a little off the right edge.
      const left = m.heroRight + 44;
      const free = Math.max(0, vw - 24 - left);
      heroScale = clamp(Math.min(1, (free * 1.1) / figureW, (0.84 * vh) / figureH), 0.35, 1);
      const w = figureW * heroScale;
      const centred = (left + vw - 60) / 2;
      heroPx = {
        x: Math.min(Math.max(left + w / 2, centred), left + w / 2 + 160),
        y: 0.456 * vh,
      };

      // Reading: pushed toward the right margin as faint atmosphere.
      readPx = { x: 0.88 * vw, y: 0.5 * vh };

      // Close: a bust in the slot under the contact copy, pinned to the page.
      const scrollY = p * Math.max(0, m.docHeight - vh);
      const top = m.closeAfter + 28 - scrollY;
      const bottom = Math.min(m.closeFloor + 70, m.docHeight) - scrollY;
      const boxH = Math.max(40, bottom - top);
      const boxW = Math.max(40, m.closeRight - m.closeLeft);
      closeScale = clamp(Math.min(1, boxH / figureH, (boxW * 1.05) / figureW), 0.2, 1);
      closePx = {
        x: (m.closeLeft + m.closeRight) / 2 + boxW * 0.08,
        y: top + (figureH * closeScale) / 2,
      };
      closeOpacity = 0.85;
    }

    const hero = toWorld(heroPx.x, heroPx.y);
    const read = toWorld(readPx.x, readPx.y);
    const close = toWorld(closePx.x, closePx.y);

    let x = hero.x + (read.x - hero.x) * away;
    let y = hero.y + (read.y - hero.y) * away;
    x += (close.x - x) * back;
    y += (close.y - y) * back;
    cloud.position.set(x, y, 0);
    cloud.scale.setScalar(heroScale + (closeScale - heroScale) * back);

    // The cloud owns the screen in the hero, steps back to atmosphere while
    // there is copy to read, then returns for the close. Legibility wins.
    material.uniforms.uOpacity.value = 1 - away * 0.93 + back * (closeOpacity - 0.07);

    // Pointer parallax plus a scroll driven turn that peaks mid page and
    // returns to face the reader at the close, with a slight three quarter
    // angle kept so the relief still reads as depth.
    const target = pointer.current;
    const turn = eased * (1 - back);
    cloud.rotation.y += (target.x * 0.32 + turn * 0.85 + back * 0.22 - cloud.rotation.y) * 0.06;
    cloud.rotation.x += (-target.y * 0.18 + turn * 0.1 - cloud.rotation.x) * 0.06;
  });

  if (!data) return null;

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.portrait, 3]} />
        <bufferAttribute attach="attributes-aRows" args={[data.rows, 3]} />
        <bufferAttribute attach="attributes-aLattice" args={[data.lattice, 3]} />
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
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
