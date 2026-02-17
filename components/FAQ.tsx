/**
 * Optional FAQ section. Use in product or landing pages.
 * Can be enhanced with client accordion (use client) later.
 */
export default function FAQ() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">
        Frequently Asked Questions
      </h2>
      <p className="text-neutral-600">
        FAQ content can be added here. For accordion UI, wrap in a client
        component.
      </p>
    </section>
  );
}
