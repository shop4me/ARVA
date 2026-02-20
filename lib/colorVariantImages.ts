/**
 * Color-accurate product image variants.
 * Convention: one static image per product × color, generated once and cached.
 * Path: /images/products/{slug}/{slug}-{colorSlug}.jpg
 */

/** Normalize color name to URL-safe slug (e.g. "Light Gray" -> "light-gray"). */
export function colorToSlug(color: string): string {
  return color.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "taupe";
}

/**
 * Path for a product's color-variant hero image (static file).
 * Use this for website hero swap and feed image_link.
 * Atlas Sectional uses Cloud Couch hero WebPs: atlas-sectional-cloud-couch-{colorSlug}-hero-01.webp
 */
export function getColorVariantHeroPath(slug: string, colorName: string): string {
  const colorSlug = colorToSlug(colorName);
  if (slug === "atlas-sectional") {
    return `/images/products/atlas-sectional/atlas-sectional-cloud-couch-${colorSlug}-hero-01.webp`;
  }
  return `/images/products/${slug}/${slug}-${colorSlug}.jpg`;
}
