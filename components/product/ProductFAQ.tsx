"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-arva-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left gap-4 focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-arva-text">{item.question}</span>
        <span className="shrink-0 w-6 h-6 flex items-center justify-center text-arva-text-muted" aria-hidden>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="pb-5 pr-10">
          <p className="text-arva-text-muted text-sm leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function ProductFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-20 border-b border-arva-border/80 bg-arva-bg scroll-mt-24" aria-labelledby="pdp-faq-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 id="pdp-faq-heading" className="text-2xl sm:text-3xl font-semibold text-arva-text mb-10 text-center">
          Frequently Asked Questions
        </h2>
        <div className="bg-white border border-arva-border rounded-xl shadow-arva overflow-hidden px-6">
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
