"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useScroll } from "motion/react";
import { PortraitField, type SceneLayout } from "./PortraitField";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

/** Where the text in a block actually ends, not where its box ends. */
function inkRight(root: Element | null) {
  if (!root) return 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let right = 0;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) right = Math.max(right, rect.right);
  }
  return right;
}

/**
 * The cloud lives in one fixed scene behind the whole page. Page scroll is the
 * only timeline, so the portrait, the break-up and the lattice are one
 * continuous object rather than three separate section effects.
 */
export function Scene({ ink, accent }: { ink: string; accent: string }) {
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState({ lowPower: false, compact: false });
  const pointer = useRef({ x: 0, y: 0 });
  const layout = useRef<SceneLayout>({
    ready: false,
    heroRight: 0,
    closeLeft: 0,
    closeRight: 0,
    closeAfter: 0,
    closeFloor: 0,
    docHeight: 0,
  });
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !supportsWebGL()) return;

    const measure = () => {
      const column = document.querySelector("[data-close-column]")?.getBoundingClientRect();
      const after = document.querySelector("[data-close-after]")?.getBoundingClientRect();
      const floor = document.querySelector("[data-close-floor]")?.getBoundingClientRect();
      const scrollY = window.scrollY;
      // The closing bust's slot starts right of the footer label's ink, so on
      // narrow desktops, where the column is tight, the sweater never lands on
      // that text. On wide screens the label already sits left of the column.
      const labelRight = inkRight(document.querySelector("[data-close-label]"));
      layout.current = {
        ready: Boolean(column && after && floor),
        heroRight: inkRight(document.querySelector("[data-hero-copy]")),
        closeLeft: Math.max(column?.left ?? 0, labelRight ? labelRight + 24 : 0),
        closeRight: column?.right ?? 0,
        closeAfter: (after?.bottom ?? 0) + scrollY,
        closeFloor: (floor?.top ?? 0) + scrollY,
        docHeight: document.documentElement.scrollHeight,
      };
      const compact = window.innerWidth < 768;
      setQuality((current) => (current.compact === compact ? current : { ...current, compact }));
    };

    const nav = navigator as Navigator & { deviceMemory?: number };
    const compact = window.innerWidth < 768;
    const lowPower =
      compact || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;

    measure();
    setQuality({ lowPower, compact });
    setReady(true);
    document.documentElement.dataset.three = "on";

    // Layout moves when fonts land, images decode or the window resizes.
    const resize = new ResizeObserver(measure);
    resize.observe(document.documentElement);
    document.fonts?.ready.then(measure);

    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      resize.disconnect();
      window.removeEventListener("pointermove", onPointer);
      delete document.documentElement.dataset.three;
    };
  }, []);

  if (!ready) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ contain: "strict" }}
    >
      <Canvas
        dpr={[1, quality.lowPower ? 1.5 : 2]}
        camera={{ position: [0, 0, 7.4], fov: 42 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <PortraitField
          progress={scrollYProgress}
          pointer={pointer}
          layout={layout}
          ink={ink}
          accent={accent}
          lowPower={quality.lowPower}
          compact={quality.compact}
        />
      </Canvas>
    </div>
  );
}
