import type { Metadata } from "next";
import Hero from "@/components/Hero";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import TransitionLink from "@/components/TransitionLink";
import WhatsAppLink from "@/components/WhatsAppLink";
import UpcomingSessions from "@/components/schedule/UpcomingSessions";
import { scheduledClassTypes, studioTodayISO } from "@/lib/schedule";
import { STUDIO_CITY, STUDIO_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `${STUDIO_NAME} - Kelas Yoga Terjadwal di ${STUDIO_CITY}`,
  description: `Jadwal kelas yoga mingguan di ${STUDIO_CITY}. Lihat jenis kelas, jam, dan sisa tempat, lalu pesan sesi lewat WhatsApp.`,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  /* Build/revalidate-time seed only. The client re-anchors to the visitor's
   * real clock on mount (see useNow + the anchor effect in WeekSchedule), so a
   * stale value here can never make a past session look bookable. */
  // eslint-disable-next-line react-hooks/purity
  const todayISO = studioTodayISO(Date.now());
  const classes = scheduledClassTypes();

  return (
    <>
      <Hero />

      {/* --- Sesi terdekat --- */}
      <section id="jadwal-terdekat" className="shell section">
        <SectionHeader
          eyebrow="Jadwal"
          headline="Sesi terdekat minggu ini"
          description="Empat sesi paling dekat dari sekarang, lengkap dengan sisa tempat. Sesi yang sudah lewat tidak ditampilkan."
          cta={
            <TransitionLink href="/jadwal" className="btn btn-primary">
              Lihat Jadwal Lengkap
            </TransitionLink>
          }
          className="mb-8"
        />
        <UpcomingSessions initialDateISO={todayISO} />
      </section>

      <div className="shell">
        <hr className="rule" />
      </div>

      {/* --- Ringkasan jenis kelas --- */}
      <section className="shell section">
        <SectionHeader
          eyebrow="Jenis kelas"
          headline="Empat jenis kelas terjadwal"
          description="Setiap jenis kelas punya tempo, durasi dan tingkat yang berbeda. Pilih yang paling sesuai sebelum memesan sesi."
          cta={
            <TransitionLink href="/kelas" className="btn btn-secondary">
              Lihat Semua Kelas
            </TransitionLink>
          }
          className="mb-8"
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {classes.map((c, i) => (
            <li key={c.slug}>
              <Reveal delayMs={i * 70}>
                <TransitionLink
                  href={`/kelas/${c.slug}`}
                  className="card group flex h-full flex-col overflow-hidden transition-colors hover:border-[var(--color-accent)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/graphics/class-${c.slug}.svg`}
                    alt={`Grafik abstrak sebagai penanda kelas ${c.name}. Bukan dokumentasi kelas.`}
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="t-title">{c.name}</h3>
                    <p className="text-xs text-[var(--color-ink-soft)]">
                      {c.durationMinutes} menit &middot;{" "}
                      <span className="capitalize">
                        {c.level.replace("-", " ")}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {c.summary}
                    </p>
                  </div>
                </TransitionLink>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <div className="shell">
        <hr className="rule" />
      </div>

      {/* --- Untuk pemula --- */}
      <section className="shell section">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeader
            eyebrow="Untuk pemula"
            headline="Baru pertama kali ikut kelas"
            description="Kalau ini kelas yoga pertama Anda, mulai dari kelas bertempo pelan. Instruktur menjelaskan setiap pose langkah demi langkah dan menyebutkan versi yang lebih ringan bila sebuah pose belum terasa nyaman."
            cta={
              <>
                <TransitionLink href="/kelas/hatha" className="btn btn-primary">
                  Lihat Kelas Hatha
                </TransitionLink>
                <WhatsAppLink
                  variant="secondary"
                  label="Tanya Kelas untuk Pemula"
                  intro={`Halo ${STUDIO_NAME}, saya baru pertama kali ikut kelas yoga.`}
                  lines={["Kelas mana yang cocok untuk pemula?"]}
                />
              </>
            }
          />

          <Reveal>
            <div className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/graphics/band-pemula.svg"
                alt="Grafik abstrak berupa busur dan bidang lengkung. Bukan foto kelas."
                width={1400}
                height={420}
                className="w-full object-cover"
                loading="lazy"
              />
              <ul className="flex flex-col gap-3 p-5 text-sm">
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-[var(--color-accent)]">
                    01
                  </span>
                  <span>
                    Pilih sesi dari jadwal mingguan dan periksa sisa tempatnya.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-[var(--color-accent)]">
                    02
                  </span>
                  <span>
                    Isi form pemesanan, termasuk tingkat pengalaman Anda.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span aria-hidden="true" className="text-[var(--color-accent)]">
                    03
                  </span>
                  <span>
                    Pemesanan dilanjutkan dan dikonfirmasi lewat WhatsApp.
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
