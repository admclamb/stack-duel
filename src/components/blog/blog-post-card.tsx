import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/lib/date";
import type { BlogPost } from "~/server/blog";

type BlogPostCardProps = {
  post: BlogPost;
};

export default function BlogPostCard({ post }: Readonly<BlogPostCardProps>) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
      {post.coverImage ? (
        <div className="overflow-hidden rounded-xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={800}
            height={420}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {formatDate(post.publishedAt)}
        </span>

        <h3 className="group-hover:text-primary text-lg font-semibold tracking-tight transition-colors">
          {post.title}
        </h3>

        <p className="text-muted-foreground text-sm">{post.excerpt}</p>

        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar size="sm">
            <AvatarImage src={post.authorImageUrl} alt={post.author} />
            <AvatarFallback>
              <User className="size-3.5" />
            </AvatarFallback>
          </Avatar>
          <span className="text-foreground font-medium">{post.author}</span>
        </div>
      </div>
    </Link>
  );
}
