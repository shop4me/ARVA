/**
 * Copy Atlas color images (colorVariantHeros + fabricHeroFallbacks) to Oris for all 3 sizes.
 * Creates new WebP copies under oris-* folders with keyword-rich oris filenames; updates productDetails.json.
 *
 * Run from repo root: npx tsx scripts/copy_atlas_color_images_to_oris.ts
 */

import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const PRODUCT_DETAILS_PATH = "data/productDetails.json";
const PUBLIC_IMAGES = "public/images/products";

type ProductDetails = Record<
  string,
  {
    images?: {
      hero?: string;
      fabricHeroFallbacks?: Record<string, string>;
      colorVariantHeros?: Record<string, string>;
      [k: string]: unknown;
    };
  }
>;

const SIZE_PAIRS: [string, string][] = [
  ["atlas-sectional", "oris-sectional"],
  ["atlas-3-seater", "oris-3-seater"],
  ["atlas-loveseat", "oris-loveseat"],
];

/** Replace atlas slug with oris slug in path (and in filename). */
function atlasPathToOrisPath(webPath: string, atlasSlug: string, orisSlug: string): string {
  return webPath
    .replace(new RegExp(`/images/products/${atlasSlug}/`, "g"), `/images/products/${orisSlug}/`)
    .replace(new RegExp(atlasSlug.replace(/-/g, "-"), "g"), orisSlug);
}

/** Same but for filenames: atlas-sectional -> oris-sectional. */
function atlasFilenameToOrisFilename(filename: string, atlasSlug: string, orisSlug: string): string {
  return filename.split("/").pop()!.replace(new RegExp(atlasSlug.replace(/-/g, "\\-"), "g"), orisSlug);
}

async function main() {
  const root = process.cwd();
  const detailsRaw = await readFile(path.join(root, PRODUCT_DETAILS_PATH), "utf-8");
  const details = JSON.parse(detailsRaw) as ProductDetails;

  for (const [atlasSlug, orisSlug] of SIZE_PAIRS) {
    const atlasProduct = details[atlasSlug];
    const orisProduct = details[orisSlug];
    if (!atlasProduct?.images?.colorVariantHeros) {
      console.warn(`Skip ${atlasSlug}: no colorVariantHeros`);
      continue;
    }
    if (!orisProduct?.images) {
      console.warn(`Skip ${orisSlug}: no images`);
      continue;
    }

    const colorVariantHeros = atlasProduct.images.colorVariantHeros as Record<string, string>;
    const fabricHeroFallbacks = (atlasProduct.images.fabricHeroFallbacks || {}) as Record<string, string>;

    const newColorVariantHeros: Record<string, string> = {};
    const newFabricHeroFallbacks: Record<string, string> = {};
    for (const [colorName, webPath] of Object.entries(colorVariantHeros)) {
      newColorVariantHeros[colorName] = atlasPathToOrisPath(webPath, atlasSlug, orisSlug);
    }
    for (const [colorName, webPath] of Object.entries(fabricHeroFallbacks)) {
      newFabricHeroFallbacks[colorName] = atlasPathToOrisPath(webPath, atlasSlug, orisSlug);
    }

    await mkdir(path.join(root, PUBLIC_IMAGES, orisSlug), { recursive: true });

    // Copy each unique source file to oris path (new copy)
    const copiedPaths = new Set<string>();
    for (const [colorName, webPath] of Object.entries(colorVariantHeros)) {
      const newWebPath = atlasPathToOrisPath(webPath, atlasSlug, orisSlug);
      const srcAbs = path.join(root, "public", webPath.slice(1));
      const destAbs = path.join(root, "public", newWebPath.slice(1));
      if (copiedPaths.has(srcAbs)) continue;
      copiedPaths.add(srcAbs);
      try {
        await mkdir(path.dirname(destAbs), { recursive: true });
        await copyFile(srcAbs, destAbs);
        console.log(`Copied ${path.basename(srcAbs)} -> ${path.basename(destAbs)} (${orisSlug})`);
      } catch (e) {
        console.warn(`Copy failed ${srcAbs} -> ${destAbs}:`, e);
      }
    }
    for (const [colorName, webPath] of Object.entries(fabricHeroFallbacks)) {
      const newWebPath = atlasPathToOrisPath(webPath, atlasSlug, orisSlug);
      const srcAbs = path.join(root, "public", webPath.slice(1));
      const destAbs = path.join(root, "public", newWebPath.slice(1));
      if (copiedPaths.has(srcAbs)) continue;
      copiedPaths.add(srcAbs);
      try {
        await mkdir(path.dirname(destAbs), { recursive: true });
        await copyFile(srcAbs, destAbs);
        console.log(`Copied ${path.basename(srcAbs)} -> ${path.basename(destAbs)} (${orisSlug})`);
      } catch (e) {
        console.warn(`Copy failed ${srcAbs} -> ${destAbs}:`, e);
      }
    }

    // Update productDetails.json for this oris product
    if (!orisProduct.images) orisProduct.images = {};
    orisProduct.images.fabricHeroFallbacks = newFabricHeroFallbacks;
    orisProduct.images.colorVariantHeros = newColorVariantHeros;
    console.log(`Updated productDetails.json: ${orisSlug} fabricHeroFallbacks + colorVariantHeros`);
  }

  await writeFile(path.join(root, PRODUCT_DETAILS_PATH), JSON.stringify(details, null, 2), "utf-8");
  console.log("Done. productDetails.json written.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
