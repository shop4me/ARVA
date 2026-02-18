/**
 * Shared layout for legal and policy pages.
 * Ensures consistent hierarchy, spacing, and readability on desktop and mobile.
 */
import type { ReactNode } from "react";

const containerClass =
  "max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-arva-text";
const h1Class =
  "text-3xl sm:text-4xl font-semibold text-arva-text mb-2 tracking-tight";
const lastUpdatedClass = "text-sm text-arva-text-muted mb-10";
const sectionClass = "mb-10";
const h2Class =
  "text-xl font-semibold text-arva-text mt-10 mb-3 first:mt-0";
const pClass = "text-arva-text-muted leading-relaxed mb-4";
const ulClass = "list-disc pl-6 space-y-2 mb-6 text-arva-text-muted leading-relaxed";
const liClass = "mb-1";

type LegalPageLayoutProps = {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <article className={`border-b border-arva-border/80 bg-arva-bg ${containerClass}`}>
      <h1 className={h1Class}>{title}</h1>
      {lastUpdated && (
        <p className={lastUpdatedClass}>
          <strong>Last updated:</strong> {lastUpdated}
        </p>
      )}
      <div className="legal-content">{children}</div>
    </article>
  );
}

export const legalStyles = {
  section: sectionClass,
  h2: h2Class,
  p: pClass,
  ul: ulClass,
  li: liClass,
} as const;
