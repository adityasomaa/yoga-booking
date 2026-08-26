"use client";

/**
 * A tiny counter of currently-open overlays (modals and the date calendar).
 *
 * Two things subscribe to it:
 *   - the Lenis provider, which must stop smooth scrolling while an overlay
 *     is open so the page behind does not drift under the dialog;
 *   - the cookie banner, which must not sit on top of the mobile menu or
 *     swallow taps on floating buttons at small widths.
 */

import { useSyncExternalStore } from "react";

let count = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function pushOverlay(): () => void {
  count += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    count = Math.max(0, count - 1);
    emit();
  };
}

export function getOverlayCount() {
  return count;
}

export function subscribeOverlay(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOverlayOpen(): boolean {
  return useSyncExternalStore(
    subscribeOverlay,
    () => count > 0,
    () => false
  );
}
