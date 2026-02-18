import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getReviewSummariesBySlug } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300; // 5 minutes

export async function generateMetadata(): Promise<Metadata> {
  const title = "Products | ARVA Modern Furniture";
  const description =
    "Browse ARVA sofas, sectionals, and living room furniture. Premium design, quality materials.";
  const canonical = absoluteUrl("/products");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

export default async function ProductsPage() {
  const products = await getProducts();
  const reviewSummaries = await getReviewSummariesBySlug(products.map((p) => p.slug));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-arva-text mb-2">
        Our Products
      </h1>
      <p className="text-arva-text-muted mb-10">
        Premium sofas and sectionals for every space.
      </p>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {products.map((product) => (
          <li key={product.slug} className="h-full">
            <ProductCard product={product} reviewSummary={reviewSummaries[product.slug]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
