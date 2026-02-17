import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE_NAME = "arva_admin";

function tokenFromPassword(password: string): string {
  return createHash("sha256").update(password + "arva").digest("hex");
}

export async function GET() {
  const password = process.env.ADMIN_PASSWORD || "qw987";
  const expected = tokenFromPassword(password);
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
