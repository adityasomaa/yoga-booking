"use client";

/**
 * The "sesi terdekat" strip on the home page: the next few sessions from the
 * real clock, with live seat counts.
 */

import { useMemo, useState } from "react";
import SessionCard from "./SessionCard";
import BookingModal from "@/components/booking/BookingModal";
import { buildWhatsAppMessage } from "@/components/WhatsAppLink";
import {
  addDaysISO,
  expandRange,
  formatDateLong,
  studioTodayISO,
  WEEKDAY_LABELS,
  formatDateShort,
} from "@/lib/schedule";
import {
  useExtraExceptions,
  useHydrated,
  useNow,
  useResolvedSessions,
  type ResolvedSession,
} from "@/lib/store/hooks";
import { STUDIO_NAME, WHATSAPP_NUMBER, isPending } from "@/lib/config";

export default function UpcomingSessions({
  initialDateISO,
  count = 4,
}: {
  initialDateISO: string;
  count?: number;
}) {
  const hydrated = useHydrated();
  const now = useNow();
  const exceptions = useExtraExceptions();
  const [active, setActive] = useState<ResolvedSession | null>(null);

  const todayISO = hydrated ? studioTodayISO(now) : initialDateISO;

  const candidates = useMemo(
    () => expandRange(todayISO, addDaysISO(todayISO, 10), exceptions),
    [todayISO, exceptions]
  );

  const resolved = useResolvedSessions(candidates, now);

  const upcoming = useMemo(
    () => resolved.filter((s) => s.status.kind !== "past").slice(0, count),
    [resolved, count]
  );

  const openWaitlist = (s: ResolvedSession) => {
    if (isPending(WHATSAPP_NUMBER)) return;
    const text = buildWhatsAppMessage({
      intro: `Halo ${STUDIO_NAME}, saya ingin menanyakan daftar tunggu.`,
      lines: [
        `Kelas: ${s.className}`,
        `Tanggal: ${formatDateLong(s.dateISO)}`,
        `Jam: ${s.startTime} - ${s.endTime}`,
      ],
      label: "Daftar Tunggu",
      sourceUrl: window.location.href,
    });
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (upcoming.length === 0) {
    return (
      <p className="card p-6 text-sm text-[var(--color-ink-soft)]">
        Tidak ada sesi terjadwal dalam waktu dekat.
      </p>
    );
  }

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {upcoming.map((s) => (
          <li key={s.id} className="flex flex-col">
            <p className="mb-2 text-xs text-[var(--color-ink-soft)]">
              {WEEKDAY_LABELS[s.weekday]}, {formatDateShort(s.dateISO)}
            </p>
            <div className="flex-1">
              <SessionCard
                session={s}
                hydrated={hydrated}
                onBook={setActive}
                onWaitlist={openWaitlist}
              />
            </div>
          </li>
        ))}
      </ul>

      <BookingModal
        session={active}
        open={active !== null}
        onClose={() => setActive(null)}
      />
    </>
  );
}
