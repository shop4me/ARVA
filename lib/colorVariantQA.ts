/**
 * QA for color-variant hero images.
 * 1) Background invariance: diff outside mask must be small.
 * 2) Upholstery change: diff inside mask must be above threshold.
 * 3) Color accuracy: average ΔE inside mask to target hex (excluding extreme luminance).
 * 4) Artifact check: no severe banding/posterization in masked region.
 */

import { readFile } from "fs/promises";
import sharp from "sharp";
import { getMaskPixels } from "./maskUtils";

export interface QAResult {
  pass: boolean;
  backgroundInvariancePass: boolean;
  upholsteryChangePass: boolean;
  colorAccuracyPass: boolean;
  artifactPass: boolean;
  outsideMaskDiff: number;
  insideMaskDiff: number;
  deltaE: number;
  artifactScore: number;
  message?: string;
}

/** Max mean absolute difference (0–255) outside mask to consider background unchanged. */
const BACKGROUND_DIFF_THRESHOLD = 12;
/** Min mean absolute difference inside mask to consider color actually changed. */
const UPHOLSTERY_DIFF_MIN = 8;
/** Max average ΔE to target for pass (lower is better). Studio lighting/shading makes ~55 acceptable. */
const DELTA_E_THRESHOLD = 55;
/** Luminance range to sample for ΔE: exclude very highlights/shadows. */
const LUMINANCE_MIN = 25;
const LUMINANCE_MAX = 230;
/** Artifact: max ratio of unique values to bins (banding = few unique values). */
const ARTIFACT_BINS = 32;
const ARTIFACT_MIN_UNIQUE_RATIO = 0.4;

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rn = r / 255;
  let gn = g / 255;
  let bn = b / 255;
  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;
  const x = rn * 0.4124564 + gn * 0.3575761 + bn * 0.1804375;
  const y = rn * 0.2126729 + gn * 0.7151522 + bn * 0.072175;
  const z = rn * 0.0193339 + gn * 0.119192 + bn * 0.9503041;
  const xn = x / 0.95047;
  const yn = y / 1.0;
  const zn = z / 1.08883;
  const fx = xn > 0.008856 ? Math.pow(xn, 1 / 3) : 7.787 * xn + 16 / 116;
  const fy = yn > 0.008856 ? Math.pow(yn, 1 / 3) : 7.787 * yn + 16 / 116;
  const fz = zn > 0.008856 ? Math.pow(zn, 1 / 3) : 7.787 * zn + 16 / 116;
  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);
  return [L, a, bLab];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

