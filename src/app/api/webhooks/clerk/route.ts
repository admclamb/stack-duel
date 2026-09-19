import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export async function POST(req: NextRequest) {
  const evt = await verifyWebhook(req);

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, username, image_url } = evt.data;

    await db
      .insert(users)
      .values({
        clerkId: id,
        username: username ?? `user_${id.slice(-8)}`,
        imageUrl: image_url,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          username: username ?? `user_${id.slice(-8)}`,
          imageUrl: image_url,
        },
      });
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    await db.delete(users).where(eq(users.clerkId, evt.data.id));
  }

  return NextResponse.json({ received: true });
}
