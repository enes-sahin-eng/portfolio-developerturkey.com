/**
 * The whole page is one journey, and this file is its only clock. Camera keys,
 * the moments the camera passes through the laptop screen, and the windows in
 * which each chapter's copy is on screen all read from here, so the 3D scene
 * and the HTML can never drift apart.
 *
 * Moments are authored in beats and exposed as progress, 0..1 over the scroll
 * track. Adding a project adds beats; nothing else has to be renumbered.
 */

export type Vec3 = readonly [number, number, number];

/** Which world the camera is in. The two are never rendered to the main view together. */
export type Space = "room" | "inner";

/** How the camera moves along the segment that ends at a key. */
export type Curve = "inOut" | "in" | "out" | "linear";

export type CameraKey = {
  at: number;
  space: Space;
  position: Vec3;
  target: Vec3;
  fov: number;
  curve?: Curve;
};

/** Chapter roles, independent of locale. Anchors are mapped from content. */
export type Role = "intro" | "about" | "work" | "experience" | "skills" | "contact";

export type Window = { from: number; to: number };

/** Laptop dimensions in world units. The screen pose below is derived from these. */
export const LAPTOP = {
  baseWidth: 2.6,
  baseDepth: 1.8,
  baseThickness: 0.07,
  baseTop: 0.2,
  hingeZ: -0.2,
  lidHeight: 1.72,
  lidThickness: 0.045,
  /** Lid lean back from vertical, radians. */
  tilt: (15 * Math.PI) / 180,
  screenWidth: 2.42,
  screenHeight: 1.5125,
  screenOffsetY: 0.03,
} as const;

function screenPose() {
  const { baseTop, hingeZ, lidHeight, lidThickness, tilt, screenOffsetY } = LAPTOP;
  const ly = lidHeight / 2 + screenOffsetY;
  const lz = lidThickness / 2 + 0.002;
  const angle = -tilt;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const center: Vec3 = [0, baseTop + 0.005 + ly * c - lz * s, hingeZ + ly * s + lz * c];
  // The lid's forward axis after the lean: the screen faces slightly upward.
  const normal: Vec3 = [0, -s, c];
  return { center, normal };
}

export const SCREEN = screenPose();
export const SCREEN_CENTER: Vec3 = SCREEN.center;

/** A point in front of the screen, along its normal. */
function inFrontOfScreen(distance: number, offset: Vec3 = [0, 0, 0]): Vec3 {
  const [cx, cy, cz] = SCREEN.center;
  const [nx, ny, nz] = SCREEN.normal;
  return [cx + nx * distance + offset[0], cy + ny * distance + offset[1], cz + nz * distance + offset[2]];
}

/** Panel positions in the inner world, one per project, in content order. */
export const PROJECT_STOPS: readonly Vec3[] = [
  [1.9, 1.7, -10],
  [-1.9, 1.7, -19],
  [1.9, 1.7, -28],
  [-1.9, 1.7, -37],
  [1.9, 1.7, -46],
];

/** Beats each project holds the camera for. */
const PROJECT_BEATS = 8;
const WORK_START_BEAT = 32;
const WORK_END_BEAT = WORK_START_BEAT + PROJECT_STOPS.length * PROJECT_BEATS;
/** Beats after the work chapter, up to the end of the journey. */
const TAIL_BEATS = 36;
const TOTAL_BEATS = WORK_END_BEAT + TAIL_BEATS;

/** Progress at a beat. */
export function beat(value: number) {
  return value / TOTAL_BEATS;
}

/** Progress at a beat counted from the end of the work chapter. */
function afterWork(value: number) {
  return beat(WORK_END_BEAT + value);
}

/** Moments the camera crosses the screen. A short flash hides the cut. */
export const CROSSINGS = {
  enter: beat(18.5),
  exit: afterWork(26.5),
  /** Half width of the flash around each crossing. */
  flash: beat(1.8),
} as const;

/** Where the portrait guide stands inside, and how tall it is. */
export const GUIDE: Vec3 = [0, 1.6, 0];
export const GUIDE_HEIGHT = 4.2;

export const WORK = { from: beat(WORK_START_BEAT), to: beat(WORK_END_BEAT) } as const;

const LAST_STOP = PROJECT_STOPS[PROJECT_STOPS.length - 1];

/** Timeline rail and skills orbits, past the last project. */
export const EXPERIENCE_ANCHOR: Vec3 = [1.4, 1.2, LAST_STOP[2] - 13];
export const SKILLS_ANCHOR: Vec3 = [0, 2.1, EXPERIENCE_ANCHOR[2] - 14];

