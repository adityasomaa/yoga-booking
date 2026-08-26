/**
 * Instructor slot.
 *
 * No instructor name, photo, biography or certification appears anywhere on
 * this site, because none has been confirmed. Inventing a teacher would be
 * both a lie and, for a yoga studio, a credential claim.
 *
 * So the card shows the ROLE only, and says plainly that it is waiting to be
 * filled in -- for the studio owner reviewing the site, not as marketing copy
 * aimed at participants.
 */

export default function InstructorSlot() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line)] p-5">
      <p className="t-eyebrow">Instruktur</p>

      <div className="mt-3 flex items-start gap-3.5">
        <div
          aria-hidden="true"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)]"
        >
          <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
            <path
              d="M 16 36 A 16 20 0 0 1 48 36"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium">Instruktur kelas</p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Nama instruktur belum diisi. Bagian ini disiapkan sebagai slot dan
            akan dilengkapi pemilik studio.
          </p>
        </div>
      </div>
    </div>
  );
}
