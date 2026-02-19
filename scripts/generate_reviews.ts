/**
 * Generate PDP reviews with OpenAI and append them to product details.
 *
 * Usage:
 *   npx tsx scripts/generate_reviews.ts atlas-sectional alto-3-seater
 *   npx tsx scripts/generate_reviews.ts atlas-sectional --count 15
 *
 * Requires OPENAI_API_KEY in .env.local or environment.
 * Reads product description + features from data/products.json and data/productDetails.json,
 * generates casual 2–3 sentence reviews with American names/locations, then appends to
 * each product's reviews in productDetails.json.
 */

import { readProducts, readProductDetails, writeProductDetails } from "../lib/dataStore";
import { openAiChatJson } from "../lib/openaiServer";
import type { Product } from "../lib/content";
import type { ProductDetailData } from "../lib/productDetail";

const DEFAULT_COUNT = 20;
const MIN_COUNT = 1;
const MAX_COUNT = 50;

type GeneratedReview = {
  quote: string;
  name: string;
  age: number;
  location: string;
  rating: 4 | 5;
  verified: boolean;
};

/** Strip return/trial policy from valueStack and copy so we don't encourage mentioning returns. */
function featuresForPrompt(valueStack: string[], deliveryCopy: string[]): string[] {
  const skip = /return|trial|pickup|restock|100.day|99\s*\$|refund/i;
  const fromStack = (valueStack || []).filter((s) => !skip.test(s));
  const fromDelivery = (deliveryCopy || []).filter((s) => !skip.test(s));
  return [...fromStack, ...fromDelivery];
}

/** Build a single blob of product features/benefits for the prompt (no returns). */
function buildFeaturesBlob(product: Product, detail: ProductDetailData | null): string {
  const parts: string[] = [];

  if (product.description) {
    const desc = product.description
      .replace(/\b(100-day in-home trial|return pickup|restocking|returned)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    if (desc) parts.push(`Product description: ${desc}`);
  }

  if (product.highlights?.length) {
    parts.push(`Highlights: ${product.highlights.join(". ")}`);
  }

  if (detail?.valueStack?.length || detail?.deliveryCopy?.length) {
    const features = featuresForPrompt(
      detail.valueStack ?? [],
      detail.deliveryCopy ?? []
    );
    if (features.length) parts.push(`Features and benefits to draw from: ${features.join(". ")}`);
  }

  if (detail?.comfortHeadline) parts.push(`Comfort: ${detail.comfortHeadline}`);
  if (detail?.comfortCopy) {
    const copy = detail.comfortCopy.replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (copy) parts.push(`Comfort copy: ${copy}`);
  }
  if (detail?.dimensionsReassurance) parts.push(`Dimensions note: ${detail.dimensionsReassurance}`);

  return parts.join("\n\n");
}

function parseArgs(argv: string[]): { slugs: string[]; count: number } {
  const args = argv.slice(2);
  const slugs: string[] = [];
  let count = DEFAULT_COUNT;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--count" && args[i + 1] != null) {
      count = Math.min(MAX_COUNT, Math.max(MIN_COUNT, parseInt(args[i + 1], 10) || DEFAULT_COUNT));
      i++;
    } else if (args[i] && !args[i].startsWith("--")) {
      slugs.push(args[i]);
    }
  }

  return { slugs, count };
}

async function generateReviewsForProduct(
  product: Product,
  detail: ProductDetailData | null,
  count: number
): Promise<GeneratedReview[]> {
  const featuresBlob = buildFeaturesBlob(product, detail);
  const productName = product.name;

  const system = `You are a copywriter generating short, casual customer reviews for a furniture product page. Return only valid JSON.
Rules:
- Each review is 2 or 3 sentences only. No more.
- Very casual tone. Sound like a real person, not marketing or AI.
- Do not mention return policy, returns, refunds, trial, or pickup. Do not mention shipping or delivery time.
- Turn the product's features into personal benefits (how it helped them, what they like).
- Use only the features and benefits provided. Do not invent specs.
- In the quote text do not use hyphens, colons, or dashes. Use commas or periods instead.
- Generate realistic American first and last names and real US city/location (City, ST).
- Each review must have: quote (string), name (string), age (number 25-55), location (string like "Austin, TX"), rating (4 or 5), verified (true).
- Return a JSON object with a single key "reviews" that is an array of review objects.`;

  const user = `Product: ${productName}

${featuresBlob}

Generate exactly ${count} new customer reviews. Each review: 2 or 3 sentences only, casual, real person tone. Use the features above as benefits. American names and locations. No hyphens, colons, or dashes in the quote. Do not mention returns or return policy. Return JSON: { "reviews": [ { "quote": "...", "name": "...", "age": 28, "location": "City, ST", "rating": 5, "verified": true }, ... ] }`;

  const res = await openAiChatJson<{ reviews: GeneratedReview[] }>({
    model: "gpt-4o",
    temperature: 0.85,
    maxTokens: 4000,
    system,
    user,
  });

  if (!res.ok) {
    throw new Error(res.error);
  }

  const list = res.value?.reviews;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("OpenAI did not return a reviews array.");
  }

  const out: GeneratedReview[] = [];
  for (const r of list) {
    if (!r || typeof r.quote !== "string" || !r.quote.trim()) continue;
    const quote = r.quote
      .replace(/[-–—]/g, " ")
      .replace(/\s*:\s*/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
    if (quote.length < 20) continue;
    out.push({
      quote,
      name: typeof r.name === "string" ? r.name.trim() : "Customer",
      age: typeof r.age === "number" && r.age >= 18 && r.age <= 99 ? r.age : 35,
      location: typeof r.location === "string" ? r.location.trim() : "US",
      rating: r.rating === 4 ? 4 : 5,
      verified: true,
    });
  }

  return out;
}

async function main() {
  const { slugs, count } = parseArgs(process.argv);

  if (slugs.length === 0) {
    console.error("Usage: npx tsx scripts/generate_reviews.ts <slug> [slug2 ...] [--count N]");
    console.error("Example: npx tsx scripts/generate_reviews.ts atlas-sectional alto-3-seater --count 15");
    process.exit(1);
  }

  const [products, details] = await Promise.all([readProducts(), readProductDetails()]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  for (const slug of slugs) {
    const product = productBySlug.get(slug);
    if (!product) {
      console.warn(`Skipping ${slug}: product not found in products.json`);
      continue;
    }

    const detail = details[slug] ?? null;
    if (!detail) {
      console.warn(`Skipping ${slug}: no product detail (add an entry in productDetails.json first)`);
      continue;
    }

    console.log(`Generating ${count} reviews for ${slug} (${product.name})...`);
    let newReviews: GeneratedReview[];
    try {
      newReviews = await generateReviewsForProduct(product, detail, count);
    } catch (e) {
      console.error(`Failed to generate reviews for ${slug}:`, e instanceof Error ? e.message : e);
      continue;
    }

    const existing = detail.reviews ?? [];
    const combined = [...existing, ...newReviews];
    details[slug] = { ...detail, reviews: combined };
    console.log(`  Added ${newReviews.length} reviews. Total for ${slug}: ${combined.length}`);
  }

  await writeProductDetails(details);
  console.log("Saved productDetails.json.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
