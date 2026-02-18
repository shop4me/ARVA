import type { Metadata } from "next";
import LegalPageLayout, { legalStyles } from "@/components/LegalPageLayout";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shipping and Returns | ARVA",
  description:
    "ARVA shipping coverage, 100-day home trial, free returns and exchanges, refund policy, and warranty.",
  alternates: { canonical: absoluteUrl("/return-policy") },
  openGraph: {
    title: "Shipping and Returns | ARVA",
    description:
      "ARVA shipping, 100-day trial, free returns and exchanges, and warranty.",
    url: absoluteUrl("/return-policy"),
  },
};

const LAST_UPDATED = "[INSERT DATE]";

export default function ReturnPolicyPage() {
  return (
    <LegalPageLayout title="Shipping and Returns" lastUpdated={LAST_UPDATED}>
      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Shipping coverage</h2>
        <p className={legalStyles.p}>
          We ship throughout the United States and Canada where delivery is
          available.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>100-day home trial</h2>
        <p className={legalStyles.p}>
          You have 100 days from delivery to request a return or exchange.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Free returns and exchanges</h2>
        <p className={legalStyles.p}>
          Eligible returns and exchanges are free. ARVA coordinates pickup at no
          cost where available. You do not pay for return shipping.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Return eligibility</h2>
        <p className={legalStyles.p}>
          Items must be in like-new condition. Original packaging is not
          required. The following are not eligible for return:
        </p>
        <ul className={legalStyles.ul}>
          <li className={legalStyles.li}>Final sale items</li>
          <li className={legalStyles.li}>Clearance items</li>
          <li className={legalStyles.li}>Gift cards</li>
          <li className={legalStyles.li}>Commercial or contract orders</li>
          <li className={legalStyles.li}>
            Items marked non-returnable at checkout
          </li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Refunds</h2>
        <p className={legalStyles.p}>
          Refunds are issued to the original payment method within 5 to 10
          business days after we receive and inspect the returned item.
        </p>
      </section>

      <section id="warranty" className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Warranty</h2>
        <p className={legalStyles.p}>
          ARVA provides a limited lifetime warranty on core structural
          components under normal residential use. This warranty is
          non-transferable unless otherwise required by law.
        </p>

        <h3 className="text-lg font-semibold text-arva-text mt-6 mb-2">
          Fabric and foam coverage
        </h3>
        <p className={legalStyles.p}>
          Performance fabric and foam are covered for three years from delivery
          for qualifying manufacturing defects.
        </p>

        <h3 className="text-lg font-semibold text-arva-text mt-6 mb-2">
          After three years
        </h3>
        <p className={legalStyles.p}>
          Eligible structural issues may qualify for our replacement program at
          50 percent of current retail price.
        </p>

        <h3 className="text-lg font-semibold text-arva-text mt-6 mb-2">
          Exclusions
        </h3>
        <p className={legalStyles.p}>
          Normal wear and tear, stains, pet damage, misuse, commercial use, and
          improper care are not covered.
        </p>

        <h3 className="text-lg font-semibold text-arva-text mt-6 mb-2">
          How to file a claim
        </h3>
        <p className={legalStyles.p}>
          Email{" "}
          <a
            href="mailto:support@livearva.com"
            className="text-arva-accent underline hover:opacity-80"
          >
            support@livearva.com
          </a>{" "}
          with your order number and photos.
        </p>
      </section>
    </LegalPageLayout>
  );
}
