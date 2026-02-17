import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { CartItem } from "@/lib/cart";
import { cartSubtotal } from "@/lib/cart";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items: CartItem[] };

    if (!items?.length) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    const amount = Math.round(cartSubtotal(items) * 100); // cents
    if (amount < 50) {
      return NextResponse.json(
        { message: "Order total must be at least $0.50" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.error("create-payment-intent error:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Payment setup failed" },
      { status: 500 }
    );
  }
}
