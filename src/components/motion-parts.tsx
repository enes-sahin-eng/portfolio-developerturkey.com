"use client";

import { useRef, type ReactNode } from "react";
import { MotionConfig, motion, useScroll, useTransform } from "motion/react";

/**
 * `reducedMotion="user"` makes Motion drop transform animations for readers who
 * ask for less motion while keeping opacity, so comprehension survives. Doing it
 * here rather than branching per component keeps one DOM tree, which is what
 * hydration needs.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Depth by differential movement, not by sliding a whole section. */
export function Parallax({ children, distance = 48 }: { children: ReactNode; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/** A hairline that draws itself as the reader moves down the timeline. */
export function DrawnRule({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <motion.span
        className="block h-full w-px origin-top"
        style={{ background: "var(--c-line-strong)", scaleY }}
      />
    </div>
  );
}
