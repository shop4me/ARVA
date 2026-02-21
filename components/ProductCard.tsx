import Link from "next/link";
import type { Product } from "@/lib/content";
import type { FabricOption } from "@/lib/productDetail";
import StarsInline from "@/components/StarsInline";

export default function ProductCard({
  product,
  reviewSummary,
  imageOverride,
  colorOptions,
  ribbon,
}: {
  product: Product;
  reviewSummary?: { count: number; rating: number };
  /** When set, used as the main card image (e.g. from productDetails.images.hero). */
  imageOverride?: string;
  /** Fabric/color options to show as small circles under the image. */
  colorOptions?: FabricOption[];
  /** Optional label shown as a small ribbon on the top-right of the card (e.g. "Most popular"). Does not affect card dimensions. */
  ribbon?: string;
}) {
  const count = reviewSummary?.count ?? 0;
  const rating = reviewSummary?.rating ?? 5;
  const imageSrc = imageOverride ?? product.image;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="relative h-full flex flex-col border border-arva-border rounded-xl p-6 hover:border-arva-accent/20 transition bg-white shadow-arva"
    >
      <div className="relative h-56 rounded-lg bg-neutral-50 border border-arva-border overflow-hidden mb-2">
        {ribbon ? (
          <div
            className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-arva-accent text-white text-[10px] font-semibold uppercase tracking-wide shadow-sm"
            aria-hidden
          >
            {ribbon}
          </div>
        ) : null}
        {imageSrc ? (
          <img
            src={imageSrc}
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
      {colorOptions && colorOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 justify-center" aria-label="Available colors">
          {colorOptions.map((opt) => (
            <span
              key={opt.name}
              className="w-4 h-4 rounded-full border border-arva-border shrink-0 shadow-sm"
              style={{ backgroundColor: opt.hex ?? "#e5e5e5" }}
              title={opt.name}
            />
          ))}
        </div>
      )}

      <div className="mb-2 text-sm">
        <StarsInline rating={rating} count={count} />
      </div>

      <h2 className="font-semibold text-arva-text line-clamp-2">{product.name}</h2>
      <p className="text-arva-text-muted mt-1 text-sm line-clamp-3">{product.description}</p>
      <p className="mt-auto pt-3 font-medium text-arva-text">${product.price.toLocaleString()}</p>
    </Link>
  );
}
