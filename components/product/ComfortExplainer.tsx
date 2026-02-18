/**
 * "What It Feels Like" — sensory selling section. Server Component.
 */

export default function ComfortExplainer() {
  const cards = [
    {
      title: "Supportive, not sink-in",
      copy: "Balanced support that feels substantial — without swallowing you.",
    },
    {
      title: "Relaxed, but structured",
      copy: "Deep enough to lounge. Structured enough for everyday sitting.",
    },
    {
      title: "Quietly premium",
      copy: "Clean lines, tailored details, and a calm presence that elevates the room.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg" aria-labelledby="feels-like-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 id="feels-like-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-12 text-center">
          What It Feels Like
        </h2>
        <div className="space-y-10 sm:space-y-12">
          {cards.map(({ title, copy }) => (
            <div key={title} className="text-center">
              <h3 className="text-lg font-semibold text-arva-text mb-2">{title}</h3>
              <p className="text-arva-text-muted leading-relaxed max-w-xl mx-auto">{copy}</p>
            </div>
          ))}
        </div>
        {/* Optional image row: fabric + seam close-up */}
        <div className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <figure className="aspect-square rounded-xl bg-white border border-arva-border shadow-arva overflow-hidden relative">
            <img
              src="/images/pdp/fabric-texture.webp"
              alt="Fabric close-up"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <figcaption className="absolute left-3 bottom-3 text-xs text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
              Fabric close-up
            </figcaption>
          </figure>
          <figure className="aspect-square rounded-xl bg-white border border-arva-border shadow-arva overflow-hidden relative">
            <img
              src="/images/pdp/precision-seams.webp"
              alt="Seam close-up"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <figcaption className="absolute left-3 bottom-3 text-xs text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
              Seam close-up
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
