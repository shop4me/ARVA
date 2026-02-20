/**
 * Overlay mask in red on the base hero image for verification.
 * Output: /tmp/mask-previews/{slug}-mask-preview.jpg
 *
 * Usage: npx tsx scripts/mask_preview.ts [--slug atlas-sectional]
 */

import { mkdir, readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { readProductDetails } from "../lib/dataStore";
import { getMaskPath } from "../lib/maskUtils";
import { FEED_SLUGS } from "../lib/merchantFeed";

const PREVIEW_DIR = "/tmp/mask-previews";

function getBaseHeroPath(
  slug: string,
  details: Record<string, { images?: { hero?: string } }>,
  productImage?: string
): string | null {
  const hero = details[slug]?.images?.hero;
  const raw = hero || productImage;
  if (!raw || typeof raw !== "string") return null;
  const relative = raw.startsWith("/") ? raw.slice(1) : raw;
  return path.join(process.cwd(), "public", relative);
}

async function main() {
  const slugArg = process.argv.indexOf("--slug");
  const slugs =
    slugArg >= 0 && process.argv[slugArg + 1]
      ? [process.argv[slugArg + 1]]
      : Array.from(FEED_SLUGS);

  const details = await readProductDetails();
  await mkdir(PREVIEW_DIR, { recursive: true });

  for (const slug of slugs) {
    const maskPath = getMaskPath(slug);
    try {
      await readFile(maskPath);
    } catch {
      console.warn(`Skip ${slug}: mask not found at ${maskPath}`);
      continue;
    }

    const basePath = getBaseHeroPath(slug, details);
    if (!basePath) {
      console.warn(`Skip ${slug}: no base hero in productDetails`);
      continue;
    }
    try {
      await readFile(basePath);
    } catch {
      console.warn(`Skip ${slug}: base image not found at ${basePath}`);
      continue;
    }

    const [baseMeta, maskMeta] = await Promise.all([
      sharp(await readFile(basePath)).metadata(),
      sharp(await readFile(maskPath)).metadata(),
    ]);
    const w = baseMeta.width!;
    const h = baseMeta.height!;

    const maskBuf = await readFile(maskPath);
    let maskResized = sharp(maskBuf);
    if (maskMeta.width !== w || maskMeta.height !== h) {
      maskResized = maskResized.resize(w, h, { fit: "fill" });
    }
    const { data: maskData } = await maskResized
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const baseRaw = await sharp(await readFile(basePath))
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });
    const channels = baseRaw.info.channels;
    const out = Buffer.alloc(baseRaw.data.length);
    for (let i = 0; i < w * h; i++) {
      const r = baseRaw.data[i * channels] ?? 0;
      const g = baseRaw.data[i * channels + 1] ?? 0;
      const b = baseRaw.data[i * channels + 2] ?? 0;
      const a = channels > 3 ? (baseRaw.data[i * channels + 3] ?? 255) : 255;
      const maskVal = maskData[i] ?? 0;
      const isUpholstery = maskVal > 127;
      const o = i * channels;
      out[o] = isUpholstery ? Math.min(255, Math.round(r * 0.5 + 200)) : r;
      out[o + 1] = isUpholstery ? Math.min(255, Math.round(g * 0.5)) : g;
      out[o + 2] = isUpholstery ? Math.min(255, Math.round(b * 0.5)) : b;
      if (channels > 3) out[o + 3] = a;
    }

    const outPath = path.join(PREVIEW_DIR, `${slug}-mask-preview.jpg`);
    await sharp(out, {
      raw: { width: w, height: h, channels: channels as 3 | 4 },
    })
      .jpeg({ quality: 90 })
      .toFile(outPath);
    console.log(`OK ${slug} -> ${outPath}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
