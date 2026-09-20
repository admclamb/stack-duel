"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";

type AuthGuardFallbackProps = {
  reason: "unauthenticated" | "forbidden";
};

export function AuthGuardFallback({ reason }: Readonly<AuthGuardFallbackProps>) {
  const pathname = usePathname();

  if (reason === "forbidden") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm font-medium">
          You don&apos;t have permission to view this.
        </p>
        <p className="text-muted-foreground text-sm">
          Contact an admin if you think this is a mistake.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-sm font-medium">Sign in to view this content.</p>
      <Button asChild>
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent(pathname ?? "/")}`}
        >
          Sign in
        </Link>
      </Button>
    </div>
  );
}
