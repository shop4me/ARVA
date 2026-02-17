import { reviews } from "@/lib/homepage";

export default function Reviews() {
  return (
    <section className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg" aria-labelledby="reviews-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-arva-text-muted text-sm">
            Rated {reviews.rating} out of {reviews.outOf} · {reviews.customerCount} {reviews.customerLabel}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {reviews.items.map((r, i) => (
            <blockquote
              key={i}
              className="p-6 rounded-xl border border-arva-border bg-white shadow-arva"
            >
              <p className="text-arva-text leading-relaxed mb-4">&ldquo;{r.quote}&rdquo;</p>
              <footer className="flex items-center gap-2">
                <cite className="not-italic font-medium text-arva-text text-sm">
                  {r.author}
                </cite>
                {r.verified && (
                  <span className="text-xs text-arva-text-muted">Verified</span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
