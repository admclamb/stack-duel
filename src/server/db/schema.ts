import { pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `stack-duel_${name}`);

export const problems = createTable("problem", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  title: d.varchar({ length: 256 }).notNull(),
  slug: d.varchar({ length: 256 }).notNull().unique(),
}));
