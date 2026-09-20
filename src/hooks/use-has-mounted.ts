import { useSyncExternalStore } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-function -- useSyncExternalStore requires an unsubscribe function; there's nothing to clean up here.
const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and on the client's first hydration pass,
 * then `true` for every render after that. This is the primitive React
 * intends for values that legitimately differ between the server snapshot
 * and the client snapshot, so it avoids hydration mismatches without
 * triggering a "setState in an effect" cascading render.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}
