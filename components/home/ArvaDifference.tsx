import { arvaDifference } from "@/lib/homepage";

export default function ArvaDifference() {
  return (
    <section className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg" aria-labelledby="arva-difference-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 id="arva-difference-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text text-center mb-12">
          The ARVA Difference
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {arvaDifference.map((item, i) => (
            <div key={i} className="text-center sm:text-left">
              <h3 className="font-semibold text-arva-text mb-2">{item.title}</h3>
              <p className="text-sm text-arva-text-muted leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
