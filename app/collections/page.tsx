import type { Metadata } from "next";
import Link from "next/link";
import { getCollections } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Collections | ARVA Modern Furniture";
  const description = "Explore ARVA collections: Atlas, Alto, and Oris. Modular sofas for every space.";
  const canonical = absoluteUrl("/collections");
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

export default async function CollectionsIndexPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-arva-text mb-2">Collections</h1>
      <p className="text-arva-text-muted mb-10">
        Choose a collection to explore sectionals, 3-seaters, and loveseats.
      </p>
      <ul className="grid gap-6 sm:grid-cols-3">
        {collections.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/collections/${c.slug}`}
              className="block p-6 border border-arva-border rounded-xl hover:border-arva-accent/30 transition bg-white shadow-arva"
            >
              <h2 className="text-xl font-semibold text-arva-text">{c.name}</h2>
              <p className="text-sm text-arva-text-muted mt-1">{c.tagline}</p>
              <p className="text-arva-text-muted mt-3 text-sm">{c.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