/** The way out is the screen again, seen from inside: same 16:10 shape. */
export const EXIT_APERTURE: Vec3 = [0, 2.2, SKILLS_ANCHOR[2] - 12];
export const EXIT_APERTURE_SIZE = { width: 4.4, height: 2.75 } as const;

/** How deep the inner world goes, so the ground always reaches past the exit. */
export const WORLD_DEPTH = -EXIT_APERTURE[2] + 10;

/** Where the camera stands to read a project panel. */
export function projectCamera(index: number): { position: Vec3; target: Vec3 } {
  const stop = PROJECT_STOPS[index];
  const side = Math.sign(stop[0]);
  // The panel sits on one side; the camera stands well off to the other and
  // looks between them, so the panel fills its half and the copy panel has
  // the other half to itself.
  return {
    position: [-side * 1.05, stop[1] + 0.1, stop[2] + 5.6],
    target: [stop[0] * 0.3, stop[1], stop[2]],
  };
}

function projectKeys(): CameraKey[] {
  const span = (WORK.to - WORK.from) / PROJECT_STOPS.length;
  return PROJECT_STOPS.flatMap((_, index) => {
    const start = WORK.from + span * index;
    const { position, target } = projectCamera(index);
    const drift: Vec3 = [position[0] * 0.85, position[1], position[2] - 0.6];
    return [
      { at: start + span * 0.38, space: "inner", position, target, fov: 38, curve: "inOut" },
      { at: start + span * 0.9, space: "inner", position: drift, target, fov: 38, curve: "linear" },
    ] satisfies CameraKey[];
  });
}

const INNER_START: CameraKey = {
  at: CROSSINGS.enter,
  space: "inner",
  position: [0, 1.6, 7.4],
  target: GUIDE,
  fov: 34,
};

/** The screen shows the inner world from exactly this pose, so the cut is seamless. */
export const SCREEN_VIEW = INNER_START;

// Leaving the last project, the camera swings to the side away from that
// panel so it never brushes past it on its way to the rail.
const away = -Math.sign(LAST_STOP[0]);

export const CAMERA_KEYS: readonly CameraKey[] = [
  // The dark room. Targets sit left of the laptop so it lands right of centre,
  // clear of the hero copy. A slow three quarter drift while the copy is read.
  { at: 0, space: "room", position: [3.4, 2.35, 5.9], target: [-1.25, 0.85, -0.1], fov: 36 },
  { at: beat(7), space: "room", position: [2.5, 1.9, 4.3], target: [-0.9, 0.92, -0.2], fov: 36, curve: "inOut" },
  // Approach: square up to the screen and gather speed into it.
  { at: beat(14.5), space: "room", position: inFrontOfScreen(2.1, [0.25, 0.05, 0]), target: SCREEN_CENTER, fov: 34, curve: "in" },
  { at: CROSSINGS.enter, space: "room", position: inFrontOfScreen(0.5), target: SCREEN_CENTER, fov: 30, curve: "linear" },

  // Inside. The first inner key matches what the screen was showing.
  INNER_START,
  { at: beat(22.5), space: "inner", position: [0, 1.6, 7.9], target: [0, 1.6, 0], fov: 36, curve: "out" },
  // About: the camera looks left of the guide, so the whole bust stands in the
  // right half while the copy takes the left.
  { at: beat(25), space: "inner", position: [-1.4, 1.55, 8.2], target: [-1.35, 1.45, 0], fov: 38, curve: "inOut" },
  { at: beat(30.5), space: "inner", position: [-1.2, 1.55, 7.6], target: [-1.25, 1.45, 0], fov: 38, curve: "linear" },

  ...projectKeys(),

  {
    at: afterWork(1.2),
    space: "inner",
    position: [away * 1.7, 2.3, LAST_STOP[2] - 3.5],
    target: [away * 0.6, 1.6, EXPERIENCE_ANCHOR[2] - 2],
    fov: 40,
    curve: "inOut",
  },
  // Experience: rise and look down the rail, which sits right of centre.
  { at: afterWork(3.5), space: "inner", position: [-0.4, 3.2, EXPERIENCE_ANCHOR[2] + 9], target: [-0.6, 1.2, EXPERIENCE_ANCHOR[2]], fov: 40, curve: "inOut" },
  { at: afterWork(12.5), space: "inner", position: [0, 3, EXPERIENCE_ANCHOR[2] + 7.5], target: [-0.4, 1.2, EXPERIENCE_ANCHOR[2]], fov: 40, curve: "linear" },
  // Skills: the orbits to the right, copy to the left.
  { at: afterWork(16), space: "inner", position: [-1.2, 2.3, SKILLS_ANCHOR[2] + 10], target: [-2.2, SKILLS_ANCHOR[1], SKILLS_ANCHOR[2]], fov: 40, curve: "inOut" },
  { at: afterWork(23), space: "inner", position: [-1.4, 2.2, SKILLS_ANCHOR[2] + 9], target: [-2.2, SKILLS_ANCHOR[1], SKILLS_ANCHOR[2]], fov: 40, curve: "linear" },
  // Toward the way out: the screen, from the inside.
  { at: CROSSINGS.exit, space: "inner", position: [0, EXIT_APERTURE[1], EXIT_APERTURE[2] + 1.6], target: EXIT_APERTURE, fov: 30, curve: "in" },

  // Back in the room, now lit. Pull out on the opposite side to the opening.
  { at: CROSSINGS.exit, space: "room", position: inFrontOfScreen(0.55), target: SCREEN_CENTER, fov: 30 },
  { at: afterWork(31.5), space: "room", position: [-2.7, 1.8, 4.5], target: [0.9, 0.9, -0.2], fov: 36, curve: "out" },
  { at: 1, space: "room", position: [-3.7, 2.3, 6.3], target: [1.6, 0.88, -0.1], fov: 36, curve: "linear" },
];

