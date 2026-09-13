import { motionValue } from "motion/react";

/**
 * Journey progress, 0..1. CopyLayer is the only writer: on wide screens it is
 * the page's scroll progress, on phones it is mapped from where each card sits
 * in the flow. The camera reads the same value, so both halves stay in step.
 */
export const journeyProgress = motionValue(0);
