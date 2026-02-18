import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import { buildMerchantItems, toMerchantCsv } from "@/lib/merchantFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const products = await getProducts();
  const baseUrl = absoluteUrl("");
  const items = await buildMerchantItems(products, baseUrl);
  const csv = toMerchantCsv(items);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"arva-google-merchant-feed.csv\"",
    },
  });
}
