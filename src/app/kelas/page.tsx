import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import TransitionLink from "@/components/TransitionLink";
import WhatsAppLink from "@/components/WhatsAppLink";
import { CLASS_TYPES } from "@/data/studio";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { STUDIO_CITY, STUDIO_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Jenis Kelas Yoga",
  description: `Jenis kelas yoga yang tersedia di ${STUDIO_CITY}: hatha, vinyasa, yin, prenatal dan kelas privat. Lihat tingkat, durasi dan apa yang perlu dibawa.`,
  alternates: { canonical: "/kelas" },
};

export default function KelasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Kelas", path: "/kelas" },
            ])
          ),
        }}
      />

      <div className="shell section">
        <SectionHeader
          as="h1"
          eyebrow="Kelas"
          headline="Jenis kelas yoga"
          description="Jenis kelas menentukan tempo, durasi dan tingkat kesulitannya. Jadwal menentukan kapan kelas itu berjalan. Halaman ini menjelaskan bagian yang pertama."
          cta={
            <TransitionLink href="/jadwal" className="btn btn-primary">
              Lihat Jadwal Minggu Ini
            </TransitionLink>
          }
          className="mb-10"
        />

        <ul className="grid gap-5 md:grid-cols-2">
          {CLASS_TYPES.map((c, i) => (
            <li key={c.slug}>
              <Reveal delayMs={i * 60}>
                <article className="card flex h-full flex-col overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/graphics/class-${c.slug}.svg`}
                    alt={`Grafik abstrak sebagai penanda kelas ${c.name}. Bukan dokumentasi kelas.`}
                    width={800}
                    height={600}
                    className="aspect-[16/9] w-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="t-title">{c.name}</h2>
                      <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5 text-xs capitalize text-[var(--color-ink-soft)]">
                        {c.level.replace("-", " ")}
                      </span>
                      <span className="text-xs text-[var(--color-ink-soft)]">
                        {c.durationMinutes} menit
                      </span>
                    </div>

                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {c.summary}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <TransitionLink
                        href={`/kelas/${c.slug}`}
                        className="btn btn-secondary"
                      >
                        Detail Kelas
                      </TransitionLink>
                      {c.byRequestOnly ? (
                        <WhatsAppLink
                          variant="quiet"
                          label="Tanya Kelas Privat"
                          intro={`Halo ${STUDIO_NAME}, saya ingin menanyakan kelas privat.`}
                        />
                      ) : (
                        <TransitionLink href="/jadwal" className="btn btn-quiet">
                          Lihat Jadwalnya
                        </TransitionLink>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
