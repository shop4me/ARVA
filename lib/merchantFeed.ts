/**
 * Google Merchant Center feed content.
 * Single source for feed title, description, category, type, and feed price.
 * RSS 2.0 + Google namespace XML and CSV export for merchant feed.
 */

import type { Product } from "./content";

export interface MerchantFeedRow {
  slug: string;
  title: string;
  description: string;
  product_type: string;
  google_product_category: string;
  price: string; // e.g. "997 USD"
}

/** Slug -> MPN: ARVA-{COLLECTION}-{CONFIG} uppercase, hyphenated (3-seater -> 3SEATER). */
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

export const merchantFeedRows: MerchantFeedRow[] = [
  {
    slug: "atlas-sectional",
    title: "Cloud Sectional Couch Modular – Under $1,000 | ARVA Atlas",
    description:
      "Modular cloud sectional couch designed for modern living. Balanced comfort, clean lines, OEKO-TEX® certified performance fabric, and tool-free assembly. Flexible configuration with included ottoman. Delivered in 2–4 weeks with free shipping. 100-day trial and lifetime structural warranty.",
    product_type: "Furniture > Sofas > Sectionals",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "997 USD",
  },
  {
    slug: "atlas-3-seater",
    title: "Cloud Sofa 3-Seater – Modular Modern Couch | ARVA Atlas",
    description:
      "Cloud-style 3-seater modular sofa with balanced comfort and clean architectural lines. OEKO-TEX® certified performance fabric and tool-free assembly. Delivered in 2–4 weeks with free shipping. 100-day trial and lifetime structural warranty.",
    product_type: "Furniture > Sofas > Standard Sofas",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "799 USD",
  },
  {
    slug: "atlas-loveseat",
    title: "Cloud Loveseat Modular Sofa – Modern Compact Couch | ARVA Atlas",
    description:
      "Modular cloud loveseat sofa with supportive comfort and clean lines. OEKO-TEX® certified performance fabric and tool-free assembly. Delivered in 2–4 weeks with free shipping. 100-day trial and lifetime structural warranty.",
    product_type: "Furniture > Sofas > Loveseats",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "599 USD",
  },
  {
    slug: "alto-sectional",
    title: "Modern Cloud Sectional Sofa – Deep Seat Modular | ARVA Alto",
    description:
      "Modern deep-seat cloud sectional sofa with modular flexibility and relaxed comfort. OEKO-TEX® certified fabric and tool-free assembly. Delivered in 2–4 weeks with free shipping. 100-day trial and lifetime structural warranty.",
    product_type: "Furniture > Sofas > Sectionals",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "1097 USD",
  },
  {
    slug: "alto-3-seater",
    title: "Modern Cloud Sofa 3-Seater – Deep Seat Couch | ARVA Alto",
    description:
      "Deep-seat modern cloud-style 3-seater sofa with modular construction and OEKO-TEX® certified fabric. Tool-free assembly. Delivered in 2–4 weeks with free shipping. 100-day trial and lifetime structural warranty.",
    product_type: "Furniture > Sofas > Standard Sofas",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "899 USD",
  },
  {
    slug: "alto-loveseat",
    title: "Modern Cloud Loveseat – Deep Seat Modular Sofa | ARVA Alto",
    description:
      "Deep-seat modern cloud loveseat with modular construction and OEKO-TEX® certified fabric. Tool-free assembly. Delivered in 2–4 weeks with free shipping. 100-day trial and lifetime structural warranty.",
    product_type: "Furniture > Sofas > Loveseats",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "699 USD",
  },
  {
    slug: "oris-sectional",
    title: "Outdoor Modular Sectional Sofa – Weather Resistant | ARVA Oris",
    description:
      "Modular outdoor sectional sofa with weather-resistant performance fabric and durable frame construction. Flexible patio seating configuration. Delivered in 2–4 weeks with free shipping. Lifetime structural warranty.",
    product_type: "Furniture > Outdoor Furniture > Outdoor Sofas",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "1197 USD",
  },
  {
    slug: "oris-3-seater",
    title: "Outdoor 3-Seater Sofa – Modular Patio Couch | ARVA Oris",
    description:
      "Weather-resistant modular outdoor 3-seater sofa designed for patios and terraces. Durable construction and clean modern lines. Delivered in 2–4 weeks with free shipping. Lifetime structural warranty.",
    product_type: "Furniture > Outdoor Furniture > Outdoor Sofas",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "999 USD",
  },
  {
    slug: "oris-loveseat",
    title: "Outdoor Loveseat Sofa – Modular Patio Seating | ARVA Oris",
    description:
      "Modular outdoor loveseat with weather-resistant performance fabric and durable construction. Ideal for patios and smaller outdoor spaces. Delivered in 2–4 weeks with free shipping. Lifetime structural warranty.",
    product_type: "Furniture > Outdoor Furniture > Outdoor Sofas",
    google_product_category: "Home & Garden > Furniture > Sofas",
    price: "799 USD",
  },
];

