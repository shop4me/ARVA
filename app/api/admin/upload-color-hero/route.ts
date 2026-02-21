import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

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

function colorToSlug(color: string): string {
  return color.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "taupe";
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;
  const colorName = formData.get("colorName") as string | null;

  if (!file || !slug || !colorName) {
    return NextResponse.json({ error: "file, slug, and colorName required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }

  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "product";
  const colorSlug = colorToSlug(colorName);
  const filename = `${safeSlug}-cloud-couch-${colorSlug}-hero-01.webp`;
  const dir = path.join(process.cwd(), "public", "images", "products", safeSlug);
  const filepath = path.join(dir, filename);

  try {
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await sharp(buf)
      .webp({ quality: 88 })
      .toFile(filepath);
  } catch (err) {
    console.error("Upload color hero error:", err);
    return NextResponse.json({ error: "Failed to convert or save image" }, { status: 500 });
  }

  const url = `/images/products/${safeSlug}/${filename}` as string;
  return NextResponse.json({ url });
}
