import { createTable } from "./table";
import { users } from "./users";

export const auditLog = createTable("audit_log", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  actorUserId: d.integer().references(() => users.id, { onDelete: "set null" }),
  actorUsername: d.varchar({ length: 64 }).notNull(),
  action: d.varchar({ length: 128 }).notNull(),
  targetType: d.varchar({ length: 64 }),
  targetId: d.varchar({ length: 128 }),
  detailsJson: d.jsonb(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
}));
