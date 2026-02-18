import type { ReactNode } from "react";

type WhyArvaTile = {
  image: string;
  headline: string;
  tagline: string;
  icon: ReactNode;
};

const WHY_ARVA_TILES: WhyArvaTile[] = [
  {
    image: "/assets/1.webp",
    headline: "Real Back Support",
    tagline: "Upright comfort that actually supports you",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M9 4h6v16H9z" stroke="white" strokeWidth="1.8" />
        <path d="M6 10h3M6 14h3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    image: "/assets/2.webp",
    headline: "Made to Sit - Not Just Lounge",
    tagline: "Comfortable for conversation, work, and long evenings",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M5 12h14v6H5v-6Z" stroke="white" strokeWidth="1.8" />
        <path d="M8 9h8v3H8V9Z" stroke="white" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    image: "/assets/3.webp",
    headline: "Performance-Weave Fabric",
    tagline: "High rub count for everyday durability",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M6 7h12v10H6V7Z" stroke="white" strokeWidth="1.8" />
        <path d="M9 10h6M9 13h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    image: "/assets/4.webp",
    headline: "Easy to Clean",
    tagline: "Designed for real life, not babying",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M6 16h12M8 13h8M10 10h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    image: "/assets/5.webp",
    headline: "Pet Friendly",
    tagline: "Handles fur, paws, and daily wear",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M8 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="white" />
        <path d="M8.5 18c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5-1.4 2.5-3.5 2.5S8.5 20 8.5 18Z" fill="white" />
      </svg>
    ),
  },
  {
    image: "/assets/6.webp",
    headline: "Spill Resistant",
    tagline: "Liquids bead up, cleanup stays easy",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 4c2.8 3.8 5.5 6.2 5.5 9.1a5.5 5.5 0 1 1-11 0C6.5 10.2 9.2 7.8 12 4Z" stroke="white" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    image: "/assets/7.webp",
    headline: "Comfort That Doesn’t Collapse",
    tagline: "Holds its shape over time",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M5 15h14v4H5v-4Z" stroke="white" strokeWidth="1.8" />
        <path d="M7 11h10v4H7v-4Z" stroke="white" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    image: "/assets/8.webp",
    headline: "True-to-Scale Design",
    tagline: "Honest sizing that fits your space",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M4 7h16M4 17h16M7 4v3M12 4v3M17 4v3M7 17v3M12 17v3M17 17v3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    image: "/assets/9.webp",
    headline: "Built to Match",
    tagline: "Every seam lines up. Every seat feels the same.",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M5 7h14v10H5V7Z" stroke="white" strokeWidth="1.8" />
        <path d="M12 7v10M5 12h14" stroke="white" strokeWidth="1.8" />
      </svg>
    ),
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
                  {tile.icon}
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
