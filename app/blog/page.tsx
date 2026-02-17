import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const title = "Blog | ARVA Modern Furniture";
  const description =
    "Design tips, care guides, and news from ARVA. Modern furniture and living well.";
  const canonical = absoluteUrl("/blog");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-arva-text mb-2">Blog</h1>
      <p className="text-arva-text-muted mb-10">
        Design inspiration and updates from ARVA.
      </p>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <h2 className="text-xl font-semibold text-arva-text group-hover:underline">
                {post.title}
              </h2>
              <p className="text-arva-text-muted mt-1">{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
