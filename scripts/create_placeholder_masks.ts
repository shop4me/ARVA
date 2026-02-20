/**
 * Create placeholder masks (center rectangle = white, rest = black) so the color-variant
 * pipeline can run. Replace with real hand-drawn or segmented masks for production.
 *
 * Usage: npx tsx scripts/create_placeholder_masks.ts [--slug atlas-sectional]
 */

import { mkdir, readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { readProductDetails } from "../lib/dataStore";
import { getMaskPath } from "../lib/maskUtils";
import { FEED_SLUGS } from "../lib/merchantFeed";

const SLUG_ARG = process.argv.indexOf("--slug");
const slugs =
  SLUG_ARG >= 0 && process.argv[SLUG_ARG + 1]
    ? [process.argv[SLUG_ARG + 1]]
    : Array.from(FEED_SLUGS);

/** Center region as fraction of width/height (0.5 = inner 50%). */
const INNER_W = 0.6;
const INNER_H = 0.75;

function getBaseHeroPath(
  slug: string,
  details: Record<string, { images?: { hero?: string } }>
): string | null {
  const hero = details[slug]?.images?.hero;
  if (!hero || typeof hero !== "string") return null;
  const relative = hero.startsWith("/") ? hero.slice(1) : hero;
  return path.join(process.cwd(), "public", relative);
}

async function main() {
  const details = await readProductDetails();
  await mkdir(path.dirname(getMaskPath("x").replace("-mask.png", "")), { recursive: true });

  for (const slug of slugs) {
    const basePath = getBaseHeroPath(slug, details);
    if (!basePath) {
      console.warn(`Skip ${slug}: no hero path`);
      continue;
    }
    let buf: Buffer;
    try {
      buf = await readFile(basePath);
    } catch {
      console.warn(`Skip ${slug}: base image not found at ${basePath}`);
      continue;
    }
    const meta = await sharp(buf).metadata();
    const w = meta.width!;
    const h = meta.height!;
    const x0 = Math.floor(w * (1 - INNER_W) / 2);
    const y0 = Math.floor(h * (1 - INNER_H) / 2);
    const x1 = Math.floor(w * (1 + INNER_W) / 2);
    const y1 = Math.floor(h * (1 + INNER_H) / 2);

    const maskData = Buffer.alloc(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const inRect = x >= x0 && x < x1 && y >= y0 && y < y1;
        maskData[y * w + x] = inRect ? 255 : 0;
      }
    }
    const maskPath = getMaskPath(slug);
    await sharp(maskData, { raw: { width: w, height: h, channels: 1 } })
      .png()
      .toFile(maskPath);
    console.log(`OK ${slug} -> ${maskPath} (placeholder center ${INNER_W}x${INNER_H})`);
  }
  console.log("\nPlaceholder masks created. Run npm run color-variants:preview to verify, then color-variants:generate. Replace with real masks for production.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
