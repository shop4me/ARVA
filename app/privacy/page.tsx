import type { Metadata } from "next";
import LegalPageLayout, { legalStyles } from "@/components/LegalPageLayout";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy | ARVA",
  description:
    "How ARVA collects, uses, and protects your personal information. Read our privacy policy.",
  alternates: { canonical: absoluteUrl("/privacy") },
  openGraph: {
    title: "Privacy Policy | ARVA",
    description: "How ARVA collects, uses, and protects your personal information.",
    url: absoluteUrl("/privacy"),
  },
};

const LAST_UPDATED = "[INSERT DATE]";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p className={legalStyles.p}>
        ARVA respects your privacy. This Privacy Policy explains how we collect,
        use, share, and protect personal information when you visit our
        website, place an order, or interact with our services.
      </p>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>What this policy covers</h2>
        <p className={legalStyles.p}>
          This policy applies to information collected through our website and
          related services, including browsing, purchasing, contacting support,
          or subscribing to communications.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Information we collect</h2>
        <p className={legalStyles.p}>
          We may collect the following categories of information:
        </p>
        <ul className={legalStyles.ul}>
          <li className={legalStyles.li}>
            Name, email address, phone number, and shipping or billing address
          </li>
          <li className={legalStyles.li}>
            Order details, payment status, and transaction records
          </li>
          <li className={legalStyles.li}>
            Customer support messages and submitted photos
          </li>
          <li className={legalStyles.li}>
            Device and usage data such as IP address, browser type, and page
            interactions
          </li>
          <li className={legalStyles.li}>
            Marketing preferences and communication settings
          </li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>How we use information</h2>
        <p className={legalStyles.p}>
          We use personal information to:
        </p>
        <ul className={legalStyles.ul}>
          <li className={legalStyles.li}>
            Process orders, payments, shipping, returns, and warranty claims
          </li>
          <li className={legalStyles.li}>
            Provide customer support and order updates
          </li>
          <li className={legalStyles.li}>
            Improve our products, website, and user experience
          </li>
          <li className={legalStyles.li}>
            Prevent fraud, abuse, and security issues
          </li>
          <li className={legalStyles.li}>
            Send marketing communications if you opt in
          </li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Cookies and tracking</h2>
        <p className={legalStyles.p}>
          We use cookies and similar technologies to operate the site, remember
          preferences, analyze traffic, and measure performance. You may
          disable cookies through your browser settings, but some features may
          not function properly.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>How information is shared</h2>
        <p className={legalStyles.p}>
          We share information only when necessary, including with:
        </p>
        <ul className={legalStyles.ul}>
          <li className={legalStyles.li}>Payment processors</li>
          <li className={legalStyles.li}>Shipping and delivery partners</li>
          <li className={legalStyles.li}>
            Service providers supporting analytics, hosting, and support
          </li>
          <li className={legalStyles.li}>
            Legal or regulatory authorities when required
          </li>
        </ul>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Data retention</h2>
        <p className={legalStyles.p}>
          We retain personal information only as long as necessary to fulfill
          orders, meet legal obligations, and resolve disputes.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Your rights</h2>
        <p className={legalStyles.p}>
          Depending on your location, you may request access, correction, or
          deletion of your personal information. Contact{" "}
          <a
            href="mailto:support@livearva.com"
            className="text-arva-accent underline hover:opacity-80"
          >
            support@livearva.com
          </a>{" "}
          to submit a request.
        </p>
      </section>

      <section className={legalStyles.section}>
        <h2 className={legalStyles.h2}>Contact</h2>
        <p className={legalStyles.p}>
          ARVA
          <br />
          [INSERT ARVA BUSINESS ADDRESS]
          <br />
          <a
            href="mailto:support@livearva.com"
            className="text-arva-accent underline hover:opacity-80"
          >
            support@livearva.com
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
