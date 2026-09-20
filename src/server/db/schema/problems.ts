import { relations } from "drizzle-orm";
import { pgEnum, primaryKey, unique } from "drizzle-orm/pg-core";
import { createTable } from "./table";
import { users } from "./users";
import { languageVersions } from "./languages";

export const problemStatusEnum = pgEnum("stack_duel_problem_status", [
  "Draft",
  "Published",
  "Archived",
]);

export const problems = createTable("problem", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  slug: d.varchar({ length: 256 }).notNull().unique(),
  title: d.varchar({ length: 256 }).notNull(),
  question: d.text().notNull().default(""),
  difficultyValue: d.integer().notNull().default(0),
  difficultyTier: d.varchar({ length: 32 }).notNull().default("Beginner"),
  timeLimitMs: d.integer().notNull().default(2000),
  memoryLimitMb: d.integer().notNull().default(256),
  status: problemStatusEnum().notNull().default("Draft"),
  tags: d.jsonb().$type<string[]>().notNull().default([]),
  authorUserId: d.integer().references(() => users.id, { onDelete: "set null" }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));

/** Per-language scaffolding a solver starts from: initial code, entry-point function name, and
 * any additional starter files. */
export const problemSetups = createTable(
  "problem_setup",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    problemId: d
      .integer()
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    languageVersionId: d
      .integer()
      .notNull()
      .references(() => languageVersions.id, { onDelete: "cascade" }),
    functionName: d.varchar({ length: 128 }),
    initialCode: d.text().notNull().default(""),
    additionalFiles: d
      .jsonb()
      .$type<{ path: string; content: string }[]>()
      .notNull()
      .default([]),
  }),
  (t) => [unique().on(t.problemId, t.languageVersionId)],
);

/** Shown in the problem statement. Values are polymorphic/tagged (e.g. `valueType: "int"`), so
 * they're stored as JSONB rather than fixed columns — the hidden grading test suite is a
 * separate, Phase 2 concern. */
export const problemPublicTestCases = createTable(
  "problem_public_test_case",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    problemId: d
      .integer()
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    name: d.varchar({ length: 128 }).notNull(),
    description: d.text(),
    inputs: d
      .jsonb()
      .$type<{ value: string; valueType: string }[]>()
      .notNull()
      .default([]),
    expectedOutputs: d
      .jsonb()
      .$type<{ value: string; valueType: string }[]>()
      .notNull()
      .default([]),
    sortOrder: d.integer().notNull().default(0),
  }),
  (t) => [unique().on(t.problemId, t.name)],
);

export const reactionTypes = createTable("reaction_type", (d) => ({
  key: d.varchar({ length: 32 }).primaryKey(),
  name: d.varchar({ length: 64 }).notNull(),
  emoji: d.varchar({ length: 8 }),
}));

export const problemReactions = createTable(
  "problem_reaction",
  (d) => ({
    problemId: d
      .integer()
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    userId: d
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reactionTypeKey: d
      .varchar({ length: 32 })
      .notNull()
      .references(() => reactionTypes.key, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.problemId, t.userId] })],
);

export const problemsRelations = relations(problems, ({ one, many }) => ({
  author: one(users, {
    fields: [problems.authorUserId],
    references: [users.id],
  }),
  setups: many(problemSetups),
  publicTestCases: many(problemPublicTestCases),
  reactions: many(problemReactions),
}));

export const problemSetupsRelations = relations(problemSetups, ({ one }) => ({
  problem: one(problems, {
    fields: [problemSetups.problemId],
    references: [problems.id],
  }),
  languageVersion: one(languageVersions, {
    fields: [problemSetups.languageVersionId],
    references: [languageVersions.id],
  }),
}));

export const problemPublicTestCasesRelations = relations(
  problemPublicTestCases,
  ({ one }) => ({
    problem: one(problems, {
      fields: [problemPublicTestCases.problemId],
      references: [problems.id],
    }),
  }),
);

export const problemReactionsRelations = relations(
  problemReactions,
  ({ one }) => ({
    problem: one(problems, {
      fields: [problemReactions.problemId],
      references: [problems.id],
    }),
    user: one(users, {
      fields: [problemReactions.userId],
      references: [users.id],
    }),
    reactionType: one(reactionTypes, {
      fields: [problemReactions.reactionTypeKey],
      references: [reactionTypes.key],
    }),
  }),
);
