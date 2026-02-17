/**
 * Product and collection content. Replace with API/DB later.
 * Schema supports collections (Atlas, Alto, Oris) and categories (sectional | three-seater | loveseat).
 */

export type CollectionSlug = "atlas" | "alto" | "oris" | "bellini";
export type ProductCategory = "sectional" | "three-seater" | "loveseat";

export interface Product {
  id: string;
  name: string;
  slug: string;
  collection: CollectionSlug;
  category: ProductCategory;
  price: number;
  currency: string;
  description: string;
  highlights: string[];
  isOutdoor: boolean;
  seoTitle: string;
  seoDescription: string;
  /** Google Merchant Center / Shopping feed & JSON-LD; falls back to seoTitle/seoDescription when absent */
  shoppingTitle?: string;
  shoppingDescription?: string;
  image?: string;
  stockStatus: "InStock" | "OutOfStock" | "PreOrder";
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  tagline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Post {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  body: string;
  publishedAt?: string;
}

export const collections: Collection[] = [
  {
    slug: "atlas",
    name: "Atlas",
    tagline: "Core collection",
    description: "Atlas is our core collection: modular comfort, clean lines, and durable construction. Sectional, 3-seater, and loveseat configurations built for everyday living.",
    seoTitle: "ARVA Atlas Collection | Modular Modern Sofas",
    seoDescription: "Shop the ARVA Atlas collection. Sectional, 3-seater, and loveseat. Modular design, 100-day trial, lifetime structural warranty.",
  },
  {
    slug: "alto",
    name: "Alto",
    tagline: "Design-forward collection",
    description: "Alto brings a design-forward silhouette to the ARVA line. Bold proportions, refined details, and the same modular flexibility and warranty.",
    seoTitle: "ARVA Alto Collection | Design-Forward Modular Sofas",
    seoDescription: "Shop the ARVA Alto collection. Design-forward sectionals, 3-seaters, and loveseats. Modular design, 100-day trial, lifetime structural warranty.",
  },
  {
    slug: "oris",
    name: "Oris",
    tagline: "Outdoor collection",
    description: "Oris is built for the outdoors. Weather-resistant fabrics and durable frames for patios, decks, and balconies. Sectional, 3-seater, and loveseat.",
    seoTitle: "ARVA Oris Collection | Outdoor Modular Sofas",
    seoDescription: "Shop the ARVA Oris outdoor collection. Weather-resistant sectionals, 3-seaters, and loveseats. Modular design, 100-day trial, lifetime structural warranty.",
  },
  {
    slug: "bellini",
    name: "Bellini",
    tagline: "Contemporary modular collection",
    description: "Bellini brings the same modular comfort profile in a clean contemporary line. Sectional, 3-seater, and loveseat configurations designed for everyday living.",
    seoTitle: "ARVA Bellini Collection | Modular Modern Sofas",
    seoDescription: "Shop the ARVA Bellini collection. Sectional, 3-seater, and loveseat. Modular design, 100-day trial, lifetime structural warranty.",
  },
];

export const posts: Post[] = [
  {
    slug: "first-post",
    title: "First Post",
    seoTitle: "First Post | ARVA Blog",
    seoDescription: "Welcome to the ARVA blog. Our first post about modern furniture and design.",
    excerpt: "Welcome to the ARVA blog. We're excited to share design tips and product updates.",
    body: "This is the first post on the ARVA blog. We'll be sharing design inspiration, care tips for your furniture, and news about new products. Stay tuned for more content.",
    publishedAt: "2025-01-15",
  },
];
