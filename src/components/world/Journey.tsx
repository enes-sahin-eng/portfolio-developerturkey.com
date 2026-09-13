"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useScroll, type MotionValue } from "motion/react";
import Lenis from "lenis";
import * as THREE from "three";
import { COMPACT_ROOM, cameraAt, flashAt, roomLight, smooth, type Space } from "@/lib/journey";
import { ATMOSPHERE_LAYER, Room } from "./Room";
import { InnerWorld, type ProjectVisual } from "./InnerWorld";

const ROOM_DARK = new THREE.Color("#07080b");
const ROOM_LIT = new THREE.Color("#eceff2");
const INNER = new THREE.Color("#eef0f3");
/** Framing is authored for a 16:10 view; narrower screens widen the lens to keep it. */
const AUTHORED_ASPECT = 1.6;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

function World({
  progress,
  pointer,
  lowPower,
  compact,
  projects,
  skillCounts,
}: {
  progress: MotionValue<number>;
  pointer: { current: { x: number; y: number } };
  lowPower: boolean;
  compact: boolean;
  projects: ProjectVisual[];
  skillCounts: number[];
}) {
  const room = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const spaceRef = useRef<Space>("room");
  const [space, setSpace] = useState<Space>("room");
  const parallax = useRef({ x: 0, y: 0 });
  const { scene, camera, size } = useThree();

  const background = useMemo(() => new THREE.Color(ROOM_DARK), []);
  const fog = useMemo(() => new THREE.Fog(ROOM_DARK, 9, 42), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    scene.background = background;
    scene.fog = fog;
    camera.layers.enable(ATMOSPHERE_LAYER);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, camera, background, fog]);

  useFrame(() => {
    const p = progress.get();
    const pose = cameraAt(p);

    if (pose.space !== spaceRef.current) {
      spaceRef.current = pose.space;
      setSpace(pose.space);
    }
    if (room.current) room.current.visible = pose.space === "room";
    if (inner.current) inner.current.visible = pose.space === "inner";

    // Pointer parallax, calmed near the crossings where the lens is on the glass.
    const calm = 1 - Math.min(1, flashAt(p) * 3);
    parallax.current.x += (pointer.current.x - parallax.current.x) * 0.04;
    parallax.current.y += (pointer.current.y - parallax.current.y) * 0.04;
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.position.set(
      pose.position[0] + parallax.current.x * 0.18 * calm,
      pose.position[1] - parallax.current.y * 0.1 * calm,
      pose.position[2],
    );

    let targetX = pose.target[0];
    let targetY = pose.target[1];
    // On a phone the copy is a sheet along the bottom, so in the room the laptop
    // is centred and lifted into the top half. Faded out during the approach,
    // where the lens has to stay squared up to the screen.
    if (compact && pose.space === "room") {
      const opening = 1 - smooth(...COMPACT_ROOM.opening, p);
      const closing = smooth(...COMPACT_ROOM.closing, p);
      const weight = Math.max(opening, closing);
      targetX += (0 - targetX) * weight;
      targetY -= 0.5 * weight;
    }
    look.set(targetX, targetY, pose.target[2]);
    perspective.lookAt(look);

    const aspect = size.width / Math.max(1, size.height);
    const fov =
      aspect < AUTHORED_ASPECT
        ? Math.min(
            72,
            THREE.MathUtils.radToDeg(
              2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(pose.fov) / 2) * Math.min(AUTHORED_ASPECT / aspect, 2.4)),
            ),
          )
        : pose.fov;
    if (Math.abs(perspective.fov - fov) > 0.01) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }

    if (pose.space === "room") {
      background.copy(ROOM_DARK).lerp(ROOM_LIT, roomLight(p));
      fog.near = 9;
      fog.far = 42;
    } else {
      background.copy(INNER);
      fog.near = 8;
      fog.far = 34;
    }
    fog.color.copy(background);
  });

  return (
    <>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -5]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-6, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2} position={[4, 3, 5]} scale={2.5} />
      </Environment>

      <group ref={room}>
        <Room progress={progress} lowPower={lowPower} screenLive={space === "room"} />
      </group>
      <group ref={inner} visible={false}>
        <InnerWorld pointer={pointer} lowPower={lowPower} projects={projects} skillCounts={skillCounts} />
      </group>
    </>
  );
}

/**
 * One fixed scene behind the whole page. Page scroll is the only timeline:
 * the room, the flight through the screen and the world inside are one
 * continuous camera path, not separate section effects.
 */
export function Journey({ projects, skillCounts }: { projects: ProjectVisual[]; skillCounts: number[] }) {
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState({ lowPower: false, compact: false });
  const pointer = useRef({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !supportsWebGL()) {
      root.classList.remove("immersive");
      return;
    }

    const nav = navigator as Navigator & { deviceMemory?: number };
    const compact = window.innerWidth < 768;
    const lowPower = compact || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    setQuality({ lowPower, compact });
    setReady(true);
    root.dataset.three = "on";

    // Anchors are handled by CopyLayer: pinned panels have no offset of their own.
    const lenis = new Lenis({ autoRaf: true, lerp: 0.085, smoothWheel: true });
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onResize = () => {
      const nowCompact = window.innerWidth < 768;
      setQuality((current) => (current.compact === nowCompact ? current : { ...current, compact: nowCompact }));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      lenis.destroy();
      delete (window as Window & { __lenis?: Lenis }).__lenis;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      delete root.dataset.three;
    };
  }, []);

  if (!ready) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={{ contain: "strict" }}>
      <Canvas
        dpr={[1, quality.lowPower ? 1.5 : 2]}
        camera={{ position: [3.4, 2.35, 5.9], fov: 36, near: 0.02, far: 140 }}
        gl={{ antialias: !quality.lowPower, alpha: false, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <World
            progress={scrollYProgress}
            pointer={pointer}
            lowPower={quality.lowPower}
            compact={quality.compact}
            projects={projects}
            skillCounts={skillCounts}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
