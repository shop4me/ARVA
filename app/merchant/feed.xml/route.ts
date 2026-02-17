import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import { buildMerchantItems, toMerchantXml } from "@/lib/merchantFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Serves Google Merchant Center feed at /merchant/feed.xml */
export async function GET() {
  const products = await getProducts();
  const baseUrl = absoluteUrl("");
  const items = buildMerchantItems(products, baseUrl);
  const xml = toMerchantXml(items, baseUrl);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    },
  });
}
