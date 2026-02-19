import { returnsTrial } from "@/lib/homepage";
import { Icon100DayTrial, IconReturnPickup, IconCheckCircle } from "@/components/TrustIcons";

const RETURNS_LIST = [
  { label: "100-day trial", Icon: Icon100DayTrial },
  { label: "$99 flat pickup fee", Icon: IconReturnPickup },
  { label: "No restocking fees", Icon: IconCheckCircle },
  { label: "Carrier-assisted return", Icon: IconReturnPickup },
];

export default function ReturnsTrial() {
  return (
    <section className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg" aria-labelledby="returns-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 id="returns-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-8">
          {returnsTrial.heading}
        </h2>
        <div className="space-y-6 text-arva-text-muted leading-relaxed">
          {returnsTrial.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <ul className="mt-8 text-left inline-block space-y-2 text-sm text-arva-text-muted">
          {RETURNS_LIST.map(({ label, Icon }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="w-5 h-5 shrink-0 text-arva-accent" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
