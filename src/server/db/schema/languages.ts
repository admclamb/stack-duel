import { relations } from "drizzle-orm";
import { unique } from "drizzle-orm/pg-core";
import { createTable } from "./table";

/**
 * Mirrored from Judge0's supported-language list rather than queried live, so problem setups and
 * submissions can FK against a stable id and the offered language list can be curated (periodic
 * sync job lands alongside the judging pipeline in Phase 2).
 */
export const languages = createTable("language", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 64 }).notNull().unique(),
}));

export const languageVersions = createTable(
  "language_version",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    languageId: d
      .integer()
      .notNull()
      .references(() => languages.id, { onDelete: "cascade" }),
    version: d.varchar({ length: 32 }).notNull(),
    judge0LanguageId: d.integer(),
  }),
  (t) => [unique().on(t.languageId, t.version)],
);

export const languagesRelations = relations(languages, ({ many }) => ({
  versions: many(languageVersions),
}));

export const languageVersionsRelations = relations(
  languageVersions,
  ({ one }) => ({
    language: one(languages, {
      fields: [languageVersions.languageId],
      references: [languages.id],
    }),
  }),
);
