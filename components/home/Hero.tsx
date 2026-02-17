import Link from "next/link";
import { hero } from "@/lib/homepage";

export default function Hero() {
  return (
    <section className="border-b border-arva-border/80 bg-arva-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left: copy + CTAs + trust badges */}
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-arva-text leading-tight mb-4">
              {hero.h1}
            </h1>
            <p className="text-lg text-arva-text-muted max-w-lg leading-relaxed mb-8">
              {hero.subhead}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href={hero.ctaPrimaryHref}
                className="inline-flex justify-center items-center px-6 py-3.5 bg-arva-accent text-white font-medium rounded-lg hover:opacity-90 transition min-h-[48px]"
              >
                {hero.ctaPrimary}
              </Link>
              <Link
                href={hero.ctaSecondaryHref}
                className="inline-flex justify-center items-center px-6 py-3.5 border border-arva-border text-arva-text font-medium rounded-lg hover:bg-white/60 transition min-h-[48px]"
              >
                {hero.ctaSecondary}
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-arva-text-muted" aria-label="Trust badges">
              {hero.trustBadges.map((badge) => (
                <li key={badge}>{badge}</li>
              ))}
            </ul>
          </div>
          {/* Right: product image area — three thumbnails, no slider */}
          <div className="order-1 lg:order-2 flex flex-col sm:flex-row lg:flex-col gap-4">
            <Link
              href="/products/atlas-loveseat"
              className="block flex-1 min-h-[200px] sm:min-h-[240px] rounded-lg bg-white border border-arva-border shadow-arva overflow-hidden focus:outline-none focus:ring-2 focus:ring-arva-accent/20"
            >
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-arva-text-muted text-sm">
                Atlas Loveseat
              </div>
            </Link>
            <Link
              href="/products/atlas-3-seater"
              className="block flex-1 min-h-[200px] sm:min-h-[240px] rounded-lg bg-white border border-arva-border shadow-arva overflow-hidden focus:outline-none focus:ring-2 focus:ring-arva-accent/20"
            >
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-arva-text-muted text-sm">
                Atlas 3-Seater
              </div>
            </Link>
            <Link
              href="/products/atlas-sectional"
              className="block flex-1 min-h-[200px] sm:min-h-[240px] rounded-lg bg-white border border-arva-border shadow-arva overflow-hidden focus:outline-none focus:ring-2 focus:ring-arva-accent/20"
            >
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-arva-text-muted text-sm">
                Atlas Sectional
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
