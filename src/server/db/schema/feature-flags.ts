import { pgEnum, unique } from "drizzle-orm/pg-core";
import { createTable } from "./table";
import { users } from "./users";
import { groups } from "./groups";

export const decisionEffectEnum = pgEnum("stack_duel_decision_effect", [
  "Allow",
  "Deny",
]);

export const featureFlags = createTable("feature_flag", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  key: d.varchar({ length: 128 }).notNull().unique(),
  name: d.varchar({ length: 256 }).notNull(),
  description: d.text().notNull(),
  defaultEnabled: d.boolean().notNull().default(false),
  rolloutPercentage: d.integer().notNull().default(0),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

export const featureFlagUserOverrides = createTable(
  "feature_flag_user_override",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    flagId: d
      .integer()
      .notNull()
      .references(() => featureFlags.id, { onDelete: "cascade" }),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    effect: decisionEffectEnum().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [unique().on(t.flagId, t.userId)],
);

export const featureFlagGroupOverrides = createTable(
  "feature_flag_group_override",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    flagId: d
      .integer()
      .notNull()
      .references(() => featureFlags.id, { onDelete: "cascade" }),
    groupId: d
      .integer()
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    effect: decisionEffectEnum().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [unique().on(t.flagId, t.groupId)],
);
