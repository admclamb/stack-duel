import { getTableColumns, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { db } from "~/server/db";
import { problems } from "~/server/db/schema";

function allColumnsExcept<T extends PgTable>(
  table: T,
  exclude: (keyof T["_"]["columns"])[],
) {
  const columns = getTableColumns(table);
  return Object.fromEntries(
    Object.entries(columns)
      .filter(([key]) => !exclude.includes(key as keyof T["_"]["columns"]))
      .map(([key, column]) => [key, sql.raw(`excluded.${column.name}`)]),
  ) as Record<Exclude<keyof T["_"]["columns"], (typeof exclude)[number]>, SQL>;
}

async function main() {
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
