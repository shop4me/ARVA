import type { ProductDetailData } from "@/lib/productDetail";

const TILES = [
  {
    title: "OEKO-TEX® Certified Fabric",
    copy: "Certified for safer, tested textiles.",
  },
  {
    title: "Lifetime Structural Warranty",
    copy: "Frame/structural components covered for life.",
  },
  {
    title: "100-Day Trial",
    copy: "$99 flat return pickup if you decide it's not for you.",
  },
] as const;

export default function ProofTiles({ detail }: { detail: ProductDetailData }) {
  const warrantyClarity = detail.warrantyClarity;

  return (
    <section className="py-12 sm:py-16 border-b border-arva-border/80 bg-white" aria-label="Proof points">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="rounded-lg border border-arva-border bg-arva-bg/30 p-4 sm:p-5">
            <p className="font-medium text-arva-text text-sm sm:text-base">{TILES[0].title}</p>
            <p className="text-arva-text-muted text-xs sm:text-sm mt-1 leading-relaxed">{TILES[0].copy}</p>
          </div>
          <div className="rounded-lg border border-arva-border bg-arva-bg/30 p-4 sm:p-5">
            <p className="font-medium text-arva-text text-sm sm:text-base">{TILES[1].title}</p>
            <p className="text-arva-text-muted text-xs sm:text-sm mt-1 leading-relaxed">
              {warrantyClarity ?? TILES[1].copy}
            </p>
          </div>
          <div className="rounded-lg border border-arva-border bg-arva-bg/30 p-4 sm:p-5 flex flex-col">
            <p className="font-medium text-arva-text text-sm sm:text-base">{TILES[2].title}</p>
            <p className="text-arva-text-muted text-xs sm:text-sm mt-1 leading-relaxed">{TILES[2].copy}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
