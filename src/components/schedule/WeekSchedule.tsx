"use client";

/**
 * =============================================================================
 *  WEEKLY SCHEDULE
 * =============================================================================
 *
 *  Sessions are derived from the recurring patterns on the fly, so "next week"
 *  needs no data entry at all -- it is the same pattern list expanded over a
 *  different date range.
 *
 *  RESPONSIVE BEHAVIOUR
 *  A seven-column grid is the single most reliable way to make a page scroll
 *  sideways on a phone. So below the lg breakpoint this renders as a stacked
 *  list of days instead. At lg and above it uses columns, and even then the
 *  grid lives inside its own horizontally scrolling box with a min-width, so
 *  the columns never push the page itself sideways.
 * =============================================================================
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Listbox from "@/components/Listbox";
import SessionCard from "./SessionCard";
import BookingModal from "@/components/booking/BookingModal";
import WhatsAppLink, { buildWhatsAppMessage } from "@/components/WhatsAppLink";
import {
  addDaysISO,
  expandWeek,
  formatDateLong,
  formatDateShort,
  scheduledClassTypes,
  studioTodayISO,
  weekStartISO,
  type ScheduleDay,
} from "@/lib/schedule";
import {
  useExtraExceptions,
  useHydrated,
  useNow,
  useResolvedSessions,
  type ResolvedSession,
} from "@/lib/store/hooks";
import {
  SCHEDULE_WEEKS_AHEAD,
  SCHEDULE_WEEKS_BEHIND,
  STUDIO_NAME,
  WHATSAPP_NUMBER,
  isPending,
} from "@/lib/config";
import { cn } from "@/lib/utils";

const LEVEL_OPTIONS = [
  { value: "semua", label: "Semua tingkat" },
  { value: "pemula", label: "Pemula" },
  { value: "semua-level", label: "Semua level" },
  { value: "menengah", label: "Menengah" },
];

export default function WeekSchedule({
  initialWeekStart,
}: {
  initialWeekStart: string;
}) {
  const hydrated = useHydrated();
  const now = useNow();
  const extraExceptions = useExtraExceptions();

  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [classFilter, setClassFilter] = useState("semua");
  const [levelFilter, setLevelFilter] = useState("semua");
  const [active, setActive] = useState<ResolvedSession | null>(null);

  // Once hydrated, anchor on the real current week rather than the build-time
  // week that was baked into the HTML.
  const didAnchor = useRef(false);
  useEffect(() => {
    if (didAnchor.current) return;
    didAnchor.current = true;
    const realWeek = weekStartISO(studioTodayISO(Date.now()));
    // Re-anchor from the build-time week to the visitor's real current week.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (realWeek !== initialWeekStart) setWeekStart(realWeek);
  }, [initialWeekStart]);

  const todayISO = hydrated ? studioTodayISO(now) : initialWeekStart;
  const thisWeek = weekStartISO(todayISO);

  const days: ScheduleDay[] = useMemo(
    () => expandWeek(weekStart, extraExceptions),
    [weekStart, extraExceptions]
  );

  const allSessions = useMemo(() => days.flatMap((d) => d.sessions), [days]);
  const resolved = useResolvedSessions(allSessions, now);

  const resolvedById = useMemo(() => {
    const m = new Map<string, ResolvedSession>();
    for (const s of resolved) m.set(s.id, s);
    return m;
  }, [resolved]);

  const matches = useCallback(
    (s: ResolvedSession) =>
      (classFilter === "semua" || s.classSlug === classFilter) &&
      (levelFilter === "semua" || s.level === levelFilter),
    [classFilter, levelFilter]
  );

  const visibleDays = useMemo(
    () =>
      days.map((d) => ({
        ...d,
        resolved: d.sessions
          .map((s) => resolvedById.get(s.id))
          .filter((s): s is ResolvedSession => !!s)
          .filter(matches),
      })),
    [days, resolvedById, matches]
  );

  const totalVisible = visibleDays.reduce((n, d) => n + d.resolved.length, 0);

  /* --- live region: announce seat changes ---------------------------- */
  const [announcement, setAnnouncement] = useState("");
  const prevSeats = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!hydrated) return;
    const next = new Map<string, number>();
    const changes: string[] = [];
    for (const s of resolved) {
      next.set(s.id, s.status.seatsLeft);
      const before = prevSeats.current.get(s.id);
      if (before !== undefined && before !== s.status.seatsLeft) {
        changes.push(
          `${s.className} ${formatDateShort(s.dateISO)} pukul ${s.startTime}: ${
            s.status.seatsLeft === 0
              ? "kuota penuh"
              : `sisa ${s.status.seatsLeft} tempat`
          }.`
        );
      }
    }
    prevSeats.current = next;
    // Announcement text is derived from a diff against the previous render,
    // which is exactly what an effect is for here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (changes.length) setAnnouncement(changes.join(" "));
  }, [resolved, hydrated]);

  /* --- week navigation bounds ---------------------------------------- */
  const minWeek = useMemo(
    () => addDaysISO(thisWeek, -7 * SCHEDULE_WEEKS_BEHIND),
    [thisWeek]
  );
  const maxWeek = useMemo(
    () => addDaysISO(thisWeek, 7 * SCHEDULE_WEEKS_AHEAD),
    [thisWeek]
  );

  const canPrev = weekStart > minWeek;
  const canNext = weekStart < maxWeek;
  const weekEnd = addDaysISO(weekStart, 6);

  const classOptions = useMemo(
    () => [
      { value: "semua", label: "Semua jenis kelas" },
      ...scheduledClassTypes().map((c) => ({ value: c.slug, label: c.name })),
    ],
    []
  );

  const waitlistLines = (s: ResolvedSession) => [
    `Kelas: ${s.className}`,
    `Tanggal: ${formatDateLong(s.dateISO)}`,
    `Jam: ${s.startTime} - ${s.endTime}`,
    "",
    "Saya ingin masuk daftar tunggu untuk sesi ini.",
  ];

  const openWaitlist = (s: ResolvedSession) => {
    if (isPending(WHATSAPP_NUMBER)) {
      setAnnouncement(
        "Nomor WhatsApp studio belum dikonfigurasi, daftar tunggu belum bisa dikirim."
      );
      return;
    }
    const text = buildWhatsAppMessage({
      intro: `Halo ${STUDIO_NAME}, saya ingin menanyakan daftar tunggu.`,
      lines: waitlistLines(s),
      label: "Daftar Tunggu",
      sourceUrl: window.location.href,
    });
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div>
      {/* Screen-reader announcements for seat changes. */}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      {/* Week navigation */}
      <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="t-eyebrow">
            {weekStart === thisWeek ? "Minggu ini" : "Jadwal mingguan"}
          </p>
          <p className="mt-1.5 text-lg font-medium tracking-[-0.02em]">
            {formatDateShort(weekStart)} &ndash; {formatDateLong(weekEnd)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setWeekStart((w) => addDaysISO(w, -7))}
            disabled={!canPrev}
          >
            <span aria-hidden="true">&larr;</span> Minggu Sebelumnya
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => setWeekStart(thisWeek)}
            disabled={weekStart === thisWeek}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setWeekStart((w) => addDaysISO(w, 7))}
            disabled={!canNext}
          >
            Minggu Berikutnya <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-3 py-5 sm:grid-cols-2 lg:max-w-xl">
        <Listbox
          label="Jenis kelas"
          value={classFilter}
          onChange={setClassFilter}
          options={classOptions}
        />
        <Listbox
          label="Tingkat"
          value={levelFilter}
          onChange={setLevelFilter}
          options={LEVEL_OPTIONS}
        />
      </div>

      {totalVisible === 0 ? (
        <p className="card p-6 text-sm text-[var(--color-ink-soft)]">
          Tidak ada sesi yang cocok dengan filter ini pada minggu tersebut.
          Coba ubah filter atau lihat minggu lain.
        </p>
      ) : null}

      {/* --- Small screens: stacked per day, no columns to overflow --- */}
      <div className="flex flex-col gap-6 lg:hidden">
        {visibleDays.map((day) => (
          <section key={day.dateISO} aria-labelledby={`day-${day.dateISO}`}>
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-line)] pb-2">
              <h3
                id={`day-${day.dateISO}`}
                className={cn(
                  "text-sm font-medium",
                  day.dateISO === todayISO && "text-[var(--color-accent)]"
                )}
              >
                {day.label}
                {day.dateISO === todayISO ? " (hari ini)" : ""}
              </h3>
              <span className="text-xs text-[var(--color-ink-soft)]">
                {formatDateShort(day.dateISO)}
              </span>
            </div>

            {day.closedReason ? (
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                Studio tutup. {day.closedReason}
              </p>
            ) : day.resolved.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                Tidak ada kelas.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {day.resolved.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    hydrated={hydrated}
                    onBook={setActive}
                    onWaitlist={openWaitlist}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* --- Large screens: seven columns, inside their own scroll box --- */}
      <div className="hidden lg:block">
        <div className="scroll-x -mx-1 px-1 pb-2">
          <div className="grid min-w-[64rem] grid-cols-7 gap-3">
            {visibleDays.map((day) => (
              <section
                key={day.dateISO}
                aria-labelledby={`col-${day.dateISO}`}
                className="flex min-w-0 flex-col"
              >
                <div
                  className={cn(
                    "mb-3 border-b pb-2",
                    day.dateISO === todayISO
                      ? "border-[var(--color-accent)]"
                      : "border-[var(--color-line)]"
                  )}
                >
                  <h3
                    id={`col-${day.dateISO}`}
                    className={cn(
                      "text-sm font-medium",
                      day.dateISO === todayISO && "text-[var(--color-accent)]"
                    )}
                  >
                    {day.label}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    {formatDateShort(day.dateISO)}
                    {day.dateISO === todayISO ? " · hari ini" : ""}
                  </p>
                </div>

                {day.closedReason ? (
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    Studio tutup. {day.closedReason}
                  </p>
                ) : day.resolved.length === 0 ? (
                  <p className="text-xs text-[var(--color-ink-soft)]">
                    Tidak ada kelas.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {day.resolved.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        hydrated={hydrated}
                        compact
                        onBook={setActive}
                        onWaitlist={openWaitlist}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>

      <BookingModal
        session={active}
        open={active !== null}
        onClose={() => setActive(null)}
      />

      {isPending(WHATSAPP_NUMBER) ? (
        <p className="mt-6 rounded-[var(--radius-md)] border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-soft)]">
          Catatan konfigurasi: nomor WhatsApp studio belum diisi, jadi tombol
          kirim pemesanan belum bisa membuka WhatsApp.
        </p>
      ) : null}

      <div className="sr-only">
        <WhatsAppLink label="Tanya jadwal" />
      </div>
    </div>
  );
}
