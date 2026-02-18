import type { ProductDetailData } from "@/lib/productDetail";

export default function ComfortFeel({ detail }: { detail: ProductDetailData }) {
  const labels = detail.comfortImageLabels ?? ["Seat depth", "Fabric texture"];
  return (
    <section id="comfort" className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg scroll-mt-24" aria-labelledby="comfort-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 id="comfort-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-8 text-center">
          {detail.comfortHeadline}
        </h2>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <figure className="aspect-video rounded-xl bg-white border border-arva-border shadow-arva overflow-hidden relative">
              <img
                src="/images/pdp/seat-depth.webp"
                alt={labels[0]}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <figcaption className="absolute left-3 bottom-3 text-xs text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                {labels[0]}
              </figcaption>
            </figure>
            <figure className="aspect-video rounded-xl bg-white border border-arva-border shadow-arva overflow-hidden relative">
              <img
                src="/images/pdp/fabric-texture.webp"
                alt={labels[1]}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <figcaption className="absolute left-3 bottom-3 text-xs text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                {labels[1]}
              </figcaption>
            </figure>
          </div>
          <p className="text-arva-text-muted leading-relaxed text-lg">
            {detail.comfortCopy}
          </p>
        </div>
      </div>
    </section>
  );
}
