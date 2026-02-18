import type { Metadata } from "next";
import LegalPageLayout, { legalStyles } from "@/components/LegalPageLayout";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Use and Store Policy | ARVA",
  description:
    "ARVA terms of use and store policy. Website use, pricing, shipping, returns, and governing law.",
  alternates: { canonical: absoluteUrl("/terms") },
  openGraph: {
    title: "Terms of Use and Store Policy | ARVA",
    description: "ARVA terms of use and store policy.",
    url: absoluteUrl("/terms"),
  },
};

const LAST_UPDATED = "[INSERT DATE]";

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Use and Store Policy"
      lastUpdated={LAST_UPDATED}
    >
      <p className={legalStyles.p}>
        By using the ARVA website or placing an order, you agree to the
        following Terms.
      </p>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Website use</h2>
        <p className={legalStyles.p}>
          You agree not to misuse the website, interfere with its operation, or
          use it for unlawful purposes.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Product information</h2>
        <p className={legalStyles.p}>
          We strive for accuracy, but product images and descriptions may vary
          slightly due to lighting, materials, or display settings.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Pricing and payment</h2>
        <p className={legalStyles.p}>
          Prices are shown in the displayed currency. Taxes may apply at
          checkout. We reserve the right to cancel orders due to pricing errors
          or suspected fraud.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Shipping and delivery</h2>
        <p className={legalStyles.p}>
          Delivery timelines are estimates. Risk of loss transfers upon confirmed
          delivery.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Returns and warranty</h2>
        <p className={legalStyles.p}>
          Returns, exchanges, and warranty coverage are governed by their
          respective pages.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Intellectual property</h2>
        <p className={legalStyles.p}>
          All content on this site is owned by ARVA and may not be used without
          permission.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Limitation of liability</h2>
        <p className={legalStyles.p}>
          To the maximum extent permitted by law, ARVA is not liable for
          indirect or consequential damages.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Governing law</h2>
        <p className={legalStyles.p}>
          These Terms are governed by the laws of the State of Michigan.
        </p>
      </section>
    </LegalPageLayout>
  );
}
