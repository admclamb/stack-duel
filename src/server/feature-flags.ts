import "server-only";

import { db } from "~/server/db";
import { featureFlags } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function isFeatureEnabled(key: string): Promise<boolean> {
  const flag = await db.query.featureFlags.findFirst({
    where: eq(featureFlags.key, key),
    columns: { enabled: true },
  });

  return flag?.enabled ?? false;
}
