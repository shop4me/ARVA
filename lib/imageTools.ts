import { promises as fs } from "fs";
import { imageSize } from "image-size";
import sharp from "sharp";

export async function getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
  const buffer = await fs.readFile(filePath);
  const dims = imageSize(buffer);
  if (!dims.width || !dims.height) throw new Error(`Cannot determine image dimensions: ${filePath}`);
  return { width: dims.width, height: dims.height };
}

export async function writeWebpHero(opts: {
  inputPngPath: string;
  outputWebpPath: string;
  minWidth: number;
  minHeight: number;
  finalWidth: number;
  finalHeight: number;
}): Promise<{ width: number; height: number }> {
  // Convert to 16:9 hero size. If input is smaller, upscale.
  await sharp(opts.inputPngPath)
    .resize(opts.finalWidth, opts.finalHeight, { fit: "cover", position: "centre" })
    .webp({ quality: 88 })
    .toFile(opts.outputWebpPath);

  const dims = await getImageDimensions(opts.outputWebpPath);
  if (dims.width < opts.minWidth || dims.height < opts.minHeight) {
    throw new Error(
      `Hero image too small after conversion: ${dims.width}x${dims.height} (min ${opts.minWidth}x${opts.minHeight})`
    );
  }
  return dims;
}

