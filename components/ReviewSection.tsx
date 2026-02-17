/**
 * Optional review section for product pages.
 * Can pull from API or static content later.
 */
export default function ReviewSection() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12 border-t border-neutral-200">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Reviews</h2>
      <p className="text-neutral-600">
        Customer reviews can be displayed here when connected to backend.
      </p>
    </section>
  );
}
