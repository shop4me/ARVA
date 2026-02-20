/**
 * One-off: generate Slate Gray hero for Atlas Sectional via OpenAI edit.
 * Saves to same path as other product images: public/images/products/atlas-sectional/atlas-sectional-slate-gray.jpg
 */

import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { generateHeroImageFromReference } from "../lib/openaiImagesServer";

const SLUG = "atlas-sectional";
const HERO_REL = "/images/products/atlas-sectional/atlas-sectional-cloud-couch-ivory-hero-01.webp";
const PROMPT =
  "Slate Gray - can you change this color to Slate Gray - fabric is OEKO TEX, do not change anything else, only color.";
const OUT_REL = "/images/products/atlas-sectional/atlas-sectional-slate-gray.jpg";

async function main() {
  const basePath = path.join(process.cwd(), "public", HERO_REL.replace(/^\//, ""));
  await readFile(basePath); // ensure exists

  const result = await generateHeroImageFromReference({
    referenceImagePath: basePath,
    prompt: PROMPT,
    size: "1024x1024",
  });

  const outPath = path.join(process.cwd(), "public", OUT_REL.replace(/^\//, ""));
  await sharp(result.buffer)
    .jpeg({ quality: 92 })
    .toFile(outPath);

  console.log("OK", OUT_REL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
