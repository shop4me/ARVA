import Link from "next/link";
import type { Product } from "@/lib/content";

const BEST_FOR: Record<string, string> = {
  sectional: "Best for anchoring a living room",
  "three-seater": "Best all-around sofa",
  loveseat: "Best for flexible layouts",
};

export default function ConfigSelector({
  currentProduct,
  relatedProducts,
  basePath,
}: {
  currentProduct: Product;
  relatedProducts: Product[];
  basePath: string;
}) {
  if (relatedProducts.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-arva-text-muted uppercase tracking-wide mb-3">
        Choose your configuration
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {relatedProducts.map((p) => {
          const isCurrent = p.slug === currentProduct.slug;
          const bestFor = BEST_FOR[p.category] ?? "Modular design";
          const price = p.price;

          if (isCurrent) {
            return (
              <div
                key={p.slug}
                className="rounded-lg border-2 border-arva-accent bg-arva-accent/5 p-3 sm:p-4"
              >
                <p className="font-medium text-arva-text text-sm sm:text-base break-words">
                  {p.category === "three-seater" ? "3-Seater" : p.category === "sectional" ? "Sectional" : "Loveseat"}
                </p>
                <p className="text-arva-text font-semibold mt-0.5">${price.toLocaleString()}</p>
                <p className="text-arva-text-muted text-xs mt-1">{bestFor}</p>
              </div>
            );
          }

          return (
            <Link
              key={p.slug}
              href={`${basePath}/${p.slug}`}
              className="rounded-lg border border-arva-border bg-white p-3 sm:p-4 hover:border-arva-accent/40 hover:bg-arva-bg/50 transition text-left"
            >
              <p className="font-medium text-arva-text text-sm sm:text-base">
                {p.category === "three-seater" ? "3-Seater" : p.category === "sectional" ? "Sectional" : "Loveseat"}
              </p>
              <p className="text-arva-text font-semibold mt-0.5">${price.toLocaleString()}</p>
              <p className="text-arva-text-muted text-xs mt-1 break-words">{bestFor}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
