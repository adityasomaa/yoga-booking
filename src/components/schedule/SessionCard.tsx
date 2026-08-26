"use client";

/**
 * One session on the schedule.
 *
 * Status is never communicated by colour alone: every card renders the status
 * label as real text next to the coloured dot, so the four states -- tersedia,
 * hampir penuh, penuh, sudah lewat -- are distinguishable without seeing
 * colour at all.
 */

import type { ResolvedSession } from "@/lib/store/hooks";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  available: "status status-available",
  "almost-full": "status status-almost-full",
  full: "status status-full",
  closed: "status status-closed",
  past: "status status-past",
};

export default function SessionCard({
  session,
  onBook,
  onWaitlist,
  compact,
  hydrated,
}: {
  session: ResolvedSession;
  onBook: (session: ResolvedSession) => void;
  onWaitlist: (session: ResolvedSession) => void;
  compact?: boolean;
  /** Before hydration, seat counts are unknown; show a neutral state. */
  hydrated: boolean;
}) {
  const { status } = session;
  const isPast = status.kind === "past";

  return (
    <article
      className={cn(
        "card flex flex-col gap-3 p-3.5 transition-colors",
        isPast && "opacity-70",
        compact ? "text-sm" : ""
      )}
      data-status={status.kind}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium tracking-[-0.01em]">
            <time dateTime={`${session.dateISO}T${session.startTime}`}>
              {session.startTime}
            </time>
            <span className="text-[var(--color-ink-soft)]">
              {" "}
              &ndash; {session.endTime}
            </span>
          </p>
          <h3 className="mt-0.5 truncate text-[0.95rem]">{session.className}</h3>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
        <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5 capitalize">
          {session.level.replace("-", " ")}
        </span>
        <span>{session.durationMinutes} menit</span>
        {session.room ? <span>&middot; {session.room}</span> : null}
      </div>

      {/* Status: coloured pill AND a text label. */}
      <p className={STATUS_CLASS[status.kind] ?? "status"}>
        <span className="status-dot" aria-hidden="true" />
        <span>{hydrated ? status.label : "Memuat ketersediaan"}</span>
      </p>

      {!hydrated ? (
        <span className="btn btn-secondary w-full" aria-disabled="true">
          Memuat
        </span>
      ) : status.bookable ? (
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={() => onBook(session)}
        >
          Pesan
          <span className="sr-only">
            {" "}
            kelas {session.className} pukul {session.startTime}
          </span>
        </button>
      ) : status.waitlist ? (
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={() => onWaitlist(session)}
        >
          Daftar Tunggu
          <span className="sr-only">
            {" "}
            untuk kelas {session.className} pukul {session.startTime}
          </span>
        </button>
      ) : (
        <span className="btn btn-secondary w-full" aria-disabled="true">
          Tidak tersedia
        </span>
      )}
    </article>
  );
}
