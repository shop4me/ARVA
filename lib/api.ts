/**
 * Server-side data layer. Single source of truth: data store (data/*.json).
 */

import { posts, collections, type Product, type Post, type Collection } from "./content";
import { readProducts, getProductDetailFromStore } from "./dataStore";

export async function getProducts(): Promise<Product[]> {
  return readProducts();
}

export async function getProduct(slug: string): Promise<Product | null> {
  const list = await readProducts();
  return list.find((p) => p.slug === slug) ?? null;
}

/** Alias for getProduct; use for product-by-slug in dynamic route. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getProduct(slug);
}

export async function getCollections(): Promise<Collection[]> {
  return collections;
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const valid = ["atlas", "alto", "oris"];
  if (!valid.includes(slug)) return null;
  return collections.find((c) => c.slug === slug) ?? null;
}

export async function getProductsByCollection(collectionSlug: string): Promise<Product[]> {
  const list = await readProducts();
  return list.filter((p) => p.collection === collectionSlug);
}

export async function getPosts(): Promise<Post[]> {
  return posts;
}

export async function getPost(slug: string): Promise<Post | null> {
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getProductDetail(slug: string): Promise<import("./productDetail").ProductDetailData | null> {
  return getProductDetailFromStore(slug);
}
