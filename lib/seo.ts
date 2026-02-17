/**
 * SEO helpers: metadata, canonicals, JSON-LD.
 * All used server-side so HTML includes correct tags and structured data.
 */

const SITE_URL = "https://livearva.com";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function productJsonLd(product: {
  name: string;
  description: string;
  shoppingTitle?: string;
  shoppingDescription?: string;
  image?: string;
  price: number;
  currency: string;
  slug: string;
  availability?: string;
  stockStatus?: string;
}): object {
  const url = absoluteUrl(`/products/${product.slug}`);
  const image = product.image
    ? (product.image.startsWith("http") ? product.image : absoluteUrl(product.image))
    : absoluteUrl("/images/placeholder-product.jpg");
  const availability = product.stockStatus ?? product.availability ?? "InStock";
  const name = product.shoppingTitle ?? product.name;
  const description = product.shoppingDescription ?? product.description;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    brand: {
      "@type": "Brand",
      name: "ARVA",
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency ?? "USD",
      availability: `https://schema.org/${availability}`,
      url,
    },
    url,
  };
}
