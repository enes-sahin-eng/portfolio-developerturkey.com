"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, RenderTexture } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { GUIDE, GUIDE_HEIGHT, LAPTOP, SCREEN, SCREEN_VIEW, roomLight } from "@/lib/journey";
import { Laptop } from "./Laptop";
import { PortraitGuide } from "./PortraitGuide";
import { InnerGround } from "./InnerWorld";

const FLOOR_Y = LAPTOP.baseTop - LAPTOP.baseThickness;
const FLOOR_DARK = new THREE.Color("#0d0f13");
const FLOOR_LIT = new THREE.Color("#e7eaee");

/** Glow and dust sit on their own layer; the main camera enables it. */
export const ATMOSPHERE_LAYER = 1;

function radialTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * A soft elliptical shadow painted once. The laptop never moves, so a live
 * contact shadow pass would cost every frame for a result that never changes.
 */
function shadowTexture() {
  const width = 512;
  const height = 384;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(1, height / width);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, width / 2);
  gradient.addColorStop(0, "rgba(0,0,0,0.85)");
  gradient.addColorStop(0.45, "rgba(0,0,0,0.55)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(-width / 2, -width / 2, width, width);
  ctx.restore();
  return new THREE.CanvasTexture(canvas);
}

/**
 * The room at both ends of the journey: dark with the screen as the only
 * light at the opening, lit at the close. The screen is a live view into the
 * inner world from exactly the pose the camera takes after passing through.
 */
export function Room({
  progress,
  lowPower,
  screenLive,
}: {
  progress: MotionValue<number>;
  lowPower: boolean;
  /** False once the camera is inside: the screen stops re-rendering. */
  screenLive: boolean;
}) {
  const floor = useRef<THREE.MeshStandardMaterial>(null);
  const shadow = useRef<THREE.MeshBasicMaterial>(null);
  const hemisphere = useRef<THREE.HemisphereLight>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const screenLight = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const screen = useRef<THREE.MeshBasicMaterial>(null);
  const dust = useRef<THREE.Points>(null);
  const dustMaterial = useRef<THREE.PointsMaterial>(null);
  const bornAt = useRef<number | null>(null);

  const glowTexture = useMemo(() => radialTexture(), []);
  const floorShadow = useMemo(() => shadowTexture(), []);
  const dustGeometry = useMemo(() => {
    const count = lowPower ? 220 : 520;
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      points[i * 3] = (Math.random() - 0.5) * 8;
      points[i * 3 + 1] = FLOOR_Y + Math.random() * 3;
      points[i * 3 + 2] = -2 + Math.random() * 5;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    return geometry;
  }, [lowPower]);

  useFrame((state, delta) => {
    const lit = roomLight(progress.get());
    floor.current?.color.copy(FLOOR_DARK).lerp(FLOOR_LIT, lit);
    if (shadow.current) shadow.current.opacity = 0.6 - lit * 0.28;
    if (hemisphere.current) hemisphere.current.intensity = 0.05 + lit * 1.15;
    if (keyLight.current) keyLight.current.intensity = 0.2 + lit * 2.4;
    if (screenLight.current) screenLight.current.intensity = 5 * (1 - lit * 0.85);
    if (halo.current) halo.current.opacity = 0.28 * (1 - lit);
    if (dustMaterial.current) dustMaterial.current.opacity = 0.5 * (1 - lit);
    if (dust.current) dust.current.rotation.y += delta * 0.012;

    // Screen power on: a brief flicker, then steady.
    if (screen.current) {
      if (bornAt.current === null) bornAt.current = state.clock.elapsedTime;
      const t = state.clock.elapsedTime - bornAt.current;
      const on = Math.min(1, Math.max(0, (t - 0.35) / 0.9));
      const flicker = t < 1.4 ? 0.78 + 0.22 * Math.sin(t * 83) : 1;
      screen.current.color.setScalar(on * flicker);
    }
  });

  const [cx, cy, cz] = SCREEN.center;
  const [, ny, nz] = SCREEN.normal;
  const screenResolution = lowPower ? { width: 768, height: 480 } : { width: 1152, height: 720 };
  // Point size is in texture pixels here, so it scales with the texture, not the viewport.
  const screenPointSize = lowPower ? 34 : 28;

  return (
    <group>
      <hemisphereLight ref={hemisphere} args={["#dfe6ef", "#0b0d11", 0.05]} />
      <directionalLight ref={keyLight} position={[4, 6, 3]} intensity={0.2} />
      <pointLight
        ref={screenLight}
        position={[cx, cy + ny * 0.6, cz + nz * 0.6]}
        color="#d8e4ff"
        distance={6}
        decay={2}
        intensity={5}
      />

      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial ref={floor} color={FLOOR_DARK} roughness={0.9} metalness={0} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y + 0.001, LAPTOP.hingeZ + LAPTOP.baseDepth / 2]}>
        <planeGeometry args={[4.2, 3.2]} />
        <meshBasicMaterial
          ref={shadow}
          map={floorShadow}
          color="#000000"
          transparent
          opacity={0.6}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* The screen's glow spilling past the lid in the dark. */}
      <mesh
        layers={ATMOSPHERE_LAYER}
        position={[cx, cy - ny * 0.06, cz - nz * 0.06]}
        rotation-x={-LAPTOP.tilt}
      >
        <planeGeometry args={[5.2, 3.8]} />
        <meshBasicMaterial
          ref={halo}
          map={glowTexture}
          color="#b9ccff"
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <Laptop
        screen={
          <meshBasicMaterial ref={screen} toneMapped={false} color="black">
            <RenderTexture
              attach="map"
              width={screenResolution.width}
              height={screenResolution.height}
              frames={screenLive ? Infinity : 0}
            >
              <PerspectiveCamera
                makeDefault
                manual
                aspect={LAPTOP.screenWidth / LAPTOP.screenHeight}
                fov={SCREEN_VIEW.fov}
                position={[...SCREEN_VIEW.position]}
                onUpdate={(camera) => {
                  camera.lookAt(...SCREEN_VIEW.target);
                  camera.updateProjectionMatrix();
                }}
              />
              <color attach="background" args={["#eef0f3"]} />
              <fog attach="fog" args={["#eef0f3", 7, 34]} />
              <InnerGround lowPower={lowPower} />
              <group position={[...GUIDE]}>
                <PortraitGuide
                  height={GUIDE_HEIGHT}
                  lowPower={lowPower}
                  assemble="clock"
                  size={screenPointSize}
                  pixelRatio={1}
                />
              </group>
            </RenderTexture>
          </meshBasicMaterial>
        }
      />

      <points ref={dust} geometry={dustGeometry} layers={ATMOSPHERE_LAYER}>
        <pointsMaterial
          ref={dustMaterial}
          size={0.016}
          color="#e2e9f4"
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
