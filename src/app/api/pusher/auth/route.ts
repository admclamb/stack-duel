import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { authorizeChannel } from "~/server/pusher";

/**
 * Pusher's private-channel auth endpoint. Only authorizes a `private-user-{clerkId}` channel for
 * the matching signed-in user — public channels (e.g. `game-{gameId}`) don't hit this endpoint at
 * all, since their contents are already visible to anyone who can join.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.formData();
  const socketId = body.get("socket_id");
  const channelName = body.get("channel_name");

  if (typeof socketId !== "string" || typeof channelName !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (channelName !== `private-user-${userId}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const authResponse = authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
