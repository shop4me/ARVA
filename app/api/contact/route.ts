import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    };
    if (!body.email || !body.message) {
      return NextResponse.json(
        { message: "Email and message are required" },
        { status: 400 }
      );
    }
    // Stub: accept and return success. Wire to email or CRM later.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }
}
