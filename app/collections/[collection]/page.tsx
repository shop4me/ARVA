import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollection, getProductsByCollection, getReviewSummariesBySlug } from "@/lib/api";
import { readProductDetails } from "@/lib/dataStore";
import { getEffectiveCompareAtPrice, getEffectiveSalePrice } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300; // 5 minutes

type Props = { params: Promise<{ collection: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return { title: "Collection Not Found" };

  const title = collection.seoTitle;
  const description = collection.seoDescription;
  const canonical = absoluteUrl(`/collections/${slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { collection: slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const [products, productDetails] = await Promise.all([
    getProductsByCollection(slug),
    readProductDetails(),
  ]);
  const reviewSummaries = await getReviewSummariesBySlug(products.map((p) => p.slug));

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold text-arva-text mb-2">
          {collection.name}
        </h1>
        <p className="text-lg text-arva-text-muted mb-2">{collection.tagline}</p>
        <p className="text-arva-text-muted leading-relaxed max-w-2xl">
          {collection.description}
        </p>
      </header>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {products.map((product) => {
          const ribbon =
            product.slug === "atlas-sectional" ||
            product.slug === "alto-3-seater" ||
            product.slug === "oris-sectional"
              ? "Most popular"
              : undefined;
          return (
            <li key={product.slug} className="h-full">
            <ProductCard
              product={product}
              reviewSummary={reviewSummaries[product.slug]}
              imageOverride={productDetails[product.slug]?.images?.hero}
              colorOptions={productDetails[product.slug]?.fabricOptions}
              ribbon={ribbon}
              priceDisplay={getEffectiveSalePrice(product.slug, product.price)}
              compareAtPrice={getEffectiveCompareAtPrice(product.slug)}
            />
            </li>
          );
        })}
      </ul>
    </article>
  );
}
