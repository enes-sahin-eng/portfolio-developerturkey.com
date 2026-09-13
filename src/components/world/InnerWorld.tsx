"use client";

import { Suspense, useMemo, useRef, type ReactNode } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  EXIT_APERTURE,
  EXIT_APERTURE_SIZE,
  EXPERIENCE_ANCHOR,
  GUIDE,
  GUIDE_HEIGHT,
  PROJECT_STOPS,
  SKILLS_ANCHOR,
  WORLD_DEPTH,
  projectCamera,
  smooth,
} from "@/lib/journey";
import { PortraitGuide } from "./PortraitGuide";

export type ProjectVisual = { src?: string; headline?: string; caption?: string };

const PANEL_W = 3.1;
const PANEL_H = PANEL_W / 1.6;
const INK = "#10131a";
const ACCENT = "#c41e28";

/** A field of points to stand on, fading into the fog. Also drawn on the laptop screen. */
export function InnerGround({ lowPower }: { lowPower: boolean }) {
  const geometry = useMemo(() => {
    const step = lowPower ? 0.75 : 0.5;
    const points: number[] = [];
    for (let x = -14; x <= 14; x += step) {
      for (let z = 12; z >= -WORLD_DEPTH; z -= step) points.push(x, 0, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, [lowPower]);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial size={0.03} color="#9aa1ab" sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

let shadowTexture: THREE.CanvasTexture | null = null;

/** One soft round shadow, shared by everything that floats above the ground. */
function softShadow() {
  if (shadowTexture) return shadowTexture;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(16,19,26,1)");
  gradient.addColorStop(0.45, "rgba(16,19,26,0.4)");
  gradient.addColorStop(1, "rgba(16,19,26,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  shadowTexture = new THREE.CanvasTexture(canvas);
  return shadowTexture;
}

function GroundShadow({
  position,
  width,
  depth,
  opacity,
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  opacity: number;
}) {
  const texture = useMemo(() => softShadow(), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={position}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/**
 * Things along the path appear as the camera approaches them and are gone
 * while they are still far off. Without this, every panel down the corridor
 * shows up as a small rectangle behind whatever is currently being read.
 */
function Approach({
  near,
  far,
  children,
}: {
  /** Fully visible within this distance. */
  near: number;
  /** Fully hidden beyond this distance. */
  far: number;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const materials = useRef<{ material: THREE.Material; base: number }[] | null>(null);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const node = group.current;
    if (!node) return;
    if (!materials.current) {
      const found: { material: THREE.Material; base: number }[] = [];
      node.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.material) return;
        const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of list) {
          material.transparent = true;
          found.push({ material, base: material.opacity });
        }
      });
      if (found.length) materials.current = found;
    }
    node.getWorldPosition(worldPosition);
    const distance = worldPosition.distanceTo(state.camera.position);
    const presence = 1 - smooth(near, far, distance);
    node.visible = presence > 0.005;
    materials.current?.forEach(({ material, base }) => {
      material.opacity = base * presence;
    });
  });

  return <group ref={group}>{children}</group>;
}

function facing(index: number) {
  const stop = PROJECT_STOPS[index];
  const { position } = projectCamera(index);
  return Math.atan2(position[0] - stop[0], position[2] - stop[2]);
}

function PanelFrame({ index, children }: { index: number; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const stop = PROJECT_STOPS[index];
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = stop[1] + Math.sin(state.clock.elapsedTime * 0.6 + index * 1.7) * 0.05;
  });
  return (
    <group ref={group} position={[stop[0], stop[1], stop[2]]} rotation-y={facing(index)}>
      <Approach near={9} far={13}>
        <RoundedBox args={[PANEL_W + 0.14, PANEL_H + 0.14, 0.06]} radius={0.03} smoothness={4}>
          <meshStandardMaterial color="#fbfcfd" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[PANEL_W, PANEL_H]} />
          {children}
        </mesh>
        <GroundShadow position={[0, -stop[1] + 0.01, 0.1]} width={3.8} depth={1.3} opacity={0.14} />
      </Approach>
    </group>
  );
}

