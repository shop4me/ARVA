import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE_NAME = "arva_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function tokenFromPassword(password: string): string {
  return createHash("sha256").update(password + "arva").digest("hex");
}

export async function POST(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD || "qw987";
  const body = await request.json().catch(() => ({}));
  const submitted = body.password ?? "";

  if (submitted !== password) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = tokenFromPassword(password);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
