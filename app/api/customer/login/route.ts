import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCustomer } from "@/lib/customerStore";
import { createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/customerSession";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const valid = await verifyCustomer(email, password);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const normalized = email.toLowerCase();
  const token = createSessionToken(normalized);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true, email: normalized });
}
