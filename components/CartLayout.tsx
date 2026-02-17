"use client";

import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
