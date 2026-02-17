import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About ARVA modern furniture.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-arva-text mb-4">About</h1>
      <p className="text-arva-text-muted leading-relaxed">
        ARVA designs modern furniture for everyday living. Explore our collections for sectionals, 3-seaters, and loveseats.
      </p>
    </div>
  );
}
