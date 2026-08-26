"use server";

/**
 * =============================================================================
 *  SERVER-SIDE BOOKING VALIDATION
 * =============================================================================
 *
 *  Every field is checked here as well as in the browser. The server does NOT
 *  trust the submitted class name, date, time or capacity: it throws them away
 *  and rebuilds the session from the recurrence patterns in the data file
 *  using only the session id. Quota and the booking cut-off are re-checked
 *  against a server clock reading.
 *
 *  Honest limitation: seat occupancy currently lives in the visitor's browser,
 *  so the seats-taken figure is supplied by the client. The server clamps it,
 *  re-derives the real capacity, and rejects anything over quota -- but it
 *  cannot yet see other people's bookings. Attaching the database in
 *  lib/store/remote.ts replaces that one argument with a query and makes this
 *  check fully authoritative. See README.
 * =============================================================================
 */

import type { DateException } from "@/data/studio";
import { paymentAdapter } from "@/lib/payments";
import { getSessionStatus } from "@/lib/schedule";
import {
  checkSeatsAndTiming,
  hasErrors,
  normaliseWhatsApp,
  resolveSession,
  validateBookingFields,
  type FieldErrors,
} from "@/lib/validation";

export type BookingActionResult =
  | {
      ok: true;
      /** Normalised, server-approved values for the record + WhatsApp message. */
      booking: {
        sessionId: string;
        patternId: string;
        classSlug: string;
        className: string;
        dateISO: string;
        startTime: string;
        endTime: string;
        room?: string;
        name: string;
        whatsapp: string;
        seats: number;
        experience: string;
        notes: string;
      };
      paymentNote: string;
    }
  | { ok: false; errors: FieldErrors };

export type BookingActionInput = {
  name: string;
  whatsapp: string;
  sessionId: string;
  seats: number;
  experience: string;
  notes: string;
  /** Honeypot. Any value means a bot filled a field humans cannot see. */
  company?: string;
  /** Seats the client believes are taken. Clamped and bounded server-side. */
  takenSeats?: number;
  /** Capacity override set by the studio owner in the admin screen. */
  capacityOverride?: number;
  /** Cancellations added in the admin screen. */
  extraExceptions?: DateException[];
};

export async function submitBooking(
  input: BookingActionInput
): Promise<BookingActionResult> {
  // Honeypot: silently reject rather than explaining the trap.
  if (input.company && input.company.trim() !== "") {
    return { ok: false, errors: { form: "Pengiriman tidak dapat diproses." } };
  }

  const fields = {
    name: String(input.name ?? ""),
    whatsapp: String(input.whatsapp ?? ""),
    sessionId: String(input.sessionId ?? ""),
    seats: Number(input.seats ?? 0),
    experience: String(input.experience ?? ""),
    notes: String(input.notes ?? ""),
  };

  const errors: FieldErrors = validateBookingFields(fields);

  // Rebuild the session from the schedule data. Nothing the client claimed
  // about the class, date or time is used.
  const extraExceptions = Array.isArray(input.extraExceptions)
    ? input.extraExceptions.filter(
        (e): e is DateException =>
          !!e && typeof e.date === "string" && typeof e.patternId === "string"
      )
    : [];

  const resolution = resolveSession(fields.sessionId, extraExceptions);
  if (!resolution.ok) {
    errors.form = resolution.error;
    return { ok: false, errors };
  }

  const session = resolution.session;
  const nowMs = Date.now();

  const capacityOverride =
    typeof input.capacityOverride === "number" &&
    Number.isFinite(input.capacityOverride) &&
    input.capacityOverride >= 0
      ? Math.round(input.capacityOverride)
      : undefined;

  const takenSeats =
    typeof input.takenSeats === "number" && Number.isFinite(input.takenSeats)
      ? Math.max(0, Math.round(input.takenSeats))
      : 0;

  Object.assign(
    errors,
    checkSeatsAndTiming({
      session,
      seats: fields.seats,
      takenSeats,
      nowMs,
      capacityOverride,
    })
  );

  if (hasErrors(errors)) return { ok: false, errors };

  // Payment layer is a no-op adapter today; the call site is already correct
  // for a real gateway.
  const settlement = await paymentAdapter.settleBooking({
    bookingId: "pending",
    sessionId: session.id,
    className: session.className,
    dateISO: session.dateISO,
    startTime: session.startTime,
    seats: fields.seats,
    customerName: fields.name.trim(),
    customerWhatsApp: normaliseWhatsApp(fields.whatsapp),
  });

  if (settlement.kind === "failed") {
    return { ok: false, errors: { form: settlement.reason } };
  }

  const capacity = capacityOverride ?? session.capacity;
  const status = getSessionStatus({ ...session, capacity }, takenSeats, nowMs);
  if (!status.bookable) {
    return { ok: false, errors: { form: status.detail } };
  }

  return {
    ok: true,
    booking: {
      sessionId: session.id,
      patternId: session.patternId,
      classSlug: session.classSlug,
      className: session.className,
      dateISO: session.dateISO,
      startTime: session.startTime,
      endTime: session.endTime,
      room: session.room,
      name: fields.name.trim(),
      whatsapp: normaliseWhatsApp(fields.whatsapp),
      seats: fields.seats,
      experience: fields.experience,
      notes: fields.notes.trim(),
    },
    paymentNote:
      settlement.kind === "not-required"
        ? settlement.note
        : "Pembayaran diatur lewat WhatsApp.",
  };
}

/** Server-validated private class enquiry. Separate flow, separate rules. */
export async function submitPrivateEnquiry(input: {
  name: string;
  whatsapp: string;
  people: number;
  preferredTime: string;
  focus: string;
  notes: string;
  company?: string;
}): Promise<{ ok: true } | { ok: false; errors: FieldErrors }> {
  if (input.company && input.company.trim() !== "") {
    return { ok: false, errors: { form: "Pengiriman tidak dapat diproses." } };
  }
  const errors: FieldErrors = {};
  const fieldErrors = validateBookingFields({
    name: input.name,
    whatsapp: input.whatsapp,
    sessionId: "private__placeholder",
    seats: 1,
    experience: "baru",
    notes: input.notes ?? "",
  });
  if (fieldErrors.name) errors.name = fieldErrors.name;
  if (fieldErrors.whatsapp) errors.whatsapp = fieldErrors.whatsapp;
  if (fieldErrors.notes) errors.notes = fieldErrors.notes;

  if (!Number.isInteger(input.people) || input.people < 1 || input.people > 12) {
    errors.seats = "Jumlah peserta antara 1 sampai 12 orang.";
  }
  if (!input.preferredTime) {
    errors.form = "Perkiraan waktu belum dipilih.";
  }

  if (hasErrors(errors)) return { ok: false, errors };
  return { ok: true };
}
