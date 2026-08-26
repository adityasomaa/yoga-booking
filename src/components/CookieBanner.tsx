"use client";

/**
 * Cookie banner.
 *
 * Placement rules it has to respect:
 *   - it must NOT sit on top of the open mobile menu, so it hides itself
 *     whenever the menu (or a modal) owns the screen;
 *   - it must not swallow taps meant for buttons near the bottom edge on
 *     small screens, so the wrapper is pointer-events:none and only the panel
 *     itself is interactive.
 */

import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/store/hooks";
import TransitionLink from "@/components/TransitionLink";
import { setConsent, useConsent } from "@/lib/consent";
import { useOverlayOpen } from "@/lib/overlay-state";

export default function CookieBanner() {
  const consent = useConsent();
  const overlayOpen = useOverlayOpen();
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useHydrated();

  // Watch the flag the header sets when the mobile menu opens.
  useEffect(() => {
    const check = () => setMenuOpen(document.body.hasAttribute("data-menu-open"));
    // Read once on the next tick rather than synchronously inside the effect,
    // then keep in step via the observer.
    const initial = window.setTimeout(check, 0);
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-menu-open"],
    });
    return () => {
      window.clearTimeout(initial);
      observer.disconnect();
    };
  }, []);

  if (!mounted || consent.decided) return null;
  // Yield the screen entirely rather than stacking over the menu or a dialog.
  if (menuOpen || overlayOpen) return null;

  return (
    <div className="layer-cookie pointer-events-none fixed inset-x-0 bottom-0 p-3 sm:p-4">
      <div
        role="region"
        aria-label="Pilihan penyimpanan data"
        className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_20px_50px_-30px_rgba(21,24,26,0.6)] sm:p-5"
      >
        <div>
          <p className="text-sm font-medium">Penyimpanan data di perangkat Anda</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            Situs ini menyimpan data pemesanan demo di browser Anda sendiri agar
            alur pemesanan bisa ditampilkan. Anda juga bisa mengizinkan situs
            mengingat nama dan nomor WhatsApp supaya tidak perlu mengetik ulang.
            Tidak ada skrip iklan atau pelacak di situs ini.{" "}
            <TransitionLink
              href="/kebijakan-privasi"
              className="text-[var(--color-accent)] underline underline-offset-2"
            >
              Kebijakan Privasi
            </TransitionLink>
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn btn-primary sm:flex-1"
            onClick={() => setConsent(true)}
          >
            Izinkan mengingat data saya
          </button>
          <button
            type="button"
            className="btn btn-secondary sm:flex-1"
            onClick={() => setConsent(false)}
          >
            Hanya yang diperlukan
          </button>
        </div>
      </div>
    </div>
  );
}
