/**
 * Google Merchant Center feed generation with compliance hardening.
 */

import { promises as fs } from "fs";
import path from "path";
import { imageSize } from "image-size";
import type { Product } from "./content";
import type { ProductDetailData, ProductDetailImages } from "./productDetail";
import {
  getRegularPrice,
  getSalePrice,
  runSafetyCheck,
} from "./pricing";

export type ConfigType = "Sectional" | "3 Seat" | "Loveseat" | "Sofa";

export interface MerchantItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link: string[];
  availability: "in_stock" | "out_of_stock" | "preorder";
  price: string;
  /** Sale price: same currency as price; derived from LINE+CONFIG map. */
  sale_price: string;
  condition: "new";
  brand: string;
  mpn: string;
  product_type: string;
  google_product_category: string;
  material: string;
  /** Free shipping: US + Canada. */
  shipping: { country: string; service: string; price: string }[];
  /** Exactly 3 highlights per item. */
  product_highlight: string[];
  item_group_id: string;
  color?: string;
  size: string;
  custom_label_0: string;
  custom_label_1: string;
  custom_label_2: string;
  custom_label_3: string;
  custom_label_4: string;
  room: string;
  style: string;
  identifier_exists: boolean;
  /** Google product_detail blocks (Overall Dimensions, Seat Height, Side Height). */
  product_detail: { attribute_name: string; attribute_value: string }[];
}

/** Exact dimension specs by line + config (inches). No invented values. */
const DIMENSIONS_BY_LINE_CONFIG: Record<string, { attribute_name: string; attribute_value: string }[]> = {
  "Atlas-Sectional": [
    { attribute_name: "Overall Dimensions", attribute_value: "102 in W × 65 in D × 25 in H" },
    { attribute_name: "Seat Height", attribute_value: "15 in" },
  ],
  "Atlas-3 Seat": [
    { attribute_name: "Overall Dimensions", attribute_value: "102 in W × 38 in D × 25 in H" },
    { attribute_name: "Seat Height", attribute_value: "15 in" },
    { attribute_name: "Side Height", attribute_value: "20 in" },
  ],
  "Atlas-Loveseat": [
    { attribute_name: "Overall Dimensions", attribute_value: "75 in W × 38 in D × 25 in H" },
    { attribute_name: "Seat Height", attribute_value: "15 in" },
  ],
  "Alto-Sectional": [
    { attribute_name: "Overall Dimensions", attribute_value: "116 in W × 78 in D × 33 in H" },
    { attribute_name: "Seat Height", attribute_value: "18 in" },
  ],
  "Alto-3 Seat": [
    { attribute_name: "Overall Dimensions", attribute_value: "116 in W × 39 in D" },
    { attribute_name: "Seat Height", attribute_value: "18 in" },
  ],
  "Alto-Loveseat": [
    { attribute_name: "Overall Dimensions", attribute_value: "78 in W × 40 in D" },
    { attribute_name: "Seat Height", attribute_value: "13–19 in (adjustable)" },
  ],
  "Oris-Sectional": [
    { attribute_name: "Overall Dimensions", attribute_value: "102 in W × 65 in D × 25 in H" },
    { attribute_name: "Seat Height", attribute_value: "15 in" },
  ],
  "Oris-3 Seat": [
    { attribute_name: "Overall Dimensions", attribute_value: "102 in W × 38 in D × 25 in H" },
    { attribute_name: "Seat Height", attribute_value: "15 in" },
  ],
  "Oris-Loveseat": [
    { attribute_name: "Overall Dimensions", attribute_value: "75 in W × 38 in D × 25 in H" },
    { attribute_name: "Seat Height", attribute_value: "15 in" },
  ],
};

function getProductDetailForItem(line: string, config: ConfigType): { attribute_name: string; attribute_value: string }[] {
  const key = `${line}-${config}`;
  const detail = DIMENSIONS_BY_LINE_CONFIG[key];
  if (!detail) return [];
  return detail.map((d) => ({ attribute_name: d.attribute_name, attribute_value: d.attribute_value }));
}

