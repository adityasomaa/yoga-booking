import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import TransitionLink from "@/components/TransitionLink";
import WhatsAppLink from "@/components/WhatsAppLink";
import PrivateClassForm from "@/components/booking/PrivateClassForm";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import {
  OPENING_HOURS,
  STUDIO_ADDRESS,
  STUDIO_CITY,
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM,
  STUDIO_MAPS_URL,
  STUDIO_NAME,
  WHATSAPP_NUMBER,
  isPending,
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Kontak dan Kelas Privat",
  description: `Hubungi ${STUDIO_NAME} di ${STUDIO_CITY} untuk menanyakan kelas, paket, atau mengajukan kelas privat.`,
  alternates: { canonical: "/kontak" },
};

/** Renders a confirmed value, or a clearly-marked pending state. */
function Fact({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="border-b border-[var(--color-line)] py-3.5 last:border-0">
      <dt className="t-eyebrow">{label}</dt>
      <dd className="mt-1.5 text-sm">
        {isPending(value) ? (
          <span className="text-[var(--color-ink-soft)]">
            Belum diisi
            <span className="sr-only"> — menunggu konfirmasi pemilik studio</span>
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export default function KontakPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Kontak", path: "/kontak" },
            ])
          ),
        }}
      />

      <div className="shell section">
        <SectionHeader
          as="h1"
          eyebrow="Kontak"
          headline="Hubungi studio"
          description="Pertanyaan tentang kelas, paket dan pemesanan dijawab lewat WhatsApp. Untuk kelas privat, gunakan form di halaman ini."
          cta={
            <WhatsAppLink
              label="Kirim Pesan WhatsApp"
              intro={`Halo ${STUDIO_NAME}, saya ingin bertanya.`}
            />
          }
          className="mb-10"
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <div className="card p-6">
              <h2 className="t-title">Informasi studio</h2>
              <dl className="mt-4">
                <Fact label="Kota" value={STUDIO_CITY} />
                <Fact label="Alamat" value={STUDIO_ADDRESS} />
                <Fact
                  label="Jam operasional"
                  value={
                    isPending(OPENING_HOURS)
                      ? null
                      : OPENING_HOURS.map(
                          (h) => `${h.days} ${h.open}-${h.close}`
                        ).join(", ")
                  }
                />
                <Fact
                  label="WhatsApp"
                  value={isPending(WHATSAPP_NUMBER) ? null : `+${WHATSAPP_NUMBER}`}
                />
                <Fact label="Email" value={STUDIO_EMAIL} />
                <Fact
                  label="Instagram"
                  value={isPending(STUDIO_INSTAGRAM) ? null : `@${STUDIO_INSTAGRAM}`}
                />
              </dl>

              {isPending(STUDIO_MAPS_URL) ? null : (
                <a
                  href={STUDIO_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary mt-5 w-full"
                >
                  Buka di Google Maps
                </a>
              )}

              <p className="mt-5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-line)] p-3.5 text-xs leading-relaxed text-[var(--color-ink-soft)]">
                Catatan untuk pemilik studio: alamat, jam operasional dan nomor
                WhatsApp sengaja dibiarkan kosong karena belum dikonfirmasi.
                Semuanya diisi di satu berkas konfigurasi.
              </p>
            </div>
          </Reveal>

          <div>
            <SectionHeader
              eyebrow="Kelas privat"
              headline="Ajukan kelas privat"
              description="Isi keterangan singkat di bawah. Setelah dikirim, percakapan dilanjutkan di WhatsApp untuk menyepakati jadwal dan materinya."
              cta={
                <TransitionLink href="/kelas/private" className="btn btn-secondary">
                  Detail Kelas Privat
                </TransitionLink>
              }
              className="mb-6"
            />
            <PrivateClassForm />
          </div>
        </div>
      </div>
    </>
  );
}
