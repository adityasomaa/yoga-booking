"use client";

/**
 * Footer.
 *
 * Every page ends with a call to action, and the footer CTA SWAPS TARGET when
 * the visitor is already on the page it would otherwise point to -- sending
 * someone to the page they are already reading is a dead end.
 */

import { usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import WhatsAppLink from "@/components/WhatsAppLink";
import SectionHeader from "@/components/SectionHeader";
import { NAV_ITEMS } from "@/components/SiteHeader";
import {
  OPENING_HOURS,
  STUDIO_ADDRESS,
  STUDIO_CITY,
  STUDIO_NAME,
  isPending,
} from "@/lib/config";

/** Picks a CTA that is never the page the visitor is already on. */
function resolveCta(pathname: string): {
  href: string;
  label: string;
  headline: string;
  description: string;
} {
  if (pathname.startsWith("/jadwal")) {
    return {
      href: "/kelas",
      label: "Lihat Jenis Kelas",
      headline: "Belum yakin kelas mana",
      description:
        "Setiap jenis kelas punya tempo, durasi dan tingkat yang berbeda. Halaman kelas menjelaskan isinya satu per satu.",
    };
  }
  if (pathname.startsWith("/kelas")) {
    return {
      href: "/jadwal",
      label: "Lihat Jadwal Minggu Ini",
      headline: "Sudah tahu kelasnya",
      description:
        "Jadwal mingguan menampilkan hari, jam dan sisa tempat untuk setiap sesi.",
    };
  }
  if (pathname.startsWith("/paket")) {
    return {
      href: "/jadwal",
      label: "Lihat Jadwal Minggu Ini",
      headline: "Pilih sesi lebih dulu",
      description:
        "Paket dikonfirmasi lewat percakapan. Untuk memulai, pilih satu sesi dari jadwal mingguan.",
    };
  }
  if (pathname.startsWith("/kontak")) {
    return {
      href: "/jadwal",
      label: "Lihat Jadwal Minggu Ini",
      headline: "Langsung pesan kelas",
      description:
        "Jadwal mingguan menampilkan hari, jam dan sisa tempat untuk setiap sesi.",
    };
  }
  return {
    href: "/jadwal",
    label: "Lihat Jadwal Minggu Ini",
    headline: "Mulai dari jadwal",
    description:
      "Pilih sesi yang cocok, lihat sisa tempat, lalu kirim pemesanan lewat WhatsApp.",
  };
}

export default function SiteFooter() {
  const pathname = usePathname();
  const cta = resolveCta(pathname);
  const year = 2026;

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface-alt)]">
      {/* Closing CTA -- present on every page. */}
      <div className="shell section">
        <SectionHeader
          eyebrow="Langkah berikutnya"
          headline={cta.headline}
          description={cta.description}
          cta={
            <>
              <TransitionLink href={cta.href} className="btn btn-primary">
                {cta.label}
              </TransitionLink>
              <WhatsAppLink
                variant="secondary"
                label="Tanya Lewat WhatsApp"
                intro={`Halo ${STUDIO_NAME}, saya ingin bertanya tentang kelas yoga.`}
              />
            </>
          }
        />
      </div>

      <hr className="rule" />

      <div className="shell py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium">{STUDIO_NAME}</p>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Kelas yoga terjadwal di {STUDIO_CITY}.
            </p>
          </div>

          <nav aria-label="Navigasi footer">
            <p className="t-eyebrow">Halaman</p>
            <ul className="mt-3 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    className="text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-accent)]"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="t-eyebrow">Lokasi</p>
            <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
              {isPending(STUDIO_ADDRESS) ? (
                <span>
                  Alamat lengkap belum diisi.
                  <span className="sr-only">
                    {" "}
                    Menunggu konfirmasi pemilik studio.
                  </span>
                </span>
              ) : (
                STUDIO_ADDRESS
              )}
            </p>
            <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
              {isPending(OPENING_HOURS)
                ? "Jam operasional belum diisi."
                : OPENING_HOURS.map((h) => `${h.days} ${h.open}-${h.close}`).join(", ")}
            </p>
          </div>

          <div>
            <p className="t-eyebrow">Ketentuan</p>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <TransitionLink
                  href="/kebijakan-privasi"
                  className="text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-accent)]"
                >
                  Kebijakan Privasi
                </TransitionLink>
              </li>
              <li>
                <TransitionLink
                  href="/ketentuan-layanan"
                  className="text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-accent)]"
                >
                  Ketentuan Layanan
                </TransitionLink>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-xs text-[var(--color-ink-soft)]">
          &copy; {year} {STUDIO_NAME}.
        </p>
      </div>
    </footer>
  );
}
