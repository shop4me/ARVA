"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { cartSubtotal, SHIPPING_LABEL } from "@/lib/cart";
import { IconFreeShipping } from "@/components/TrustIcons";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();
  const subtotal = cartSubtotal(items);

  if (!isDrawerOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        aria-hidden
        onClick={closeDrawer}
      />
      <aside
        className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-md bg-white border-r border-arva-border shadow-xl flex flex-col"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-arva-border">
          <h2 className="text-lg font-semibold text-arva-text">Cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 text-arva-text-muted hover:text-arva-text rounded-lg transition"
            aria-label="Close cart"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {items.length === 0 ? (
            <p className="text-arva-text-muted">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="flex gap-3 py-3 border-b border-arva-border/60 last:border-0"
                >
                  <div className="w-16 h-16 rounded-lg bg-arva-bg border border-arva-border flex-shrink-0 flex items-center justify-center text-arva-text-muted text-xs">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      item.name.slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-arva-text truncate">{item.name}</p>
                    <p className="text-sm text-arva-text-muted">
                      ${item.price.toLocaleString()} × {item.quantity}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                        className="w-8 h-8 rounded border border-arva-border text-arva-text hover:bg-arva-bg transition"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                        className="w-8 h-8 rounded border border-arva-border text-arva-text hover:bg-arva-bg transition"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        className="ml-2 text-sm text-arva-text-muted hover:text-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold text-arva-text flex-shrink-0">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-arva-border px-4 sm:px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm text-arva-text-muted">
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
            <div className="flex justify-between font-semibold text-arva-text pt-2">
              <span>Total</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={closeDrawer}
                className="w-full py-3 px-4 border border-arva-border text-arva-text font-medium rounded-lg hover:bg-arva-bg transition"
              >
                Continue shopping
              </button>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full py-3 px-4 bg-arva-accent text-white font-medium rounded-lg hover:opacity-90 transition text-center"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
