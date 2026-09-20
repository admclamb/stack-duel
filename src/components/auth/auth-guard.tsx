"use client";

import { type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import type { Permission } from "~/lib/permissions";
import { useCurrentUser } from "~/hooks/use-current-user";
import { useHasMounted } from "~/hooks/use-has-mounted";
import { AuthGuardFallback } from "./auth-guard-fallback";

type AuthGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  permission?: Permission | Permission[];
  requireAll?: boolean;
};

export function AuthGuard({
  children,
  fallback,
  loadingFallback = null,
  permission,
  requireAll = true,
}: Readonly<AuthGuardProps>) {
  const hasMounted = useHasMounted();
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  if (!hasMounted || !isLoaded || (!!isSignedIn && isUserLoading)) {
    return <>{loadingFallback}</>;
  }

  if (!isSignedIn) {
    return <>{fallback ?? <AuthGuardFallback reason="unauthenticated" />}</>;
  }

  if (permission) {
    const required = Array.isArray(permission) ? permission : [permission];
    const userPermissions = user?.permissions ?? [];
    const hasRequiredPermission = requireAll
      ? required.every((p) => userPermissions.includes(p))
      : required.some((p) => userPermissions.includes(p));

    if (!hasRequiredPermission) {
      return <>{fallback ?? <AuthGuardFallback reason="forbidden" />}</>;
    }
  }

  return <>{children}</>;
}
