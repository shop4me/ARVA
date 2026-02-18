/**
 * Server-only read/write for admin-editable data.
 * Single source of truth: data/*.json. No fallbacks.
 */

import { promises as fs } from "fs";
import path from "path";
import type { Product, Post } from "./content";
import type { ProductDetailData } from "./productDetail";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_PATH = path.join(DATA_DIR, "products.json");
const DETAILS_PATH = path.join(DATA_DIR, "productDetails.json");
const POSTS_PATH = path.join(DATA_DIR, "posts.json");

async function readJsonStrict<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function readProducts(): Promise<Product[]> {
  return readJsonStrict<Product[]>(PRODUCTS_PATH);
}

export async function writeProducts(products: Product[]): Promise<void> {
  return writeJson(PRODUCTS_PATH, products);
}

export async function readProductDetails(): Promise<Record<string, ProductDetailData>> {
  return readJsonStrict<Record<string, ProductDetailData>>(DETAILS_PATH);
}

export async function writeProductDetails(details: Record<string, ProductDetailData>): Promise<void> {
  return writeJson(DETAILS_PATH, details);
}

export async function getProductDetailFromStore(slug: string): Promise<ProductDetailData | null> {
  const details = await readProductDetails();
  return details[slug] ?? null;
}

export async function readPosts(): Promise<Post[]> {
  return readJsonStrict<Post[]>(POSTS_PATH);
}

export async function writePosts(posts: Post[]): Promise<void> {
  return writeJson(POSTS_PATH, posts);
}
