/**
 * =============================================================================
 *  REMOTE STORE  --  EMPTY SKELETON, NOT WIRED UP
 * =============================================================================
 *
 *  This file exists so that attaching a real database is a contained job. It
 *  implements the same BookingStore interface as local.ts and nothing else.
 *
 *  TO GO LIVE WITH A DATABASE
 *  --------------------------
 *  1. Create two tables:
 *
 *       bookings(
 *         id            text primary key,
 *         session_id    text not null,      -- "<pattern_id>__<YYYY-MM-DD>"
 *         pattern_id    text not null,
 *         date_iso      date not null,
 *         start_time    text not null,
 *         class_slug    text not null,
 *         name          text not null,
 *         whatsapp      text not null,
 *         seats         int  not null,
 *         experience    text not null,
 *         notes         text,
 *         created_at    timestamptz not null default now(),
 *         status        text not null
 *       )
 *
 *       schedule_overrides(
 *         session_id    text primary key,
 *         capacity      int,
 *         cancelled     boolean not null default false,
 *         reason        text
 *       )
 *
 *  2. Add a UNIQUE constraint or a transactional check so two people cannot
 *     take the last seat at the same time. The quota rule in schedule.ts is
 *     already the single source of truth for the maths -- the database only
 *     needs to make the write atomic. Suggested:
 *
 *       insert into bookings (...)
 *       select ... where (
 *         select coalesce(sum(seats),0) from bookings
 *         where session_id = $1 and status <> 'dibatalkan'
 *       ) + $seats <= $capacity;
 *
 *  3. Fill in the methods below, then change the one export in index.ts from
 *     `localBookingStore` to `remoteBookingStore`.
 *
 *  Nothing in the components, forms or schedule views needs to be touched.
 * =============================================================================
 */

import type { DateException } from "@/data/studio";
import {
  EMPTY_SNAPSHOT,
  type BookingRecord,
  type BookingStore,
  type NewBookingInput,
  type StoreSnapshot,
} from "./types";

const NOT_WIRED = "remoteBookingStore is a skeleton: no database is connected yet.";

class RemoteBookingStore implements BookingStore {
  getSnapshot(): StoreSnapshot {
    return EMPTY_SNAPSHOT;
  }

  getServerSnapshot(): StoreSnapshot {
    return EMPTY_SNAPSHOT;
  }

  subscribe(_listener: () => void): () => void {
    // A real implementation would open a realtime channel here and call
    // _listener() on every insert/update, then close it in the returned
    // unsubscribe function.
    void _listener;
    return () => {};
  }

  addBooking(_input: NewBookingInput): BookingRecord {
    void _input;
    throw new Error(NOT_WIRED);
  }

  cancelBooking(_id: string): void {
    void _id;
    throw new Error(NOT_WIRED);
  }

  setCapacityOverride(_sessionId: string, _capacity: number): void {
    void _sessionId;
    void _capacity;
    throw new Error(NOT_WIRED);
  }

  clearCapacityOverride(_sessionId: string): void {
    void _sessionId;
    throw new Error(NOT_WIRED);
  }

  addException(_exception: DateException): void {
    void _exception;
    throw new Error(NOT_WIRED);
  }

  removeException(_date: string, _patternId: string): void {
    void _date;
    void _patternId;
    throw new Error(NOT_WIRED);
  }

  reset(): void {
    throw new Error(NOT_WIRED);
  }
}

export const remoteBookingStore = new RemoteBookingStore();
