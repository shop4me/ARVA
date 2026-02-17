"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Icon100DayTrial } from "@/components/TrustIcons";
import type { Product } from "@/lib/content";
import type { ProductDetailData } from "@/lib/productDetail";

export default function StickyCTA({
  product,
  detail,
}: {
  product: Product;
  detail: ProductDetailData;
}) {
  const [visible, setVisible] = useState(false);
  const { addItem } = useCart();
  const price = detail?.displayPrice ?? product.price;

  useEffect(() => {
    const el = document.getElementById("pdp-hero-cta");
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setVisible(e ? !e.isIntersecting : false);
      },
      { threshold: 0, rootMargin: "0px 0px -20% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-arva-border bg-white/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              addItem({
                slug: product.slug,
                name: product.name,
                price,
                image: product.image,
              })
            }
            className="py-3 px-6 bg-arva-accent text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Add to Cart
          </button>
          <div className="flex items-center gap-2 text-sm text-arva-text">
            <Icon100DayTrial className="w-5 h-5 shrink-0 text-arva-accent" />
            <span className="font-medium">100-Day Trial</span>
            <span className="text-arva-text-muted hidden sm:inline">— $99 flat return pickup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
