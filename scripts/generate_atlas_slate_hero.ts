/**
 * One-off: generate Slate Gray hero for Atlas Sectional via high-fidelity edit.
 * Uses scripts/_oneoffs/atlas_slate_high_fidelity_edit.ts (Responses API, action: edit, input_fidelity: high).
 * Saves to same path as other product images: public/images/products/atlas-sectional/atlas-sectional-slate-gray.jpg
 *
 * Run: npx tsx scripts/generate_atlas_slate_hero.ts
 * Optional: npx tsx scripts/generate_atlas_slate_hero.ts --dry-run
 *
 * Expected output (success): model used, request id, output path + bytes written, then "OK /images/products/atlas-sectional/atlas-sectional-slate-gray.jpg"
 */

import { unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import {
  generateAtlasSlateHeroHighFidelityEdit,
} from "./_oneoffs/atlas_slate_high_fidelity_edit";

const HERO_REL = "/images/products/atlas-sectional/atlas-sectional-cloud-couch-ivory-hero-01.webp";
const OUT_REL = "/images/products/atlas-sectional/atlas-sectional-slate-gray.jpg";

async function main() {
  const basePath = path.join(process.cwd(), "public", HERO_REL.replace(/^\//, ""));
  const outPath = path.join(process.cwd(), "public", OUT_REL.replace(/^\//, ""));
  const outPngPath = path.join(
    path.dirname(outPath),
    path.basename(outPath, path.extname(outPath)) + ".png"
  );

  await generateAtlasSlateHeroHighFidelityEdit({
    inputImagePath: basePath,
    outputImagePath: outPngPath,
    colorName: "Slate Gray",
    dryRun: process.argv.includes("--dry-run"),
  });

  if (process.argv.includes("--dry-run")) {
    console.log("[dry-run] Skip conversion to JPG.");
    return;
  }

  await sharp(outPngPath)
    .jpeg({ quality: 92 })
    .toFile(outPath);
  await unlink(outPngPath).catch(() => {});

  console.log("OK", OUT_REL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
