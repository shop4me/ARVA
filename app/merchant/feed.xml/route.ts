import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";
import { readProductDetails } from "@/lib/dataStore";
import { absoluteUrl } from "@/lib/seo";
import { buildMerchantItems, toMerchantXml } from "@/lib/merchantFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MINIMAL_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>ARVA Product Feed</title>
    <link>https://livearva.com</link>
    <description>Google Merchant Center feed for ARVA</description>
  </channel>
</rss>
`;

/** Serves Google Merchant Center feed at /merchant/feed.xml. Always returns 200 + valid XML. */
export async function GET() {
  const baseUrl = absoluteUrl("");
  const headers: Record<string, string> = {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const [products, productDetails] = await Promise.all([getProducts(), readProductDetails()]);
    const items = await buildMerchantItems(products, baseUrl, productDetails);
    const xml = toMerchantXml(items, baseUrl);
    return new NextResponse(xml, { status: 200, headers });
  } catch (err) {
    console.error("[merchant feed]", err instanceof Error ? err.message : String(err));
    return new NextResponse(MINIMAL_FEED, { status: 200, headers });
  }
}
