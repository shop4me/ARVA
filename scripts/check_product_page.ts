/**
 * Puppeteer script: open a product page, capture console errors, verify hero + fabric swatches.
 * Run: npx tsx scripts/check_product_page.ts
 * Requires dev server: npm run dev (port 3030)
 */

import puppeteer from "puppeteer";

const BASE = "http://localhost:3030";
const PRODUCT_SLUG = "atlas-sectional";

async function main() {
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();
      // Ignore resource 404s (missing color-variant images); fallback shows default hero
      if (type === "error" && !text.includes("Failed to load resource")) {
        consoleErrors.push(text);
      }
      consoleLogs.push(`[${type}] ${text}`);
    });

    const url = `${BASE}/products/${PRODUCT_SLUG}`;
    console.log("Navigating to", url);
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    if (!response || !response.ok()) {
      console.error("Page load failed:", response?.status());
      process.exit(1);
    }

    await page.waitForSelector('button[aria-label*="image gallery"] img', { timeout: 10000 });

    const heroImgSrc = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="image gallery"]');
      if (!btn) return null;
      const img = btn.querySelector("img");
      return img?.getAttribute("src") ?? null;
    });
    console.log("Hero image src (first 80 chars):", heroImgSrc ? heroImgSrc.slice(0, 80) + "…" : "none");

    const hasFabricSection = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll("p")).find(
        (p) => p.textContent?.trim() === "Fabric"
      );
      return !!heading;
    });
    console.log("Fabric section present:", hasFabricSection);

    const fabricButtons = await page.$$('button[aria-label^="Select "]');
    console.log("Fabric swatch buttons count:", fabricButtons.length);

    if (fabricButtons.length > 0) {
      await fabricButtons[1].click();
      await new Promise((r) => setTimeout(r, 800));
      const heroSrcAfter = await page.evaluate(() => {
        const btn = document.querySelector('button[aria-label*="image gallery"]');
        const img = btn?.querySelector("img");
        return img?.getAttribute("src") ?? null;
      });
      console.log("Hero src after clicking 2nd swatch:", heroSrcAfter ? heroSrcAfter.slice(0, 80) + "…" : "none");
    }

    // Wait for fallback: color-variant may 404; component uses 2.5s timeout to switch to default hero
    await new Promise((r) => setTimeout(r, 4500));
    const heroState = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="image gallery"]');
      const img = btn?.querySelector("img");
      if (!img) return { src: null, complete: false, naturalWidth: 0 };
      return {
        src: img.getAttribute("src") ?? null,
        complete: img.complete,
        naturalWidth: img.naturalWidth ?? 0,
      };
    });
    console.log("Hero after 3.5s:", heroState);
    const heroLoaded = heroState.complete && (heroState.naturalWidth ?? 0) > 0;
    if (!heroLoaded) {
      console.error("Hero image did not load; fallback may have failed.");
      process.exit(1);
    }

    if (consoleErrors.length > 0) {
      console.error("\n--- Console errors ---");
      consoleErrors.forEach((e) => console.error(e));
      process.exit(1);
    }

    console.log("\nNo console errors. Page check OK.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
