/**
 * Puppeteer: open admin, log in with password, verify edit product UI.
 * Run: npx tsx scripts/test_admin_login.ts
 */
import puppeteer from "puppeteer";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3030";
const ADMIN_URL = `${BASE}/qw987`;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "qw987";

async function main() {
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS === "1",
    slowMo: process.env.HEADLESS === "1" ? 0 : 120,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(ADMIN_URL, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForSelector('input[type="password"]', { timeout: 8000 });
    await page.type('input[type="password"]', ADMIN_PASSWORD, { delay: 50 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));

    const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
    const hasEditUI = bodyText.includes("Which product are you editing") || bodyText.includes("Edit product page");
    if (!hasEditUI) {
      console.error("FAIL: After login, edit UI not found. Body sample:", bodyText.slice(0, 600));
      process.exit(1);
    }
    console.log("OK: Logged into admin; edit product page visible.");
    if (process.env.HEADLESS !== "1") {
      console.log("(Browser closing in 4s...)");
      await new Promise((r) => setTimeout(r, 4000));
    }
  } catch (e) {
    console.error("FAIL:", e);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
