import "server-only";

import PusherServer from "pusher";

import { env } from "~/env";

let pusherServer: PusherServer | undefined;

/**
 * Lazily-created singleton — Pusher env vars are optional until a domain actually needs realtime
 * (Phase 2's submission-completed event, Phase 3's game channels), so importing this module (or
 * building the app) doesn't require a Pusher account to exist yet.
 */
function getPusherServer() {
  if (!pusherServer) {
    const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = env;
    if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
      throw new Error(
        "Pusher is not configured — set PUSHER_APP_ID/PUSHER_KEY/PUSHER_SECRET/PUSHER_CLUSTER",
      );
    }

    pusherServer = new PusherServer({
      appId: PUSHER_APP_ID,
      key: PUSHER_KEY,
      secret: PUSHER_SECRET,
      cluster: PUSHER_CLUSTER,
      useTLS: true,
    });
  }

  return pusherServer;
}

/**
 * Single call site for triggering a Pusher event, so domain code never touches the SDK directly.
 */
export function trigger(channel: string, event: string, payload: unknown) {
  return getPusherServer().trigger(channel, event, payload);
}

export function authorizeChannel(
  socketId: string,
  channel: string,
  data?: { user_id: string },
) {
  return getPusherServer().authorizeChannel(socketId, channel, data);
}
