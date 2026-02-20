/**
 * Generate color-accurate product variant images using OpenAI image edit.
 * One image per product × color; saved as static files. Run once, cache permanently.
 *
 * Usage:
 *   npx tsx scripts/generate_color_variant_images.ts
 *   npx tsx scripts/generate_color_variant_images.ts --slug atlas-sectional
 *   npx tsx scripts/generate_color_variant_images.ts --dry-run
 *
 * Requires OPENAI_API_KEY. Uses existing hero as base; only fabric color is changed.
 */

import { mkdir, readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { readProductDetails, readProducts } from "../lib/dataStore";
import { getColorVariantHeroPath, colorToSlug } from "../lib/colorVariantImages";
import { FEED_COLORS, FEED_SLUGS } from "../lib/merchantFeed";
import { generateHeroImageFromReference } from "../lib/openaiImagesServer";

const DRY_RUN = process.argv.includes("--dry-run");
const SLUG_FILTER = (() => {
  const i = process.argv.indexOf("--slug");
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
})();

const DELAY_MS = 3000; // Rate limit between OpenAI calls

/** All colors to generate: feed colors + PDP fabric option names (for website swatch images). */
function getColorsForSlug(slug: string, details: Record<string, { fabricOptions?: { name: string }[] }>): string[] {
  const feedSet = new Set<string>(FEED_COLORS);
  const fabricNames = details[slug]?.fabricOptions?.map((o) => o.name).filter(Boolean) ?? [];
  fabricNames.forEach((name) => feedSet.add(name));
  return Array.from(feedSet);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getBaseHeroPath(slug: string, details: Record<string, { images?: { hero?: string } }>, productImage?: string): string | null {
  const hero = details[slug]?.images?.hero;
  const raw = hero || productImage;
  if (!raw || typeof raw !== "string") return null;
  const relative = raw.startsWith("/") ? raw.slice(1) : raw;
  const absolute = path.join(process.cwd(), "public", relative);
  return absolute;
}

async function main() {
  const [products, details] = await Promise.all([readProducts(), readProductDetails()]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const slugs = SLUG_FILTER ? (FEED_SLUGS.has(SLUG_FILTER) ? [SLUG_FILTER] : []) : Array.from(FEED_SLUGS);

  let generated = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const product = productBySlug.get(slug);
    const basePath = getBaseHeroPath(slug, details, product?.image);
    if (!basePath) {
      console.warn(`Skip ${slug}: no hero image`);
      skipped++;
      continue;
    }
    try {
      await readFile(basePath);
    } catch {
      console.warn(`Skip ${slug}: hero file not found at ${basePath}`);
      skipped++;
      continue;
    }

    const colors = getColorsForSlug(slug, details);
    for (const color of colors) {
      const colorSlug = colorToSlug(color);
      const relPath = getColorVariantHeroPath(slug, color).replace(/^\//, "");
      const outPath = path.join(process.cwd(), "public", relPath);

      if (DRY_RUN) {
        console.log(`[dry-run] would generate ${slug} / ${color} -> ${relPath}`);
        generated++;
        continue;
      }

      const prompt = `Change ONLY the sofa upholstery color to ${color}. Keep everything else identical: same geometry, proportions, seams, stitching, cushions, lighting, shadows, camera angle, background, and fabric texture. The result must look like a professional studio product photo. Do not add or remove any elements.`;

      try {
        const result = await generateHeroImageFromReference({
          referenceImagePath: basePath,
          prompt,
          size: "1024x1024",
        });
        await mkdir(path.dirname(outPath), { recursive: true });
        await sharp(result.buffer)
          .jpeg({ quality: 90 })
          .toFile(outPath);
        console.log(`OK ${slug} / ${color} -> ${relPath}`);
        generated++;
      } catch (err) {
        console.error(`FAIL ${slug} / ${color}:`, err instanceof Error ? err.message : err);
      }

      await sleep(DELAY_MS);
    }
  }

  console.log("");
  console.log(`Done. Generated: ${generated}, skipped: ${skipped}`);
  if (!DRY_RUN && generated > 0) {
    console.log("Run feed:merchant and deploy so the feed and site use the new images.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
