"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { bookingStore, bookedSeatsFor, effectiveCapacity } from "./index";
import type { StoreSnapshot } from "./types";
import type { Session } from "@/lib/schedule";
import { getSessionStatus, type SessionStatus } from "@/lib/schedule";
import type { DateException } from "@/data/studio";

/** Live snapshot. Re-renders on every mutation, no page refresh required. */
export function useStoreSnapshot(): StoreSnapshot {
  return useSyncExternalStore(
    (l) => bookingStore.subscribe(l),
    () => bookingStore.getSnapshot(),
    () => bookingStore.getServerSnapshot()
  );
}

/**
 * True once the client has taken over from the server-rendered markup.
 * Seat counts and time-based status live only in the browser, so anything
 * that depends on them renders a neutral placeholder until this flips --
 * which keeps hydration deterministic instead of mismatching.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * A real-clock ticker.
 *
 * Deliberately reads Date.now() on every tick rather than accumulating
 * elapsed frames, and re-reads immediately when the tab becomes visible or
 * regains focus. Leaving a tab in the background for hours and coming back
 * therefore yields a correct "sudah lewat" result on the very first paint.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const sync = () => setNow(Date.now());
    sync();
    const timer = window.setInterval(sync, intervalMs);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
    };
  }, [intervalMs]);

  return now;
}

/** Date exceptions from the data file plus anything added in the admin screen. */
export function useExtraExceptions(): DateException[] {
  const snapshot = useStoreSnapshot();
  return snapshot.admin.exceptions;
}

export type ResolvedSession = Session & {
  bookedSeats: number;
  status: SessionStatus;
};

/**
 * Applies live occupancy + admin capacity overrides + the real clock to a list
 * of derived sessions.
 */
export function useResolvedSessions(
  sessions: Session[],
  nowMs: number
): ResolvedSession[] {
  const snapshot = useStoreSnapshot();
  return useMemo(
    () =>
      sessions.map((s) => {
        const capacity = effectiveCapacity(snapshot, s.id, s.capacity);
        const withCapacity: Session = { ...s, capacity };
        const bookedSeats = bookedSeatsFor(snapshot, s.id);
        return {
          ...withCapacity,
          bookedSeats,
          status: getSessionStatus(withCapacity, bookedSeats, nowMs),
        };
      }),
    [sessions, snapshot, nowMs]
  );
}

/** Imperative store actions, stable across renders. */
export function useStoreActions() {
  return useMemo(
    () => ({
      addBooking: bookingStore.addBooking.bind(bookingStore),
      cancelBooking: bookingStore.cancelBooking.bind(bookingStore),
      setCapacityOverride: bookingStore.setCapacityOverride.bind(bookingStore),
      clearCapacityOverride: bookingStore.clearCapacityOverride.bind(bookingStore),
      addException: bookingStore.addException.bind(bookingStore),
      removeException: bookingStore.removeException.bind(bookingStore),
      reset: bookingStore.reset.bind(bookingStore),
    }),
    []
  );
}

/** Locks body scroll while a modal or calendar is open, and restores it after. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    // Compensate for the scrollbar disappearing so the layout does not jump.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    body.setAttribute("data-scroll-locked", "true");
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      body.removeAttribute("data-scroll-locked");
    };
  }, [locked]);
}

/** Calls back on Escape while `active`. */
export function useEscape(active: boolean, onEscape: () => void) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    },
    [onEscape]
  );
  useEffect(() => {
    if (!active) return;
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active, handler]);
}