function ease(curve: Curve, t: number) {
  switch (curve) {
    case "in":
      return t * t;
    case "out":
      return 1 - (1 - t) * (1 - t);
    case "linear":
      return t;
    default:
      return t * t * (3 - 2 * t);
  }
}

export type CameraPose = { space: Space; position: Vec3; target: Vec3; fov: number };

/** Camera pose at a given progress. Keys that share `at` across spaces are cuts. */
export function cameraAt(progress: number): CameraPose {
  const keys = CAMERA_KEYS;
  let index = 0;
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].at <= progress) index = i;
    else break;
  }
  const a = keys[index];
  const b = keys[index + 1];
  if (!b || b.space !== a.space || b.at === a.at) {
    return { space: a.space, position: a.position, target: a.target, fov: a.fov };
  }
  const t = ease(b.curve ?? "inOut", Math.min(1, Math.max(0, (progress - a.at) / (b.at - a.at))));
  const mix = (u: Vec3, v: Vec3): Vec3 => [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t, u[2] + (v[2] - u[2]) * t];
  return {
    space: a.space,
    position: mix(a.position, b.position),
    target: mix(a.target, b.target),
    fov: a.fov + (b.fov - a.fov) * t,
  };
}

/** When each chapter's copy is on screen. Fades happen at the edges of each window. */
export const COPY_WINDOWS: Record<Role, Window> = {
  intro: { from: 0, to: beat(9.5) },
  about: { from: beat(23.5), to: beat(31.5) },
  work: { from: WORK.from + beat(1.2), to: WORK.to - beat(0.4) },
  experience: { from: afterWork(2.8), to: afterWork(13.8) },
  skills: { from: afterWork(15.5), to: afterWork(23.8) },
  contact: { from: afterWork(29.5), to: afterWork(37) },
};

/** Per project copy windows, aligned with each camera stop's hold. */
export function projectWindow(index: number): Window {
  const span = (WORK.to - WORK.from) / PROJECT_STOPS.length;
  const start = WORK.from + span * index;
  return { from: start + span * 0.3, to: start + span * 0.97 };
}

/** The short list after the last project, read while the camera swings toward the rail. */
export const ALSO_WINDOW: Window = { from: WORK.to - beat(0.6), to: afterWork(2.4) };

/** On a phone the laptop is centred in the room; these are when that framing holds. */
export const COMPACT_ROOM = {
  opening: [beat(7), beat(15)] as const,
  closing: [afterWork(27.5), afterWork(32)] as const,
};

/** How lit the room is: dark at the opening, lit after the exit. */
export function roomLight(progress: number) {
  return smooth(CROSSINGS.exit, CROSSINGS.exit + beat(4), progress);
}

/** 0..1 flash strength around the two screen crossings. */
export function flashAt(progress: number) {
  const bump = (center: number) => Math.max(0, 1 - Math.abs(progress - center) / CROSSINGS.flash);
  return Math.max(bump(CROSSINGS.enter), bump(CROSSINGS.exit));
}

export function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Scroll track length in viewport heights. Every beat gets the same scroll distance. */
export const TRACK_VH = TOTAL_BEATS * 15;
