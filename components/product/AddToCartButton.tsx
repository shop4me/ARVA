"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/content";
import type { ProductDetailData } from "@/lib/productDetail";
import { getEffectiveSalePrice } from "@/lib/pricing";

interface AddToCartButtonProps {
  product: Product;
  detail?: ProductDetailData | null;
  className?: string;
  children?: React.ReactNode;
}

export default function AddToCartButton({
  product,
  detail,
  className = "inline-flex justify-center items-center w-full py-4 bg-arva-accent text-white font-semibold rounded-lg hover:opacity-90 transition text-lg",
  children,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const price = getEffectiveSalePrice(product.slug, detail?.displayPrice ?? product.price);

  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        addItem({
          slug: product.slug,
          name: product.name,
          price,
          image: product.image,
        })
      }
    >
      {children ?? "Add to Cart"}
    </button>
  );
}
