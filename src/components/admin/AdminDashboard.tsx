"use client";

/**
 * =============================================================================
 *  ADMIN  --  DEMO SCREEN
 * =============================================================================
 *
 *  Marked clearly as a demo, on its own route, absent from the navigation,
 *  excluded from the sitemap and served with noindex.
 *
 *  There is NO authentication here. It reads and writes the same local store
 *  the participant side uses, which is exactly what makes the demo honest:
 *  cancelling a session here removes it from the public schedule immediately,
 *  because both sides derive their sessions from the same data plus the same
 *  exception list.
 * =============================================================================
 */

import { useMemo, useState } from "react";
import Listbox from "@/components/Listbox";
import TransitionLink from "@/components/TransitionLink";
import {
  addDaysISO,
  expandWeek,
  formatDateLong,
  formatDateShort,
  studioTodayISO,
  weekStartISO,
  WEEKDAY_LABELS,
} from "@/lib/schedule";
import {
  useExtraExceptions,
  useHydrated,
  useNow,
  useResolvedSessions,
  useStoreActions,
  useStoreSnapshot,
} from "@/lib/store/hooks";
import { bookingsForSession } from "@/lib/store";
import { EXPERIENCE_OPTIONS } from "@/lib/validation";
import { cn } from "@/lib/utils";

