import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

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
  const field = formData.get("field") as string | null;

  if (!file || !slug || !field) {
    return NextResponse.json({ error: "file, slug, and field required" }, { status: 400 });
  }

  const type = file.type;
  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }

  const ext = EXT[type] ?? "jpg";
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "_");
  const safeField = field.replace(/[^a-z0-9]/gi, "_");
  const filename = `${safeSlug}_${safeField}.${ext}`;
  const dir = path.join(process.cwd(), "public", "images", "admin");
  const filepath = path.join(dir, filename);

  try {
    await mkdir(dir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }

  const url = `/images/admin/${filename}`;
  return NextResponse.json({ url });
}
