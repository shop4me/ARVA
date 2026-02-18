import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | ARVA",
  description: "Get in touch with ARVA. Send us a message and we'll get back to you.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: "Contact | ARVA",
    description: "Get in touch with ARVA.",
    url: absoluteUrl("/contact"),
  },
};

export default function ContactPage() {
  return (
    <section className="border-b border-arva-border/80 bg-arva-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold text-arva-text tracking-tight mb-2">
          Contact
        </h1>
        <p className="text-arva-text-muted mb-8">
          Have a question or want to say hi? Send us a message and we&apos;ll get
          back to you.
        </p>
        <ContactForm />
      </div>
    </section>
  );
}
