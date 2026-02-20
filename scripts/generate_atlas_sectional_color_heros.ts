/**
 * Generate Atlas Sectional color hero WebPs from assets.
 * Uses image-upload-manifest atlas-sectional order: each PNG maps to a color;
 * outputs Cloud Couch naming: atlas-sectional-cloud-couch-{colorSlug}-hero-01.webp
 *
 * Run: npx tsx scripts/generate_atlas_sectional_color_heros.ts
 */

import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MANIFEST_PATH = "data/image-upload-manifest.json";
const OUT_DIR = "public/images/products/atlas-sectional";

/** Manifest order → productDetails fabric name (same order as manifest). */
const ATLAS_SECTIONAL_COLORS = [
  "Warm Ivory",
  "Oatmeal",
  "Stone",
  "Mist",
  "Slate Gray",
  "Charcoal",
  "Soft White",
  "Graphite",
] as const;

function colorToSlug(color: string): string {
  return color.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "taupe";
}

async function main() {
  const root = process.cwd();
  const manifestRaw = await readFile(path.join(root, MANIFEST_PATH), "utf-8");
  const manifest = JSON.parse(manifestRaw) as { "atlas-sectional": { source: string }[] };
  const entries = manifest["atlas-sectional"];
  if (!entries || entries.length < ATLAS_SECTIONAL_COLORS.length) {
    throw new Error("Manifest atlas-sectional has fewer entries than colors.");
  }

  const outDirAbs = path.join(root, OUT_DIR);
  for (let i = 0; i < ATLAS_SECTIONAL_COLORS.length; i++) {
    const color = ATLAS_SECTIONAL_COLORS[i];
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
