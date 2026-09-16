"use client";

import { motion, useScroll } from "motion/react";

/** The same red line that tracks the journey on the home page, here tracking the read. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <div className="reading-progress" aria-hidden="true">
      <motion.span style={{ scaleX: scrollYProgress }} />
    </div>
  );
}
