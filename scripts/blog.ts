/**
 * Blog generator and publisher for ARVA.
 *
 * Usage:
 *   npm run blog -- generate
 *   npm run blog -- generate --update
 *
 * Default behavior is idempotent: skip posts that already exist by slug.
 */

import { readFile } from "fs/promises";
import path from "path";
import { readPosts, writePosts } from "../lib/dataStore";
import type { Post } from "../lib/content";
import { openAiChatJson } from "../lib/openaiServer";

const TITLES = [
  "Why All Cloud Sofas Look the Same And Why Comfort Isnt",
  "Cloud Sofa Buying Guide What Actually Matters And What Is Just Hype",
  "Soft vs Supportive Why a Sofa Should Be Made to Sit Not Just Lounge",
  "Pet Friendly Sofas What Makes a Couch Actually Survive Real Life",
  "How Long Should a Sofa Last Inside Construction Fabric and Longevity",
] as const;

const DEFAULT_AUTHOR = "ARVA";

const BRAND_BLOCKLIST = [
  "ikea",
  "wayfair",
  "amazon",
  "walmart",
  "costco",
  "crate and barrel",
  "restoration hardware",
  "rh",
  "west elm",
  "pottery barn",
  "burrow",
  "joybird",
  "living spaces",
  "ashley",
  "bob's",
  "bobs",
];

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasForbiddenChars(text: string): string | null {
  if (text.includes("-")) return "Contains a hyphen character.";
  if (text.includes(":")) return "Contains a colon character.";
  return null;
}

function sanitizeForbiddenChars(text: string): string {
  // Enforce formatting rules without changing meaning.
  // Replace forbidden punctuation with spaces to avoid accidental hyphenated compounds.
  const replaced = text.replace(/[-:]/g, " ");
  const lines = replaced.split(/\r?\n/).map((line) => line.replace(/[ \t]+/g, " ").trimEnd());
  // Preserve intentional blank lines for markdown.
  return lines.join("\n").trim();
}

function ensureRequiredMentionsAndLinks(body: string): string {
  let next = body.trim();

  // Ensure ARVA appears at least once in the body.
  if (!next.includes("ARVA")) {
    next = `${next}\n\nARVA makes cloud sofas that feel supportive without losing the relaxed look.`;
  }

  const hasAbout = /\]\(\/about\)/.test(next);
  const hasProduct = /\]\(\/products\/[a-z0-9]+\)/.test(next);
  if (hasAbout && hasProduct) return next;

  const fallbackLinks = [
    "If you want to see what this looks like in a real living room check out [Atlas Sectional](/products/atlassectional).",
    "To learn more about how ARVA thinks about comfort and longevity visit [About](/about).",
  ].join(" ");

  return `${next}\n\n${fallbackLinks}`;
}

const ALLOWED_PRODUCT_LINK_SLUGS = new Set([
  "atlassectional",
  "atlas3seater",
  "atlasloveseat",
  "altosectional",
  "alto3seater",
  "altoloveseat",
  "orissectional",
  "oris3seater",
  "orisloveseat",
]);

function containsOtherBrands(text: string): string | null {
  const lower = text.toLowerCase();
  for (const b of BRAND_BLOCKLIST) {
    if (b.includes(" ")) {
      if (lower.includes(b)) return `Contains disallowed brand mention: ${b}`;
      continue;
    }
    if (b.length <= 3) {
      const re = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "i");
      if (re.test(text)) return `Contains disallowed brand mention: ${b}`;
      continue;
    }
    if (lower.includes(b)) return `Contains disallowed brand mention: ${b}`;
  }
  return null;
}

