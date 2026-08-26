/**
 * =============================================================================
 *  BOOKING VALIDATION
 * =============================================================================
 *
 *  ONE set of rules, imported by BOTH the browser form and the server action.
 *  The client copy exists to give fast inline feedback. The server copy is the
 *  one that decides, and it re-derives the session from the recurrence
 *  patterns rather than trusting anything the browser sent about dates, times
 *  or capacity.
 * =============================================================================
 */

import {
  MAX_SEATS_PER_BOOKING,
  BOOKING_LEAD_TIME_HOURS,
} from "@/lib/config";
import {
  bookingClosesAtMs,
  findException,
  getClassType,
  getPattern,
  materialise,
  parseSessionId,
  type Session,
} from "@/lib/schedule";
import type { DateException } from "@/data/studio";
import type { ExperienceLevel } from "@/lib/store/types";

export type BookingFields = {
  name: string;
  whatsapp: string;
  sessionId: string;
  seats: number;
  experience: string;
  notes: string;
  /** Anti-spam honeypot. Must stay empty. */
  company?: string;
};

export type FieldErrors = Partial<Record<keyof BookingFields | "form", string>>;

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "baru", label: "Baru pertama kali" },
  { value: "pernah", label: "Pernah beberapa kali" },
  { value: "rutin", label: "Rutin ikut kelas" },
];

const EXPERIENCE_VALUES = EXPERIENCE_OPTIONS.map((o) => o.value);

/* -------------------------------------------------------------------------
 * Field-level rules
 * ---------------------------------------------------------------------- */

/** Keeps digits only, drops +, spaces, dashes and brackets. */
export function normaliseWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Indonesian numbers are commonly written 08xx; store them as 628xx.
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function validateName(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Nama belum diisi.";
  if (t.length < 2) return "Nama terlalu pendek.";
  if (t.length > 80) return "Nama terlalu panjang, maksimal 80 karakter.";
  return undefined;
}

export function validateWhatsApp(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Nomor WhatsApp belum diisi.";
  if (!/^[\d+\-\s()]+$/.test(t)) return "Nomor hanya boleh berisi angka.";
  const digits = normaliseWhatsApp(t);
  if (digits.length < 10 || digits.length > 15) {
    return "Nomor WhatsApp tidak valid. Contoh: 0812xxxxxxx.";
  }
  return undefined;
}

export function validateExperience(v: string): string | undefined {
  if (!v) return "Tingkat pengalaman belum dipilih.";
  if (!EXPERIENCE_VALUES.includes(v as ExperienceLevel)) {
    return "Tingkat pengalaman tidak dikenali.";
  }
  return undefined;
}

export function validateNotes(v: string): string | undefined {
  if (v.length > 500) return "Catatan terlalu panjang, maksimal 500 karakter.";
  return undefined;
}

/* -------------------------------------------------------------------------
 * Session + quota + lead-time rules
 *
 * `takenSeats` is how many seats the caller believes are already used. On the
 * server this is supplied by the client because seat state currently lives in
 * the browser -- see README, "Apa yang nyata dan apa yang masih lokal". The
 * server still bounds it: it clamps the value, re-derives capacity from the
 * data file, and rejects anything exceeding the real quota. When a database is
 * attached, this argument is replaced by a query and nothing else changes.
 * ---------------------------------------------------------------------- */

export type SessionResolution =
  | { ok: true; session: Session }
  | { ok: false; error: string };

/**
 * Rebuilds a Session from its id using only the recurrence patterns and the
 * exception list. A forged or stale session id cannot survive this.
 */
