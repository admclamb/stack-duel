import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { upsertUserFromClerk } from "~/server/auth/upsert-user";
import type { Permission } from "~/lib/permissions";

export type CurrentAppUser = {
  id: number;
  clerkId: string;
  username: string;
  bio: string | null;
  imageUrl: string | null;
  isPrivate: boolean;
  usernameLastChangedAt: Date | null;
  setupCompletedAt: Date | null;
  roles: string[];
  permissions: Permission[];
};

/**
 * Loads the signed-in Clerk user's app-level row plus their effective roles/permissions, computed
 * as the union of the groups they belong to. Returns `null` when signed out.
 *
 * The Clerk webhook (`user.created`/`user.updated`) is the primary way `users` rows get created,
 * but webhooks are eventually-consistent — a request can beat the webhook to the punch right after
 * sign-up. Rather than surface that as a transient `null`, fall back to fetching the user directly
 * from Clerk and upserting the row on the spot.
 */
export async function getCurrentAppUser(): Promise<CurrentAppUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const row = await findUserWithGroups(userId);
  if (row) return toCurrentAppUser(row);

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  await upsertUserFromClerk({
    id: clerkUser.id,
    username: clerkUser.username,
    imageUrl: clerkUser.imageUrl,
  });

  const created = await findUserWithGroups(userId);
  if (!created) return null;
  return toCurrentAppUser(created);
}

function findUserWithGroups(clerkId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    with: {
      userGroups: {
        with: { group: true },
      },
    },
  });
}

function toCurrentAppUser(
  row: NonNullable<Awaited<ReturnType<typeof findUserWithGroups>>>,
): CurrentAppUser {
  const roles = row.userGroups.map(({ group }) => group.name);
  const permissions = [
    ...new Set(row.userGroups.flatMap(({ group }) => group.permissions)),
  ] as Permission[];

  return {
    id: row.id,
    clerkId: row.clerkId,
    username: row.username,
    bio: row.bio,
    imageUrl: row.imageUrl,
    isPrivate: row.isPrivate,
    usernameLastChangedAt: row.usernameLastChangedAt,
    setupCompletedAt: row.setupCompletedAt,
    roles,
    permissions,
  };
}

export function hasPermission(
  user: Pick<CurrentAppUser, "permissions"> | null,
  permission: Permission,
): boolean {
  return user?.permissions.includes(permission) ?? false;
}
