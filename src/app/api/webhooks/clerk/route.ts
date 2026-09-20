import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { upsertUserFromClerk } from "~/server/auth/upsert-user";

export async function POST(req: NextRequest) {
  const evt = await verifyWebhook(req);

  if (evt.type === "user.created" || evt.type === "user.updated") {
    await upsertUserFromClerk({
      id: evt.data.id,
      username: evt.data.username,
      imageUrl: evt.data.image_url,
    });
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    await db.delete(users).where(eq(users.clerkId, evt.data.id));
  }

  return NextResponse.json({ received: true });
}
