/**
 * Verify promo pricing: print safety table and (optional) sample feed prices.
 * Run from project root: npx tsx scripts/verify_pricing.ts
 *
 * For full verification:
 * 1. Run this script to confirm price map and safety.
 * 2. Run npm run feed:merchant and check output for price/sale_price per bucket.
 * 3. In browser: open one PDP per line+config (e.g. /products/atlas-sectional), confirm crossed-out regular + sale as main price; add to cart and confirm line total = sale price.
 */

import { runSafetyCheck } from "../lib/pricing";

function main() {
  const result = runSafetyCheck();

  console.log("--- Promo pricing safety table ---\n");
  console.log(
    "Bucket\t\t\tRegular\tSale\tDiscount%\tFlag lowReg+highSale\tFlag sale>=regular"
  );
  for (const row of result.table) {
    console.log(
      `${row.bucket}\t${row.regular}\t${row.sale}\t${row.discountPct}%\t\t${row.flagLowRegularHighSale}\t\t\t${row.flagSaleGteRegular}`
    );
  }
  console.log("");
  console.log("Safe to use promo prices:", result.ok ? "YES" : "NO");
  if (result.message) console.log("Message:", result.message);
  console.log("");
  console.log("Website: PDP shows compare_at (regular) crossed out + sale as main; cart/checkout uses sale.");
  console.log("Feed: g:price = regular, g:sale_price = sale (from lib/pricing.ts).");
  console.log("To regenerate feed: npm run feed:merchant");
}

main();
