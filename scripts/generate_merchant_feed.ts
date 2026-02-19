/**
 * Generate Google Merchant Center feed. Run from project root: npm run feed:merchant
 * Writes: public/merchant/feed.xml
 */

import { promises as fs } from "fs";
import path from "path";
import { getProducts } from "../lib/api";
import { readProductDetails } from "../lib/dataStore";
import { buildMerchantItems, toMerchantXml } from "../lib/merchantFeed";
import { absoluteUrl } from "../lib/seo";

async function main() {
  const [products, productDetails] = await Promise.all([getProducts(), readProductDetails()]);
  const baseUrl = absoluteUrl("");
  const items = await buildMerchantItems(products, baseUrl, productDetails);

  const outDir = path.join(process.cwd(), "public", "merchant");
  await fs.mkdir(outDir, { recursive: true });

  const xml = toMerchantXml(items, baseUrl);
  const feedPath = path.join(outDir, "feed.xml");
  await fs.writeFile(feedPath, xml, "utf-8");

  const base = baseUrl.replace(/\/$/, "");
  console.log(`Generated ${items.length} items.`);
  console.log("  public/merchant/feed.xml");
  console.log("");
  console.log("Feed URL (production): " + base + "/merchant/feed.xml");
  console.log("Feed URL (localhost):  http://localhost:3000/merchant/feed.xml");

  // Verification: dimensions (product_detail) per line+config
  const byGroup: Record<string, number> = {};
  for (const item of items) {
    byGroup[item.item_group_id] = (byGroup[item.item_group_id] || 0) + 1;
  }
  const expectedGroups = [
    "atlas-sectional",
    "atlas-3-seat",
    "atlas-loveseat",
    "alto-sectional",
    "alto-3-seat",
    "alto-loveseat",
    "oris-sectional",
    "oris-3-seat",
    "oris-loveseat",
  ];
  console.log("");
  console.log("--- Dimensions verification ---");
  console.log("Total items processed:", items.length);
  console.log("Items per line+config (item_group_id):");
  for (const g of expectedGroups) {
    console.log(`  ${g}: ${byGroup[g] ?? 0}`);
  }
  const withDetail = items.filter((i) => i.product_detail?.length > 0).length;
  console.log("Items with product_detail (dimensions):", withDetail, "(all newly set by generator)");
  const altoSectional = items.find(
    (i) => i.item_group_id === "alto-sectional" && i.product_detail?.some((pd) => pd.attribute_name === "Overall Dimensions")
  );
  const altoOverall = altoSectional?.product_detail?.find((pd) => pd.attribute_name === "Overall Dimensions")?.attribute_value ?? "";
  const altoSectionalExact = "116 in W × 78 in D × 33 in H";
  const altoMatch = altoOverall === altoSectionalExact;
  console.log("ALTO Sectional Overall Dimensions exactly equals expected:", altoMatch ? "YES" : "NO", altoMatch ? "" : `(got: ${altoOverall})`);
  if (!altoMatch) throw new Error("ALTO Sectional dimensions mismatch");

  // Enrichment summary: google_product_category, shipping, product_highlight
  const withCategory = items.filter((i) => i.google_product_category?.trim()).length;
  const withShipping = items.filter((i) => i.shipping?.length === 2).length;
  const withHighlights = items.filter((i) => i.product_highlight?.length === 3).length;
  console.log("");
  console.log("--- Enrichment summary ---");
  console.log("Items with google_product_category (set):", withCategory);
  console.log("Items with 2 shipping blocks (US + CA):", withShipping);
  console.log("Items with 3 product_highlight tags:", withHighlights);
  if (withCategory !== items.length || withShipping !== items.length || withHighlights !== items.length) {
    throw new Error("Enrichment validation failed: every item must have category, shipping, and 3 highlights");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
