import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import TransitionLink from "@/components/TransitionLink";
import WhatsAppLink from "@/components/WhatsAppLink";
import { PACKAGES } from "@/data/studio";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { STUDIO_CITY, STUDIO_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Paket Kelas Yoga",
  description: `Pilihan paket kelas yoga di ${STUDIO_CITY}: sekali datang, paket beberapa kali, dan bulanan. Ketentuan dan biaya dikonfirmasi lewat WhatsApp.`,
  alternates: { canonical: "/paket" },
};

export default function PaketPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Paket", path: "/paket" },
            ])
          ),
        }}
      />

      <div className="shell section">
        <SectionHeader
          as="h1"
          eyebrow="Paket"
          headline="Paket kelas yoga"
          description="Tiga bentuk paket, dari sekali datang sampai bulanan. Rincian biaya dan masa berlaku dikonfirmasi langsung lewat WhatsApp."
          cta={
            <WhatsAppLink
              label="Tanya Paket Kelas"
              intro={`Halo ${STUDIO_NAME}, saya ingin menanyakan paket kelas.`}
            />
          }
          className="mb-10"
        />

        <ul className="grid gap-5 lg:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <li key={p.slug}>
              <Reveal delayMs={i * 70}>
                <article className="card flex h-full flex-col gap-4 p-6">
                  <h2 className="t-title">{p.name}</h2>
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    {p.summary}
                  </p>

                  <ul className="flex flex-col gap-2.5 border-t border-[var(--color-line)] pt-4">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex gap-2.5 text-sm">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1 w-1 flex-none rounded-full bg-[var(--color-accent)]"
                        />
                        <span className="text-[var(--color-ink-soft)]">{pt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    <WhatsAppLink
                      variant="secondary"
                      className="w-full"
                      label={`Tanya Paket ${p.name}`}
                      intro={`Halo ${STUDIO_NAME}, saya ingin menanyakan paket kelas.`}
                      lines={[`Paket yang ditanyakan: ${p.name}`]}
                    />
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-6">
          <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-soft)]">
            Harga paket belum ditampilkan di situs ini karena belum
            dikonfirmasi. Semua pertanyaan biaya diarahkan ke percakapan
            WhatsApp.
          </p>
        </Reveal>
      </div>

      <div className="shell">
        <hr className="rule" />
      </div>

      {/* Kelas privat -- jalur terpisah dari paket reguler. */}
      <section className="shell section">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeader
            eyebrow="Kelas privat"
            headline="Sesi privat atau kelompok kecil"
            description="Kelas privat diatur per permintaan, sehingga jadwal, durasi dan fokus materinya disepakati lebih dulu. Kelas ini tidak muncul di jadwal mingguan."
            cta={
              <>
                <TransitionLink href="/kontak" className="btn btn-primary">
                  Ajukan Kelas Privat
                </TransitionLink>
                <TransitionLink href="/kelas/private" className="btn btn-secondary">
                  Detail Kelas Privat
                </TransitionLink>
              </>
            }
          />
          <Reveal>
            <div className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/graphics/band-paket.svg"
                alt="Grafik abstrak berupa busur dan bidang lengkung. Bukan foto kelas."
                width={1400}
                height={420}
                className="w-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
