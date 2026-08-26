/**
 * =============================================================================
 *  SCHEDULE ENGINE
 * =============================================================================
 *
 *  Two layers, kept deliberately separate:
 *
 *    ClassType  -- what a class IS   (hatha, vinyasa, yin ...)
 *    Session    -- one ClassType ON a specific date and time, with a quota
 *
 *  Sessions are never stored. They are DERIVED on demand by expanding the
 *  weekly recurrence patterns over a date range and then removing anything
 *  matching a date exception. That is what lets the owner write a schedule
 *  once instead of re-typing dates every week.
 *
 *  TIME CORRECTNESS
 *  All "has this already started" maths resolves a studio-local wall clock
 *  time against a fixed +07:00 offset (Indonesia has no daylight saving), then
 *  compares real epoch milliseconds. Nothing here counts frames or accumulates
 *  deltas, so leaving a tab backgrounded for hours and returning still yields
 *  the correct answer on the next read.
 * =============================================================================
 */

import {
  CLASS_TYPES,
  DATE_EXCEPTIONS,
  WEEKLY_PATTERNS,
  type ClassType,
  type DateException,
  type WeeklyPattern,
} from "@/data/studio";
import {
  ALMOST_FULL_THRESHOLD,
  BOOKING_LEAD_TIME_HOURS,
  STUDIO_UTC_OFFSET,
} from "@/lib/config";

/* -------------------------------------------------------------------------
 * Date primitives. All operate on "YYYY-MM-DD" strings in studio local time
 * and use UTC internally so the host machine's timezone can never shift them.
 * ---------------------------------------------------------------------- */

const DAY_MS = 86_400_000;

/** Epoch ms for a studio wall-clock time, e.g. ("2026-08-26", "18:00"). */
export function studioEpoch(dateISO: string, time: string): number {
  return Date.parse(`${dateISO}T${time}:00${STUDIO_UTC_OFFSET}`);
}

/** Today's date in the studio's timezone, derived from a real clock reading. */
export function studioTodayISO(nowMs: number): string {
  return new Date(nowMs + 7 * 3_600_000).toISOString().slice(0, 10);
}

