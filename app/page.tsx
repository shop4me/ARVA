import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import Hero from "@/components/home/Hero";
import ProductLineup from "@/components/home/ProductLineup";
import WhyArva from "@/components/home/WhyArva";
import ArvaDifference from "@/components/home/ArvaDifference";
import Reviews from "@/components/home/Reviews";
import ReturnsTrial from "@/components/home/ReturnsTrial";
import FAQAccordion from "@/components/home/FAQAccordion";
import FinalCta from "@/components/home/FinalCta";
import { faqItems } from "@/lib/homepage";

export const revalidate = 600; // 10 minutes

export async function generateMetadata(): Promise<Metadata> {
  const title = "ARVA | Modern Furniture for Your Home";
  const description =
    "Discover ARVA modern furniture. Premium sofas, sectionals, and living room pieces. Free shipping.";
  const canonical = absoluteUrl("/");

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

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductLineup />
      <WhyArva />
      <ArvaDifference />
      <Reviews />
      <ReturnsTrial />
      <FAQAccordion items={faqItems} />
      <FinalCta />
    </>
  );
}
