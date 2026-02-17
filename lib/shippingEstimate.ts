/**
 * Server-side delivery estimate. Uses server date; no user timezone required.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getEstimatedArrivalRange(options: {
  minWeeks: number;
  maxWeeks: number;
  timezone?: string;
}): string {
  const { minWeeks, maxWeeks } = options;
  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() + minWeeks * 7);
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + maxWeeks * 7);

  const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return `Estimated arrival: ${fmt(minDate)} – ${fmt(maxDate)}`;
}
