/**
 * Adapter selection point.
 *
 * Swapping the whole app onto a real database is this one line:
 *     export const bookingStore: BookingStore = remoteBookingStore;
 * See remote.ts for the schema and the steps.
 */

import type { BookingStore, StoreSnapshot } from "./types";
import { localBookingStore } from "./local";

export const bookingStore: BookingStore = localBookingStore;

export * from "./types";

/* -------------------------------------------------------------------------
 * Derived selectors -- pure functions over a snapshot.
 * Kept here so both React components and the server action use identical maths.
 * ---------------------------------------------------------------------- */

/** Seats already taken for a session, ignoring cancelled bookings. */
export function bookedSeatsFor(snapshot: StoreSnapshot, sessionId: string): number {
  let total = 0;
  for (const b of snapshot.bookings) {
    if (b.sessionId === sessionId && b.status !== "dibatalkan") total += b.seats;
  }
  return total;
}

/** Capacity after any admin override for that specific session. */
export function effectiveCapacity(
  snapshot: StoreSnapshot,
  sessionId: string,
  patternCapacity: number
): number {
  const override = snapshot.admin.capacityOverrides[sessionId];
  return typeof override === "number" ? override : patternCapacity;
}

/** All bookings for one session, newest last. */
export function bookingsForSession(
  snapshot: StoreSnapshot,
  sessionId: string
) {
  return snapshot.bookings
    .filter((b) => b.sessionId === sessionId)
    .sort((a, b) => a.createdAt - b.createdAt);
}
