"use client";

import PusherClient from "pusher-js";

import { env } from "~/env";

let client: PusherClient | undefined;

/**
 * Lazily-created singleton client-side Pusher instance. Private channels (e.g. `private-user-*`)
 * authorize via `/api/pusher/auth`; public channels (e.g. `game-*`) need no auth round trip.
 */
export function getPusherClient() {
  if (!client) {
    const { NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER } = env;
    if (!NEXT_PUBLIC_PUSHER_KEY || !NEXT_PUBLIC_PUSHER_CLUSTER) {
      throw new Error(
        "Pusher is not configured — set NEXT_PUBLIC_PUSHER_KEY/NEXT_PUBLIC_PUSHER_CLUSTER",
      );
    }

    client = new PusherClient(NEXT_PUBLIC_PUSHER_KEY, {
      cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
    });
  }

  return client;
}
