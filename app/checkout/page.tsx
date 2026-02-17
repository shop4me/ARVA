"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/context/CartContext";
import { cartSubtotal, SHIPPING_LABEL } from "@/lib/cart";
import { IconFreeShipping } from "@/components/TrustIcons";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

type Address = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

const emptyAddress: Address = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
};

function CheckoutForm({
  items,
  onSuccess,
}: {
  items: { slug: string; name: string; price: number; quantity: number }[];
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const subtotal = cartSubtotal(items);
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const [billing, setBilling] = useState<Address>(emptyAddress);
  const [shipping, setShipping] = useState<Address>(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBilling = useCallback((field: keyof Address, value: string) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
  }, []);
  const updateShipping = useCallback((field: keyof Address, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }, []);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError(null);
    setLoading(true);
    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: typeof window !== "undefined" ? `${window.location.origin}/checkout?placed=1` : "/checkout",
          payment_method_data: {
            billing_details: {
              name: billing.name || undefined,
              address: {
                line1: billing.line1 || undefined,
                line2: billing.line2 || undefined,
                city: billing.city || undefined,
                state: billing.state || undefined,
                postal_code: billing.zip || undefined,
                country: billing.country || undefined,
              },
            },
          },
        },
      });
      if (confirmError) {
        setError(confirmError.message ?? "Payment failed");
        setLoading(false);
        return;
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-8">
      {/* Order summary */}
      <section className="pb-8 border-b border-arva-border">
        <h2 className="text-lg font-medium text-arva-text mb-4">Order summary</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.slug} className="flex justify-between text-sm">
              <span className="text-arva-text">
                {item.name} × {item.quantity}
              </span>
              <span className="text-arva-text-muted">
                ${(item.price * item.quantity).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between text-sm text-arva-text-muted">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-arva-text-muted items-center gap-2">
          <span className="flex items-center gap-1.5">
            <IconFreeShipping className="w-4 h-4 shrink-0 text-arva-accent" />
            Shipping
          </span>
          <span>{SHIPPING_LABEL}</span>
        </div>
        <div className="mt-2 flex justify-between font-semibold text-arva-text">
          <span>Total</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
      </section>

      {/* Payment — card field (container needs min-height so Stripe iframe renders) */}
      <section>
        <h2 className="text-lg font-medium text-arva-text mb-4">Payment</h2>
        <div className="checkout-payment-element-wrapper rounded-lg border border-arva-border bg-white p-4 min-h-[300px] w-full">
          {stripe && elements ? (
            <PaymentElement />
          ) : (
            <div className="flex items-center justify-center h-[252px] text-arva-text-muted">Loading payment form…</div>
          )}
        </div>
      </section>

      {/* Billing address */}
      <section>
        <h2 className="text-lg font-medium text-arva-text mb-4">Billing address</h2>
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={billing.name}
            onChange={(e) => updateBilling("name", e.target.value)}
            className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
          />
          <input
            type="text"
            placeholder="Address line 1"
            value={billing.line1}
            onChange={(e) => updateBilling("line1", e.target.value)}
            className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
          />
          <input
            type="text"
            placeholder="Address line 2 (optional)"
            value={billing.line2}
            onChange={(e) => updateBilling("line2", e.target.value)}
            className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              value={billing.city}
              onChange={(e) => updateBilling("city", e.target.value)}
              className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
            />
            <input
              type="text"
              placeholder="State"
              value={billing.state}
              onChange={(e) => updateBilling("state", e.target.value)}
              className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ZIP"
              value={billing.zip}
              onChange={(e) => updateBilling("zip", e.target.value)}
              className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
            />
            <input
              type="text"
              placeholder="Country"
              value={billing.country}
              onChange={(e) => updateBilling("country", e.target.value)}
              className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
            />
          </div>
        </div>
      </section>

      {/* Shipping same as billing */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={shippingSameAsBilling}
            onChange={(e) => setShippingSameAsBilling(e.target.checked)}
            className="w-4 h-4 rounded border-arva-border text-arva-accent focus:ring-arva-accent/30"
          />
          <span className="text-arva-text">Shipping address same as billing</span>
        </label>
      </div>

      {!shippingSameAsBilling && (
        <section>
          <h2 className="text-lg font-medium text-arva-text mb-4">Shipping address</h2>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Full name"
              value={shipping.name}
              onChange={(e) => updateShipping("name", e.target.value)}
              className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
            />
            <input
              type="text"
              placeholder="Address line 1"
              value={shipping.line1}
              onChange={(e) => updateShipping("line1", e.target.value)}
              className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
            />
            <input
              type="text"
              placeholder="Address line 2 (optional)"
              value={shipping.line2}
              onChange={(e) => updateShipping("line2", e.target.value)}
              className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={shipping.city}
                onChange={(e) => updateShipping("city", e.target.value)}
                className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
              />
              <input
                type="text"
                placeholder="State"
                value={shipping.state}
                onChange={(e) => updateShipping("state", e.target.value)}
                className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="ZIP"
                value={shipping.zip}
                onChange={(e) => updateShipping("zip", e.target.value)}
                className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
              />
              <input
                type="text"
                placeholder="Country"
                value={shipping.country}
                onChange={(e) => updateShipping("country", e.target.value)}
                className="w-full px-4 py-3 border border-arva-border rounded-lg bg-white text-arva-text placeholder:text-arva-text-muted focus:outline-none focus:ring-2 focus:ring-arva-accent/30"
              />
            </div>
          </div>
        </section>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full py-4 bg-arva-accent text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Placing order…" : "Place Order"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("placed=1")) {
      setPlaced(true);
      clearCart();
    }
  }, [clearCart]);

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    fetch("/api/checkout/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.clientSecret) setClientSecret(data.clientSecret);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (items.length === 0 && !placed) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-arva-text mb-2">Your cart is empty</h1>
        <p className="text-arva-text-muted mb-6">Add items from the shop to checkout.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-6 py-3 bg-arva-accent text-white font-medium rounded-lg hover:opacity-90 transition"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-arva-text mb-2">Order placed</h1>
        <p className="text-arva-text-muted mb-6">Thank you for your order.</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-6 py-3 bg-arva-accent text-white font-medium rounded-lg hover:opacity-90 transition"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-arva-text-muted">Loading checkout…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl font-semibold text-arva-text mb-8">Checkout</h1>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
            variables: {
              borderRadius: "8px",
              colorPrimary: "#1e2a3a",
              colorBackground: "#ffffff",
              colorText: "#1a1a1a",
              colorDanger: "#dc2626",
            },
          },
        }}
      >
        <CheckoutForm
        items={items}
        onSuccess={() => {
          clearCart();
          setPlaced(true);
        }}
      />
      </Elements>
    </div>
  );
}
