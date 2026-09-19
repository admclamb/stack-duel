/**
 * Idempotent data seeding (lookup/enum tables, not schema). Run with `pnpm db:seed`.
 * Safe to re-run: every insert uses onConflictDoNothing/onConflictDoUpdate.
 */
import { db } from "~/server/db";
import { problems } from "~/server/db/schema";

async function main() {
  await db
    .insert(problems)
    .values([{ title: "Hello or Goodbye", slug: "hello-or-goodbye" }])
    .onConflictDoNothing();

  console.log("Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
