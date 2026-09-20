import "server-only";

import { db } from "~/server/db";
import { auditLog } from "~/server/db/schema";
import type { CurrentAppUser } from "~/server/auth/current-user";

type WriteAuditLogInput = {
  actor: CurrentAppUser;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: unknown;
};

/**
 * Explicit call at the end of an admin mutation, not a tRPC middleware — a middleware would still
 * need per-procedure metadata to know *what* to log, so it wouldn't actually remove complexity,
 * and explicit calls make "was this mutation audited" reviewable at the call site.
 */
export async function writeAuditLog({
  actor,
  action,
  targetType,
  targetId,
  details,
}: WriteAuditLogInput) {
  await db.insert(auditLog).values({
    actorUserId: actor.id,
    actorUsername: actor.username,
    action,
    targetType,
    targetId,
    detailsJson: details,
  });
}