/** Build g:price (regular) and g:sale_price (sale) from shared pricing module. */
function priceStringsForProduct(product: Product): { price: string; sale_price: string } {
  const currency = product.currency ?? "USD";
  const regular = getRegularPrice(product.slug);
  const sale = getSalePrice(product.slug);
  const price = regular != null ? `${Number(regular).toFixed(2)} ${currency}` : `${Number(product.price).toFixed(2)} ${currency}`;
  const sale_price = sale != null ? `${Number(sale).toFixed(2)} ${currency}` : "";
  return { price, sale_price };
}

/** Google product category: use numeric ID from official taxonomy (Furniture = 436). */
const GOOGLE_PRODUCT_CATEGORY = "436";

/** Free shipping: US and Canada. Single currency (USD) for all price attributes to avoid GMC "Inconsistent currencies". */
const SHIPPING_BLOCKS = [
  { country: "US", service: "Free Shipping", price: "0 USD" },
  { country: "CA", service: "Free Shipping", price: "0 USD" },
] as const;

/** Exactly 3 product highlights (wording unchanged). */
const PRODUCT_HIGHLIGHTS = [
  "Modular configuration",
  "No-tool setup",
  "Lifetime structural warranty",
] as const;

type KeywordRow = {
  keyword: string;
  intent: string;
  volume: number;
  difficulty: number;
};

const CORE_KEYWORDS = [
  "cloud couch",
  "cloud sectional",
  "cloud modular couch",
  "cloud style sofa",
  "modular cloud sofa",
];

const KEYWORD_CSV_CANDIDATE_PATHS = [
  "/mnt/data/keywords.csv",
  path.join(process.cwd(), "data", "keywords.csv"),
];

const FEED_SLUGS = new Set([
  "atlas-sectional",
  "atlas-3-seater",
  "atlas-loveseat",
  "alto-sectional",
  "alto-3-seater",
  "alto-loveseat",
  "oris-sectional",
  "oris-3-seater",
  "oris-loveseat",
]);

/** All sofa colors; one feed item per product × color. */
export const FEED_COLORS = [
  "Taupe",
  "Ivory",
  "Beige",
  "Light Gray",
  "Charcoal",
  "Camel",
  "Warm Sand",
  "Stone",
  "Olive Green",
  "Sage Green",
  "Terracotta",
  "Rust",
  "Inky Blue",
] as const;