function ImagePanel({ index, src }: { index: number; src: string }) {
  const texture = useLoader(THREE.TextureLoader, src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return (
    <PanelFrame index={index}>
      <meshBasicMaterial map={texture} toneMapped={false} />
    </PanelFrame>
  );
}

function TypePanel({ index, headline, caption }: { index: number; headline: string; caption: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1440;
    canvas.height = 900;
    const ctx = canvas.getContext("2d")!;
    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(120, 150, 120, 10);
    ctx.fillStyle = "#f2f3f5";
    ctx.font = `600 320px ${family}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(headline, 110, 560);
    ctx.fillStyle = "#9ba3ac";
    ctx.font = `400 64px ${family}`;
    ctx.fillText(caption, 120, 690);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [headline, caption]);

  return (
    <PanelFrame index={index}>
      <meshBasicMaterial map={texture} toneMapped={false} />
    </PanelFrame>
  );
}

/** A measured line with two stops: the earlier role in ink, the current one in accent. */
function ExperienceRail() {
  const [x, y, z] = EXPERIENCE_ANCHOR;
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const ticks = useMemo(() => Array.from({ length: 21 }, (_, i) => -2.5 + i * 0.25), []);

  useFrame((state) => {
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      ring.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.4 + i * 1.3) * 0.08);
    });
  });

  return (
    <group position={[x, y, z]}>
      <Approach near={15} far={22}>
        <mesh>
          <boxGeometry args={[5, 0.012, 0.012]} />
          <meshStandardMaterial color={INK} roughness={0.5} />
        </mesh>
        {ticks.map((tickX, i) => (
          <mesh key={tickX} position={[tickX, 0.035, 0]}>
            <boxGeometry args={[0.006, i % 4 === 0 ? 0.12 : 0.06, 0.006]} />
            <meshBasicMaterial color={INK} transparent opacity={0.45} />
          </mesh>
        ))}
        {[-1.6, 1.6].map((nodeX, i) => {
          const current = i === 1;
          return (
            <group key={nodeX} position={[nodeX, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.085, 32, 16]} />
                <meshStandardMaterial color={current ? ACCENT : INK} roughness={0.35} />
              </mesh>
              <mesh
                ref={(mesh: THREE.Mesh | null) => {
                  rings.current[i] = mesh;
                }}
              >
                <torusGeometry args={[0.22, 0.005, 8, 72]} />
                <meshBasicMaterial color={current ? ACCENT : INK} transparent opacity={current ? 0.7 : 0.35} />
              </mesh>
              <GroundShadow position={[0, -y + 0.01, 0]} width={0.9} depth={0.9} opacity={0.12} />
            </group>
          );
        })}
      </Approach>
    </group>
  );
}

/**
 * Each skill group is one orbit, its items evenly spaced along it. The group
 * being learned right now is the outer orbit, in accent.
 */
function SkillsOrbits({ counts }: { counts: number[] }) {
  const spinners = useRef<(THREE.Group | null)[]>([]);
  const orbits = useMemo(
    () =>
      counts.map((count, i) => ({
        radius: 0.62 + i * 0.32,
        tilt: [1.12 + (i % 2) * 0.16, 0, i * 0.46] as [number, number, number],
        speed: (0.06 + i * 0.012) * (i % 2 ? -1 : 1),
        accent: i === counts.length - 1,
        angles: Array.from({ length: count }, (_, k) => (k / count) * Math.PI * 2 + i * 0.9),
      })),
    [counts],
  );

  useFrame((_, delta) => {
    spinners.current.forEach((spinner, i) => {
      if (spinner) spinner.rotation.z += delta * orbits[i].speed;
    });
  });

  return (
    <group position={[...SKILLS_ANCHOR]}>
      <Approach near={15} far={22}>
        <mesh>
          <sphereGeometry args={[0.11, 32, 16]} />
          <meshStandardMaterial color={INK} roughness={0.35} />
        </mesh>
        {orbits.map((orbit, i) => (
          <group key={i} rotation={orbit.tilt}>
            <mesh>
              <torusGeometry args={[orbit.radius, 0.0045, 6, 180]} />
              <meshBasicMaterial color={orbit.accent ? ACCENT : INK} transparent opacity={orbit.accent ? 0.55 : 0.2} />
            </mesh>
            <group
              ref={(group: THREE.Group | null) => {
                spinners.current[i] = group;
              }}
            >
              {orbit.angles.map((angle, k) => (
                <mesh key={k} position={[Math.cos(angle) * orbit.radius, Math.sin(angle) * orbit.radius, 0]}>
                  <sphereGeometry args={[orbit.accent ? 0.07 : 0.052, 20, 12]} />
                  <meshStandardMaterial color={orbit.accent ? ACCENT : INK} roughness={0.4} />
                </mesh>
              ))}
            </group>
          </group>
        ))}
      </Approach>
    </group>
  );
}

/** The laptop screen seen from inside: a lit 16:10 pane in a dark bezel. Fog would grey both. */
function ExitScreen() {
  const { width, height } = EXIT_APERTURE_SIZE;
  return (
    <group position={[...EXIT_APERTURE]}>
      <Approach near={9} far={14}>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[width + 0.26, height + 0.26]} />
          <meshBasicMaterial color="#0b0c0f" fog={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} />
        </mesh>
      </Approach>
    </group>
  );
}

export function InnerWorld({
  pointer,
  lowPower,
  projects,
  skillCounts,
}: {
  pointer: { current: { x: number; y: number } };
  lowPower: boolean;
  projects: ProjectVisual[];
  skillCounts: number[];
}) {
  return (
    <group>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 8, 6]} intensity={1.3} />
      <InnerGround lowPower={lowPower} />

      <group position={[...GUIDE]}>
        <PortraitGuide height={GUIDE_HEIGHT} pointer={pointer} lowPower={lowPower} assemble="static" size={16} />
      </group>

      {PROJECT_STOPS.map((_, index) => {
        const visual = projects[index];
        if (!visual) return null;
        return (
          <Suspense key={index} fallback={null}>
            {visual.src ? (
              <ImagePanel index={index} src={visual.src} />
            ) : (
              <TypePanel index={index} headline={visual.headline ?? ""} caption={visual.caption ?? ""} />
            )}
          </Suspense>
        );
      })}

      <ExperienceRail />
      <SkillsOrbits counts={skillCounts} />
      <ExitScreen />
    </group>
  );
}