function deltaE76(
  L1: number,
  a1: number,
  b1: number,
  L2: number,
  a2: number,
  b2: number
): number {
  return Math.sqrt((L2 - L1) ** 2 + (a2 - a1) ** 2 + (b2 - b1) ** 2);
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Resize candidate to match original dimensions if needed, then compute pixel diffs.
 */
async function loadImagePixels(
  imagePath: string,
  width: number,
  height: number
): Promise<{ data: Uint8Array; channels: number }> {
  const buf = await readFile(imagePath);
  const { data, info } = await sharp(buf)
    .resize(width, height, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: new Uint8Array(data), channels: info.channels };
}

/**
 * Run full QA on a candidate image.
 * originalPath: base hero image path.
 * candidatePath: generated variant path.
 * maskPath: path to mask PNG (white = upholstery).
 * targetHex: e.g. "#374151".
 */
export async function runQA(
  originalPath: string,
  candidatePath: string,
  maskPath: string,
  targetHex: string
): Promise<QAResult> {
  const mask = await getMaskPixels(maskPath);
  const origMeta = await sharp(await readFile(originalPath)).metadata();
  const w = origMeta.width!;
  const h = origMeta.height!;

  const [origPx, candPx] = await Promise.all([
    loadImagePixels(originalPath, w, h),
    loadImagePixels(candidatePath, w, h),
  ]);

  const maskData = mask.data;
  const maskW = mask.width;
  const maskH = mask.height;
  const scaleX = maskW / w;
  const scaleY = maskH / h;

  let outsideSum = 0;
  let outsideCount = 0;
  let insideSum = 0;
  let insideCount = 0;

  const targetRgb = hexToRgb(targetHex);
  const [targetL, targetA, targetB] = rgbToLab(targetRgb[0], targetRgb[1], targetRgb[2]);

  let deltaESum = 0;
  let deltaECount = 0;
  const insideR: number[] = [];
  const insideG: number[] = [];
  const insideB: number[] = [];

  const co = origPx.channels;
  const cc = candPx.channels;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const mx = Math.min(Math.floor(x * scaleX), maskW - 1);
      const my = Math.min(Math.floor(y * scaleY), maskH - 1);
      const mi = my * maskW + mx;
      const isUpholstery = maskData[mi] === 1;

      const oi = (y * w + x) * co;
      const ci = (y * w + x) * cc;
      const rO = origPx.data[oi] ?? 0;
      const gO = origPx.data[oi + 1] ?? 0;
      const bO = origPx.data[oi + 2] ?? 0;
      const rC = candPx.data[ci] ?? 0;
      const gC = candPx.data[ci + 1] ?? 0;
      const bC = candPx.data[ci + 2] ?? 0;

      const diff = (Math.abs(rC - rO) + Math.abs(gC - gO) + Math.abs(bC - bO)) / 3;

      if (isUpholstery) {
        insideSum += diff;
        insideCount++;
        const lum = luminance(rC, gC, bC);
        if (lum >= LUMINANCE_MIN && lum <= LUMINANCE_MAX) {
          const [L, a, b] = rgbToLab(rC, gC, bC);
          deltaESum += deltaE76(L, a, b, targetL, targetA, targetB);
          deltaECount++;
        }
        insideR.push(rC);
        insideG.push(gC);
        insideB.push(bC);
      } else {
        outsideSum += diff;
        outsideCount++;
      }
    }
  }

  const outsideMaskDiff = outsideCount > 0 ? outsideSum / outsideCount : 0;
  const insideMaskDiff = insideCount > 0 ? insideSum / insideCount : 0;
  const deltaE = deltaECount > 0 ? deltaESum / deltaECount : 999;

  const backgroundInvariancePass = outsideMaskDiff <= BACKGROUND_DIFF_THRESHOLD;
  const upholsteryChangePass = insideMaskDiff >= UPHOLSTERY_DIFF_MIN;
  const colorAccuracyPass = deltaE <= DELTA_E_THRESHOLD;

  let artifactScore = 1;
  if (insideR.length > 100) {
    const allVals = [...insideR, ...insideG, ...insideB];
    const unique = new Set(allVals).size;
    const maxUnique = ARTIFACT_BINS * 3;
    artifactScore = unique / maxUnique;
  }
  const artifactPass = artifactScore >= ARTIFACT_MIN_UNIQUE_RATIO;

  const pass =
    backgroundInvariancePass && upholsteryChangePass && colorAccuracyPass && artifactPass;

  return {
    pass,
    backgroundInvariancePass,
    upholsteryChangePass,
    colorAccuracyPass,
    artifactPass,
    outsideMaskDiff,
    insideMaskDiff,
    deltaE,
    artifactScore,
    message: pass
      ? undefined
      : [
          !backgroundInvariancePass && `background changed (diff=${outsideMaskDiff.toFixed(1)})`,
          !upholsteryChangePass && `upholstery unchanged (diff=${insideMaskDiff.toFixed(1)})`,
          !colorAccuracyPass && `color off (ΔE=${deltaE.toFixed(1)})`,
          !artifactPass && `artifacts (score=${artifactScore.toFixed(2)})`,
        ]
          .filter(Boolean)
          .join("; "),
  };
}
