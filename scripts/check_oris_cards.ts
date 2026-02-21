/**
 * Puppeteer: check that Oris (outdoor) product cards on /products have the subtle
 * warm gradient + shadow styling. Run: npx tsx scripts/check_oris_cards.ts
 * Requires dev server: npm run dev (port 3030)
 */

import puppeteer from "puppeteer";

const BASE = "http://localhost:3030";
const PRODUCTS_PATH = "/products";

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const url = `${BASE}${PRODUCTS_PATH}`;
    console.log("Navigating to", url);

    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    if (!response || !response.ok()) {
      console.error("Page load failed:", response?.status(), "- Is the dev server running? (npm run dev)");
      process.exit(1);
    }

    // Product cards are <a href="/products/slug"> that contain the card content.
    // Find all links to product pages (excluding the main /products nav if any).
    const cardResults = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/products/"]'));
      const cards: { href: string; slug: string; isOris: boolean; hasGradientDiv: boolean; gradientBg: string; cardShadow: string }[] = [];

      for (const a of links) {
        const href = a.getAttribute("href") ?? "";
        const match = href.match(/^\/products\/([a-z0-9-]+)$/);
        if (!match || match[1] === "") continue;

        const slug = match[1];
        const isOris = slug === "oris-sectional" || slug === "oris-3-seater" || slug === "oris-loveseat";

        const gradientDiv = Array.from(a.children).find((el) => {
          if (el.tagName !== "DIV") return false;
          const bg = (el as HTMLElement).style?.background ?? "";
          return bg.includes("radial-gradient") && bg.includes("253");
        });

        const cardStyle = getComputedStyle(a);
        cards.push({
          href,
          slug,
          isOris,
          hasGradientDiv: !!gradientDiv,
          gradientBg: gradientDiv ? (gradientDiv as HTMLElement).style?.background ?? "" : "",
          cardShadow: cardStyle.boxShadow,
        });
      }

      return cards;
    });

    // Dedupe by slug (same card might be linked from multiple places in theory; in practice one per slug)
    const bySlug = new Map(cardResults.map((c) => [c.slug, c]));
    const orisSlugs = ["oris-sectional", "oris-3-seater", "oris-loveseat"];

    console.log("\n--- Product cards on /products ---\n");
    let orisOk = true;
    for (const slug of orisSlugs) {
      const c = bySlug.get(slug);
      if (!c) {
        console.log(`  ${slug}: NOT FOUND (card not on page)`);
        orisOk = false;
        continue;
      }
      const gradientOk = c.hasGradientDiv && c.gradientBg.includes("radial-gradient");
      console.log(`  ${slug} (Oris):`);
      console.log(`    sun (gradient) present: ${c.hasGradientDiv} ${gradientOk ? "✓" : "✗"}`);
      console.log(`    gradient: ${c.gradientBg.slice(0, 70)}${c.gradientBg.length > 70 ? "…" : ""}`);
      if (!gradientOk) orisOk = false;
      console.log("");
    }

    // Also list non-Oris cards to confirm we're not applying Oris styling to them
    const nonOris = Array.from(bySlug.entries()).filter(([s]) => !orisSlugs.includes(s));
    console.log("--- Non-Oris cards (sample: should NOT have warm gradient) ---");
    for (const [slug, c] of nonOris.slice(0, 3)) {
      console.log(`  ${slug}: hasGradientDiv=${c.hasGradientDiv}, shadow=${c.cardShadow.slice(0, 40)}…`);
    }

    if (!orisOk) {
      console.error("\nOris styling check FAILED: one or more Oris cards missing gradient or warm shadow.");
      process.exit(1);
    }

    console.log("\nOris styling check PASSED: all three Oris cards have sun glow.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
