import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import Markdown from "@/components/Markdown";
import Image from "next/image";

export const revalidate = 3600; // 1 hour

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };

  const title = post.seoTitle;
  const description = post.seoDescription;
  const canonical = absoluteUrl(`/blog/${slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {post.heroImage && (
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-arva-border bg-arva-bg mb-8">
          <Image
            src={post.heroImage}
            alt={`${post.title} hero`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}
      <h1 className="text-3xl font-semibold text-arva-text mb-4">
        {post.title}
      </h1>
      <div className="text-sm text-arva-text-muted mb-6">
        {post.publishedAt ? <span>{post.publishedAt}</span> : null}
        {post.author ? <span>{post.publishedAt ? " · " : ""}{post.author}</span> : null}
      </div>
      <p className="text-arva-text-muted mb-8">{post.excerpt}</p>
      <Markdown content={post.body} />
    </article>
  );
}
