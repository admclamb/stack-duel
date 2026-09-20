import "server-only";

import { db } from "~/server/db";
import { featureFlags } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Checks a flag's `defaultEnabled` value only. Per-user/per-group overrides and rollout
 * percentage bucketing are resolved by a richer helper landing in Phase 1, once there's an admin
 * UI to actually manage them.
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flag = await db.query.featureFlags.findFirst({
    where: eq(featureFlags.key, key),
    columns: { defaultEnabled: true },
  });

  return flag?.defaultEnabled ?? false;
}
