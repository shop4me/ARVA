import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { readProductDetails, writeProductDetails, getProductDetailFromStore } from "@/lib/dataStore";
import type { ProductDetailData } from "@/lib/productDetail";

const COOKIE_NAME = "arva_admin";

function tokenFromPassword(password: string): string {
  return createHash("sha256").update(password + "arva").digest("hex");
}

async function isAdmin(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD || "qw987";
  const expected = tokenFromPassword(password);
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token === expected;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  const detail = await getProductDetailFromStore(slug);
  return NextResponse.json(detail);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const slug = body.slug;
  const detail = body.detail as ProductDetailData | undefined;
  if (!slug || !detail) return NextResponse.json({ error: "slug and detail required" }, { status: 400 });
  const details = await readProductDetails();
  details[slug] = detail;
  await writeProductDetails(details);
  return NextResponse.json({ ok: true });
}