function validatePostDraft(draft: {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  body: string;
  author?: string;
}): void {
  const wc = wordCount(draft.body);
  if (wc < 300) throw new Error(`Body too short: ${wc} words (min 300).`);

  const forbidden = hasForbiddenChars(draft.body);
  if (forbidden) throw new Error(`Body validation failed: ${forbidden}`);

  const forbiddenExcerpt = hasForbiddenChars(draft.excerpt);
  if (forbiddenExcerpt) throw new Error(`Excerpt validation failed: ${forbiddenExcerpt}`);

  const forbiddenSeoTitle = hasForbiddenChars(draft.seoTitle);
  if (forbiddenSeoTitle) throw new Error(`SEO title validation failed: ${forbiddenSeoTitle}`);

  const forbiddenSeoDesc = hasForbiddenChars(draft.seoDescription);
  if (forbiddenSeoDesc) throw new Error(`SEO description validation failed: ${forbiddenSeoDesc}`);

  if (!draft.body.includes("ARVA")) throw new Error("Body must mention ARVA at least once.");
  if (containsOtherBrands(draft.body)) throw new Error(containsOtherBrands(draft.body) as string);
  if (containsOtherBrands(draft.excerpt)) throw new Error(containsOtherBrands(draft.excerpt) as string);

  if (draft.seoTitle.length > 60) throw new Error(`SEO title too long: ${draft.seoTitle.length} (max 60).`);
  if (draft.seoDescription.length > 155) throw new Error(`SEO description too long: ${draft.seoDescription.length} (max 155).`);
  if (draft.excerpt.length > 160) throw new Error(`Excerpt too long: ${draft.excerpt.length} (max 160).`);

  if (!/\]\(\/about\)/.test(draft.body)) throw new Error("Body must include an internal markdown link to /about.");
  if (!/\]\(\/products\/[a-z0-9]+\)/.test(draft.body)) {
    throw new Error("Body must include at least one internal markdown link to a product page.");
  }

  // Product links must use known hyphenless aliases to keep the article body hyphen-free.
  const productLinks = Array.from(draft.body.matchAll(/\]\(\/products\/([a-z0-9]+)\)/g)).map((m) => m[1]);
  for (const s of productLinks) {
    if (!ALLOWED_PRODUCT_LINK_SLUGS.has(s)) {
      throw new Error(`Body contains unknown product link slug: ${s}`);
    }
  }
}

function canonicalProductLinks(): { label: string; href: string }[] {
  // Use hyphenless aliases so the article body contains no hyphen characters.
  return [
    { label: "Atlas Sectional", href: "/products/atlassectional" },
    { label: "Atlas 3 Seater", href: "/products/atlas3seater" },
    { label: "Atlas Loveseat", href: "/products/atlasloveseat" },
    { label: "Alto Sectional", href: "/products/altosectional" },
    { label: "Alto 3 Seater", href: "/products/alto3seater" },
    { label: "Alto Loveseat", href: "/products/altoloveseat" },
  ];
}

async function generateOnce(title: string, failureHint?: string): Promise<Omit<Post, "publishedAt"> & { author: string }> {
  const slug = slugifyTitle(title);
  const links = canonicalProductLinks();

  const system = "You are a premium DTC furniture brand writer. Return strict JSON only.";
  // Intentionally avoid using ':' or '-' characters in the prompt itself to reduce accidental leakage
  // into the generated article text (the body is strictly validated).
  const user = [
    "Write one blog post as markdown with multiple short paragraphs",
    "No lists that use hyphen bullets",
    "No headings that include colon characters",
    failureHint ? `Important rewrite note ${failureHint}` : "",
    "",
    "Hard rules for the article body",
    "No hyphen characters anywhere",
    "No colon characters anywhere",
    "At least 450 words",
    "Casual witty tone that still feels premium and modern",
    "Do not mention any brand except ARVA",
    "Avoid competitor names entirely",
    "Include a natural recommendation for ARVA sofas at least once",
    "",
    "Internal links required in the body",
    "Include one link to /about",
    "Include at least two links to product pages using these exact link targets",
    links.map((l) => `[${l.label}](${l.href})`).join("\\n"),
    "Do not include any external links",
    "",
    "Keyword guidance",
    "Use natural phrases including cloud sofa cloud couch modular couch supportive sofa pet friendly sofa spill resistant sofa durable sofa",
    "Avoid keyword stuffing",
    "",
    "Required output JSON keys",
    "title",
    "slug",
    "seoTitle under 60 characters",
    "seoDescription under 155 characters",
    "excerpt under 160 characters",
    "author",
    "body",
    "",
    "Use this title and slug exactly",
    title,
    slug,
    "",
    "Return strict JSON only with these keys",
  ].join("\\n");

  const res = await openAiChatJson<{
    title: string;
    slug: string;
    seoTitle: string;
    seoDescription: string;
    excerpt: string;
    author?: string;
    body: string;
  }>({
    model: "gpt-4o-mini",
    temperature: 0.9,
    system,
    user,
    maxTokens: 2200,
  });

  if (!res.ok) throw new Error(res.error);
  const v = res.value;
  return {
    title: v.title || title,
    slug: v.slug || slug,
    seoTitle: v.seoTitle || `${title} | ARVA`,
    seoDescription: v.seoDescription || "",
    excerpt: v.excerpt || "",
    body: v.body || "",
    author: (v.author && String(v.author).trim()) || DEFAULT_AUTHOR,
  };
}

