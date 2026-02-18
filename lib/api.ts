/**
 * Server-side data layer. Single source of truth: data store (data/*.json).
 */

import { collections, type Product, type Post, type Collection } from "./content";
import { readProducts, getProductDetailFromStore, readProductDetails, readPosts } from "./dataStore";

const DISABLED_PRODUCT_SLUGS = new Set([
  "bellini-sectional",
  "bellini-3-seater",
  "bellini-loveseat",
]);

const DISABLED_COLLECTION_SLUGS = new Set(["bellini"]);

function isProductActive(product: Product): boolean {
  return !DISABLED_PRODUCT_SLUGS.has(product.slug);
}

export async function getProducts(): Promise<Product[]> {
  const products = await readProducts();
  return products.filter(isProductActive);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const list = await readProducts();
  const direct = list.find((p) => p.slug === slug && isProductActive(p));
  if (direct) return direct;
  const normalized = slug.replace(/-/g, "");
  return list.find((p) => p.slug.replace(/-/g, "") === normalized && isProductActive(p)) ?? null;
}

/** Alias for getProduct; use for product-by-slug in dynamic route. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getProduct(slug);
}

export async function getCollections(): Promise<Collection[]> {
  return collections.filter((collection) => !DISABLED_COLLECTION_SLUGS.has(collection.slug));
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const valid = ["atlas", "alto", "oris", "bellini"];
  if (!valid.includes(slug)) return null;
  if (DISABLED_COLLECTION_SLUGS.has(slug)) return null;
  return collections.find((c) => c.slug === slug) ?? null;
}

export async function getProductsByCollection(collectionSlug: string): Promise<Product[]> {
  const list = await readProducts();
  return list.filter((p) => p.collection === collectionSlug && isProductActive(p));
}

export async function getPosts(): Promise<Post[]> {
  return readPosts();
}

export async function getPost(slug: string): Promise<Post | null> {
  const list = await readPosts();
  return list.find((p) => p.slug === slug) ?? null;
}

export async function getProductDetail(slug: string): Promise<import("./productDetail").ProductDetailData | null> {
  const direct = await getProductDetailFromStore(slug);
  if (direct) return direct;
  const product = await getProduct(slug);
  if (!product) return null;
  return getProductDetailFromStore(product.slug);
}

export type ReviewSummary = { count: number; rating: number };

export async function getReviewSummariesBySlug(slugs: string[]): Promise<Record<string, ReviewSummary>> {
  const details = await readProductDetails();
  const map: Record<string, ReviewSummary> = {};
  for (const slug of slugs) {
    const reviewList = details[slug]?.reviews ?? [];
    const count = reviewList.length;
    if (!count) continue;
    const total = reviewList.reduce((sum, r) => sum + (r.rating ?? 5), 0);
    const rating = total / count;
    map[slug] = { count, rating };
  }
  return map;
}
