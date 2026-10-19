// Bayer-dithered gradient tiles for the UI, served as SVG so cells stay crisp at any device pixel ratio.
// Each tile is 8 cells wide (one Bayer period) and repeats horizontally.

const CELL = 2; // CSS px per dither cell

/** The 8×8 Bayer threshold matrix (0–63), the same one the WebGL shader uses. */
const BAYER = Array.from({ length: 8 }, (_, y) =>
  Array.from({ length: 8 }, (_, x) => {
    let value = 0;
    for (let bit = 0; bit < 3; bit++) {
      const shift = 2 * (2 - bit);
      value |= ((((x ^ y) >> bit) & 1) << (shift + 1)) | (((y >> bit) & 1) << shift);
    }
    return value;
  }),
);

/** A vertical ramp of `color` that dithers from solid to clear over `rows` cells (or the reverse with "up"). */
function ramp(color: string, rows: number, direction: "down" | "up" = "down") {
  let path = "";
  for (let y = 0; y < rows; y++) {
    const t = (y + 0.5) / rows;
    const density = Math.pow(direction === "down" ? 1 - t : t, 1.4);
    let start = -1;
    for (let x = 0; x <= 8; x++) {
      const on = x < 8 && BAYER[y % 8][x] < density * 64;
      if (on && start < 0) start = x;
      if (!on && start >= 0) {
        path += `M${start} ${y}h${x - start}v1h${start - x}z`;
        start = -1;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${8 * CELL}" height="${rows * CELL}" viewBox="0 0 8 ${rows}" shape-rendering="crispEdges"><path fill="${color}" d="${path}"/></svg>`;
}

export const patterns = {
  /** Light falling onto the top of a window. */
  glow: ramp("#36100b", 72),
  /** The same for a 40px control. */
  "glow-sm": ramp("#3d130e", 20),
  /** The lower half of a primary button sinking into deep red. */
  "shade-sm": ramp("#c9230f", 20, "up"),
} as const;