export function addDaysISO(dateISO: string, days: number): string {
  return new Date(Date.parse(`${dateISO}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** 0 = Sunday ... 6 = Saturday */
export function weekdayOfISO(dateISO: string): number {
  return new Date(`${dateISO}T00:00:00Z`).getUTCDay();
}

/** Monday-anchored start of the week containing `dateISO`. */
export function weekStartISO(dateISO: string): string {
  const wd = weekdayOfISO(dateISO);
  // Shift Sunday (0) back 6 days rather than forward 1.
  const back = wd === 0 ? 6 : wd - 1;
  return addDaysISO(dateISO, -back);
}

export function diffDays(aISO: string, bISO: string): number {
  return Math.round(
    (Date.parse(`${aISO}T00:00:00Z`) - Date.parse(`${bISO}T00:00:00Z`)) / DAY_MS
  );
}

export const WEEKDAY_LABELS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export const WEEKDAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

const MONTH_LABELS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/** "2026-08-26" -> "26 Agustus 2026" */
export function formatDateLong(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2026-08-26" -> "26 Agu" */
export function formatDateShort(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTH_LABELS[d.getUTCMonth()].slice(0, 3)}`;
}

/** Adds minutes to a "HH:MM" wall time. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------
 * Lookups
 * ---------------------------------------------------------------------- */

export function getClassType(slug: string): ClassType | undefined {
  return CLASS_TYPES.find((c) => c.slug === slug);
}

/** Class types that appear on the weekly schedule (excludes by-request-only). */
export function scheduledClassTypes(): ClassType[] {
  return CLASS_TYPES.filter((c) => !c.byRequestOnly);
}

export function getPattern(id: string): WeeklyPattern | undefined {
  return WEEKLY_PATTERNS.find((p) => p.id === id);
}

/* -------------------------------------------------------------------------
 * Session derivation
 * ---------------------------------------------------------------------- */

export type Session = {
  /** Stable, derivable id: "<patternId>__<YYYY-MM-DD>". */
  id: string;
  patternId: string;
  classSlug: string;
  className: string;
  level: ClassType["level"];
  dateISO: string;
  weekday: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  room?: string;
  /** Epoch ms of the session start, resolved in studio local time. */
  startsAtMs: number;
  endsAtMs: number;
};

export function sessionId(patternId: string, dateISO: string): string {
  return `${patternId}__${dateISO}`;
}

export function parseSessionId(
  id: string
): { patternId: string; dateISO: string } | null {
  const idx = id.lastIndexOf("__");
  if (idx === -1) return null;
  const patternId = id.slice(0, idx);
  const dateISO = id.slice(idx + 2);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return null;
  return { patternId, dateISO };
}

/** Exceptions that apply to a given pattern on a given date. */
export function findException(
  dateISO: string,
  patternId: string,
  extraExceptions: DateException[] = []
): DateException | undefined {
  const all = [...DATE_EXCEPTIONS, ...extraExceptions];
  return all.find(
    (e) => e.date === dateISO && (e.patternId === "all" || e.patternId === patternId)
  );
}

function patternActiveOn(pattern: WeeklyPattern, dateISO: string): boolean {
  if (pattern.activeFrom && dateISO < pattern.activeFrom) return false;
  if (pattern.activeUntil && dateISO > pattern.activeUntil) return false;
  return true;
}

/** Builds the Session object for one pattern on one date. Does not filter. */
export function materialise(
  pattern: WeeklyPattern,
  dateISO: string
): Session | null {
  const type = getClassType(pattern.classSlug);
  if (!type) return null;
  const endTime = addMinutesToTime(pattern.startTime, type.durationMinutes);
  return {
    id: sessionId(pattern.id, dateISO),
    patternId: pattern.id,
    classSlug: type.slug,
    className: type.name,
    level: type.level,
    dateISO,
    weekday: weekdayOfISO(dateISO),
    startTime: pattern.startTime,
    endTime,
    durationMinutes: type.durationMinutes,
    capacity: pattern.capacity,
    room: pattern.room,
    startsAtMs: studioEpoch(dateISO, pattern.startTime),
    endsAtMs: studioEpoch(dateISO, pattern.startTime) + type.durationMinutes * 60_000,
  };
}

/**
 * Expands the recurring patterns across [fromISO, toISO] inclusive.
 * Date exceptions remove sessions entirely -- a cancelled session simply is
 * not in the result, which is what makes an admin cancellation visible on the
 * participant side with no extra wiring.
 */
export function expandRange(
  fromISO: string,
  toISO: string,
  extraExceptions: DateException[] = []
): Session[] {
  const out: Session[] = [];
  const span = diffDays(toISO, fromISO);
  for (let i = 0; i <= span; i++) {
    const dateISO = addDaysISO(fromISO, i);
    const wd = weekdayOfISO(dateISO);
    for (const pattern of WEEKLY_PATTERNS) {
      if (pattern.weekday !== wd) continue;
      if (!patternActiveOn(pattern, dateISO)) continue;
      if (findException(dateISO, pattern.id, extraExceptions)) continue;
      const s = materialise(pattern, dateISO);
      if (s) out.push(s);
    }
  }
  return out.sort((a, b) => a.startsAtMs - b.startsAtMs);
}

/** The seven days of a Monday-anchored week, each with its sessions. */
export type ScheduleDay = {
  dateISO: string;
  weekday: number;
  label: string;
  shortLabel: string;
  sessions: Session[];
  /** Set when the whole day is closed by an exception. */
  closedReason?: string;
};

export function expandWeek(
  weekStart: string,
  extraExceptions: DateException[] = []
): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  for (let i = 0; i < 7; i++) {
    const dateISO = addDaysISO(weekStart, i);
    const wd = weekdayOfISO(dateISO);
    const allDayClosure = [...DATE_EXCEPTIONS, ...extraExceptions].find(
      (e) => e.date === dateISO && e.patternId === "all"
    );
    const sessions = WEEKLY_PATTERNS.filter(
      (p) =>
        p.weekday === wd &&
        patternActiveOn(p, dateISO) &&
        !findException(dateISO, p.id, extraExceptions)
    )
      .map((p) => materialise(p, dateISO))
      .filter((s): s is Session => s !== null)
      .sort((a, b) => a.startsAtMs - b.startsAtMs);

    days.push({
      dateISO,
      weekday: wd,
      label: WEEKDAY_LABELS[wd],
      shortLabel: WEEKDAY_SHORT[wd],
      sessions,
      closedReason: allDayClosure?.reason,
    });
  }
  return days;
}

/* -------------------------------------------------------------------------
 * Session status
 *
 * Status is a single source of truth for BOTH the visual treatment and the
 * text label. Colour alone never carries the meaning -- every status ships a
 * `label` that is rendered as real text.
 * ---------------------------------------------------------------------- */

export type SessionStatusKind =
  | "available"
  | "almost-full"
  | "full"
  | "closed"
  | "past";

export type SessionStatus = {
  kind: SessionStatusKind;
  /** Text shown next to the session. Never colour-only. */
  label: string;
  /** Longer sentence for screen readers and tooltips. */
  detail: string;
  seatsLeft: number;
  bookable: boolean;
  /** True when the correct action is a waiting list rather than a booking. */
  waitlist: boolean;
};

export function seatsLeft(session: Session, bookedSeats: number): number {
  return Math.max(0, session.capacity - Math.max(0, bookedSeats));
}

/** Epoch ms after which this session can no longer be booked. */
export function bookingClosesAtMs(session: Session): number {
  return session.startsAtMs - BOOKING_LEAD_TIME_HOURS * 3_600_000;
}

/**
 * Resolves a session's status against a REAL clock reading.
 * `nowMs` must come from Date.now() (or a server timestamp), never from an
 * animation frame counter.
 */
export function getSessionStatus(
  session: Session,
  bookedSeats: number,
  nowMs: number
): SessionStatus {
  const left = seatsLeft(session, bookedSeats);

  // 1. Already started (or finished) -- includes earlier hours of today.
  if (nowMs >= session.startsAtMs) {
    return {
      kind: "past",
      label: "Sudah lewat",
      detail: "Sesi ini sudah berlangsung dan tidak bisa dipesan.",
      seatsLeft: left,
      bookable: false,
      waitlist: false,
    };
  }

  // 2. Quota reached -- waiting list instead of booking.
  if (left <= 0) {
    return {
      kind: "full",
      label: "Penuh",
      detail:
        "Kuota sesi ini sudah terisi. Anda masih bisa masuk daftar tunggu lewat WhatsApp.",
      seatsLeft: 0,
      bookable: false,
      waitlist: true,
    };
  }

  // 3. Inside the lead-time cutoff.
  if (nowMs >= bookingClosesAtMs(session)) {
    return {
      kind: "closed",
      label: "Pemesanan ditutup",
      detail: `Pemesanan ditutup ${BOOKING_LEAD_TIME_HOURS} jam sebelum kelas dimulai. Hubungi studio lewat WhatsApp untuk menanyakan ketersediaan.`,
      seatsLeft: left,
      bookable: false,
      waitlist: true,
    };
  }

  // 4. Open, but nearly out of seats.
  if (left <= ALMOST_FULL_THRESHOLD) {
    return {
      kind: "almost-full",
      label: `Hampir penuh - sisa ${left} tempat`,
      detail: `Tersisa ${left} tempat untuk sesi ini.`,
      seatsLeft: left,
      bookable: true,
      waitlist: false,
    };
  }

  // 5. Open.
  return {
    kind: "available",
    label: `Tersedia - sisa ${left} tempat`,
    detail: `Tersisa ${left} tempat dari kuota ${session.capacity}.`,
    seatsLeft: left,
    bookable: true,
    waitlist: false,
  };
}

/** Next N bookable sessions from now, used by the home page. */
export function upcomingSessions(
  nowMs: number,
  count: number,
  seatsBookedFor: (sessionId: string) => number = () => 0,
  extraExceptions: DateException[] = []
): Session[] {
  const todayISO = studioTodayISO(nowMs);
  const sessions = expandRange(todayISO, addDaysISO(todayISO, 14), extraExceptions);
  return sessions
    .filter((s) => {
      const status = getSessionStatus(s, seatsBookedFor(s.id), nowMs);
      return status.kind !== "past";
    })
    .slice(0, count);
}
