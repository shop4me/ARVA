type WhyArvaTile = {
  image: string;
  headline: string;
  tagline: string;
};

const WHY_ARVA_TILES: WhyArvaTile[] = [
  {
    image: "/assets/1.webp",
    headline: "Made to Sit",
    tagline: "More back support than similar sofas",
  },
  {
    image: "/assets/2.webp",
    headline: "Built to Last",
    tagline: "High rub count for real daily use",
  },
  {
    image: "/assets/3.webp",
    headline: "Spill-Resistant",
    tagline: "Easy cleanup for real life",
  },
];

export default function WhyArvaVisual() {
  return (
    <section
      className="py-12 sm:py-16 border-b border-arva-border/80 bg-arva-bg"
      aria-label="Why ARVA visual introduction"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <div
          className="relative overflow-hidden rounded-xl min-h-[320px] sm:min-h-[380px] lg:min-h-[460px] bg-cover bg-top"
          style={{ backgroundImage: "url('/assets/why-arva-sofas.webp')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/10" />
          <div className="relative z-10 flex justify-center text-center px-6 pt-10 sm:pt-14 lg:pt-16">
            <div>
              <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                They all look the same.
              </h2>
              <p className="mt-3 sm:mt-4 text-white/90 text-lg sm:text-xl font-normal">
                So why ARVA?
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {WHY_ARVA_TILES.map((tile) => (
            <article
              key={tile.headline}
              className="relative overflow-hidden rounded-xl border border-arva-border min-h-[260px] sm:min-h-[280px] lg:min-h-[300px] bg-neutral-100"
            >
              <img
                src={tile.image}
                alt={tile.headline}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4 z-10">
                <p className="inline-flex items-center gap-2 text-white font-semibold text-xl leading-tight">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4" fill="white" />
                  </svg>
                  {tile.headline}
                </p>
                <p className="mt-1 text-white/95 text-sm sm:text-base leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                  {tile.tagline}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
