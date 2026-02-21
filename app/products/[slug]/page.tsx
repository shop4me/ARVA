import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductDetail, getProductsByCollection } from "@/lib/api";
import { getEstimatedArrivalRange } from "@/lib/shippingEstimate";
import { absoluteUrl, productJsonLd } from "@/lib/seo";
import type { ProductCategory } from "@/lib/content";
import {
  buildMerchantDescription,
  buildMerchantTitle,
  getMerchantHeroImagePath,
} from "@/lib/merchantFeed";
import { getEffectiveSalePrice } from "@/lib/pricing";
import ProductHero from "@/components/product/ProductHero";
import TrustStrip from "@/components/product/TrustStrip";
import PdpJumpLinks from "@/components/product/PdpJumpLinks";
import ComfortFeel from "@/components/product/ComfortFeel";
import ComfortExplainer from "@/components/product/ComfortExplainer";
import ComparisonTable from "@/components/product/ComparisonTable";
import DetailsAccordion from "@/components/product/DetailsAccordion";
import ProofTiles from "@/components/product/ProofTiles";
import WhyArvaVisual from "@/components/product/WhyArvaVisual";
import ProductReviews from "@/components/product/ProductReviews";
import ProductFAQ from "@/components/product/ProductFAQ";
import FinalCtaPdp from "@/components/product/FinalCtaPdp";
import StickyCTA from "@/components/product/StickyCTA";

const CONFIG_ORDER: ProductCategory[] = ["sectional", "three-seater", "loveseat"];

export const revalidate = 0; // always fresh so color-variant heroes and productDetails show immediately after deploy/admin updates

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const title = buildMerchantTitle(product);
  const description = buildMerchantDescription(product);
  const canonical = absoluteUrl(`/products/${slug}`);

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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const detail = await getProductDetail(slug);
  const priceForSchema = getEffectiveSalePrice(slug, detail?.displayPrice ?? product.price);
  const nameForSchema = buildMerchantTitle(product);
  const descriptionForSchema = buildMerchantDescription(product);
  const imageForSchema = getMerchantHeroImagePath(product.slug) ?? product.image;
  const jsonLd = productJsonLd({
    name: nameForSchema,
    description: descriptionForSchema,
    shoppingTitle: undefined,
    shoppingDescription: undefined,
    image: imageForSchema,
    price: priceForSchema,
    currency: product.currency,
    slug: product.slug,
    stockStatus: product.stockStatus,
  });

  if (detail) {
    const collectionProducts = await getProductsByCollection(product.collection);
    const relatedProducts = CONFIG_ORDER.map(
      (cat) => collectionProducts.find((p) => p.category === cat)
    ).filter((p): p is NonNullable<typeof p> => p != null);
    const arrivalRange = getEstimatedArrivalRange({ minWeeks: 2, maxWeeks: 4 });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="pb-24 sm:pb-28 overflow-x-hidden">
          <ProductHero
            product={product}
            detail={detail}
            arrivalRange={arrivalRange}
            relatedProducts={relatedProducts}
            basePath="/products"
          />
          <TrustStrip detail={detail} />
          <PdpJumpLinks />
          <ComfortFeel detail={detail} />
          <ComfortExplainer />
          <ComparisonTable />
          <DetailsAccordion detail={detail} />
          <ProofTiles detail={detail} />
          <WhyArvaVisual />
          <ProductReviews detail={detail} />
          <ProductFAQ items={detail.faq} />
          <FinalCtaPdp product={product} detail={detail} />
          <StickyCTA product={product} detail={detail} />
        </article>
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl font-semibold text-arva-text mb-2">
          {product.name}
        </h1>
        <p className="text-2xl text-arva-text mb-6">
          ${getEffectiveSalePrice(slug, product.price).toLocaleString()} {product.currency}
        </p>
        <div className="min-h-[280px] rounded-xl bg-neutral-50 border border-arva-border mb-8 flex items-center justify-center text-arva-text-muted text-sm">
          {product.name}
        </div>
        <p className="text-arva-text-muted leading-relaxed mb-8">
          {product.description}
        </p>
        <p className="text-sm text-arva-text-muted">
          Availability: {product.stockStatus === "InStock" ? "In Stock" : product.stockStatus}
        </p>
      </article>
    </>
  );
}
