/**
 * Product detail page (PDP) content. Used only for UI on product pages.
 * Keyed by product slug. Detail content is in data/productDetails.json (admin-editable).
 */

export interface FabricOption {
  name: string;
  hex?: string;
}

export interface ProductDetailImages {
  hero?: string;
  thumbnail1?: string;
  thumbnail2?: string;
  thumbnail3?: string;
  thumbnail4?: string;
  thumbnail5?: string;
  comfort1?: string;
  comfort2?: string;
  dimensionsDiagram?: string;
  /** Optional: fabric name → image path when color-variant hero 404s (e.g. "Slate Gray" → slate seam image). */
  fabricHeroFallbacks?: Record<string, string>;
}

export interface ProductDetailData {
  displayPrice?: number; // PDP-specific price if different from main product
  images?: ProductDetailImages;
  /** PDP H1 – aligns with Google Shopping / feed; one per page */
  pdpH1?: string;
  /** PDP H2 – directly below H1; reinforces intent */
  pdpH2?: string;
  subhead: string;
  reassuranceText: string;
  valueStack: string[];
  fabricDefault: string;
  fabricOptions?: FabricOption[];
  trustStrip: string[];
  comfortHeadline: string;
  comfortCopy: string;
  comfortImageLabels?: string[];
  comparisonTable: {
    rows: { label: string; arva: string; luxury: string; lowCost: string }[];
  };
  dimensions: {
    width: string;
    depth: string;
    height: string;
    seatHeight: string;
    ottoman?: string;
    maxWeightPerPiece: string;
  };
  dimensionsReassurance: string;
  deliveryHeadline: string;
  deliveryCopy: string[];
  reviewsHeading: string;
  reviews: {
    quote: string;
    location: string;
    name?: string;
    age?: number;
    rating?: 4 | 5;
    verified?: boolean;
  }[];
  faq: { question: string; answer: string }[];
  finalCtaHeadline: string;
  finalCtaSubhead: string;
  /** What's Included accordion (Bundle B) */
  whatsIncluded?: string[];
  /** Care & Durability accordion bullets */
  careAndDurability?: string[];
  /** One-line warranty clarity for ProofTiles / hero */
  warrantyClarity?: string;
}
