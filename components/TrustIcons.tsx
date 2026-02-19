import React from "react";

const iconClass = "w-5 h-5 shrink-0 text-arva-accent";

/** Minimal checkmark for list bullets (ProductLineup, WhyArva). */
export function IconBulletCheck({ className = "w-4 h-4 shrink-0 text-arva-accent/80" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8l3 3 7-7" />
    </svg>
  );
}

/** Check in circle for “no fee” / positive assurance (e.g. No restocking fees). */
export function IconCheckCircle({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function Icon100DayTrial({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconToolFree({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function IconReturnPickup({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function IconLifetimeWarranty({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function IconFreeShipping({ className = iconClass }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v2" />
      <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export const TRUST_ITEMS = [
  { id: "trial", label: "100-Day Trial", Icon: Icon100DayTrial },
  { id: "assembly", label: "Tool-Free Assembly", Icon: IconToolFree },
  { id: "return", label: "$99 Flat Return Pickup", Icon: IconReturnPickup },
  { id: "warranty", label: "Lifetime Warranty", Icon: IconLifetimeWarranty },
  { id: "shipping", label: "Free Shipping", Icon: IconFreeShipping },
] as const;

/** Match a trust strip or list label to an icon (for dynamic content). */
export function getIconForLabel(label: string): React.ComponentType<{ className?: string }> | null {
  const lower = label.toLowerCase();
  if (lower.includes("100-day") || lower.includes("trial")) return Icon100DayTrial;
  if (lower.includes("tool-free") || lower.includes("assembly")) return IconToolFree;
  if (lower.includes("return") || lower.includes("pickup") || lower.includes("99")) return IconReturnPickup;
  if (lower.includes("lifetime") || lower.includes("warranty")) return IconLifetimeWarranty;
  if (lower.includes("free shipping") || lower.includes("shipping")) return IconFreeShipping;
  return null;
}

export default function TrustItemWithIcon({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className={iconClass} />
      <span>{label}</span>
    </span>
  );
}
