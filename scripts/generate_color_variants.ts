/**
 * Masked, QA-gated color variant hero generation.
 * One hero image per product × color. Only upholstery color changes; geometry/background preserved.
 *
 * Usage:
 *   npx tsx scripts/generate_color_variants.ts
 *   npx tsx scripts/generate_color_variants.ts --slug atlas-sectional
 *   npx tsx scripts/generate_color_variants.ts --slug atlas-sectional --color "Slate Gray"
 *   npx tsx scripts/generate_color_variants.ts --dry-run
 *   npx tsx scripts/generate_color_variants.ts --force
 *
 * Requires: OPENAI_API_KEY, masks in assets/masks/{slug}-mask.png
 * Output: public/images/products/{slug}/{slug}-{colorSlug}.jpg (only if QA passes)
 * Previews: /tmp/variant-previews/{slug}-preview.jpg
 * Log: logs/color-variants.csv
 */

import { appendFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getColorVariantHeroPath, colorToSlug } from "../lib/colorVariantImages";
import { runQA, type QAResult } from "../lib/colorVariantQA";
import { readProductDetails, readProducts } from "../lib/dataStore";
import { recolorInMask } from "../lib/deterministicRecolor";
import { getMaskPath, maskExists } from "../lib/maskUtils";
import { generateHeroImageFromReferenceWithMask } from "../lib/openaiImagesServer";
import { FEED_SLUGS } from "../lib/merchantFeed";
import type { FabricOption } from "../lib/productDetail";

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const SLUG_FILTER = (() => {
  const i = process.argv.indexOf("--slug");
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
})();
const COLOR_FILTER = (() => {
  const i = process.argv.indexOf("--color");
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
})();

const NUM_CANDIDATES = 3;
const DELAY_MS = 4000;
const LOG_PATH = path.join(process.cwd(), "logs", "color-variants.csv");
const PREVIEW_DIR = "/tmp/variant-previews";

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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getColorsWithHex(
  slug: string,
  details: Record<string, { fabricOptions?: FabricOption[] }>
): { name: string; hex: string }[] {
  const opts = details[slug]?.fabricOptions ?? [];
  return opts
    .filter((o): o is FabricOption & { hex: string } => Boolean(o.name && o.hex))
    .map((o) => ({ name: o.name, hex: o.hex }));
}

const PROMPT_TEMPLATE =
  "Change ONLY the upholstery fabric color inside the masked region to match {colorName} ({hex}). Preserve exact geometry, seams, stitching, fabric texture, lighting, shadows, camera angle, and background. Do not add or remove elements. Output must look like a professional studio product photo.";
const POLISH_PROMPT_TEMPLATE =
  "Do not change anything except make the upholstery look natural and photo-real for {colorName}. Keep lighting and texture realistic. No geometry changes.";

async function ensureLogHeader() {
  try {
    const content = await readFile(LOG_PATH, "utf8");
    if (content.includes("slug,")) return;
  } catch {
    /* file new */
  }
  await mkdir(path.dirname(LOG_PATH), { recursive: true });
  await appendFile(
    LOG_PATH,
    "slug,colorName,hex,output_url,qa_pass,deltaE,outsideMaskDiff,timestamp\n"
  );
}

function logRun(
  slug: string,
  colorName: string,
  hex: string,
  outputUrl: string,
  qaPass: boolean,
  deltaE: number,
  outsideMaskDiff: number
) {
  const timestamp = new Date().toISOString();
  const line = `${slug},${colorName},${hex},${outputUrl},${qaPass},${deltaE.toFixed(2)},${outsideMaskDiff.toFixed(2)},${timestamp}\n`;
  return appendFile(LOG_PATH, line);
}

async function generateCandidates(
  basePath: string,
  maskPath: string,
  colorName: string,
  hex: string,
  count: number
): Promise<Buffer[]> {
  const prompt = PROMPT_TEMPLATE.replace("{colorName}", colorName).replace("{hex}", hex);
  const out: Buffer[] = [];
  for (let i = 0; i < count; i++) {
    const result = await generateHeroImageFromReferenceWithMask({
      referenceImagePath: basePath,
      maskPath,
      prompt,
      size: "1024x1024",
    });
    out.push(result.buffer);
    if (i < count - 1) await sleep(DELAY_MS);
  }
  return out;
}

