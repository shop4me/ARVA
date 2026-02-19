/**
 * Arva promo pricing: single source of truth for REGULAR (compare-at) and SALE (charged) prices.
 * Used by: website PDP/cart/checkout and Google Merchant feed.
 * Buckets: LINE + CONFIG (Atlas Sectional, Atlas 3-Seater, …).
 */

export type LineConfigKey =
  | "Atlas-Sectional"
  | "Atlas-3 Seat"
  | "Atlas-Loveseat"
  | "Alto-Sectional"
  | "Alto-3 Seat"
  | "Alto-Loveseat"
  | "Oris-Sectional"
  | "Oris-3 Seat"
  | "Oris-Loveseat";

/** Regular price (crossed out on PDP; g:price in feed). */
export const REGULAR_PRICE_BY_LINE_CONFIG: Record<LineConfigKey, number> = {
  "Atlas-Sectional": 2499,
  "Atlas-3 Seat": 2199,
  "Atlas-Loveseat": 1699,
  "Alto-Sectional": 4095.0,
  "Alto-3 Seat": 3795.0,
  "Alto-Loveseat": 2495.0,
  "Oris-Sectional": 3195.0,
  "Oris-3 Seat": 2795.0,
  "Oris-Loveseat": 2195.0,
};

/** Sale price (what customer pays; g:sale_price in feed). */
export const SALE_PRICE_BY_LINE_CONFIG: Record<LineConfigKey, number> = {
  "Atlas-Sectional": 1299.0,
  "Atlas-3 Seat": 1199.0,
  "Atlas-Loveseat": 999.0,
  "Alto-Sectional": 1599.0,
  "Alto-3 Seat": 1599.0,
  "Alto-Loveseat": 999.0,
  "Oris-Sectional": 1999.0,
  "Oris-3 Seat": 1499.0,
  "Oris-Loveseat": 1499.0,
};

const BUCKET_ORDER: LineConfigKey[] = [
  "Atlas-Sectional",
  "Atlas-3 Seat",
  "Atlas-Loveseat",
  "Alto-Sectional",
  "Alto-3 Seat",
  "Alto-Loveseat",
  "Oris-Sectional",
  "Oris-3 Seat",
  "Oris-Loveseat",
];

function lineNameFromSlug(slug: string): string {
  if (slug.startsWith("atlas-")) return "Atlas";
  if (slug.startsWith("alto-")) return "Alto";
  if (slug.startsWith("oris-")) return "Oris";
  const first = slug.split("-")[0];
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
}

function configFromSlug(slug: string): "Sectional" | "3 Seat" | "Loveseat" | "Sofa" {
  if (slug.includes("sectional")) return "Sectional";
  if (slug.includes("3-seater") || slug.includes("3-seat")) return "3 Seat";
  if (slug.includes("loveseat")) return "Loveseat";
  return "Sofa";
}

/** Bucket key for a product slug (e.g. atlas-sectional -> "Atlas-Sectional"). */
export function getBucketFromSlug(slug: string): LineConfigKey | null {
  const line = lineNameFromSlug(slug);
  const config = configFromSlug(slug);
  if (config === "Sofa") return null;
  const key = `${line}-${config}` as LineConfigKey;
  return BUCKET_ORDER.includes(key) ? key : null;
}

export function getRegularPrice(slug: string): number | null {
  const bucket = getBucketFromSlug(slug);
  if (!bucket) return null;
  return REGULAR_PRICE_BY_LINE_CONFIG[bucket] ?? null;
}

export function getSalePrice(slug: string): number | null {
  const bucket = getBucketFromSlug(slug);
  if (!bucket) return null;
  return SALE_PRICE_BY_LINE_CONFIG[bucket] ?? null;
}

export interface SafetyRow {
  bucket: string;
  regular: number;
  sale: number;
  discountPct: number;
  flagLowRegularHighSale: boolean;
  flagSaleGteRegular: boolean;
}

export interface SafetyResult {
  ok: boolean;
  table: SafetyRow[];
  message?: string;
}

/** Run safety check. If any bucket has regular < 100 and sale > 900, or sale >= regular, ok is false. */
export function runSafetyCheck(): SafetyResult {
  const table: SafetyRow[] = BUCKET_ORDER.map((bucket) => {
    const regular = REGULAR_PRICE_BY_LINE_CONFIG[bucket];
    const sale = SALE_PRICE_BY_LINE_CONFIG[bucket];
    const discountPct = regular > 0 ? Math.round(((regular - sale) / regular) * 100) : 0;
    const flagLowRegularHighSale = regular < 100 && sale > 900;
    const flagSaleGteRegular = sale >= regular;
    return {
      bucket,
      regular,
      sale,
      discountPct,
      flagLowRegularHighSale,
      flagSaleGteRegular,
    };
  });

  const hasSuspicious = table.some((r) => r.flagLowRegularHighSale || r.flagSaleGteRegular);
  return {
    ok: !hasSuspicious,
    table,
    message: hasSuspicious
      ? "Price map appears inconsistent; requires confirmation."
      : undefined,
  };
}

let safetyChecked: SafetyResult | null = null;

function getSafetyResult(): SafetyResult {
  if (safetyChecked == null) safetyChecked = runSafetyCheck();
  return safetyChecked;
}

/** Whether it is safe to use promo prices (no suspicious buckets). */
export function isPromoPricingSafe(): boolean {
  return getSafetyResult().ok;
}

/**
 * Sale price to use for display and cart/checkout.
 * If safety check fails, returns product's base price (no promo).
 */
export function getEffectiveSalePrice(slug: string, fallbackPrice: number): number {
  if (!getSafetyResult().ok) return fallbackPrice;
  const sale = getSalePrice(slug);
  return sale ?? fallbackPrice;
}

/**
 * Compare-at (regular) price for strikethrough display. Null if no promo or unsafe.
 */
export function getEffectiveCompareAtPrice(slug: string): number | null {
  if (!getSafetyResult().ok) return null;
  return getRegularPrice(slug);
}
