// Regenerates the PWA / home-screen icons from the Acroma submark.
// Run from acroma-web: `node scripts/generate-icons.mjs`
// Brand orange field + white submark, matching the manifest theme_color.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ORANGE = "#F26F21";
const SUB_W = 198.21;
const SUB_H = 158.62;
const SUB_PATHS = [
  "M104.77.2c4.32-.98,9.37,1.77,12.49,4.7,27.36,38.05,52.56,77.92,78.9,116.81,11.31,29.05-26.7,41.4-47.47,35.34-7.05-2.06-7.55-8.1-9.29-14.55-12.56-46.32-23.67-93.13-35.64-139.62-.01-1.19-.37-2.37,1.02-2.68Z",
  "M94.34.46c.23,1.72-.09,3.24-.38,4.89-1.29,7.4-3.89,15.79-5.73,23.2-8.44,33.88-17.02,67.77-25.92,101.52-1.48,5.62-3.77,17.58-6.22,22.11-4.17,7.72-21.56,6.81-28.78,5.51-15.45-2.78-33.14-15.83-25.46-34.35L77.71,8.84c3.86-5.39,9.87-9.97,16.63-8.38Z",
  "M98.43,62.67c3.99-.61,4.98,4.51,5.93,7.52,3.87,12.31,7.01,25.77,10.33,38.34,3.75,14.26,7.61,28.54,10.76,42.94-.8,4.42-5.31,6.43-9.16,6.88-11.05-.66-22.97.85-33.92-.01-3.19-.25-7.74-1.58-9.02-5-.85-2.27-.39-3.59.08-5.82,2.41-11.52,6.15-24.02,9.16-35.51,3.67-14.01,7.23-29.64,11.7-43.26.73-2.23,1.55-5.69,4.14-6.08Z",
];

function mark(size, heightRatio) {
  const h = size * heightRatio;
  const scale = h / SUB_H;
  const w = SUB_W * scale;
  const tx = (size - w) / 2;
  const ty = (size - h) / 2;
  const paths = SUB_PATHS.map((d) => `<path d="${d}"/>`).join("");
  return `<g transform="translate(${tx} ${ty}) scale(${scale})" fill="#fff">${paths}</g>`;
}

function iconSvg({ size, radius, markRatio }) {
  const bg = radius
    ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${ORANGE}"/>`
    : `<rect width="${size}" height="${size}" fill="${ORANGE}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}${mark(size, markRatio)}</svg>`;
}

const outDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "icons",
);

// Rounded for "any" use; full-bleed (mask draws the shape) + extra safe-zone
// padding for maskable; full-bleed for Apple (iOS rounds it itself).
const jobs = [
  { file: "icon-512.png", size: 512, radius: 114, markRatio: 0.46 },
  { file: "icon-192.png", size: 192, radius: 43, markRatio: 0.46 },
  { file: "icon-512-maskable.png", size: 512, radius: 0, markRatio: 0.38 },
  { file: "apple-touch-icon.png", size: 180, radius: 0, markRatio: 0.46 },
];

for (const job of jobs) {
  const svg = iconSvg(job);
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, job.file));
  console.log("wrote", job.file);
}
