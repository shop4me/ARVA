import Link from "next/link";
import { finalCta } from "@/lib/homepage";

export default function FinalCta() {
  return (
    <section className="py-20 sm:py-24 bg-arva-accent text-white" aria-labelledby="final-cta-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 id="final-cta-heading" className="text-2xl sm:text-3xl font-semibold mb-4">
          {finalCta.heading}
        </h2>
        <p className="text-white/80 text-lg mb-10">
          {finalCta.subhead}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={finalCta.ctaPrimaryHref}
            className="inline-flex justify-center items-center px-6 py-3.5 bg-white text-arva-accent font-medium rounded-lg hover:opacity-90 transition min-h-[48px]"
          >
            {finalCta.ctaPrimary}
          </Link>
          <Link
            href={finalCta.ctaSecondaryHref}
            className="inline-flex justify-center items-center px-6 py-3.5 border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition min-h-[48px]"
          >
            {finalCta.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
