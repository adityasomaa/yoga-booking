/**
 * =============================================================================
 *  DATA ADAPTER CONTRACT
 * =============================================================================
 *
 *  Every read and write of booking state goes through this interface. Nothing
 *  in the UI touches localStorage directly.
 *
 *  There are two implementations:
 *
 *    local.ts   -- ACTIVE. Persists to the visitor's own browser so the whole
 *                  booking flow can be demonstrated end to end.
 *    remote.ts  -- SKELETON. Same interface, no implementation. Wiring a real
 *                  database means filling that file in and flipping one export
 *                  in index.ts. No component needs to change.
 * =============================================================================
 */

import type { DateException } from "@/data/studio";

export type ExperienceLevel = "baru" | "pernah" | "rutin";

export type BookingRecord = {
  id: string;
  /** "<patternId>__<YYYY-MM-DD>" */
  sessionId: string;
  patternId: string;
  dateISO: string;
  startTime: string;
  classSlug: string;
  className: string;
  name: string;
  whatsapp: string;
  seats: number;
  experience: ExperienceLevel;
  notes: string;
  /** Epoch ms. */
  createdAt: number;
  status: "menunggu-konfirmasi" | "dibatalkan";
};

/** Owner-side changes that are layered on top of the static data file. */
export type AdminState = {
  /** sessionId -> replacement capacity. */
  capacityOverrides: Record<string, number>;
  /** Extra date exceptions added from the admin screen. */
  exceptions: DateException[];
};

export type StoreSnapshot = {
  bookings: BookingRecord[];
  admin: AdminState;
};

export const EMPTY_SNAPSHOT: StoreSnapshot = {
  bookings: [],
  admin: { capacityOverrides: {}, exceptions: [] },
};

export type NewBookingInput = Omit<BookingRecord, "id" | "createdAt" | "status">;

export interface BookingStore {
  /** Current state. Must be a stable reference between mutations. */
  getSnapshot(): StoreSnapshot;
  /** Snapshot used during server rendering. Must be referentially stable. */
  getServerSnapshot(): StoreSnapshot;
  /** Register for change notifications. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;

  addBooking(input: NewBookingInput): BookingRecord;
  cancelBooking(id: string): void;

  setCapacityOverride(sessionId: string, capacity: number): void;
  clearCapacityOverride(sessionId: string): void;

  addException(exception: DateException): void;
  removeException(date: string, patternId: string): void;

  /** Restores everything to the state a first-time visitor sees. */
  reset(): void;
}
