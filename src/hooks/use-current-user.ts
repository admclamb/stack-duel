"use client";

import { useAuth } from "@clerk/nextjs";

import { api } from "~/trpc/react";
import type { Permission } from "~/lib/permissions";

export function useCurrentUser() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: user, isLoading } = api.user.me.useQuery(undefined, {
    enabled: !!isSignedIn,
  });

  function hasPermission(permission: Permission) {
    return user?.permissions.includes(permission) ?? false;
  }

  return {
    user: user ?? null,
    isLoading: !isLoaded || (!!isSignedIn && isLoading),
    hasPermission,
  };
}
