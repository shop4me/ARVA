import Link from "next/link";

const LINKS = [
  { href: "#comfort", label: "Comfort" },
  { href: "#compare", label: "Compare" },
  { href: "#specs", label: "Specs" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
] as const;

export default function PdpJumpLinks() {
  return (
    <nav
      className="border-b border-arva-border/80 bg-white py-3"
      aria-label="Jump to section"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-arva-text-muted hover:text-arva-text hover:underline transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
