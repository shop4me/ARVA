/**
 * Puppeteer: verify on LIVE site that choosing a fabric updates the main hero image.
 * Run: npx tsx scripts/check_live_fabric_hero.ts
 * Launches visible browser on desktop (headless: false).
 */

import puppeteer from "puppeteer";

const LIVE_URL = "https://livearva.com/products/atlas-sectional";
const SLATE_JPG = "atlas-sectional-slate-gray.jpg";
const SLATE_WEBP_FALLBACK = "atlas-sectional-cloud-couch-slate-seam-05.webp";

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to", LIVE_URL);
    const response = await page.goto(LIVE_URL, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });
    if (!response || !response.ok()) {
      console.error("Page load failed:", response?.status());
      process.exit(1);
    }

    await page.waitForSelector('button[aria-label*="image gallery"] img', { timeout: 10000 });

    const getHeroSrc = async () => {
      return page.evaluate(() => {
        const btn = document.querySelector('button[aria-label*="image gallery"]');
        const img = btn?.querySelector("img");
        return img?.getAttribute("src") ?? null;
      });
    };

    const initialSrc = await getHeroSrc();
    console.log("Initial hero src:", initialSrc ? initialSrc.slice(-65) : "none");

    const fabricButtons = await page.$$('button[aria-label^="Select "]');
    if (fabricButtons.length < 2) {
      console.error("Expected at least 2 fabric swatches, got", fabricButtons.length);
      process.exit(1);
    }

    const secondLabel = await page.evaluate(() => {
      const btns = document.querySelectorAll('button[aria-label^="Select "]');
      return btns[1]?.getAttribute("aria-label") ?? null;
    });
    console.log("Clicking 2nd fabric swatch:", secondLabel);

    await fabricButtons[1].click();

    await new Promise((r) => setTimeout(r, 500));
    const srcAfterClick = await getHeroSrc();
    console.log("Hero src after click:", srcAfterClick ? srcAfterClick.slice(-70) : "none");

    if (initialSrc === srcAfterClick) {
      console.error("FAIL: Hero image did NOT update after clicking color. src unchanged.");
      process.exit(1);
    }
    console.log("OK: Hero src changed after click.");

    await new Promise((r) => setTimeout(r, 3000));
    const srcAfterWait = await getHeroSrc();
    const isSlateImage =
      (srcAfterWait?.includes(SLATE_JPG) ?? false) || (srcAfterWait?.includes(SLATE_WEBP_FALLBACK) ?? false);
    if (!isSlateImage) {
      console.error("FAIL: Hero is not Slate Gray image. src:", srcAfterWait?.slice(-70));
      process.exit(1);
    }
    console.log("OK: Hero shows Slate Gray image (generated or fallback).");

    const heroLoaded = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="image gallery"]');
      const img = btn?.querySelector("img");
      return img ? img.complete && img.naturalWidth > 0 : false;
    });
    if (!heroLoaded) {
      console.error("FAIL: Hero image did not load (complete/dimensions).");
      process.exit(1);
    }
    console.log("OK: Hero image loaded.");
    console.log("\nDone: Fabric selection updates main image on live site.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
