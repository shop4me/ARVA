import { whyArva } from "@/lib/homepage";

export default function WhyArva() {
  return (
    <section className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg" aria-labelledby="why-arva-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 id="why-arva-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-10">
          {whyArva.heading}
        </h2>
        <div className="space-y-6 text-arva-text-muted leading-relaxed text-left">
          <p>{whyArva.intro}</p>
          <ul className="list-none space-y-2 pl-0">
            {whyArva.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-arva-accent shrink-0">—</span>
                {b}
              </li>
            ))}
          </ul>
          <p>{whyArva.closing}</p>
        </div>
      </div>
    </section>
  );
}
