import Link from "next/link";
import { productLineup } from "@/lib/homepage";
import { getProducts } from "@/lib/api";
import { readProductDetails } from "@/lib/dataStore";
import { IconBulletCheck } from "@/components/TrustIcons";

export default async function ProductLineup() {
  const [products, productDetails] = await Promise.all([getProducts(), readProductDetails()]);
  const imageBySlug = new Map(
    productLineup.map((item) => {
      const product = products.find((p) => p.slug === item.slug);
      const hero = productDetails[item.slug]?.images?.hero;
      return [item.slug, hero ?? product?.image ?? ""];
    })
  );

  return (
    <section className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg" aria-labelledby="product-lineup-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 id="product-lineup-heading" className="sr-only">
          Product lineup
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
          {productLineup.map((item) => (
            <article
              key={item.slug}
              className={`rounded-xl border bg-white p-6 flex flex-col shadow-arva transition ${
                item.badge
                  ? "border-arva-accent/20 ring-1 ring-arva-accent/10"
                  : "border-arva-border"
              }`}
            >
              {item.badge && (
                <p className="text-xs font-medium text-arva-accent uppercase tracking-wide mb-4">
                  {item.badge}
                </p>
              )}
              <Link
                href={`/products/${item.slug}`}
                className="block mb-4 min-h-[180px] rounded-lg bg-neutral-50 border border-arva-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-arva-accent/20"
              >
                {imageBySlug.get(item.slug) ? (
                  <img
                    src={imageBySlug.get(item.slug)}
                    alt={item.name}
                    className="w-full h-full min-h-[180px] object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full min-h-[180px] flex items-center justify-center text-arva-text-muted text-sm">
                    {item.name}
                  </div>
                )}
              </Link>
              <h3 className="text-xl font-semibold text-arva-text mb-1">
                {item.name}
              </h3>
              <p className="text-lg font-medium text-arva-text mb-4">
                ${item.price.toLocaleString()}
              </p>
              <ul className="space-y-2 mb-6 flex-1 text-sm text-arva-text-muted">
                {item.bullets.map((b) => (
                  <li key={b} className="flex gap-2 items-start">
                    <IconBulletCheck />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href={`/products/${item.slug}`}
                className="inline-flex justify-center items-center w-full py-3 border border-arva-accent text-arva-accent font-medium rounded-lg hover:bg-arva-accent hover:text-white transition min-h-[44px]"
              >
                {item.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
