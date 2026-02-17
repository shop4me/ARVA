import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { readProducts, writeProducts } from "@/lib/dataStore";
import type { Product } from "@/lib/content";

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

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await readProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body.products && Array.isArray(body.products)) {
    await writeProducts(body.products as Product[]);
    return NextResponse.json({ ok: true });
  }
  if (body.add && typeof body.add === "object") {
    const products = await readProducts();
    const add = body.add as Partial<Product>;
    if (!add.slug || !add.name) {
      return NextResponse.json({ error: "slug and name required" }, { status: 400 });
    }
    if (products.some((p) => p.slug === add.slug)) {
      return NextResponse.json({ error: "Product slug already exists" }, { status: 400 });
    }
    const slug = add.slug;
    const name = add.name ?? "";
    const newProduct: Product = {
      id: add.id ?? slug,
      name,
      slug,
      collection: (add.collection as Product["collection"]) ?? "atlas",
      category: (add.category as Product["category"]) ?? "three-seater",
      price: typeof add.price === "number" ? add.price : 0,
      currency: add.currency ?? "USD",
      description: add.description ?? "",
      highlights: Array.isArray(add.highlights) ? add.highlights : [],
      isOutdoor: add.isOutdoor ?? false,
      seoTitle: add.seoTitle ?? `${name} | Modular Modern Sofa`,
      seoDescription: add.seoDescription ?? `Shop the ${name}. Modular design, durable construction, 100-day trial, lifetime structural warranty.`,
      image: add.image,
      stockStatus: add.stockStatus ?? "InStock",
      createdAt: add.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    await writeProducts(products);
    return NextResponse.json({ ok: true, slug: newProduct.slug });
  }
  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
