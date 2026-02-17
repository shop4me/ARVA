"use client";

import { useCart } from "@/context/CartContext";

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function HeaderCartIcon() {
  const { items, openDrawer } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative p-2 text-arva-text-muted hover:text-arva-text transition rounded-lg hover:bg-arva-border/50"
      aria-label={count > 0 ? `Open cart (${count} items)` : "Open cart"}
    >
      <CartIcon />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[11px] font-semibold text-white bg-arva-accent rounded-full">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