function pickBestCandidate(
  results: { buffer: Buffer; qa: QAResult }[]
): { buffer: Buffer; qa: QAResult } | null {
  const passed = results.filter((r) => r.qa.pass);
  if (passed.length === 0) return null;
  passed.sort((a, b) => a.qa.deltaE - b.qa.deltaE);
  return passed[0];
}

async function buildPreviewGrid(
  slug: string,
  basePath: string,
  variants: { colorName: string; path: string }[]
): Promise<void> {
  await mkdir(PREVIEW_DIR, { recursive: true });
  const baseBuf = await readFile(basePath);
  const baseMeta = await sharp(baseBuf).metadata();
  const w = baseMeta.width!;
  const h = baseMeta.height!;
  const thumbW = Math.min(400, w);
  const thumbH = Math.round((h * thumbW) / w);
  const cols = Math.min(4, 1 + variants.length);
  const rows = Math.ceil((1 + variants.length) / cols);
  const padding = 8;
  const totalW = cols * thumbW + (cols + 1) * padding;
  const totalH = rows * thumbH + (rows + 1) * padding;

  const composites: sharp.OverlayOptions[] = [];
  let idx = 0;
  const addThumb = async (buf: Buffer) => {
    const x = padding + (idx % cols) * (thumbW + padding);
    const y = padding + Math.floor(idx / cols) * (thumbH + padding);
    const thumb = await sharp(buf)
      .resize(thumbW, thumbH, { fit: "inside" })
      .extend({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();
    composites.push({ input: thumb, left: x, top: y });
    idx++;
  };

  await addThumb(baseBuf);
  for (const v of variants) {
    try {
      const buf = await readFile(v.path);
      await addThumb(buf);
    } catch {
      /* skip missing */
    }
  }

  const outPath = path.join(PREVIEW_DIR, `${slug}-preview.jpg`);
  let baseImg = sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 3,
      background: { r: 240, g: 240, b: 240, alpha: 1 },
    },
  });
  for (const c of composites) {
    baseImg = baseImg.composite([c]);
  }
  await baseImg.jpeg({ quality: 88 }).toFile(outPath);
  console.log(`Preview: ${outPath}`);
}

