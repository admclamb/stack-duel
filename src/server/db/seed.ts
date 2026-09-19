/**
 * Idempotent data seeding (lookup/enum tables, not schema). Run with `pnpm db:seed`.
 * Safe to re-run: every insert uses onConflictDoNothing/onConflictDoUpdate.
 */
import { db } from "~/server/db";
// import { statuses } from "~/server/db/schema";

async function main() {
  // Example pattern for a lookup table backing an "enum" that the app can
  // extend without a migration:
  //
  // await db
  //   .insert(statuses)
  //   .values([
  //     { id: "draft", label: "Draft" },
  //     { id: "published", label: "Published" },
  //     { id: "archived", label: "Archived" },
  //   ])
  //   .onConflictDoNothing();

  console.log("Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
