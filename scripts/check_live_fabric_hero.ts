/**
 * Puppeteer: verify on LIVE site that choosing a fabric updates the main hero image.
 * Run: npx tsx scripts/check_live_fabric_hero.ts
 */

import puppeteer from "puppeteer";

const LIVE_URL = "https://livearva.com/products/atlas-sectional";
const FABRIC_FALLBACK_SLATE = "atlas-sectional-cloud-couch-slate-seam-05.webp";

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
    console.log("Initial hero src:", initialSrc ? initialSrc.slice(-60) : "none");

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

    const srcAfterClick = await getHeroSrc();
    console.log("Hero src immediately after click:", srcAfterClick ? srcAfterClick.slice(-70) : "none");

    const changedRightAway = initialSrc !== srcAfterClick;
    if (changedRightAway) {
      console.log("OK: Hero src changed immediately after click.");
    } else {
      console.log("WARN: Hero src did NOT change immediately after click.");
    }

    console.log("Waiting 4s for fallback (404 -> fabric fallback image)...");
    await new Promise((r) => setTimeout(r, 4000));

    const srcAfterWait = await getHeroSrc();
    console.log("Hero src after 4s:", srcAfterWait ? srcAfterWait.slice(-70) : "none");

    const showsSlateFallback = srcAfterWait?.includes(FABRIC_FALLBACK_SLATE) ?? false;
    if (showsSlateFallback) {
      console.log("OK: Hero shows Slate Gray fallback image (slate-seam).");
    } else {
      console.log("FAIL: Hero does not show Slate Gray fallback. Expected URL to contain:", FABRIC_FALLBACK_SLATE);
      process.exit(1);
    }

    const heroLoaded = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="image gallery"]');
      const img = btn?.querySelector("img");
      return img ? img.complete && img.naturalWidth > 0 : false;
    });
    console.log("Hero image loaded (complete, has dimensions):", heroLoaded);
    if (!heroLoaded) {
      console.error("Hero image failed to load.");
      process.exit(1);
    }

    console.log("\nDone: Fabric selection updates main image on live site.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
