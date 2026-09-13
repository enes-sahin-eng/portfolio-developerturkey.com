"use client";

import dynamic from "next/dynamic";

/** Keeps three.js out of the server render and off the critical path. */
const Scene = dynamic(() => import("./Scene").then((m) => m.Scene), { ssr: false });

export function SceneMount(props: { ink: string; accent: string }) {
  return <Scene {...props} />;
}
