import { createTable } from "./table";

export const users = createTable("user", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  clerkId: d.varchar({ length: 128 }).notNull().unique(),
  username: d.varchar({ length: 64 }).notNull().unique(),
  bio: d.text(),
  imageUrl: d.text(),
  isPrivate: d.boolean().notNull().default(false),
  usernameLastChangedAt: d.timestamp({ withTimezone: true }),
  setupCompletedAt: d.timestamp({ withTimezone: true }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));
