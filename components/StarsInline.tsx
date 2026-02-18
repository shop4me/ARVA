import type { HTMLAttributes } from "react";

export default function StarsInline({
  rating,
  count,
  className,
  ...rest
}: {
  rating: number; // average rating (e.g. 4.8)
  count: number; // number of reviews
} & HTMLAttributes<HTMLDivElement>) {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const safeRating = Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
  const rounded = Math.round(safeRating);

  if (safeCount <= 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 ${className ?? ""}`.trim()}
      aria-label={`${safeRating.toFixed(1)} out of 5 stars (${safeCount} reviews)`}
      {...rest}
    >
      <span className="inline-flex items-center gap-0.5 leading-none" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={index < rounded ? "text-amber-500" : "text-neutral-300"}
          >
            ★
          </span>
        ))}
      </span>
      <span className="text-arva-text-muted leading-none">({safeCount})</span>
    </div>
  );
}

