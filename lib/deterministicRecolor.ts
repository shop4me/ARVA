/**
 * Deterministic recolor inside mask: preserve luminance (shading), shift chroma/hue toward target.
 * Used as fail-safe when masked AI edit fails QA repeatedly.
 */

import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getMaskPixels } from "./maskUtils";

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

const REF_X = 95.047;
const REF_Y = 100;
const REF_Z = 108.883;

function labToRgb(L: number, a: number, b: number): [number, number, number] {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const x = fx > 0.206897 ? REF_X * Math.pow(fx, 3) : REF_X * (fx - 16 / 116) / 7.787;
  const y = fy > 0.206897 ? REF_Y * Math.pow(fy, 3) : REF_Y * (fy - 16 / 116) / 7.787;
  const z = fz > 0.206897 ? REF_Z * Math.pow(fz, 3) : REF_Z * (fz - 16 / 116) / 7.787;
  let rn = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let gn = x * -0.969266 + y * 1.8760108 + z * 0.041556;
  let bn = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
  rn = rn > 0.0031308 ? 1.055 * Math.pow(rn, 1 / 2.4) - 0.055 : 12.92 * rn;
  gn = gn > 0.0031308 ? 1.055 * Math.pow(gn, 1 / 2.4) - 0.055 : 12.92 * gn;
  bn = bn > 0.0031308 ? 1.055 * Math.pow(bn, 1 / 2.4) - 0.055 : 12.92 * bn;
  const r = Math.round(Math.max(0, Math.min(255, rn * 255)));
  const g = Math.round(Math.max(0, Math.min(255, gn * 255)));
  const bl = Math.round(Math.max(0, Math.min(255, bn * 255)));
  return [r, g, bl];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Apply deterministic recolor: inside mask, keep L from original, replace a,b with target's a,b
 * (optionally blended for softer shift). Output PNG buffer.
 */
export async function recolorInMask(
  imagePath: string,
  maskPath: string,
  targetHex: string,
  options?: { blend?: number }
): Promise<Buffer> {
  const blend = options?.blend ?? 1;
  const [imageBuf, mask] = await Promise.all([
    readFile(imagePath),
    getMaskPixels(maskPath),
  ]);
  const targetRgb = hexToRgb(targetHex);
  const [targetL, targetA, targetB] = rgbToLab(targetRgb[0], targetRgb[1], targetRgb[2]);

  const { data: imgData, info } = await sharp(imageBuf)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const w = info.width!;
  const h = info.height!;
  const ch = info.channels;

  const maskW = mask.width;
  const maskH = mask.height;
  const scaleX = maskW / w;
  const scaleY = maskH / h;
  const maskData = mask.data;

  const out = Buffer.from(imgData);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const mx = Math.min(Math.floor(x * scaleX), maskW - 1);
      const my = Math.min(Math.floor(y * scaleY), maskH - 1);
      if (maskData[my * maskW + mx] !== 1) continue;

      const i = (y * w + x) * ch;
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const [L, a, bLab] = rgbToLab(r, g, b);
      const aNew = a + (targetA - a) * blend;
      const bNew = bLab + (targetB - bLab) * blend;
      const [rOut, gOut, bOut] = labToRgb(L, aNew, bNew);
      out[i] = rOut;
      out[i + 1] = gOut;
      out[i + 2] = bOut;
    }
  }

  return sharp(out, { raw: { width: w, height: h, channels: ch as 3 | 4 } })
    .png()
    .toBuffer();
}
