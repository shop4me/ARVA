import type { ProductDetailData } from "@/lib/productDetail";
import { getIconForLabel } from "@/components/TrustIcons";

export default function TrustStrip({ detail }: { detail: ProductDetailData }) {
  return (
    <section className="border-b border-arva-border/80 bg-white py-6" aria-label="Trust and delivery">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-arva-text-muted">
          {detail.trustStrip.map((item, i) => {
            const Icon = getIconForLabel(item);
            return (
              <span key={i} className="flex items-center gap-2">
                {Icon ? <Icon className="w-5 h-5 shrink-0 text-arva-accent" /> : <span aria-hidden>•</span>}
                {item}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
