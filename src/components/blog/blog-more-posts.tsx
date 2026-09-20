import Link from "next/link";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDate } from "~/lib/date";
import type { BlogPost } from "~/server/blog";

type BlogMorePostsProps = {
  posts: BlogPost[];
};

export default function BlogMorePosts({
  posts,
}: Readonly<BlogMorePostsProps>) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 text-xl font-semibold tracking-tight">
        More posts
      </h2>
      <div className="divide-border border-t border-b flex flex-col divide-y">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex items-center justify-between gap-6 py-6"
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <h3 className="group-hover:text-primary font-semibold transition-colors">
                {post.title}
              </h3>
              <p className="text-muted-foreground line-clamp-1 text-sm">
                {post.excerpt}
              </p>
              <span className="text-muted-foreground text-xs">
                {formatDate(post.publishedAt)}
              </span>
            </div>
            <Avatar className="shrink-0">
              <AvatarImage src={post.authorImageUrl} alt={post.author} />
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </Link>
        ))}
      </div>
    </section>
  );
}
