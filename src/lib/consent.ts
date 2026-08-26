"use client";

/**
 * =============================================================================
 *  COOKIE / STORAGE CONSENT
 * =============================================================================
 *
 *  This is not a decorative banner. The choice made here changes real
 *  behaviour on the site:
 *
 *    necessary   -- always on. The booking demo store itself. Without this the
 *                   site cannot show your bookings back to you at all.
 *
 *    preferensi  -- OFF until accepted. When accepted, the booking form
 *                   remembers your name and WhatsApp number so you do not
 *                   retype them next time. When declined or later withdrawn,
 *                   anything already remembered is DELETED immediately.
 *
 *  There is no analytics or advertising script on this site, so no such
 *  category is offered. Claiming one would be dishonest.
 * =============================================================================
 */

import { useSyncExternalStore } from "react";

const KEY = "yoga-booking:consent:v1";
const PREFS_KEY = "yoga-booking:prefs:v1";

export type ConsentState = {
  decided: boolean;
  preferences: boolean;
};

export const DEFAULT_CONSENT: ConsentState = { decided: false, preferences: false };

let state: ConsentState = DEFAULT_CONSENT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ConsentState>;
      state = {
        decided: Boolean(parsed.decided),
        preferences: Boolean(parsed.preferences),
      };
    }
  } catch {
    state = DEFAULT_CONSENT;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable; the in-memory choice still applies this session */
  }
}

export function setConsent(preferences: boolean) {
  state = { decided: true, preferences };
  persist();
  // Withdrawing consent must actually delete what was remembered.
  if (!preferences) clearRememberedDetails();
  emit();
}

export function resetConsent() {
  state = DEFAULT_CONSENT;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  clearRememberedDetails();
  emit();
}

export function getConsent(): ConsentState {
  hydrate();
  return state;
}

export function subscribeConsent(l: () => void) {
  hydrate();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(
    subscribeConsent,
    getConsent,
    () => DEFAULT_CONSENT
  );
}

/* -------------------------------------------------------------------------
 * The feature the "preferensi" category actually controls.
 * ---------------------------------------------------------------------- */

export type RememberedDetails = { name: string; whatsapp: string };

export function rememberDetails(details: RememberedDetails) {
  if (!getConsent().preferences) return; // gated, genuinely
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(details));
  } catch {
    /* ignore */
  }
}

export function readRememberedDetails(): RememberedDetails | null {
  if (!getConsent().preferences) return null;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RememberedDetails>;
    if (typeof parsed.name !== "string" || typeof parsed.whatsapp !== "string") {
      return null;
    }
    return { name: parsed.name, whatsapp: parsed.whatsapp };
  } catch {
    return null;
  }
}

export function clearRememberedDetails() {
  try {
    window.localStorage.removeItem(PREFS_KEY);
  } catch {
    /* ignore */
  }
}
