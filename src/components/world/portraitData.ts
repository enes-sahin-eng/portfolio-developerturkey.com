/**
 * The portrait is sampled once per density and shared. The screen and the
 * inner world both draw it, and sharing the same random offsets is what makes
 * the figure on the screen and the figure you step in front of identical.
 */

export type PortraitData = {
  /** Height 1, centred on the origin, relief in z from luminance. */
  positions: Float32Array;
  random: Float32Array;
  luminance: Float32Array;
  aspect: number;
  count: number;
};

const SRC = "/media/portrait.png";
const ALPHA_CUTOFF = 40;
const cache = new Map<number, Promise<PortraitData>>();

export function loadPortrait(gridWidth: number): Promise<PortraitData> {
  let pending = cache.get(gridWidth);
  if (!pending) {
    pending = sample(gridWidth);
    cache.set(gridWidth, pending);
  }
  return pending;
}

async function sample(gridWidth: number): Promise<PortraitData> {
  const image = new Image();
  image.decoding = "async";
  image.src = SRC;
  await image.decode();

  const gridHeight = Math.round((gridWidth * image.naturalHeight) / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = gridWidth;
  canvas.height = gridHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.drawImage(image, 0, 0, gridWidth, gridHeight);
  const { data } = ctx.getImageData(0, 0, gridWidth, gridHeight);

  const aspect = gridWidth / gridHeight;
  const positions: number[] = [];
  const random: number[] = [];
  const luminance: number[] = [];

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const i = (y * gridWidth + x) * 4;
      if (data[i + 3] < ALPHA_CUTOFF) continue;
      const lum = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;
      positions.push((x / (gridWidth - 1) - 0.5) * aspect, -(y / (gridHeight - 1) - 0.5), (lum - 0.5) * 0.2);
      random.push(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random());
      luminance.push(lum);
    }
  }

  return {
    positions: new Float32Array(positions),
    random: new Float32Array(random),
    luminance: new Float32Array(luminance),
    aspect,
    count: luminance.length,
  };
}
