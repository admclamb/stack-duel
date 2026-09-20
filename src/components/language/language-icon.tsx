import iconData from "devicon/devicon.json";
import { Code2 } from "lucide-react";
import { cn } from "~/lib/utils";

const DEVICON_NAMES = new Set(iconData.map((icon) => icon.name));

type LanguageIconProps = {
  slug: string;
  name?: string;
  className?: string;
};

export function LanguageIcon({ slug, name, className }: LanguageIconProps) {
  const label = name ?? slug;

  if (!DEVICON_NAMES.has(slug)) {
    return (
      <Code2
        className={cn("text-muted-foreground h-5 w-5", className)}
        aria-label={label}
      />
    );
  }

  return (
    <i
      className={cn(
        `devicon-${slug}-plain`,
        "text-muted-foreground text-xl leading-none",
        className,
      )}
      role="img"
      aria-label={label}
    />
  );
}
