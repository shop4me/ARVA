/**
 * Generate Google Merchant Center feed files: XML (RSS 2.0 + g:) and CSV.
 * Run from project root: npm run feed:merchant
 * Writes: public/merchant/arva_merchant_feed.xml, public/merchant/arva_merchant_feed.csv
 */

import { promises as fs } from "fs";
import path from "path";
import { getProducts } from "../lib/api";
import { buildMerchantItems, toMerchantXml, toMerchantCsv } from "../lib/merchantFeed";
import { absoluteUrl } from "../lib/seo";

async function main() {
  const products = await getProducts();
  const baseUrl = absoluteUrl("");
  const items = buildMerchantItems(products, baseUrl);

  const outDir = path.join(process.cwd(), "public", "merchant");
  await fs.mkdir(outDir, { recursive: true });

  const xml = toMerchantXml(items, baseUrl);
  const csv = toMerchantCsv(items);

  await fs.writeFile(path.join(outDir, "arva_merchant_feed.xml"), xml, "utf-8");
  await fs.writeFile(path.join(outDir, "arva_merchant_feed.csv"), csv, "utf-8");

  console.log(`Generated ${items.length} items.`);
  console.log("  public/merchant/arva_merchant_feed.xml");
  console.log("  public/merchant/arva_merchant_feed.csv");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
