"use client";

import dynamic from "next/dynamic";
import type { ProjectVisual } from "./InnerWorld";

/** Keeps three.js out of the server render and off the critical path. */
const Journey = dynamic(() => import("./Journey").then((m) => m.Journey), { ssr: false });

export function JourneyMount(props: { projects: ProjectVisual[]; skillCounts: number[] }) {
  return <Journey {...props} />;
}
