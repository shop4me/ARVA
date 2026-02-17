import Link from "next/link";
import type { Product } from "@/lib/content";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="block border border-arva-border rounded-xl p-6 hover:border-arva-accent/20 transition bg-white shadow-arva"
    >
      <div className="min-h-[160px] rounded-lg bg-neutral-50 border border-arva-border flex items-center justify-center mb-4 text-arva-text-muted text-sm">
        {product.name}
      </div>
      <h2 className="font-semibold text-arva-text">{product.name}</h2>
      <p className="text-arva-text-muted mt-1 text-sm">{product.description}</p>
      <p className="mt-3 font-medium text-arva-text">
        ${product.price.toLocaleString()}
      </p>
    </Link>
  );
}
