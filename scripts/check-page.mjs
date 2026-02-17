/**
 * Puppeteer script: open product page, check title/CSS, save screenshot.
 * Run: node scripts/check-page.mjs
 * Requires dev server: npm run dev
 */

import puppeteer from "puppeteer";

const PORTS = [3000, 3001, 3002, 3003, 3004];
const PATH = "/products/atlas-sectional";
const SCREENSHOT_PATH = "screenshot-check.png";

async function main() {
  let port = null;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  try {
    for (const p of PORTS) {
      try {
        const url = `http://127.0.0.1:${p}${PATH}`;
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 5000 });
        if (response && response.ok()) {
          port = p;
          break;
        }
      } catch {
        continue;
      }
    }
    if (!port) {
      console.error("No dev server found. Run: npm run dev");
      process.exit(1);
    }
    const url = `http://127.0.0.1:${port}${PATH}`;
    console.log("Opening:", url);
    await page.setViewport({ width: 1280, height: 800 });
    const response = await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });
    if (!response || !response.ok()) {
      console.error("Page load failed:", response?.status());
      process.exit(1);
    }

    const title = await page.title();
    const bodyBg = await page.evaluate(() => {
      const b = document.body;
      const s = getComputedStyle(b);
      return {
        backgroundColor: s.backgroundColor,
        color: s.color,
        fontFamily: s.fontFamily,
        className: b.className,
      };
    });
    const h1Text = await page.evaluate(() => document.querySelector("h1")?.textContent?.trim() ?? "");
    const priceText = await page.evaluate(() => {
      const p = document.querySelector("p.text-2xl, [class*='text-2xl']");
      return p?.textContent?.trim() ?? document.body.innerText.match(/\$[\d,]+/)?.[0] ?? "";
    });
    const hasArvaBg = bodyBg.backgroundColor.includes("250") || bodyBg.backgroundColor.includes("250, 250, 248"); // #FAFAF8

    console.log("Title:", title);
    console.log("H1:", h1Text);
    console.log("Price shown:", priceText);
    console.log("Body bg:", bodyBg.backgroundColor);
    console.log("Body color:", bodyBg.color);
    console.log("Body classes:", bodyBg.className);
    console.log("CSS applied (arva-bg ~ #FAFAF8):", hasArvaBg || bodyBg.className.includes("arva"));

    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
    console.log("Screenshot saved:", SCREENSHOT_PATH);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