function colorToSlug(color: string): string {
  return color.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** MPN format: ARVA-{LINE}-{CONFIG}-{COLOR}. Config slug for MPN. */
function configSlugForMpn(config: ConfigType): string {
  return config === "Sectional" ? "SECTIONAL" : config === "3 Seat" ? "3SEAT" : config === "Loveseat" ? "LOVESEAT" : "SOFA";
}

/** Color to MPN segment: no spaces/punctuation, uppercase (e.g. "Light Gray" -> "LIGHTGRAY"). */
function colorToMpnSegment(color: string): string {
  return color.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "TAUPE";
}

/** Line name (Atlas, Alto, Oris) from slug. */
function lineNameFromSlug(slug: string): string {
  if (slug.startsWith("atlas-")) return "Atlas";
  if (slug.startsWith("alto-")) return "Alto";
  if (slug.startsWith("oris-")) return "Oris";
  const first = slug.split("-")[0];
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "Sofa";
}

/** Configuration from slug. */
function configFromSlug(slug: string): ConfigType {
  if (slug.includes("sectional")) return "Sectional";
  if (slug.includes("3-seater") || slug.includes("3-seat")) return "3 Seat";
  if (slug.includes("loveseat")) return "Loveseat";
  return "Sofa";
}

/** item_group_id: same for all variants of same line + config. */
function itemGroupIdFromSlug(slug: string): string {
  const line = lineNameFromSlug(slug).toLowerCase();
  const config = configFromSlug(slug);
  const configSlug =
    config === "Sectional" ? "sectional" : config === "3 Seat" ? "3-seat" : "loveseat";
  return `${line}-${configSlug}`;
}

/** Size for g:size. */
function sizeFromConfig(config: ConfigType): string {
  if (config === "Sectional") return "Modular Sectional";
  if (config === "3 Seat") return "3 Seat Sofa";
  if (config === "Loveseat") return "Loveseat";
  return "Sofa";
}

/** product_type for Google Shopping (Living Room > Sofas > ...). */
function productTypeForShopping(config: ConfigType): string {
  if (config === "Sectional") return "Living Room > Sofas > Modular Sectionals";
  if (config === "3 Seat") return "Living Room > Sofas > Modular Sofas";
  if (config === "Loveseat") return "Living Room > Sofas > Loveseats";
  return "Living Room > Sofas";
}

const PRODUCT_TYPE_BY_CATEGORY: Record<string, string> = {
  sectional: "Furniture > Sofas > Sectionals",
  "three-seater": "Furniture > Sofas > Standard Sofas",
  loveseat: "Furniture > Sofas > Loveseats",
};

/** Fallback hero path when productDetails has no images (legacy). */
const MERCHANT_HERO_IMAGE_PATH_BY_SLUG: Record<string, string> = Object.fromEntries(
  Array.from(FEED_SLUGS).map((slug) => [slug, `/images/merchant/${slug}-hero.jpg`])
);

/**
 * Feed image_link: use JPG hero for oris-3-seater so Google Merchant Center can process reliably
 * (WebP/sand-room heroes have triggered "Image not processed" in GMC).
 */
const ORIS_3SEATER_FEED_HERO = "/images/merchant/oris-3-seater-hero.jpg";

function getHeroImagePath(product: Product, details: Record<string, ProductDetailData> | undefined): string {
  if (product.slug === "oris-3-seater") return ORIS_3SEATER_FEED_HERO;
  const hero = details?.[product.slug]?.images?.hero;
  if (hero && typeof hero === "string") return hero;
  return product.image && typeof product.image === "string" ? product.image : MERCHANT_HERO_IMAGE_PATH_BY_SLUG[product.slug];
}

/** Ordered keys for additional_image_link (site gallery order; hero is image_link, dimensionsDiagram excluded). */
const ADDITIONAL_IMAGE_KEYS: (keyof ProductDetailImages)[] = [
  "thumbnail1",
  "thumbnail2",
  "thumbnail3",
  "thumbnail4",
  "thumbnail5",
  "comfort1",
  "comfort2",
];

function getOrderedAdditionalPaths(images: ProductDetailImages | undefined): string[] {
  if (!images) return [];
  const out: string[] = [];
  for (const key of ADDITIONAL_IMAGE_KEYS) {
    const path = images[key];
    if (path && typeof path === "string") out.push(path);
  }
  return out;
}

/** Hero colors for launch (Taupe, Ivory, Light Gray, Charcoal); use custom_label_4 for bid control. */
const FEED_HERO_COLORS = new Set(["Taupe", "Ivory", "Light Gray", "Charcoal"]);

/** Canonical material: Oris => Weather-Resistant; others => Performance Fabric. */
const MATERIAL_ORIS = "Weather-Resistant Performance Weave";
const MATERIAL_DEFAULT = "Performance Fabric";

function materialForSlug(slug: string): string {
  return lineNameFromSlug(slug) === "Oris" ? MATERIAL_ORIS : MATERIAL_DEFAULT;
}

/** Preferred order for additional_image_link (angle, side, back, lifestyle, detail). */
const ADDITIONAL_IMAGE_ORDER = ["angle", "side", "back", "lifestyle", "detail"];

function sortAdditionalImageLinks(urls: string[]): string[] {
  return [...urls].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const ai = ADDITIONAL_IMAGE_ORDER.findIndex((t) => aLower.includes(t));
    const bi = ADDITIONAL_IMAGE_ORDER.findIndex((t) => bLower.includes(t));
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  });
}

export function getMerchantHeroImagePath(slug: string): string | undefined {
  return MERCHANT_HERO_IMAGE_PATH_BY_SLUG[slug];
}

