/**
 * Generate Atlas Sectional color hero WebPs from assets.
 * Color order comes from productDetails.json fabricOptions (same order as UI).
 * Manifest atlas-sectional array index = fabricOptions index (1:1): first PNG = first color, etc.
 *
 * Run: npx tsx scripts/generate_atlas_sectional_color_heros.ts
 */

import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MANIFEST_PATH = "data/image-upload-manifest.json";
const PRODUCT_DETAILS_PATH = "data/productDetails.json";
const OUT_DIR = "public/images/products/atlas-sectional";

function colorToSlug(color: string): string {
  return color.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "taupe";
}

async function main() {
  const root = process.cwd();
  const manifestRaw = await readFile(path.join(root, MANIFEST_PATH), "utf-8");
  const detailsRaw = await readFile(path.join(root, PRODUCT_DETAILS_PATH), "utf-8");
  const manifest = JSON.parse(manifestRaw) as { "atlas-sectional": { source: string }[] };
  const details = JSON.parse(detailsRaw) as { "atlas-sectional": { fabricOptions: { name: string }[] } };
  const entries = manifest["atlas-sectional"];
  const colors = details["atlas-sectional"]?.fabricOptions?.map((o) => o.name) ?? [];
  if (!entries || entries.length < 8 || colors.length < 8) {
    throw new Error("Manifest or productDetails atlas-sectional needs at least 8 entries.");
  }

  const outDirAbs = path.join(root, OUT_DIR);
  for (let i = 0; i < 8; i++) {
    const color = colors[i];
    const slug = colorToSlug(color);
    const filename = `atlas-sectional-cloud-couch-${slug}-hero-01.webp`;
    const srcPath = path.join(root, entries[i].source);
    const outPath = path.join(outDirAbs, filename);

    const buf = await readFile(srcPath);
    await sharp(buf)
      .webp({ quality: 88 })
      .toFile(outPath);
    console.log(color, "->", path.join(OUT_DIR, filename));
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
