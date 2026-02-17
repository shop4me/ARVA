import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { CartItem } from "@/lib/cart";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function POST(req: NextRequest) {
  try {
    const { items, billing } = (await req.json()) as {
      items: CartItem[];
      billing?: { name?: string; line1?: string; city?: string; state?: string; zip?: string; country?: string };
      shipping?: { name?: string; line1?: string; city?: string; state?: string; zip?: string; country?: string };
    };

    if (!items?.length) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${baseUrl}/?checkout=success`,
      cancel_url: `${baseUrl}/checkout`,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe create-session error:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Payment setup failed" },
      { status: 500 }
    );
  }
}
