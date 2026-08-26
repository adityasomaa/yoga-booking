"use client";

/**
 * Sticky header + mobile menu.
 *
 * The admin route is intentionally absent from NAV_ITEMS -- it is reachable
 * only by typing the URL, and is excluded from the sitemap and marked
 * noindex.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import { STUDIO_NAME } from "@/lib/config";
import { useBodyScrollLock, useEscape } from "@/lib/store/hooks";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/jadwal", label: "Jadwal" },
  { href: "/kelas", label: "Kelas" },
  { href: "/paket", label: "Paket" },
  { href: "/kontak", label: "Kontak" },
] as const;

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path
          d="M 12 34 A 20 26 0 0 1 52 34"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M 12 34 A 20 26 0 0 0 52 34"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="32" cy="34" r="5" fill="var(--color-ink)" />
      </svg>
      <span className="text-[0.95rem] font-medium tracking-[-0.01em]">
        {STUDIO_NAME}
      </span>
    </span>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useBodyScrollLock(open);
  useEscape(open, () => setOpen(false));

  // Any route change closes the menu. This deliberately mirrors external
  // navigation state into local state; there is no derived-value equivalent.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  // Signal to the cookie banner that the mobile menu owns the screen.
  useEffect(() => {
    document.body.toggleAttribute("data-menu-open", open);
    return () => document.body.removeAttribute("data-menu-open");
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="layer-header sticky top-0 border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-bg)_88%,transparent)] backdrop-blur-md">
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-4">
          <TransitionLink href="/" className="flex-none" aria-label={`${STUDIO_NAME} - ke halaman utama`}>
            <Wordmark />
          </TransitionLink>

          {/* Desktop nav */}
          <nav aria-label="Navigasi utama" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                        : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                    )}
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block">
            <TransitionLink href="/jadwal" className="btn btn-primary">
              Pesan Kelas
            </TransitionLink>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-[var(--color-line)] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
            <span aria-hidden="true" className="relative block h-3.5 w-4.5">
              <span
                className={cn(
                  "absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-300",
                  open ? "top-[6px] rotate-45" : "top-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[6px] block h-[1.5px] w-full bg-current transition-opacity duration-200",
                  open ? "opacity-0" : "opacity-100"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-300",
                  open ? "top-[6px] -rotate-45" : "top-[12px]"
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu. Sits above the header, below modals, and above the
          cookie banner in practice because the banner hides while it is open. */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="layer-mobile-menu fixed inset-0 md:hidden"
      >
        <div
          className="absolute inset-0 bg-[var(--color-bg)]"
          style={{
            opacity: open ? 1 : 0,
            transition: "opacity 260ms var(--ease-out-soft)",
          }}
        />
        <div className="relative flex h-full flex-col">
          <div className="shell flex h-[var(--header-h)] flex-none items-center justify-between">
            <Wordmark />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)]"
            >
              <span className="sr-only">Tutup menu</span>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav
            aria-label="Navigasi utama seluler"
            className="shell flex min-h-0 flex-1 flex-col justify-between overflow-y-auto pb-8"
          >
            <ul className="flex flex-col gap-1 pt-6">
              {NAV_ITEMS.map((item, i) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    onNavigate={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "block border-b border-[var(--color-line)] py-4 text-2xl tracking-[-0.02em] transition-colors",
                      isActive(item.href)
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-ink)]"
                    )}
                    style={{
                      opacity: open ? 1 : 0,
                      transform: open ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 320ms var(--ease-out-soft) ${60 + i * 45}ms, transform 320ms var(--ease-out-soft) ${60 + i * 45}ms`,
                    }}
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>

            <div className="pt-8">
              <TransitionLink
                href="/jadwal"
                onNavigate={() => setOpen(false)}
                className="btn btn-primary w-full"
              >
                Lihat Jadwal Minggu Ini
              </TransitionLink>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
