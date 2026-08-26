import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import TransitionLink from "@/components/TransitionLink";
import WhatsAppLink from "@/components/WhatsAppLink";
import InstructorSlot from "@/components/InstructorSlot";
import { CLASS_TYPES } from "@/data/studio";
import { getClassType } from "@/lib/schedule";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { STUDIO_CITY, STUDIO_NAME } from "@/lib/config";

export function generateStaticParams() {
  return CLASS_TYPES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getClassType(slug);
  if (!c) return { title: "Kelas tidak ditemukan" };
  return {
    title: `Kelas ${c.name}`,
    description: `Kelas ${c.name} di ${STUDIO_CITY}, durasi ${c.durationMinutes} menit, tingkat ${c.level.replace("-", " ")}. ${c.summary}`,
    alternates: { canonical: `/kelas/${c.slug}` },
  };
}

export default async function KelasDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getClassType(slug);
  if (!c) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Kelas", path: "/kelas" },
              { name: c.name, path: `/kelas/${c.slug}` },
            ])
          ),
        }}
      />

      <div className="shell section">
        <nav aria-label="Remah roti" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <li>
              <TransitionLink href="/kelas" className="hover:text-[var(--color-accent)]">
                Kelas
              </TransitionLink>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-[var(--color-ink)]">{c.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <SectionHeader
              as="h1"
              eyebrow={`${c.durationMinutes} menit · ${c.level.replace("-", " ")}`}
              headline={`Kelas ${c.name}`}
              description={c.summary}
              cta={
                c.byRequestOnly ? (
                  <>
                    <TransitionLink href="/kontak" className="btn btn-primary">
                      Ajukan Kelas Privat
                    </TransitionLink>
                    <WhatsAppLink
                      variant="secondary"
                      label={`Tanya Kelas ${c.name}`}
                      intro={`Halo ${STUDIO_NAME}, saya ingin menanyakan kelas ${c.name}.`}
                    />
                  </>
                ) : (
                  <>
                    <TransitionLink href="/jadwal" className="btn btn-primary">
                      Lihat Jadwal Kelas Ini
                    </TransitionLink>
                    <WhatsAppLink
                      variant="secondary"
                      label={`Tanya Kelas ${c.name}`}
                      intro={`Halo ${STUDIO_NAME}, saya ingin menanyakan kelas ${c.name}.`}
                    />
                  </>
                )
              }
            />

            <div className="mt-8 flex flex-col gap-6">
              <div>
                <h2 className="t-title">Isi kelas</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {c.description}
                </p>
              </div>

              <div>
                <h2 className="t-title">Cocok untuk</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {c.suitableFor}
                </p>
              </div>

              <div>
                <h2 className="t-title">Yang perlu dibawa</h2>
                <ul className="mt-2 flex flex-col gap-2">
                  {c.bring.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2.5 text-sm text-[var(--color-ink-soft)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1 w-1 flex-none rounded-full bg-[var(--color-accent)]"
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Reveal className="flex flex-col gap-5">
            <div className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/graphics/class-${c.slug}.svg`}
                alt={`Grafik abstrak sebagai penanda kelas ${c.name}. Bukan dokumentasi kelas.`}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
              />
              <dl className="grid grid-cols-2 gap-4 p-5 text-sm">
                <div>
                  <dt className="t-eyebrow">Durasi</dt>
                  <dd className="mt-1">{c.durationMinutes} menit</dd>
                </div>
                <div>
                  <dt className="t-eyebrow">Tingkat</dt>
                  <dd className="mt-1 capitalize">{c.level.replace("-", " ")}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="t-eyebrow">Pemesanan</dt>
                  <dd className="mt-1 text-[var(--color-ink-soft)]">
                    {c.byRequestOnly
                      ? "Diatur lewat permintaan terpisah, tidak muncul di jadwal mingguan."
                      : "Lewat jadwal mingguan, dikonfirmasi di WhatsApp."}
                  </dd>
                </div>
              </dl>
            </div>

            <InstructorSlot />
          </Reveal>
        </div>
      </div>
    </>
  );
}
