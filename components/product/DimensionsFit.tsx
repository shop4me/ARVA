import type { ProductDetailData } from "@/lib/productDetail";

export default function DimensionsFit({ detail }: { detail: ProductDetailData }) {
  const d = detail.dimensions;
  return (
    <section className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg" aria-labelledby="dimensions-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 id="dimensions-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-10 text-center">
          Dimensions & Fit
        </h2>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="rounded-xl bg-white border border-arva-border shadow-arva aspect-square max-h-[320px] flex items-center justify-center text-arva-text-muted text-sm">
            Diagram placeholder
          </div>
          <div>
            <dl className="space-y-3 text-arva-text">
              <div className="flex justify-between gap-4">
                <dt className="text-arva-text-muted">Width</dt>
                <dd className="font-semibold">{d.width}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-arva-text-muted">Depth</dt>
                <dd className="font-semibold">{d.depth}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-arva-text-muted">Height</dt>
                <dd className="font-semibold">{d.height}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-arva-text-muted">Seat height</dt>
                <dd className="font-semibold">{d.seatHeight}</dd>
              </div>
              {d.ottoman && (
                <div className="flex justify-between gap-4">
                  <dt className="text-arva-text-muted">Ottoman</dt>
                  <dd className="font-semibold">{d.ottoman}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-arva-text-muted">Max weight capacity (per piece)</dt>
                <dd className="font-semibold">{d.maxWeightPerPiece}</dd>
              </div>
            </dl>
            <p className="mt-8 text-arva-text-muted leading-relaxed">
              {detail.dimensionsReassurance}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
