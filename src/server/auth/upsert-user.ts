// Deliberately no `"server-only"` guard: this needs to be importable from `src/server/db/seed.ts`,
// which runs standalone via tsx (outside Next's build), where the guard throws a false positive.

import { db } from "~/server/db";
import { users } from "~/server/db/schema";

type ClerkUserInput = {
  id: string;
  username: string | null;
  imageUrl: string | null;
};

function fallbackUsername(clerkId: string) {
  return `user_${clerkId.slice(-8)}`;
}

/**
 * Upserts the app-level `users` row from Clerk's view of a user. Shared by the Clerk webhook
 * (`user.created`/`user.updated`) and the lazy-create fallback in `getCurrentAppUser` for the
 * (rare, transient) case where a request beats the webhook to the punch.
 */
export async function upsertUserFromClerk(clerkUser: ClerkUserInput) {
  const username = clerkUser.username ?? fallbackUsername(clerkUser.id);

  const [row] = await db
    .insert(users)
    .values({ clerkId: clerkUser.id, username, imageUrl: clerkUser.imageUrl })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { username, imageUrl: clerkUser.imageUrl },
    })
    .returning();

  if (!row) throw new Error("upsertUserFromClerk: insert returned no row");
  return row;
}
