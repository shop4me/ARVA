"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type FadeInSectionProps = {
  children: ReactNode;
  className?: string;
  delayClassName?: string;
};

export default function FadeInSection({
  children,
  className,
  delayClassName,
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const visibilityClass = isVisible ? "fade-in-visible" : "fade-in-hidden";

  return (
    <div
      ref={ref}
      className={`fade-in-section ${visibilityClass} ${delayClassName ?? ""} ${
        className ?? ""
      }`.trim()}
    >
      {children}
    </div>
  );
}
