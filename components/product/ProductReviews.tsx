import type { ProductDetailData } from "@/lib/productDetail";

export default function ProductReviews({ detail }: { detail: ProductDetailData }) {
  return (
    <section id="reviews" className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg scroll-mt-24" aria-labelledby="reviews-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 id="reviews-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-4 text-center">
          {detail.reviewsHeading}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {detail.reviews.map((r, i) => (
            <blockquote
              key={i}
              className="p-6 rounded-xl border border-arva-border bg-white shadow-arva"
            >
              <div className="mb-3 text-amber-500" aria-label={`${r.rating ?? 5} out of 5 stars`}>
                {"★".repeat(r.rating ?? 5)}
              </div>
              <p className="text-arva-text leading-relaxed mb-4 break-words">&ldquo;{r.quote}&rdquo;</p>
              <footer className="flex flex-wrap items-center gap-2 text-sm min-w-0">
                <cite className="not-italic font-medium text-arva-text">
                  {r.name ? `${r.name}${r.age ? `, ${r.age}` : ""}` : r.location}
                </cite>
                {r.name && <span className="text-arva-text-muted">{r.location}</span>}
                {r.verified && (
                  <span className="text-arva-text-muted">Verified Customer</span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
