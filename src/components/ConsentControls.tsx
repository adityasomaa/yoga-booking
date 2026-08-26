"use client";

/**
 * Lets a visitor change or withdraw the storage consent they gave in the
 * banner. Withdrawing genuinely deletes the remembered name and number.
 */

import { resetConsent, setConsent, useConsent } from "@/lib/consent";

export default function ConsentControls() {
  const consent = useConsent();

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <p className="text-sm text-[var(--color-ink)]">
        Status saat ini:{" "}
        <strong className="font-medium">
          {!consent.decided
            ? "belum memilih"
            : consent.preferences
              ? "mengingat nama dan nomor diizinkan"
              : "hanya penyimpanan yang diperlukan"}
        </strong>
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="btn btn-secondary sm:flex-1"
          onClick={() => setConsent(true)}
          disabled={consent.decided && consent.preferences}
        >
          Izinkan mengingat data
        </button>
        <button
          type="button"
          className="btn btn-secondary sm:flex-1"
          onClick={() => setConsent(false)}
          disabled={consent.decided && !consent.preferences}
        >
          Cabut dan hapus
        </button>
        <button
          type="button"
          className="btn btn-quiet sm:flex-1"
          onClick={() => resetConsent()}
        >
          Tampilkan banner lagi
        </button>
      </div>
    </div>
  );
}