export default function AdminDashboard({
  initialWeekStart,
}: {
  initialWeekStart: string;
}) {
  const hydrated = useHydrated();
  const now = useNow();
  const snapshot = useStoreSnapshot();
  const actions = useStoreActions();
  const exceptions = useExtraExceptions();

  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [confirmReset, setConfirmReset] = useState(false);

  const todayISO = hydrated ? studioTodayISO(now) : initialWeekStart;
  const thisWeek = weekStartISO(todayISO);

  const days = useMemo(
    () => expandWeek(weekStart, exceptions),
    [weekStart, exceptions]
  );
  const allSessions = useMemo(() => days.flatMap((d) => d.sessions), [days]);
  const resolved = useResolvedSessions(allSessions, now);
  const byId = useMemo(() => {
    const m = new Map(resolved.map((s) => [s.id, s]));
    return m;
  }, [resolved]);

  const dayOptions = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = addDaysISO(weekStart, i);
        return { value: d, label: `${WEEKDAY_LABELS[(i + 1) % 7]} · ${formatDateShort(d)}` };
      }),
    [weekStart]
  );

  const [holidayDate, setHolidayDate] = useState(dayOptions[0]?.value ?? weekStart);

  const totalBookings = snapshot.bookings.filter(
    (b) => b.status !== "dibatalkan"
  ).length;

  return (
    <div className="shell section">
      {/* Demo banner -- unmistakable. */}
      <div className="mb-8 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-status-warn)] p-5">
        <p className="text-sm font-medium text-[var(--color-status-warn)]">
          Halaman demo &mdash; bukan sistem produksi
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Halaman ini tidak memiliki login dan tidak terhubung ke basis data.
          Semua perubahan tersimpan di browser ini saja dan tidak terlihat di
          perangkat lain. Tujuannya untuk memperagakan alur pengelolaan jadwal
          dari sisi pemilik studio.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="t-headline">Admin jadwal</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            {formatDateShort(weekStart)} &ndash; {formatDateLong(addDaysISO(weekStart, 6))}
            {" · "}
            {hydrated ? `${totalBookings} pemesanan tersimpan` : "memuat"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setWeekStart((w) => addDaysISO(w, -7))}
          >
            <span aria-hidden="true">&larr;</span> Minggu Sebelumnya
          </button>
          <button
            className="btn btn-quiet"
            onClick={() => setWeekStart(thisWeek)}
            disabled={weekStart === thisWeek}
          >
            Minggu Ini
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setWeekStart((w) => addDaysISO(w, 7))}
          >
            Minggu Berikutnya <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      {/* --- Tandai tanggal libur --- */}
      <section className="mt-8 card p-5">
        <h2 className="t-title">Tandai tanggal libur</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Menutup seluruh kelas pada satu tanggal. Sesi yang ditutup langsung
          hilang dari jadwal peserta.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Listbox
            className="sm:flex-1"
            label="Tanggal"
            value={holidayDate}
            onChange={setHolidayDate}
            options={dayOptions}
          />
          <button
            className="btn btn-primary"
            onClick={() =>
              actions.addException({
                date: holidayDate,
                patternId: "all",
                reason: "Studio libur",
              })
            }
          >
            Tandai Libur
          </button>
        </div>

        {exceptions.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2 border-t border-[var(--color-line)] pt-4">
            {exceptions.map((e) => (
              <li
                key={`${e.date}-${e.patternId}`}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span>
                  {formatDateLong(e.date)} &mdash;{" "}
                  {e.patternId === "all" ? "seluruh kelas" : e.patternId}{" "}
                  <span className="text-[var(--color-ink-soft)]">({e.reason})</span>
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => actions.removeException(e.date, e.patternId)}
                >
                  Batalkan Penutupan
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* --- Sesi per hari --- */}
      <div className="mt-8 flex flex-col gap-8">
        {days.map((day) => (
          <section key={day.dateISO}>
            <h2 className="t-title border-b border-[var(--color-line)] pb-2">
              {day.label}{" "}
              <span className="text-sm font-normal text-[var(--color-ink-soft)]">
                {formatDateShort(day.dateISO)}
                {day.dateISO === todayISO ? " · hari ini" : ""}
              </span>
            </h2>

            {day.closedReason ? (
              <p className="mt-3 text-sm text-[var(--color-status-warn)]">
                Ditutup: {day.closedReason}
              </p>
            ) : day.sessions.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                Tidak ada kelas.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {day.sessions.map((raw) => {
                  const s = byId.get(raw.id);
                  if (!s) return null;
                  const participants = bookingsForSession(snapshot, s.id).filter(
                    (b) => b.status !== "dibatalkan"
                  );
                  const overridden =
                    snapshot.admin.capacityOverrides[s.id] !== undefined;

                  return (
                    <article key={s.id} className="card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {s.startTime} &ndash; {s.endTime} &middot; {s.className}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                            {s.room ?? "Ruang belum diisi"} &middot; kuota {s.capacity}
                            {overridden ? " (diubah)" : ""} &middot; terisi{" "}
                            {s.bookedSeats} &middot; sisa {s.status.seatsLeft}
                          </p>
                        </div>
                        <p className="text-xs">{s.status.label}</p>
                      </div>

                      {/* Ubah kuota */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <label
                          className="text-xs text-[var(--color-ink-soft)]"
                          htmlFor={`cap-${s.id}`}
                        >
                          Kuota
                        </label>
                        <input
                          id={`cap-${s.id}`}
                          type="number"
                          min={0}
                          max={99}
                          value={s.capacity}
                          onChange={(e) =>
                            actions.setCapacityOverride(s.id, Number(e.target.value))
                          }
                          className="field-input w-24"
                        />
                        {overridden ? (
                          <button
                            className="btn btn-secondary"
                            onClick={() => actions.clearCapacityOverride(s.id)}
                          >
                            Kembalikan
                          </button>
                        ) : null}

                        <button
                          className="btn btn-secondary ml-auto"
                          onClick={() =>
                            actions.addException({
                              date: s.dateISO,
                              patternId: s.patternId,
                              reason: "Kelas dibatalkan",
                            })
                          }
                        >
                          Batalkan Sesi Ini
                        </button>
                      </div>

                      {/* Daftar peserta */}
                      <div className="mt-4 border-t border-[var(--color-line)] pt-3">
                        <p className="t-eyebrow">
                          Peserta ({participants.length})
                        </p>
                        {participants.length === 0 ? (
                          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                            Belum ada pemesanan.
                          </p>
                        ) : (
                          <ul className="mt-2 flex flex-col gap-2">
                            {participants.map((b) => (
                              <li
                                key={b.id}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                              >
                                <span className="min-w-0">
                                  <span className="font-medium">{b.name}</span>{" "}
                                  <span className="text-[var(--color-ink-soft)]">
                                    +{b.whatsapp} &middot; {b.seats} orang &middot;{" "}
                                    {EXPERIENCE_OPTIONS.find(
                                      (o) => o.value === b.experience
                                    )?.label ?? b.experience}
                                    {b.notes ? ` · "${b.notes}"` : ""}
                                  </span>
                                </span>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => actions.cancelBooking(b.id)}
                                >
                                  Batalkan
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* --- Reset --- */}
      <section className="mt-12 rounded-[var(--radius-lg)] border border-[var(--color-line)] p-5">
        <h2 className="t-title">Reset demo</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Menghapus semua pemesanan, perubahan kuota, dan penutupan tanggal yang
          dibuat di browser ini, lalu mengembalikan jadwal ke kondisi awal.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {confirmReset ? (
            <>
              <button
                className={cn("btn")}
                style={{
                  background: "var(--color-status-full)",
                  color: "#fff",
                }}
                onClick={() => {
                  actions.reset();
                  setConfirmReset(false);
                }}
              >
                Ya, Reset Sekarang
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmReset(false)}
              >
                Batal
              </button>
            </>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => setConfirmReset(true)}
            >
              Reset Demo
            </button>
          )}
          <TransitionLink href="/jadwal" className="btn btn-quiet">
            Lihat Sisi Peserta
          </TransitionLink>
        </div>
      </section>
    </div>
  );
}
