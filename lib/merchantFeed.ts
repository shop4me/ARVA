/**
 * Google Merchant Center feed generation with compliance hardening.
 */

import { promises as fs } from "fs";
import path from "path";
import { imageSize } from "image-size";
import type { Product } from "./content";

export interface MerchantItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link: string[];
  availability: "in_stock" | "out_of_stock" | "preorder";
  price: string;
  condition: "new";
  brand: string;
  mpn: string;
  product_type: string;
  google_product_category: "2740";
  material: string;
}

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

const SLUG_TO_MPN: Record<string, string> = {
  "atlas-sectional": "ARVA-ATLAS-SECTIONAL",
  "atlas-3-seater": "ARVA-ATLAS-3SEATER",
  "atlas-loveseat": "ARVA-ATLAS-LOVESEAT",
  "alto-sectional": "ARVA-ALTO-SECTIONAL",
  "alto-3-seater": "ARVA-ALTO-3SEATER",
  "alto-loveseat": "ARVA-ALTO-LOVESEAT",
  "oris-sectional": "ARVA-ORIS-SECTIONAL",
  "oris-3-seater": "ARVA-ORIS-3SEATER",
  "oris-loveseat": "ARVA-ORIS-LOVESEAT",
};

const PRODUCT_TYPE_BY_CATEGORY: Record<string, string> = {
  sectional: "Furniture > Sofas > Sectionals",
  "three-seater": "Furniture > Sofas > Standard Sofas",
  loveseat: "Furniture > Sofas > Loveseats",
};

const MERCHANT_HERO_IMAGE_PATH_BY_SLUG: Record<string, string> = Object.fromEntries(
  Array.from(FEED_SLUGS).map((slug) => [slug, `/images/merchant/${slug}-hero.jpg`])
);

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

export function buildMerchantTitle(product: Product, keywords: string[]): string {
  const model = normalizeModelName(product.name);
  const selected = selectKeywordByProduct(product, keywords);
  const differentiator =
    product.category === "sectional"
      ? "Modular Cloud Sectional Comfort"
      : product.category === "three-seater"
        ? "Structured Everyday Support"
        : "Compact Structured Comfort";
  return `ARVA ${model} Cloud-Style Sofa - ${differentiator} (${selected})`;
}

export function buildMerchantDescription(product: Product, keywords: string[]): string {
  const selected = selectKeywordByProduct(product, keywords);
  const model = normalizeModelName(product.name);
  const intro = `${model} is built for buyers searching for a ${selected} look, but with better long-term support and structure than typical sink-in cloud couches.`;
  return [
    intro,
    "",
    "Highlights:",
    "- Real back support with structured comfort for daily sitting",
    "- Performance-weave fabric designed for spill resistance and pet friendliness",
    "- Durable construction that holds shape over time",
    "- Tool-free modular setup with cleaner fit-and-finish",
    "- Built as a better-built cloud-style sofa for real-life use",
  ].join("\n");
}

function toProductType(product: Product): string {
  if (product.isOutdoor) return "Furniture > Outdoor Furniture > Outdoor Sofas";
  return PRODUCT_TYPE_BY_CATEGORY[product.category] ?? "Furniture > Sofas";
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
      } else if (dimensions.width < 2000 || dimensions.height < 2000) {
        failures.push(`image dimensions too small (${dimensions.width}x${dimensions.height}) for ${imageUrl}`);
      }
      const lowerPath = fsPath.toLowerCase();
      if (!(lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg"))) {
        failures.push(`image must be JPG/JPEG for canonical hero: ${imageUrl}`);
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
  if (!["in_stock", "out_of_stock", "preorder"].includes(item.availability)) {
    failures.push(`${item.id}: invalid availability (${item.availability})`);
  }
  if (item.google_product_category !== "2740") {
    failures.push(`${item.id}: invalid google_product_category (${item.google_product_category})`);
  }
  return failures;
}

export async function buildMerchantItems(products: Product[], baseUrl: string): Promise<MerchantItem[]> {
  const keywords = await loadSelectedKeywords();
  const items: MerchantItem[] = [];
  const failures: string[] = [];

  for (const product of products) {
    if (!FEED_SLUGS.has(product.slug)) continue;
    const imagePath = MERCHANT_HERO_IMAGE_PATH_BY_SLUG[product.slug];
    const imageLink = toAbsoluteUrl(baseUrl, imagePath);
    const item: MerchantItem = {
      id: product.slug,
      title: buildMerchantTitle(product, keywords),
      description: buildMerchantDescription(product, keywords),
      link: toAbsoluteUrl(baseUrl, `/products/${product.slug}`),
      image_link: imageLink,
      additional_image_link: [],
      availability: toAvailability(product.stockStatus),
      price: `${Number(product.price).toFixed(2)} ${product.currency ?? "USD"}`,
      condition: "new",
      brand: "ARVA",
      mpn: SLUG_TO_MPN[product.slug] ?? `ARVA-${product.slug.toUpperCase().replace(/-/g, "-")}`,
      product_type: toProductType(product),
      google_product_category: "2740",
      material: product.isOutdoor ? "weather-resistant performance weave fabric" : "performance weave fabric",
    };

    failures.push(...validateItemFields(item));
    failures.push(...(await validateMerchantImage(item.image_link, baseUrl)));
    items.push(item);
  }

  if (failures.length) {
    const message = `Merchant feed validation failed:\n- ${failures.join("\n- ")}`;
    console.error(message);
    throw new Error(message);
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
        `  <g:title>${escapeXml(item.title)}</g:title>`,
        `  <g:description>${escapeXml(item.description)}</g:description>`,
        `  <g:link>${escapeXml(item.link)}</g:link>`,
        `  <g:image_link>${escapeXml(item.image_link)}</g:image_link>`,
        ...item.additional_image_link.map((url) => `  <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`),
        `  <g:availability>${escapeXml(item.availability)}</g:availability>`,
        `  <g:price>${escapeXml(item.price)}</g:price>`,
        `  <g:condition>${escapeXml(item.condition)}</g:condition>`,
        `  <g:brand>${escapeXml(item.brand)}</g:brand>`,
        `  <g:mpn>${escapeXml(item.mpn)}</g:mpn>`,
        `  <g:product_type>${escapeXml(item.product_type)}</g:product_type>`,
        `  <g:google_product_category>${escapeXml(item.google_product_category)}</g:google_product_category>`,
        `  <g:material>${escapeXml(item.material)}</g:material>`,
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
    "title",
    "description",
    "link",
    "image_link",
    "additional_image_link",
    "availability",
    "price",
    "condition",
    "brand",
    "mpn",
    "product_type",
    "google_product_category",
    "material",
  ];

  const rows = items.map((item) =>
    [
      item.id,
      item.title,
      item.description,
      item.link,
      item.image_link,
      item.additional_image_link.join(","),
      item.availability,
      item.price,
      item.condition,
      item.brand,
      item.mpn,
      item.product_type,
      item.google_product_category,
      item.material,
    ].map(escapeCsvValue)
  );

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
