import type { Metadata } from "next";
import SiteLayout from "~/components/layout/site-layout";
import BlogPostCard from "~/components/blog/blog-post-card";
import { getPublishedPosts } from "~/server/blog";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <SiteLayout>
      <section className="border-b pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Blog</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
            Updates, engineering notes, and announcements from the team.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center">No posts yet.</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
