import { notFound } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";
import type { Metadata } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Markdown } from "~/components/markdown/markdown";
import SiteLayout from "~/components/layout/site-layout";
import CtaSection from "~/components/landing/cta-section";
import BlogToc from "~/components/blog/blog-toc";
import BlogMorePosts from "~/components/blog/blog-more-posts";
import { getHeadings } from "~/lib/blog-headings";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "~/server/blog";
import { formatDate } from "~/lib/date";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const headings = getHeadings(post.body);
  const relatedPosts = getRelatedPosts(post);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-24">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1600}
            height={840}
            className="mb-12 h-64 w-full rounded-xl object-cover md:h-96"
            priority
          />
        ) : null}

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
          <article className="min-w-0 lg:max-w-3xl lg:flex-1">
            <div className="flex flex-col gap-4">
              <h1 className="scroll-m-28 text-3xl font-bold tracking-tight md:text-4xl">
                {post.title}
              </h1>

              <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                <Avatar size="sm">
                  <AvatarImage src={post.authorImageUrl} alt={post.author} />
                  <AvatarFallback>
                    <User className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground font-medium">
                  {post.author}
                </span>
                <span aria-hidden="true">·</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>

              {post.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-12">
              <Markdown content={post.body} />
            </div>
          </article>

          {headings.length > 0 ? (
            <aside className="hidden lg:block lg:w-56 lg:shrink-0">
              <div className="sticky top-28">
                <BlogToc headings={headings} />
              </div>
            </aside>
          ) : null}
        </div>

        <div className="mt-20">
          <CtaSection variant="card" />
        </div>

        <div className="mt-20">
          <BlogMorePosts posts={relatedPosts} />
        </div>
      </div>
    </SiteLayout>
  );
}
