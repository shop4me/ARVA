import Link from "next/link";
import type { Product } from "@/lib/content";
import StarsInline from "@/components/StarsInline";

export default function ProductCard({
  product,
  reviewSummary,
}: {
  product: Product;
  reviewSummary?: { count: number; rating: number };
}) {
  const count = reviewSummary?.count ?? 0;
  const rating = reviewSummary?.rating ?? 5;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="h-full flex flex-col border border-arva-border rounded-xl p-6 hover:border-arva-accent/20 transition bg-white shadow-arva"
    >
      <div className="h-56 rounded-lg bg-neutral-50 border border-arva-border overflow-hidden mb-4">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-arva-text-muted text-sm">
            {product.name}
          </div>
        )}
      </div>

      <div className="mb-2 text-sm">
        <StarsInline rating={rating} count={count} />
      </div>

      <h2 className="font-semibold text-arva-text line-clamp-2">{product.name}</h2>
      <p className="text-arva-text-muted mt-1 text-sm line-clamp-3">{product.description}</p>
      <p className="mt-auto pt-3 font-medium text-arva-text">${product.price.toLocaleString()}</p>
    </Link>
  );
}
