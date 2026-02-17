import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Read the ARVA return policy.",
};

export default function ReturnPolicyPage() {
  return (
    <section className="border-b border-arva-border/80 bg-arva-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-arva-text mb-4">
          Return Policy
        </h1>
        <p className="text-arva-text-muted mb-8">
          This is placeholder return policy content. We will update this page
          with final legal copy and exact return terms.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-arva-text mb-2">
              Return Window
            </h2>
            <p className="text-arva-text-muted leading-relaxed">
              Customers may request a return within a standard trial period from
              delivery. Returned items should be in good condition and include
              all original parts where possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-arva-text mb-2">
              Return Pickup & Fees
            </h2>
            <p className="text-arva-text-muted leading-relaxed">
              A flat pickup fee may apply. Final fee amounts and eligibility
              details will be confirmed in the final policy text.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-arva-text mb-2">
              Refund Processing
            </h2>
            <p className="text-arva-text-muted leading-relaxed">
              Once the return is received and inspected, refunds are processed
              back to the original payment method. Processing times can vary by
              payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-arva-text mb-2">
              Questions
            </h2>
            <p className="text-arva-text-muted leading-relaxed">
              For support, contact our team and include your order number so we
              can help quickly.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
