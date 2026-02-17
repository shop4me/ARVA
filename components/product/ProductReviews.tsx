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
              <p className="text-arva-text leading-relaxed mb-4">&ldquo;{r.quote}&rdquo;</p>
              <footer className="flex flex-wrap items-center gap-2 text-sm">
                <cite className="not-italic font-medium text-arva-text">{r.location}</cite>
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
