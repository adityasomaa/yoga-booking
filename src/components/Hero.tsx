/**
 * Hero -- exactly one screen tall.
 *
 * Uses 100svh, not 100vh: on phones the browser chrome hides during scroll,
 * which changes vh and makes a 100vh hero visibly resize mid-scroll. svh is
 * the small viewport height, so the box stays put.
 *
 * The graphic is deliberately NOT scroll-linked. No parallax, no zoom on
 * scroll -- it sits still while the page moves over it.
 */

import TransitionLink from "@/components/TransitionLink";
import { STUDIO_CITY } from "@/lib/config";

export default function Hero() {
  return (
    <section className="relative isolate flex h-screen-safe flex-col overflow-hidden">
      {/* Background graphic. Fixed size and position: nothing here reacts to
          scroll position. */}
      <div className="layer-behind pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/graphics/hero.svg"
          alt=""
          aria-hidden="true"
          width={1600}
          height={1000}
          className="h-full w-full object-cover object-[68%_center]"
          fetchPriority="high"
        />
      </div>

      <div className="layer-content relative shell flex flex-1 flex-col justify-center py-10">
        <div className="max-w-2xl lg:max-w-5xl">
          <p className="t-eyebrow">Kelas yoga di {STUDIO_CITY}</p>

          <h1 className="t-display mt-4">Jadwal kelas yoga mingguan</h1>

          <p className="t-lede mt-5 max-w-md">
            Lihat kelas apa saja yang berjalan minggu ini, berapa tempat yang
            masih tersisa, lalu pesan sesi yang cocok dengan jadwal Anda.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <TransitionLink href="/jadwal" className="btn btn-primary">
              Lihat Jadwal Minggu Ini
            </TransitionLink>
            <TransitionLink href="/kelas" className="btn btn-secondary">
              Jenis Kelas
            </TransitionLink>
          </div>
        </div>
      </div>

      {/* Quiet pointer to the schedule, which is the next thing on the page. */}
      <div className="layer-content relative shell pb-8">
        <a
          href="#jadwal-terdekat"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-accent)]"
        >
          Sesi terdekat
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
            <path
              d="M5 1v11M1 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
