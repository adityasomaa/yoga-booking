/**
 * Local (browser) implementation of the BookingStore contract.
 *
 * WHAT IS REAL HERE: the booking rules, the quota maths, the recurrence
 * expansion, the admin overrides -- all of that runs for real.
 *
 * WHAT IS NOT REAL: persistence. Data lives in this visitor's own browser via
 * localStorage. It is not shared between devices and not visible to the studio
 * owner on their phone. Swap in remote.ts once a database exists.
 */

import type { DateException } from "@/data/studio";
import {
  EMPTY_SNAPSHOT,
  type AdminState,
  type BookingRecord,
  type BookingStore,
  type NewBookingInput,
  type StoreSnapshot,
} from "./types";

const KEY = "yoga-booking:v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function makeId(): string {
  if (isBrowser() && typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function sanitise(raw: unknown): StoreSnapshot {
  if (!raw || typeof raw !== "object") return EMPTY_SNAPSHOT;
  const obj = raw as Partial<StoreSnapshot>;
  const bookings = Array.isArray(obj.bookings) ? (obj.bookings as BookingRecord[]) : [];
  const admin = (obj.admin ?? {}) as Partial<AdminState>;
  return {
    bookings: bookings.filter((b) => b && typeof b.sessionId === "string"),
    admin: {
      capacityOverrides:
        admin.capacityOverrides && typeof admin.capacityOverrides === "object"
          ? admin.capacityOverrides
          : {},
      exceptions: Array.isArray(admin.exceptions) ? admin.exceptions : [],
    },
  };
}

class LocalBookingStore implements BookingStore {
  /**
   * Held as one immutable object. Every mutation replaces it, so
   * useSyncExternalStore can compare by reference and re-render exactly the
   * components that read it -- no page refresh anywhere.
   */
  private snapshot: StoreSnapshot = EMPTY_SNAPSHOT;
  private listeners = new Set<() => void>();
  private hydrated = false;

  private hydrate() {
    if (this.hydrated || !isBrowser()) return;
    this.hydrated = true;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) this.snapshot = sanitise(JSON.parse(raw));
    } catch {
      // Corrupt or unavailable storage (private mode, quota, disabled cookies).
      // Falling back to the empty snapshot keeps the site usable.
      this.snapshot = EMPTY_SNAPSHOT;
    }
    // Keep multiple tabs of the same browser in step.
    window.addEventListener("storage", (e) => {
      if (e.key !== KEY) return;
      try {
        this.snapshot = e.newValue ? sanitise(JSON.parse(e.newValue)) : EMPTY_SNAPSHOT;
      } catch {
        this.snapshot = EMPTY_SNAPSHOT;
      }
      this.emit();
    });
  }

  private persist() {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(this.snapshot));
    } catch {
      // Storage full or blocked. In-memory state stays correct for this session.
    }
  }

  private emit() {
    for (const l of this.listeners) l();
  }

  private commit(next: StoreSnapshot) {
    this.snapshot = next;
    this.persist();
    this.emit();
  }

  getSnapshot(): StoreSnapshot {
    this.hydrate();
    return this.snapshot;
  }

  /** The server has no visitor storage, so it always renders the empty state. */
  getServerSnapshot(): StoreSnapshot {
    return EMPTY_SNAPSHOT;
  }

  subscribe(listener: () => void): () => void {
    this.hydrate();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  addBooking(input: NewBookingInput): BookingRecord {
    const record: BookingRecord = {
      ...input,
      id: makeId(),
      createdAt: Date.now(),
      status: "menunggu-konfirmasi",
    };
    this.commit({
      ...this.snapshot,
      bookings: [...this.snapshot.bookings, record],
    });
    return record;
  }

  cancelBooking(id: string) {
    this.commit({
      ...this.snapshot,
      bookings: this.snapshot.bookings.map((b) =>
        b.id === id ? { ...b, status: "dibatalkan" as const } : b
      ),
    });
  }

  setCapacityOverride(sessionId: string, capacity: number) {
    this.commit({
      ...this.snapshot,
      admin: {
        ...this.snapshot.admin,
        capacityOverrides: {
          ...this.snapshot.admin.capacityOverrides,
          [sessionId]: Math.max(0, Math.round(capacity)),
        },
      },
    });
  }

  clearCapacityOverride(sessionId: string) {
    const next = { ...this.snapshot.admin.capacityOverrides };
    delete next[sessionId];
    this.commit({
      ...this.snapshot,
      admin: { ...this.snapshot.admin, capacityOverrides: next },
    });
  }

  addException(exception: DateException) {
    const exists = this.snapshot.admin.exceptions.some(
      (e) => e.date === exception.date && e.patternId === exception.patternId
    );
    if (exists) return;
    this.commit({
      ...this.snapshot,
      admin: {
        ...this.snapshot.admin,
        exceptions: [...this.snapshot.admin.exceptions, exception],
      },
    });
  }

  removeException(date: string, patternId: string) {
    this.commit({
      ...this.snapshot,
      admin: {
        ...this.snapshot.admin,
        exceptions: this.snapshot.admin.exceptions.filter(
          (e) => !(e.date === date && e.patternId === patternId)
        ),
      },
    });
  }

  reset() {
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    }
    this.snapshot = EMPTY_SNAPSHOT;
    this.emit();
  }
}

export const localBookingStore = new LocalBookingStore();
