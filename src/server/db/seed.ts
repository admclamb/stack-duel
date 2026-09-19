/**
 * Idempotent data seeding (lookup/enum tables, not schema). Run with `pnpm db:seed`.
 * Safe to re-run: every insert uses onConflictDoNothing/onConflictDoUpdate.
 */
import { getTableColumns, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { db } from "~/server/db";
import { problems } from "~/server/db/schema";

/**
 * Builds a `set` clause that updates every column except the ones given
 * (typically the conflict target and `id`), so a seed upsert stays correct
 * as columns are added without needing to list them out by hand.
 */
function allColumnsExcept<T extends PgTable>(
  table: T,
  exclude: (keyof T["_"]["columns"])[]
) {
  const columns = getTableColumns(table);
  return Object.fromEntries(
    Object.entries(columns)
      .filter(([key]) => !exclude.includes(key as keyof T["_"]["columns"]))
      .map(([key, column]) => [key, sql.raw(`excluded.${column.name}`)])
  ) as Record<Exclude<keyof T["_"]["columns"], (typeof exclude)[number]>, SQL>;
}

async function main() {
  // Keyed by slug: re-running with edited fields updates the existing row.
  await db
    .insert(problems)
    .values([{ title: "Hello or Goodbye", slug: "hello-or-goodbye" }])
    .onConflictDoUpdate({
      target: problems.slug,
      set: allColumnsExcept(problems, ["id", "slug"]),
    });

  console.log("Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
