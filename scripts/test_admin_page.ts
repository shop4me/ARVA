/**
 * Puppeteer: load admin page and verify no server error.
 * Run: npx tsx scripts/test_admin_page.ts
 */
import puppeteer from "puppeteer";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const ADMIN_URL = `${BASE}/qw987`;

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    const response = await page.goto(ADMIN_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
    if (!response) {
      console.error("FAIL: No response");
      process.exit(1);
    }
    if (!response.ok()) {
      console.error("FAIL: Status", response.status(), response.statusText());
      process.exit(1);
    }
    await page.waitForSelector("main", { timeout: 5000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));

    const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
    if (bodyText.includes("Cannot find module") || bodyText.includes("Server Error") || (bodyText.includes("Error:") && bodyText.includes("Require stack"))) {
      console.error("FAIL: Server/chunk error on page:", bodyText.slice(0, 600));
      process.exit(1);
    }
    const hasAdmin = bodyText.includes("Admin login") || bodyText.includes("Edit product") || bodyText.includes("Which product are you editing") || bodyText.includes("Checking…");
    if (hasAdmin) {
      console.log("OK: Admin page loaded (login or edit screen)");
    } else {
      console.error("FAIL: Admin content not found. Page length:", bodyText.length, "Sample:", bodyText.slice(0, 400));
      process.exit(1);
    }
  } catch (e) {
    console.error("FAIL:", e);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
