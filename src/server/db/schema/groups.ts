import { relations } from "drizzle-orm";
import { primaryKey } from "drizzle-orm/pg-core";
import { createTable } from "./table";
import { users } from "./users";

/**
 * A group is both a role (its name) and a permission bundle (its `permissions`). A user's
 * effective permissions/roles are the union/list of the groups they belong to — there is no
 * separate roles table.
 */
export const groups = createTable("group", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 128 }).notNull().unique(),
  permissions: d.jsonb().$type<string[]>().notNull().default([]),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const userGroups = createTable(
  "user_group",
  (d) => ({
    userId: d
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    groupId: d
      .integer()
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.userId, t.groupId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  userGroups: many(userGroups),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  userGroups: many(userGroups),
}));

export const userGroupsRelations = relations(userGroups, ({ one }) => ({
  user: one(users, { fields: [userGroups.userId], references: [users.id] }),
  group: one(groups, {
    fields: [userGroups.groupId],
    references: [groups.id],
  }),
}));