async function main() {
  const [products, details] = await Promise.all([readProducts(), readProductDetails()]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const slugs = SLUG_FILTER
    ? (FEED_SLUGS.has(SLUG_FILTER) ? [SLUG_FILTER] : [])
    : Array.from(FEED_SLUGS);

  await ensureLogHeader();

  const previewVariantsBySlug = new Map<string, { colorName: string; path: string }[]>();

  for (const slug of slugs) {
    const product = productBySlug.get(slug);
    const basePath = getBaseHeroPath(slug, details, product?.image);
    if (!basePath) {
      console.warn(`Skip ${slug}: no base hero`);
      continue;
    }
    try {
      await readFile(basePath);
    } catch {
      console.warn(`Skip ${slug}: base image not found`);
      continue;
    }
    const maskPath = getMaskPath(slug);
    if (!(await maskExists(slug))) {
      console.warn(`Skip ${slug}: mask not found at ${maskPath}. Create assets/masks/${slug}-mask.png (white=upholstery).`);
      continue;
    }

    const colors = getColorsWithHex(slug, details);
    const filtered =
      COLOR_FILTER ?
        colors.filter((c) => c.name.toLowerCase() === COLOR_FILTER.toLowerCase())
      : colors;
    if (filtered.length === 0) {
      console.warn(`Skip ${slug}: no colors with hex`);
      continue;
    }

    const variantPaths: { colorName: string; path: string }[] = [];
    const publicDir = path.join(process.cwd(), "public");

    for (const { name: colorName, hex } of filtered) {
      const colorSlug = colorToSlug(colorName);
      const relPath = getColorVariantHeroPath(slug, colorName).replace(/^\//, "");
      const outPath = path.join(publicDir, relPath);
      const outputUrl = `/${relPath}`;

      const existingPass = async (): Promise<boolean> => {
        try {
          const qa = await runQA(basePath, outPath, maskPath, hex);
          return qa.pass;
        } catch {
          return false;
        }
      };

      if (!DRY_RUN) {
        try {
          const exists = await readFile(outPath).then(() => true).catch(() => false);
          if (exists && !FORCE && (await existingPass())) {
            console.log(`Skip (exists + QA pass): ${slug} / ${colorName}`);
            variantPaths.push({ colorName, path: outPath });
            await logRun(slug, colorName, hex, outputUrl, true, 0, 0);
            continue;
          }
        } catch {
          /* continue to generate */
        }
      }

      if (DRY_RUN) {
        console.log(`[dry-run] would generate ${slug} / ${colorName} -> ${relPath}`);
        continue;
      }

      let bestBuffer: Buffer | null = null;
      let bestQa: QAResult | null = null;
      const tmpDir = path.join(process.cwd(), "tmp", "color-variants", slug, colorSlug);
      await mkdir(tmpDir, { recursive: true });

      try {
        const candidateBuffers = await generateCandidates(
          basePath,
          maskPath,
          colorName,
          hex,
          NUM_CANDIDATES
        );
        const results: { buffer: Buffer; qa: QAResult }[] = [];
        for (let i = 0; i < candidateBuffers.length; i++) {
          const tmpPath = path.join(tmpDir, `candidate-${i}.png`);
          await writeFile(tmpPath, candidateBuffers[i]);
          const qa = await runQA(basePath, tmpPath, maskPath, hex);
          results.push({ buffer: candidateBuffers[i], qa });
          console.log(
            `  candidate ${i}: pass=${qa.pass} ΔE=${qa.deltaE.toFixed(1)} outsideDiff=${qa.outsideMaskDiff.toFixed(1)} ${qa.message ?? ""}`
          );
        }
        const best = pickBestCandidate(results);
        if (best) {
          bestBuffer = best.buffer;
          bestQa = best.qa;
        }
      } catch (err) {
        console.warn(`  AI candidates failed for ${slug}/${colorName}:`, err instanceof Error ? err.message : err);
      }

      if (!bestBuffer || !bestQa?.pass) {
        try {
          const recolorBuffer = await recolorInMask(basePath, maskPath, hex);
          const recolorPath = path.join(tmpDir, "recolor.png");
          await writeFile(recolorPath, recolorBuffer);
          const polishResult = await generateHeroImageFromReferenceWithMask({
            referenceImagePath: recolorPath,
            maskPath,
            prompt: POLISH_PROMPT_TEMPLATE.replace("{colorName}", colorName),
            size: "1024x1024",
          });
          const polishPath = path.join(tmpDir, "polish.png");
          await writeFile(polishPath, polishResult.buffer);
          const qa = await runQA(basePath, polishPath, maskPath, hex);
          if (qa.pass) {
            bestBuffer = polishResult.buffer;
            bestQa = qa;
          }
        } catch (fallbackErr) {
          console.warn(`  Fallback recolor+polish failed:`, fallbackErr instanceof Error ? fallbackErr.message : fallbackErr);
        }
      }

      if (bestBuffer && bestQa?.pass) {
        await mkdir(path.dirname(outPath), { recursive: true });
        await sharp(bestBuffer)
          .jpeg({ quality: 92 })
          .toFile(outPath);
        console.log(`OK ${slug} / ${colorName} -> ${relPath} (ΔE=${bestQa.deltaE.toFixed(1)})`);
        variantPaths.push({ colorName, path: outPath });
        await logRun(
          slug,
          colorName,
          hex,
          outputUrl,
          true,
          bestQa.deltaE,
          bestQa.outsideMaskDiff
        );
      } else {
        console.warn(`NEEDS MANUAL REVIEW: ${slug} / ${colorName} (QA did not pass). Do NOT publish.`);
        await logRun(
          slug,
          colorName,
          hex,
          "",
          false,
          bestQa?.deltaE ?? 0,
          bestQa?.outsideMaskDiff ?? 0
        );
      }

      await sleep(DELAY_MS);
    }

    if (variantPaths.length > 0 && !DRY_RUN) {
      try {
        await buildPreviewGrid(slug, basePath, variantPaths);
      } catch (e) {
        console.warn("Preview grid failed:", e);
      }
    }
  }

  console.log("\nDone. Check /tmp/variant-previews/ and logs/color-variants.csv.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
