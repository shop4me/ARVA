import type { MetadataRoute } from "next";
import { getProducts, getPosts, getCollections } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, collections] = await Promise.all([
    getProducts(),
    getPosts(),
    getCollections(),
  ]);

  const productEntries = products.map((p) => ({
    url: absoluteUrl(`/products/${p.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const collectionIndex = {
    url: absoluteUrl("/collections"),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  };
  const collectionEntries = collections.map((c) => ({
    url: absoluteUrl(`/collections/${c.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const postEntries = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/products"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    collectionIndex,
    ...collectionEntries,
    ...productEntries,
    ...postEntries,
  ];
}