async function generateValidated(title: string): Promise<Post> {
  const slug = slugifyTitle(title);

  const attempt = async () => {
    const draft = await generateOnce(title);
    const normalized = {
      ...draft,
      title,
      slug,
      author: draft.author || DEFAULT_AUTHOR,
      seoTitle: sanitizeForbiddenChars(draft.seoTitle ?? ""),
      seoDescription: sanitizeForbiddenChars(draft.seoDescription ?? ""),
      excerpt: sanitizeForbiddenChars(draft.excerpt ?? ""),
      body: ensureRequiredMentionsAndLinks(sanitizeForbiddenChars(draft.body ?? "")),
    };
    validatePostDraft(normalized);
    return normalized;
  };

  const attemptWithHint = async (hint: string) => {
    const draft = await generateOnce(title, hint);
    const normalized = {
      ...draft,
      title,
      slug,
      author: draft.author || DEFAULT_AUTHOR,
      seoTitle: sanitizeForbiddenChars(draft.seoTitle ?? ""),
      seoDescription: sanitizeForbiddenChars(draft.seoDescription ?? ""),
      excerpt: sanitizeForbiddenChars(draft.excerpt ?? ""),
      body: ensureRequiredMentionsAndLinks(sanitizeForbiddenChars(draft.body ?? "")),
    };
    validatePostDraft(normalized);
    return normalized;
  };

  try {
    const ok = await attempt();
    return {
      ...ok,
      publishedAt: new Date().toISOString().slice(0, 10),
    };
  } catch (err1) {
    // Regenerate once if validation fails.
    try {
      const reason = err1 instanceof Error ? err1.message : "Validation failed";
      const ok2 = await attemptWithHint(`The last draft failed validation because ${reason}. Rewrite and remove the problem entirely.`);
      return {
        ...ok2,
        publishedAt: new Date().toISOString().slice(0, 10),
      };
    } catch (err2) {
      const message =
        err2 instanceof Error ? err2.message : "Blog generation failed validation.";
      throw new Error(`Failed to generate valid post for slug ${slug}. ${message}`);
    }
  }
}

async function runGenerate({ update }: { update: boolean }) {
  const existing = await readPosts().catch(() => [] as Post[]);
  const bySlug = new Map(existing.map((p) => [p.slug, p]));
  const next: Post[] = [...existing];

  for (const title of TITLES) {
    const slug = slugifyTitle(title);
    if (bySlug.has(slug) && !update) {
      console.log(`SKIP ${slug}`);
      continue;
    }

    const post = await generateValidated(title);
    const idx = next.findIndex((p) => p.slug === slug);
    if (idx >= 0) {
      next[idx] = post;
      console.log(`UPDATE ${slug}`);
    } else {
      next.push(post);
      console.log(`CREATE ${slug}`);
    }

    // Persist progress after each successful post so partial runs are durable.
    next.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.title.localeCompare(b.title));
    await writePosts(next);
    bySlug.set(slug, post);
  }

  // Keep deterministic ordering: newest first by publishedAt, then title.
  next.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.title.localeCompare(b.title));
  await writePosts(next);
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const cmd = args[0] ?? "";
  const update = args.includes("--update");
  return { cmd, update };
}

async function main() {
  const { cmd, update } = parseArgs(process.argv);
  if (cmd !== "generate") {
    console.log("Usage: npm run blog -- generate [--update]");
    process.exit(1);
  }
  await runGenerate({ update });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

