import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import { merchantFeedRows, buildMerchantFeedCsv } from "@/lib/merchantFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const products = await getProducts();
  const imageBySlug: Record<string, string | undefined> = {};
  for (const p of products) {
    imageBySlug[p.slug] = p.image;
  }
  const baseUrl = absoluteUrl("");
  const csv = buildMerchantFeedCsv(baseUrl.replace(/\/$/, ""), merchantFeedRows, imageBySlug);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"arva-google-merchant-feed.csv\"",
    },
  });
}
