export default function WhyArvaVisual() {
  return (
    <section
      className="py-12 sm:py-16 border-b border-arva-border/80 bg-arva-bg"
      aria-label="Why ARVA visual introduction"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
      </div>
    </section>
  );
}