export function resolveSession(
  sessionId: string,
  extraExceptions: DateException[] = []
): SessionResolution {
  const parsed = parseSessionId(sessionId);
  if (!parsed) return { ok: false, error: "Sesi tidak dikenali." };

  const pattern = getPattern(parsed.patternId);
  if (!pattern) return { ok: false, error: "Sesi tidak ditemukan di jadwal." };

  // The date must actually fall on the pattern's weekday.
  const weekday = new Date(`${parsed.dateISO}T00:00:00Z`).getUTCDay();
  if (Number.isNaN(weekday) || weekday !== pattern.weekday) {
    return { ok: false, error: "Tanggal tidak cocok dengan jadwal kelas ini." };
  }

  if (pattern.activeFrom && parsed.dateISO < pattern.activeFrom) {
    return { ok: false, error: "Sesi belum tersedia pada tanggal itu." };
  }
  if (pattern.activeUntil && parsed.dateISO > pattern.activeUntil) {
    return { ok: false, error: "Sesi sudah tidak berjalan pada tanggal itu." };
  }

  const exception = findException(parsed.dateISO, pattern.id, extraExceptions);
  if (exception) {
    return { ok: false, error: `Sesi ini dibatalkan. ${exception.reason}` };
  }

  const type = getClassType(pattern.classSlug);
  if (!type) return { ok: false, error: "Jenis kelas tidak ditemukan." };
  if (type.byRequestOnly) {
    return { ok: false, error: "Kelas ini diatur lewat permintaan terpisah." };
  }

  const session = materialise(pattern, parsed.dateISO);
  if (!session) return { ok: false, error: "Sesi tidak bisa dibentuk." };
  return { ok: true, session };
}

export type QuotaCheckInput = {
  session: Session;
  seats: number;
  takenSeats: number;
  nowMs: number;
  /** Capacity override applied by the studio owner, if any. */
  capacityOverride?: number;
};

export function checkSeatsAndTiming({
  session,
  seats,
  takenSeats,
  nowMs,
  capacityOverride,
}: QuotaCheckInput): FieldErrors {
  const errors: FieldErrors = {};
  const capacity =
    typeof capacityOverride === "number" ? capacityOverride : session.capacity;
  const withCapacity: Session = { ...session, capacity };

  // Rule: a session that has already started can never be booked, including
  // an earlier hour of today.
  if (nowMs >= withCapacity.startsAtMs) {
    errors.form = "Sesi ini sudah lewat dan tidak bisa dipesan.";
    return errors;
  }

  // Rule: booking closes a configured number of hours before the start.
  if (nowMs >= bookingClosesAtMs(withCapacity)) {
    errors.form = `Pemesanan sudah ditutup. Kelas harus dipesan paling lambat ${BOOKING_LEAD_TIME_HOURS} jam sebelum dimulai.`;
    return errors;
  }

  const taken = Math.max(0, Math.min(takenSeats, capacity));
  const left = Math.max(0, capacity - taken);

  if (left <= 0) {
    errors.form = "Kuota sesi ini sudah penuh. Silakan masuk daftar tunggu.";
    return errors;
  }

  if (!Number.isInteger(seats) || seats < 1) {
    errors.seats = "Jumlah orang minimal 1.";
  } else if (seats > MAX_SEATS_PER_BOOKING) {
    errors.seats = `Maksimal ${MAX_SEATS_PER_BOOKING} orang per pemesanan.`;
  } else if (seats > left) {
    errors.seats =
      left === 1
        ? "Tersisa 1 tempat untuk sesi ini."
        : `Tersisa ${left} tempat untuk sesi ini.`;
  }

  return errors;
}

/** Full field-level pass, shared by client and server. */
export function validateBookingFields(fields: BookingFields): FieldErrors {
  const errors: FieldErrors = {};
  const name = validateName(fields.name);
  if (name) errors.name = name;
  const wa = validateWhatsApp(fields.whatsapp);
  if (wa) errors.whatsapp = wa;
  const exp = validateExperience(fields.experience);
  if (exp) errors.experience = exp;
  const notes = validateNotes(fields.notes);
  if (notes) errors.notes = notes;
  if (!fields.sessionId) errors.sessionId = "Sesi belum dipilih.";
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
