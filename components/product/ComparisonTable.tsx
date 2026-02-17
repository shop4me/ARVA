/**
 * "Why ARVA vs. Other Cloud Sofas" — comparison section. Server Component.
 * Uses calm, factual copy; ARVA column slightly emphasized. Mobile: card stacking.
 */

const COMPARISON_ROWS: { label: string; arva: string; luxury: string; lowCost: string }[] = [
  { label: "Price", arva: "Under $1,000", luxury: "$2,500–$8,000+", lowCost: "Varies" },
  { label: "Delivery time", arva: "2–4 weeks", luxury: "Often weeks–months", lowCost: "Varies" },
  { label: "Modular flexibility", arva: "Yes", luxury: "Sometimes", lowCost: "Sometimes" },
  { label: "Trial period", arva: "100 days", luxury: "Often limited", lowCost: "Often limited" },
  { label: "Warranty", arva: "Lifetime structural", luxury: "Varies", lowCost: "Varies" },
  { label: "Tool-free setup", arva: "Yes", luxury: "Sometimes", lowCost: "Varies" },
  { label: "Fabric standards", arva: "OEKO-TEX® certified", luxury: "Varies", lowCost: "Often unclear" },
  { label: "Returns experience", arva: "$99 flat pickup", luxury: "Often expensive/complex", lowCost: "Often limited" },
  { label: "Shipping damage risk", arva: "Lower (packaging optimized)", luxury: "Higher (freight)", lowCost: "Varies" },
];

export default function ComparisonTable() {
  return (
    <section id="compare" className="py-16 sm:py-20 border-b border-arva-border/80 bg-white scroll-mt-24" aria-labelledby="comparison-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 id="comparison-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-4 text-center">
          Why ARVA vs. Other Cloud Sofas
        </h2>
        <p className="text-arva-text-muted text-center max-w-2xl mx-auto mb-10">
          If you love the cloud look, ARVA is the smarter way to get it — without the markup or the freight headaches.
        </p>
        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-arva-border">
                <th className="py-4 pr-4 font-semibold text-arva-text w-1/4" scope="col" />
                <th className="py-4 px-4 font-semibold text-arva-text bg-arva-accent/5" scope="col">
                  ARVA
                </th>
                <th className="py-4 px-4 font-semibold text-arva-text-muted" scope="col">
                  Luxury Cloud Sofas
                </th>
                <th className="py-4 px-4 font-semibold text-arva-text-muted" scope="col">
                  Low-Cost Alternatives
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} className="border-b border-arva-border/60">
                  <td className="py-3 pr-4 font-medium text-arva-text">{row.label}</td>
                  <td className="py-3 px-4 text-arva-text bg-arva-accent/5">{row.arva}</td>
                  <td className="py-3 px-4 text-arva-text-muted">{row.luxury}</td>
                  <td className="py-3 px-4 text-arva-text-muted">{row.lowCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile: stacked cards per row */}
        <div className="md:hidden space-y-3">
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={i}
              className="rounded-lg border border-arva-border bg-arva-bg/30 p-4 text-sm"
            >
              <p className="font-medium text-arva-text mb-3">{row.label}</p>
              <dl className="space-y-2">
                <div>
                  <dt className="text-arva-text-muted text-xs">ARVA</dt>
                  <dd className="font-medium text-arva-text">{row.arva}</dd>
                </div>
                <div>
                  <dt className="text-arva-text-muted text-xs">Luxury Cloud Sofas</dt>
                  <dd className="text-arva-text-muted">{row.luxury}</dd>
                </div>
                <div>
                  <dt className="text-arva-text-muted text-xs">Low-Cost Alternatives</dt>
                  <dd className="text-arva-text-muted">{row.lowCost}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
