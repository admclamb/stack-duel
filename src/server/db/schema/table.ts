import { pgTableCreator } from "drizzle-orm/pg-core";

/**
 * Shared table-name prefixer so every domain's schema file lives in the same Postgres namespace
 * without repeating the multi-project prefix everywhere.
 */
export const createTable = pgTableCreator((name) => `stack-duel_${name}`);
