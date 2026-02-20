/**
 * Mask convention: PNG with white = upholstery (region to recolor), black = everything else.
 * OpenAI edits API expects: transparent pixels = area to edit, opaque = keep.
 * So we convert: white -> transparent, black -> opaque (black) for the API mask.
 */

import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export const MASKS_DIR = path.join(process.cwd(), "assets", "masks");
export const MASK_PREVIEW_DIR = "/tmp/mask-previews";

/** Mask filename per slug: e.g. atlas-sectional-mask.png */
export function getMaskPath(slug: string): string {
  return path.join(MASKS_DIR, `${slug}-mask.png`);
}

/** Check if mask file exists for slug. */
export async function maskExists(slug: string): Promise<boolean> {
  const p = getMaskPath(slug);
  try {
    await readFile(p);
    return true;
  } catch {
    return false;
  }
}

/** Upholstery = white (or high luminance). Threshold: luminance > 127 = upholstery. */
const UPHOLSTERY_THRESHOLD = 127;

/**
 * Convert internal mask (white=upholstery, black=else) to API mask:
 * transparent = edit (upholstery), opaque black = keep.
 * Returns PNG buffer suitable for OpenAI edits.
 */
export async function maskToApiFormat(maskPath: string): Promise<Buffer> {
  const raw = await readFile(maskPath);
  const { data, info } = await sharp(raw)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const w = info.width;
  const h = info.height;
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * channels] ?? 0;
    const g = data[channels === 1 ? i : i * channels + 1] ?? 0;
    const b = data[channels === 1 ? i : i * channels + 2] ?? 0;
    const luminance = (r + g + b) / (channels === 1 ? 1 : 3);
    const isUpholstery = luminance > UPHOLSTERY_THRESHOLD;
    const o = i * 4;
    out[o] = 0;
    out[o + 1] = 0;
    out[o + 2] = 0;
    out[o + 3] = isUpholstery ? 0 : 255;
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();
}

/**
 * Get binary mask as 0/1 per pixel (1 = upholstery). Same dimensions as image.
 * maskBuffer: raw mask PNG bytes (white=upholstery).
 */
export async function getMaskPixels(maskPath: string): Promise<{ data: Uint8Array; width: number; height: number }> {
  const raw = await readFile(maskPath);
  const { data, info } = await sharp(raw)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const v = data[i] ?? 0;
    out[i] = v > UPHOLSTERY_THRESHOLD ? 1 : 0;
  }
  return { data: out, width: w, height: h };
}