function toAbsoluteUrl(baseUrl: string, value: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return value.startsWith("/") ? `${base}${value}` : `${base}/${value}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCsvValue(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function normalizeModelName(name: string): string {
  return name.replace(/^ARVA\s+/i, "").trim();
}

function selectKeywordByProduct(product: Product, keywords: string[]): string {
  const lower = keywords.map((k) => k.toLowerCase());
  if (product.category === "sectional") {
    return lower.find((k) => k.includes("sectional")) ?? "cloud sectional";
  }
  if (product.category === "three-seater") {
    return lower.find((k) => k.includes("cloud couch")) ?? "cloud couch";
  }
  return lower.find((k) => k.includes("modular")) ?? "cloud modular couch";
}

/** Default feed color when no variant color is set (required format: color last). */
const DEFAULT_FEED_COLOR = "Taupe";

/** Title: one conversion modifier (Washable Fabric), color last. Arva {Line} Modular {Config} – Cloud Style – Washable Fabric – {Color}. */
export function buildMerchantTitle(product: Product, color?: string): string {
  const slug = product.slug;
  const line = lineNameFromSlug(slug);
  const config = configFromSlug(slug);
  const productWord = config === "Loveseat" ? "" : config === "Sectional" || config === "3 Seat" ? "Sofa" : "Sofa";
  const middle = productWord ? `${config} ${productWord}` : config;
  const colorFinal = (color && color.trim()) ? color.trim() : DEFAULT_FEED_COLOR;
  return `Arva ${line} Modular ${middle} – Cloud Style – Washable Fabric – ${colorFinal}`;
}

/** Exact closing sentence required on every description. */
const DESCRIPTION_ENDING = "Lifetime structural warranty included.";

/** First-sentence trust signal for Quality Score; rest unchanged. */
const FIRST_SENTENCE_SECTIONAL =
  "Modular cloud-style sectional sofa with washable performance fabric and tool-free assembly.";
const FIRST_SENTENCE_3SEAT =
  "Modular three-seat sofa with washable performance fabric and tool-free assembly.";
const FIRST_SENTENCE_LOVESEAT =
  "Compact modular loveseat with washable performance fabric and tool-free assembly.";

const DESCRIPTION_SECTIONAL =
  FIRST_SENTENCE_SECTIONAL + " Designed for flexible layouts and deep seating support. Upholstered in durable performance fabric for everyday living in modern spaces. Designed to adapt as your room changes. " + DESCRIPTION_ENDING;

const DESCRIPTION_3SEAT =
  FIRST_SENTENCE_3SEAT + " Designed for clean modern interiors and flexible placement. Upholstered in durable performance fabric with supportive deep seating. Ideal for living rooms, studios, and adaptable spaces. " + DESCRIPTION_ENDING;

const DESCRIPTION_LOVESEAT =
  FIRST_SENTENCE_LOVESEAT + " Designed for smaller spaces without sacrificing support. Upholstered in durable performance fabric for everyday use. Ideal for apartments, offices, and flexible living areas. " + DESCRIPTION_ENDING;

/** Light variation by line; all start with trust signal and end with DESCRIPTION_ENDING. */
const DESCRIPTION_VARY: Record<string, { sectional: string; threeSeat: string; loveseat: string }> = {
  Atlas: {
    sectional: FIRST_SENTENCE_SECTIONAL + " Built for flexible layouts and deep seating support. Upholstered in durable performance fabric for everyday living in modern spaces. Reconfigures as your room evolves. " + DESCRIPTION_ENDING,
    threeSeat: FIRST_SENTENCE_3SEAT + " Built for clean modern interiors and flexible placement. Upholstered in durable performance fabric with supportive deep seating. Suited to living rooms, studios, and adaptable spaces. " + DESCRIPTION_ENDING,
    loveseat: FIRST_SENTENCE_LOVESEAT + " Built for smaller spaces without sacrificing support. Upholstered in durable performance fabric for everyday use. Ideal for apartments, offices, and flexible living areas. " + DESCRIPTION_ENDING,
  },
  Alto: {
    sectional: FIRST_SENTENCE_SECTIONAL + " Designed for flexible layouts and deep seating support. Upholstered in durable performance fabric for everyday living in modern spaces. Designed to adapt as your room changes. " + DESCRIPTION_ENDING,
    threeSeat: FIRST_SENTENCE_3SEAT + " Designed for clean modern interiors and flexible placement. Upholstered in durable performance fabric with supportive deep seating. Ideal for living rooms, studios, and adaptable spaces. " + DESCRIPTION_ENDING,
    loveseat: FIRST_SENTENCE_LOVESEAT + " Designed for smaller spaces without sacrificing support. Upholstered in durable performance fabric and built for everyday use. Ideal for apartments, offices, and flexible living areas. " + DESCRIPTION_ENDING,
  },
  Oris: {
    sectional: FIRST_SENTENCE_SECTIONAL + " For flexible layouts and deep seating support. Upholstered in durable performance fabric for everyday living in modern spaces. Adapts as your room changes. " + DESCRIPTION_ENDING,
    threeSeat: FIRST_SENTENCE_3SEAT + " For clean modern interiors and flexible placement. Upholstered in durable performance fabric with supportive deep seating. Ideal for living rooms, studios, and adaptable spaces. " + DESCRIPTION_ENDING,
    loveseat: FIRST_SENTENCE_LOVESEAT + " For smaller spaces without sacrificing support. Upholstered in durable performance fabric for everyday use. Ideal for apartments, offices, and flexible living areas. " + DESCRIPTION_ENDING,
  },
};

export function buildMerchantDescription(product: Product): string {
  const slug = product.slug;
  const line = lineNameFromSlug(slug);
  const config = configFromSlug(slug);
  const vary = DESCRIPTION_VARY[line] ?? {
    sectional: DESCRIPTION_SECTIONAL,
    threeSeat: DESCRIPTION_3SEAT,
    loveseat: DESCRIPTION_LOVESEAT,
  };
  if (config === "Sectional") return vary.sectional;
  if (config === "3 Seat") return vary.threeSeat;
  if (config === "Loveseat") return vary.loveseat;
  return DESCRIPTION_3SEAT;
}

function toProductType(product: Product): string {
  const config = configFromSlug(product.slug);
  return productTypeForShopping(config);
}

function toAvailability(stockStatus: Product["stockStatus"]): MerchantItem["availability"] {
  if (stockStatus === "OutOfStock") return "out_of_stock";
  if (stockStatus === "PreOrder") return "preorder";
  return "in_stock";
}

function parseKeywordCsv(csv: string): KeywordRow[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const getIndex = (...names: string[]) => headers.findIndex((h) => names.includes(h));
  const keywordIdx = getIndex("keyword");
  const intentIdx = getIndex("intent");
  const volumeIdx = getIndex("volume", "search volume");
  const difficultyIdx = getIndex("keyword difficulty", "difficulty", "kd");
  if (keywordIdx < 0 || intentIdx < 0 || volumeIdx < 0 || difficultyIdx < 0) return [];

  const rows: KeywordRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((c) => c.trim());
    const keyword = cells[keywordIdx] ?? "";
    if (!keyword) continue;
    const intent = (cells[intentIdx] ?? "").toLowerCase();
    const volume = Number((cells[volumeIdx] ?? "0").replace(/[^\d.]/g, ""));
    const difficulty = Number((cells[difficultyIdx] ?? "999").replace(/[^\d.]/g, ""));
    rows.push({ keyword, intent, volume, difficulty });
  }
  return rows;
}

export async function loadSelectedKeywords(): Promise<string[]> {
  let csvContent: string | null = null;
  for (const candidate of KEYWORD_CSV_CANDIDATE_PATHS) {
    try {
      csvContent = await fs.readFile(candidate, "utf-8");
      break;
    } catch {
      // continue
    }
  }
  if (!csvContent) return CORE_KEYWORDS;
  const parsed = parseKeywordCsv(csvContent);
  const selected = parsed
    .filter((row) => {
      const intent = row.intent;
      const validIntent =
        intent === "transactional" ||
        intent === "informational + transactional" ||
        intent === "informational+transactional";
      return validIntent && row.volume >= 700 && row.difficulty <= 40;
    })
    .sort((a, b) => b.volume - a.volume)
    .map((row) => row.keyword.toLowerCase());
  const unique = Array.from(new Set([...CORE_KEYWORDS, ...selected]));
  return unique.length ? unique : CORE_KEYWORDS;
}

async function validateMerchantImage(imageUrl: string, baseUrl: string): Promise<string[]> {
  const failures: string[] = [];
  const isHttps = imageUrl.startsWith("https://");
  if (!isHttps) failures.push(`image_link must be https: ${imageUrl}`);

  const base = baseUrl.replace(/\/$/, "");
  if (imageUrl.startsWith(base)) {
    const relativePath = imageUrl.slice(base.length);
    const fsPath = path.join(process.cwd(), "public", relativePath.replace(/^\/+/, ""));
    try {
      const buffer = await fs.readFile(fsPath);
      const dimensions = imageSize(buffer);
      if (!dimensions.width || !dimensions.height) {
        failures.push(`cannot determine image dimensions: ${imageUrl}`);
      } else if (dimensions.width < 800 || dimensions.height < 800) {
        failures.push(`image dimensions too small (${dimensions.width}x${dimensions.height}) for ${imageUrl}`);
      }
      const lowerPath = fsPath.toLowerCase();
      const isImage = lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg") || lowerPath.endsWith(".webp") || lowerPath.endsWith(".png");
      if (!isImage) {
        failures.push(`image must be JPG/JPEG/WebP/PNG: ${imageUrl}`);
      }
    } catch {
      failures.push(`image not found or unreadable: ${imageUrl}`);
    }
  } else {
    try {
      const response = await fetch(imageUrl, { method: "HEAD" });
      if (response.status !== 200) failures.push(`image URL returned HTTP ${response.status}: ${imageUrl}`);
      const type = response.headers.get("content-type") ?? "";
      if (!type.toLowerCase().startsWith("image/")) failures.push(`image URL MIME not image/*: ${imageUrl}`);
    } catch {
      failures.push(`failed to HEAD image URL: ${imageUrl}`);
    }
  }

  return failures;
}

function validateItemFields(item: MerchantItem): string[] {
  const failures: string[] = [];
  if (!item.title.trim()) failures.push(`${item.id}: missing title`);
  if (!item.description.trim()) failures.push(`${item.id}: missing description`);
  if (!/^\d+(\.\d{2})\s[A-Z]{3}$/.test(item.price)) failures.push(`${item.id}: invalid price format (${item.price})`);
  if (!item.sale_price || !/^\d+(\.\d{2})\s[A-Z]{3}$/.test(item.sale_price)) {
    failures.push(`${item.id}: missing or invalid sale_price (${item.sale_price})`);
  }
  if (!["in_stock", "out_of_stock", "preorder"].includes(item.availability)) {
    failures.push(`${item.id}: invalid availability (${item.availability})`);
  }
  if (!item.google_product_category || item.google_product_category.trim() === "") {
    failures.push(`${item.id}: missing google_product_category`);
  }
  return failures;
}

/** Build all feed items: one per product × color (same item_group_id per product). additional_image_link uses productDetails.images in site order when provided. */
export async function buildMerchantItems(
  products: Product[],
  baseUrl: string,
  productDetails?: Record<string, ProductDetailData>
): Promise<MerchantItem[]> {
  const safety = runSafetyCheck();
  if (!safety.ok) {
    throw new Error(safety.message ?? "Price map failed safety check. Fix lib/pricing.ts before generating feed.");
  }

  const items: MerchantItem[] = [];
  const skipped: string[] = [];

  const productSlugs = new Set(products.map((p) => p.slug));
  const requestedSlugs = Array.from(FEED_SLUGS).filter((slug) => productSlugs.has(slug));
  if (requestedSlugs.length === 0) {
    console.warn("[merchant feed] No products matched FEED_SLUGS; ensure products.json includes Atlas, Alto, Oris.");
  }

  for (const product of products) {
    if (!FEED_SLUGS.has(product.slug)) continue;
    const config = configFromSlug(product.slug);
    const heroPath = getHeroImagePath(product, productDetails);
    const imageLink = toAbsoluteUrl(baseUrl, heroPath);
    const imageFailures = await validateMerchantImage(imageLink, baseUrl);
    if (imageFailures.length > 0) {
      skipped.push(product.slug, ...imageFailures);
      continue;
    }

    const additionalPaths = getOrderedAdditionalPaths(productDetails?.[product.slug]?.images);
    const additionalImageLinks = sortAdditionalImageLinks(
      additionalPaths.map((p) => toAbsoluteUrl(baseUrl, p))
    );

    const { price: priceStr, sale_price: salePriceStr } = priceStringsForProduct(product);

    for (const color of FEED_COLORS) {
      const colorSlug = colorToSlug(color);
      const mpn = `ARVA-${lineNameFromSlug(product.slug).toUpperCase()}-${configSlugForMpn(config)}-${colorToMpnSegment(color)}`;
      const item: MerchantItem = {
        id: `${product.slug}--${colorSlug}`,
        title: buildMerchantTitle(product, color),
        description: buildMerchantDescription(product),
        link: toAbsoluteUrl(baseUrl, `/products/${product.slug}`),
        image_link: imageLink,
        additional_image_link: additionalImageLinks,
        availability: toAvailability(product.stockStatus),
        price: priceStr,
        sale_price: salePriceStr,
        condition: "new",
        brand: "ARVA",
        mpn,
        product_type: productTypeForShopping(config),
        google_product_category: GOOGLE_PRODUCT_CATEGORY,
        material: materialForSlug(product.slug),
        shipping: [...SHIPPING_BLOCKS],
        product_highlight: [...PRODUCT_HIGHLIGHTS],
        item_group_id: itemGroupIdFromSlug(product.slug),
        size: sizeFromConfig(config),
        custom_label_0: config === "Loveseat" ? "supporting" : "hero",
        custom_label_1: "high_aov",
        custom_label_2: config === "Sectional" ? "sectional" : config === "3 Seat" ? "sofa" : "loveseat",
        custom_label_3: "core_collection",
        custom_label_4: FEED_HERO_COLORS.has(color) ? "hero_color" : "supporting_color",
        room: "Living Room",
        style: "Modern",
        identifier_exists: false,
        color,
        product_detail: getProductDetailForItem(lineNameFromSlug(product.slug), config),
      };

      const fieldFailures = validateItemFields(item);
      if (fieldFailures.length > 0) {
        skipped.push(item.id, ...fieldFailures);
        continue;
      }
      items.push(item);
    }
  }

  if (skipped.length > 0) {
    console.warn("[merchant feed] Skipped items (included rest):", skipped.join("; "));
  }
  if (items.length === 0) {
    throw new Error("Merchant feed has no valid items. Check products and merchant images.");
  }
  return items;
}

/**
 * RSS 2.0 + Google namespace XML for Merchant Center.
 */
export function toMerchantXml(items: MerchantItem[], baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const channelTitle = "ARVA Product Feed";
  const channelLink = base;
  const channelDesc = "Google Merchant Center feed for ARVA (livearva.com)";

  const itemNodes = items
    .map((item) => {
      const lines = [
        "<item>",
        `  <g:id>${escapeXml(item.id)}</g:id>`,
        `  <g:item_group_id>${escapeXml(item.item_group_id)}</g:item_group_id>`,
        `  <g:title>${escapeXml(item.title)}</g:title>`,
        `  <g:description>${escapeXml(item.description)}</g:description>`,
        `  <g:link>${escapeXml(item.link)}</g:link>`,
        `  <g:image_link>${escapeXml(item.image_link)}</g:image_link>`,
        ...item.additional_image_link.map((url) => `  <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`),
        `  <g:availability>${escapeXml(item.availability)}</g:availability>`,
        `  <g:price>${escapeXml(item.price)}</g:price>`,
        ...(item.sale_price ? [`  <g:sale_price>${escapeXml(item.sale_price)}</g:sale_price>`] : []),
        `  <g:condition>${escapeXml(item.condition)}</g:condition>`,
        `  <g:brand>${escapeXml(item.brand)}</g:brand>`,
        `  <g:mpn>${escapeXml(item.mpn)}</g:mpn>`,
        ...(item.color ? [`  <g:color>${escapeXml(item.color)}</g:color>`] : []),
        `  <g:material>${escapeXml(item.material)}</g:material>`,
        `  <g:size>${escapeXml(item.size)}</g:size>`,
        `  <g:product_type>${escapeXml(item.product_type)}</g:product_type>`,
        `  <g:google_product_category>${escapeXml(item.google_product_category)}</g:google_product_category>`,
        `  <g:custom_label_0>${escapeXml(item.custom_label_0)}</g:custom_label_0>`,
        `  <g:custom_label_1>${escapeXml(item.custom_label_1)}</g:custom_label_1>`,
        `  <g:custom_label_2>${escapeXml(item.custom_label_2)}</g:custom_label_2>`,
        `  <g:custom_label_3>${escapeXml(item.custom_label_3)}</g:custom_label_3>`,
        `  <g:custom_label_4>${escapeXml(item.custom_label_4)}</g:custom_label_4>`,
        `  <g:room>${escapeXml(item.room)}</g:room>`,
        `  <g:style>${escapeXml(item.style)}</g:style>`,
        `  <g:identifier_exists>${item.identifier_exists ? "true" : "false"}</g:identifier_exists>`,
        ...(item.product_detail || []).flatMap((pd) => [
          "  <g:product_detail>",
          `    <g:attribute_name>${escapeXml(pd.attribute_name)}</g:attribute_name>`,
          `    <g:attribute_value>${escapeXml(pd.attribute_value)}</g:attribute_value>`,
          "  </g:product_detail>",
        ]),
        ...(item.shipping || []).flatMap((s) => [
          "  <g:shipping>",
          `    <g:country>${escapeXml(s.country)}</g:country>`,
          `    <g:service>${escapeXml(s.service)}</g:service>`,
          `    <g:price>${escapeXml(s.price)}</g:price>`,
          "  </g:shipping>",
        ]),
        ...(item.product_highlight || []).map((h) => `  <g:product_highlight>${escapeXml(h)}</g:product_highlight>`),
        "</item>",
      ];
      return lines.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(channelDesc)}</description>
${itemNodes}
  </channel>
</rss>
`;
}

/**
 * CSV mirror of merchant feed.
 */
export function toMerchantCsv(items: MerchantItem[]): string {
  const headers = [
    "id",
    "item_group_id",
    "title",
    "description",
    "link",
    "image_link",
    "additional_image_link",
    "availability",
    "price",
    "sale_price",
    "condition",
    "brand",
    "mpn",
    "color",
    "material",
    "size",
    "product_type",
    "google_product_category",
    "custom_label_0",
    "custom_label_1",
    "custom_label_2",
    "custom_label_3",
    "custom_label_4",
    "room",
    "style",
    "identifier_exists",
  ];

  const rows = items.map((item) =>
    [
      item.id,
      item.item_group_id,
      item.title,
      item.description,
      item.link,
      item.image_link,
      item.additional_image_link.join(","),
      item.availability,
      item.price,
      item.sale_price ?? "",
      item.condition,
      item.brand,
      item.mpn,
      item.color ?? "",
      item.material,
      item.size,
      item.product_type,
      item.google_product_category,
      item.custom_label_0,
      item.custom_label_1,
      item.custom_label_2,
      item.custom_label_3,
      item.custom_label_4,
      item.room,
      item.style,
      item.identifier_exists ? "true" : "false",
    ].map(escapeCsvValue)
  );

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
