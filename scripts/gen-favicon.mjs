// One-off: regenerate app/favicon.ico from app/icon.svg (the brand "A" mark)
// so the browser-tab favicon matches the rest of the icon set.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "app/icon.svg"));
const sizes = [16, 32, 48];

const pngs = await Promise.all(
  sizes.map((size) =>
    sharp(svg, { density: 384 })
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer(),
  ),
);

// Assemble an ICO that embeds PNG frames (supported by all modern browsers).
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(pngs.length, 4); // image count

const entries = [];
let offset = 6 + pngs.length * 16;
pngs.forEach((png, i) => {
  const entry = Buffer.alloc(16);
  const dim = sizes[i] >= 256 ? 0 : sizes[i];
  entry.writeUInt8(dim, 0); // width
  entry.writeUInt8(dim, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // size of image data
  entry.writeUInt32LE(offset, 12); // offset of image data
  offset += png.length;
  entries.push(entry);
});

const ico = Buffer.concat([header, ...entries, ...pngs]);
writeFileSync(join(root, "app/favicon.ico"), ico);
console.log(`Wrote app/favicon.ico (${ico.length} bytes, ${sizes.join("/")})`);
