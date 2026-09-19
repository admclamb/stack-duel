import { pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `stack-duel_${name}`);

export const problems = createTable("problem", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  title: d.varchar({ length: 256 }).notNull(),
  slug: d.varchar({ length: 256 }).notNull().unique(),
}));

export const featureFlags = createTable("feature_flag", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  key: d.varchar({ length: 128 }).notNull().unique(),
  name: d.varchar({ length: 256 }).notNull(),
  description: d.text().notNull(),
  enabled: d.boolean().notNull().default(false),
}));

export const users = createTable("user", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  clerkId: d.varchar({ length: 128 }).notNull().unique(),
  username: d.varchar({ length: 64 }).notNull().unique(),
  bio: d.text(),
  imageUrl: d.text(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));
