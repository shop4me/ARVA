/**
 * Puppeteer test: Atlas Sectional hero image updates when fabric color is selected.
 * Run with dev server up: npm run dev (port 3030), then npx tsx scripts/test_atlas_sectional_hero.ts
 */

import puppeteer from "puppeteer";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3030";
const PDP = `${BASE}/products/atlas-sectional`;

const EXPECTED_HERO_PATTERNS: Record<string, RegExp> = {
  "Warm Ivory": /atlas-sectional-cloud-couch-warm-ivory-hero-01\.webp/,
  "Slate Gray": /atlas-sectional-cloud-couch-slate-gray-hero-01\.webp/,
  "Charcoal": /atlas-sectional-cloud-couch-charcoal-hero-01\.webp/,
  "Soft White": /atlas-sectional-cloud-couch-soft-white-hero-01\.webp/,
  "Stone": /atlas-sectional-cloud-couch-stone-hero-01\.webp/,
  "Mist": /atlas-sectional-cloud-couch-mist-hero-01\.webp/,
  "Oatmeal": /atlas-sectional-cloud-couch-oatmeal-hero-01\.webp/,
  "Graphite": /atlas-sectional-cloud-couch-graphite-hero-01\.webp/,
};

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    const response = await page.goto(PDP, { waitUntil: "networkidle0", timeout: 15000 });
    if (!response || !response.ok()) {
      throw new Error(`Page load failed: ${response?.status() ?? "no response"}`);
    }

    // Hero image is inside the first gallery slot (index 0). Selector: main hero img in the aspect box
    const heroImgSelector = 'section button[aria-label*="image gallery"] img';
    await page.waitForSelector(heroImgSelector, { timeout: 5000 });

    const getHeroSrc = async () => {
      const src = await page.evaluate((sel) => {
        const img = document.querySelector<HTMLImageElement>(sel);
        return img?.src ?? "";
      }, heroImgSelector);
      return src;
    };

    // Check initial (Warm Ivory default)
    const initialSrc = await getHeroSrc();
    if (!EXPECTED_HERO_PATTERNS["Warm Ivory"].test(initialSrc)) {
      console.error("FAIL: Initial hero should be Warm Ivory WebP. Got:", initialSrc);
      process.exitCode = 1;
    } else {
      console.log("OK: Initial hero is Warm Ivory WebP");
    }

    // Click "Slate Gray" - find by title or aria-label (swatch buttons have title={opt.name})
    const slateGrayButton = await page.$('button[title="Slate Gray"]');
    if (!slateGrayButton) {
      console.error("FAIL: Could not find Slate Gray fabric button");
      process.exitCode = 1;
      await browser.close();
      return;
    }
    await slateGrayButton.click();
    await new Promise((r) => setTimeout(r, 600)); // allow React state update and img src change

    let srcAfter = await getHeroSrc();
    if (!EXPECTED_HERO_PATTERNS["Slate Gray"].test(srcAfter)) {
      console.error("FAIL: After selecting Slate Gray, hero should be slate-gray WebP. Got:", srcAfter);
      process.exitCode = 1;
    } else {
      console.log("OK: After Slate Gray, hero is slate-gray WebP");
    }

    // Click Charcoal
    const charcoalButton = await page.$('button[title="Charcoal"]');
    if (charcoalButton) {
      await charcoalButton.click();
      await new Promise((r) => setTimeout(r, 600));
      srcAfter = await getHeroSrc();
      if (!EXPECTED_HERO_PATTERNS["Charcoal"].test(srcAfter)) {
        console.error("FAIL: After Charcoal, hero should be charcoal WebP. Got:", srcAfter);
        process.exitCode = 1;
      } else {
        console.log("OK: After Charcoal, hero is charcoal WebP");
      }
    }

    // Click back to Warm Ivory
    const warmIvoryButton = await page.$('button[title="Warm Ivory"]');
    if (warmIvoryButton) {
      await warmIvoryButton.click();
      await new Promise((r) => setTimeout(r, 600));
      srcAfter = await getHeroSrc();
      if (!EXPECTED_HERO_PATTERNS["Warm Ivory"].test(srcAfter)) {
        console.error("FAIL: After Warm Ivory, hero should be warm-ivory WebP. Got:", srcAfter);
        process.exitCode = 1;
      } else {
        console.log("OK: After Warm Ivory, hero is warm-ivory WebP");
      }
    }

    if (process.exitCode !== 1) {
      console.log("All hero-by-color checks passed.");
    }
  } catch (e) {
    console.error("Error:", e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