/** Single item for Google Merchant feed (XML/CSV). */
export interface MerchantItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link: string[];
  availability: string;
  price: string;
  condition: string;
  brand: string;
  mpn: string;
  product_type: string;
  google_product_category: string;
  shipping: string;
  material: string;
}

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

function toAbsoluteImageUrl(baseUrl: string, path: string | undefined): string {
  const base = baseUrl.replace(/\/$/, "");
  if (!path) return `${base}/images/placeholder-product.jpg`;
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

/**
 * Build merchant feed items from products. Uses existing merchantFeedRows for title/description/category.
 * baseUrl e.g. https://livearva.com
 */
export function buildMerchantItems(products: Product[], baseUrl: string): MerchantItem[] {
  const rowBySlug = new Map(merchantFeedRows.map((r) => [r.slug, r]));
  const items: MerchantItem[] = [];

  for (const p of products) {
    if (!FEED_SLUGS.has(p.slug)) continue;
    const row = rowBySlug.get(p.slug);
    if (!row) continue;

    const link = `${baseUrl.replace(/\/$/, "")}/products/${p.slug}`;
    const imageLink = toAbsoluteImageUrl(baseUrl, p.image);
    const additionalImages: string[] = []; // No extra images yet; placeholder only

    const availability =
      p.stockStatus === "OutOfStock" ? "out_of_stock" : p.stockStatus === "PreOrder" ? "preorder" : "in_stock";
    const priceFormatted = `${Number(p.price).toFixed(2)} ${p.currency ?? "USD"}`;
    const mpn = SLUG_TO_MPN[p.slug] ?? `ARVA-${p.slug.toUpperCase().replace(/-/g, "-")}`;
    const material = p.isOutdoor ? "weather-resistant performance fabric" : "performance fabric";

    items.push({
      id: p.slug,
      title: row.title,
      description: row.description,
      link,
      image_link: imageLink,
      additional_image_link: additionalImages,
      availability,
      price: priceFormatted,
      condition: "new",
      brand: "ARVA",
      mpn,
      product_type: row.product_type,
      google_product_category: row.google_product_category,
      shipping: "US:Standard:0 USD",
      material,
    });
  }

  return items;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
        `  <g:shipping>${escapeXml(item.shipping)}</g:shipping>`,
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

function escapeCsvValue(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * CSV mirror of merchant feed (Google Shopping format).
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
    "shipping",
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
      item.shipping,
      item.material,
    ].map(escapeCsvValue)
  );
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function escapeCsvField(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildMerchantFeedCsv(
  baseUrl: string,
  rows: MerchantFeedRow[],
  imageBySlug: Record<string, string | undefined>
): string {
  const headers = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "brand",
    "price",
    "availability",
    "condition",
    "google_product_category",
    "product_type",
    "shipping",
    "identifier_exists",
  ];
  const lines: string[] = [headers.join(",")];
  for (const row of rows) {
    const link = `${baseUrl}/products/${row.slug}`;
    const imageLink = imageBySlug[row.slug]
      ? (imageBySlug[row.slug]!.startsWith("http") ? imageBySlug[row.slug]! : `${baseUrl}${imageBySlug[row.slug]!.startsWith("/") ? "" : "/"}${imageBySlug[row.slug]}`)
      : `${baseUrl}/images/placeholder-product.jpg`;
    const fields = [
      row.slug,
      escapeCsvField(row.title),
      escapeCsvField(row.description),
      link,
      imageLink,
      "ARVA",
      row.price,
      "in stock",
      "new",
      escapeCsvField(row.google_product_category),
      escapeCsvField(row.product_type),
      "", // shipping – optional
      "no",
    ];
    lines.push(fields.join(","));
  }
  return lines.join("\n");
}
