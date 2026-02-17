"use client";

import { useState } from "react";
import type { ProductDetailData } from "@/lib/productDetail";

const DEFAULT_WARRANTY = "Lifetime structural coverage (frame/structural components).";

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function DetailsAccordion({ detail }: { detail: ProductDetailData }) {
  const [openId, setOpenId] = useState<string>(
    detail.whatsIncluded?.length ? "whats-included" : "materials"
  );

  const d = detail.dimensions;
  const warrantyText = detail.warrantyClarity ?? DEFAULT_WARRANTY;

  const sections: Section[] = [
    ...(detail.whatsIncluded && detail.whatsIncluded.length > 0
      ? [
          {
            id: "whats-included",
            title: "What's Included",
            content: (
              <ul className="space-y-2 text-sm text-arva-text-muted leading-relaxed list-disc pl-5">
                {detail.whatsIncluded.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ),
          } as Section,
        ]
      : []),
    {
      id: "materials",
      title: "Materials & Fabric",
      content: (
        <p className="text-arva-text-muted text-sm leading-relaxed">
          OEKO-TEX® certified performance fabric. Durable, everyday-friendly weave. Frame and construction built for long-term use.
        </p>
      ),
    },
    {
      id: "dimensions",
      title: "Dimensions",
      content: (
        <dl className="space-y-2 text-sm text-arva-text-muted">
          <div className="flex justify-between gap-4">
            <dt>Width</dt>
            <dd className="font-medium text-arva-text">{d.width}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Depth</dt>
            <dd className="font-medium text-arva-text">{d.depth}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Height</dt>
            <dd className="font-medium text-arva-text">{d.height}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Seat height</dt>
            <dd className="font-medium text-arva-text">{d.seatHeight}</dd>
          </div>
          {d.ottoman && (
            <div className="flex justify-between gap-4">
              <dt>Ottoman</dt>
              <dd className="font-medium text-arva-text">{d.ottoman}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt>Max weight per piece</dt>
            <dd className="font-medium text-arva-text">{d.maxWeightPerPiece}</dd>
          </div>
          <p className="pt-4 text-arva-text-muted leading-relaxed">{detail.dimensionsReassurance}</p>
        </dl>
      ),
    },
    {
      id: "shipping",
      title: "Shipping & Returns",
      content: (
        <ul className="space-y-2 text-sm text-arva-text-muted leading-relaxed list-none pl-0">
          {detail.deliveryCopy.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      ),
    },
    ...(detail.careAndDurability && detail.careAndDurability.length > 0
      ? [
          {
            id: "care",
            title: "Care & Durability",
            content: (
              <ul className="space-y-2 text-sm text-arva-text-muted leading-relaxed list-none pl-0">
                {detail.careAndDurability.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ),
          } as Section,
        ]
      : []),
    {
      id: "warranty",
      title: "Warranty",
      content: (
        <p className="text-arva-text-muted text-sm leading-relaxed">{warrantyText}</p>
      ),
    },
  ];

  return (
    <section id="specs" className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg scroll-mt-24" aria-labelledby="details-accordion-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 id="details-accordion-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-8 text-center">
          Details & Specs
        </h2>
        <div className="border border-arva-border rounded-xl bg-white shadow-arva overflow-hidden">
          {sections.map(({ id, title, content }) => (
            <div key={id} id={id === "dimensions" ? "dimensions" : undefined} className="border-b border-arva-border last:border-b-0 scroll-mt-24">
              <button
                type="button"
                onClick={() => setOpenId(openId === id ? "" : id)}
                className="w-full py-4 px-5 flex items-center justify-between text-left gap-4 focus:outline-none focus:ring-2 focus:ring-arva-accent/20 focus:ring-inset"
                aria-expanded={openId === id}
              >
                <span className="font-medium text-arva-text">{title}</span>
                <span className="shrink-0 w-6 h-6 flex items-center justify-center text-arva-text-muted" aria-hidden>
                  {openId === id ? "−" : "+"}
                </span>
              </button>
              {openId === id && (
                <div className="px-5 pb-5 pt-0">
                  {content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
