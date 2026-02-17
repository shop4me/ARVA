/**
 * Homepage / landing copy and section data.
 * Used only for UI; does not affect routing or product API.
 * Positioning: modern living for real spaces (apartments AND homes).
 */

export const hero = {
  h1: "Designed for Real Living. Built to Last.",
  subhead:
    "Modern modular comfort. Clean architectural design. OEKO-TEX® certified fabric. Lifetime structural warranty. Starting at $599.",
  ctaPrimary: "Shop the Collection",
  ctaPrimaryHref: "/products",
  ctaSecondary: "View the Atlas Sectional",
  ctaSecondaryHref: "/products/atlas-sectional",
  trustBadges: [
    "4.8★ Rated",
    "100-Day Trial",
    "$99 Flat Return Pickup",
    "Tool-Free Assembly",
    "Delivered in 2–4 Weeks",
  ],
};

export interface LineupItem {
  slug: string;
  name: string;
  price: number;
  bullets: string[];
  ctaLabel: string;
  badge?: "Most Popular";
}

export const productLineup: LineupItem[] = [
  {
    slug: "atlas-loveseat",
    name: "Atlas Loveseat",
    price: 1299,
    bullets: [
      "Clean, versatile footprint for modern living spaces",
      "Same premium build as larger pieces",
      "Tool-free assembly",
      "Designed for simple delivery and easy setup",
    ],
    ctaLabel: "Shop Loveseat",
  },
  {
    slug: "atlas-3-seater",
    name: "Atlas 3-Seater",
    price: 1899,
    bullets: [
      "Designed for simple delivery and easy setup",
      "Modular design",
      "OEKO-TEX® certified fabric",
      "Lifetime structural warranty",
    ],
    ctaLabel: "Shop 3-Seater",
  },
  {
    slug: "atlas-sectional",
    name: "Atlas Sectional",
    price: 2499,
    bullets: [
      "Configure to your space",
      "Add units over time",
      "Premium comfort",
      "Built for daily use",
    ],
    ctaLabel: "Shop Sectional",
    badge: "Most Popular",
  },
];

export const whyArva = {
  heading: "Why ARVA Exists",
  intro: "Luxury cloud-style sofas look beautiful. They also:",
  bullets: [
    "Cost $3,000–$8,000",
    "Take months to deliver",
    "Require freight scheduling",
    "Get damaged in transit",
    "Are difficult to move, reconfigure, or relocate",
  ],
  closing:
    "ARVA was built differently. We engineered modular comfort for modern living — without the luxury markup or logistical headaches.",
};

export interface DifferenceItem {
  title: string;
  body: string;
}

export const arvaDifference: DifferenceItem[] = [
  {
    title: "Thoughtfully Balanced Dimensions",
    body: "37.7\" depth — deep enough to lounge, balanced enough for everyday living. 15\" low seat height — a modern silhouette that feels open and relaxed. 102\" width — substantial presence without dominating your space.",
  },
  {
    title: "Thoughtfully packaged delivery",
    body: "Designed to move, reconfigure, and relocate with ease. Ships in a box — unbox, unroll, and let it expand. No freight coordination required.",
  },
  {
    title: "Modular system",
    body: "Start with one piece. Add a chaise or more seats later. Your sofa grows with your space.",
  },
  {
    title: "OEKO-TEX® certified fabric",
    body: "Fabric tested for harmful substances. Safe for you and your home.",
  },
  {
    title: "Lifetime structural warranty",
    body: "We stand behind the frame. If it ever fails under normal use, we’ll make it right.",
  },
];

export interface Review {
  quote: string;
  author: string;
  verified?: boolean;
}

export const reviews = {
  rating: "4.8",
  outOf: "5",
  customerCount: "1,200+",
  customerLabel: "customers",
  items: [
    {
      quote: "Finally a sofa that actually fit through my door. Assembly took maybe 20 minutes.",
      author: "Sarah M.",
      verified: true,
    },
    {
      quote: "The quality is solid. No sagging after a year. Worth every penny.",
      author: "James K.",
      verified: true,
    },
    {
      quote: "Return process was straightforward. $99 pickup, no hassle. (I ended up keeping it.)",
      author: "Alex T.",
      verified: true,
    },
    {
      quote: "Clean look, comfortable. Doesn’t feel like a \"budget\" option at all.",
      author: "Morgan L.",
      verified: true,
    },
  ] as Review[],
};

export const returnsTrial = {
  heading: "Returns & Trial",
  paragraphs: [
    "We want you to be sure. That’s why we offer a 100-day trial on every order.",
    "If it’s not right, we’ll arrange a carrier-assisted return. $99 flat pickup fee, no restocking fees. We make it simple so you can decide without pressure.",
  ],
};

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "How does delivery work?",
    answer:
      "Your order ships vacuum-packed in boxes via standard carrier. You’ll get tracking and typically receive it within 2–4 weeks. No freight trucks or appointment windows—delivery to your door.",
  },
  {
    question: "Is it easy to deliver and set up?",
    answer:
      "Yes. ARVA ships in modular components designed for easier delivery, setup, and relocation — whether you’re moving into a house or a city space.",
  },
  {
    question: "What if it doesn’t fit my space?",
    answer:
      "We offer a 100-day trial. If you’re not satisfied, we’ll arrange a return for a $99 flat pickup fee. No restocking fees. Measure your space and doorways before ordering; our product pages include full dimensions.",
  },
  {
    question: "Is assembly difficult?",
    answer:
      "No. The M1 line is designed for tool-free assembly. You unbox, unroll the pieces, and connect them. Most people are done in under 30 minutes.",
  },
  {
    question: "What does the lifetime structural warranty cover?",
    answer:
      "The frame and structural components are covered for the lifetime of the product under normal household use. If the frame fails, we’ll repair or replace it. Fabric and cushions have separate coverage—see our warranty page for details.",
  },
  {
    question: "Can I add more pieces later?",
    answer:
      "Yes. The M1 system is modular. You can add a chaise, ottoman, or more seating units later. Pieces are designed to connect and match.",
  },
];

export const finalCta = {
  heading: "Upgrade your living space.",
  subhead:
    "Without overpaying. Without freight headaches. Without waiting months.",
  ctaPrimary: "Shop ARVA",
  ctaPrimaryHref: "/products",
  ctaSecondary: "Explore Configurations",
  ctaSecondaryHref: "/products",
};
