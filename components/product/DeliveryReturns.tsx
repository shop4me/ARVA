import type { ProductDetailData } from "@/lib/productDetail";

const ICONS: Record<number, JSX.Element> = {
  0: (
    <svg className="w-5 h-5 text-arva-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  1: (
    <svg className="w-5 h-5 text-arva-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  2: (
    <svg className="w-5 h-5 text-arva-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75h1.5M7.5 10.5h3m-2.25 3.75h3.75m-.75-4.5h4.5m-1.5 4.5h1.5m-1.5 2.25H12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25v6.75m0-6.75h3m-3 0h-6m6 0V3.75" />
    </svg>
  ),
  3: (
    <svg className="w-5 h-5 text-arva-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  4: (
    <svg className="w-5 h-5 text-arva-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function DeliveryReturns({ detail }: { detail: ProductDetailData }) {
  return (
    <section id="delivery-returns" className="py-16 sm:py-20 border-b border-arva-border/80 bg-white" aria-labelledby="delivery-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 id="delivery-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-8">
          {detail.deliveryHeadline}
        </h2>
        <ul className="space-y-4 text-arva-text-muted leading-relaxed text-left list-none pl-0">
          {detail.deliveryCopy.map((p, i) => (
            <li key={i} className="flex items-start gap-3">
              {ICONS[i]}
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
