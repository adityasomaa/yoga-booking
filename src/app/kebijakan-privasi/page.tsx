import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import TransitionLink from "@/components/TransitionLink";
import ConsentControls from "@/components/ConsentControls";
import { STUDIO_NAME, isPending, STUDIO_EMAIL, WHATSAPP_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: `Penjelasan data apa yang dikumpulkan situs ${STUDIO_NAME}, bagaimana data itu dipakai, dan pilihan yang tersedia untuk pengunjung.`,
  alternates: { canonical: "/kebijakan-privasi" },
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--color-line)] pt-6">
      <h2 className="t-title">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="shell section">
      <SectionHeader
        as="h1"
        eyebrow="Ketentuan"
        headline="Kebijakan privasi"
        description="Halaman ini menjelaskan data apa yang diterima situs ini, untuk apa data itu dipakai, dan pilihan yang tersedia untuk Anda."
        cta={
          <TransitionLink href="/ketentuan-layanan" className="btn btn-secondary">
            Ketentuan Layanan
          </TransitionLink>
        }
        className="mb-10"
      />

      <div className="flex max-w-3xl flex-col gap-8">
        <Block title="Data yang dikumpulkan">
          <p>
            Saat Anda mengisi form pemesanan kelas atau form kelas privat, situs
            ini menerima nama, nomor WhatsApp, sesi yang dipilih, jumlah orang,
            tingkat pengalaman, dan catatan yang Anda tulis sendiri.
          </p>
          <p>
            Situs ini tidak meminta data pembayaran, nomor identitas, atau data
            kesehatan. Kalau Anda menuliskan informasi seperti itu di kolom
            catatan, informasi tersebut ikut terkirim sebagai bagian dari pesan.
          </p>
        </Block>

        <Block title="Cara data disimpan">
          <p>
            Saat ini situs belum terhubung ke basis data. Data pemesanan
            disimpan di penyimpanan lokal browser Anda sendiri agar alur
            pemesanan bisa ditampilkan dari awal sampai akhir. Data itu tidak
            dikirim ke server situs ini dan tidak terlihat oleh pengunjung lain.
          </p>
          <p>
            Ketika Anda menekan tombol kirim, isi form disusun menjadi pesan
            WhatsApp. Pengiriman pesan itu terjadi di aplikasi WhatsApp Anda dan
            tunduk pada ketentuan WhatsApp.
          </p>
        </Block>

        <Block title="Cookie dan penyimpanan browser">
          <p>
            Situs ini tidak memasang skrip iklan maupun skrip analitik pihak
            ketiga. Penyimpanan browser dipakai untuk dua hal:
          </p>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              <strong className="font-medium text-[var(--color-ink)]">
                Diperlukan.
              </strong>{" "}
              Menyimpan data pemesanan demo dan pilihan Anda pada banner
              persetujuan. Tanpa ini alur pemesanan tidak bisa ditampilkan.
            </li>
            <li>
              <strong className="font-medium text-[var(--color-ink)]">
                Preferensi.
              </strong>{" "}
              Bila Anda mengizinkan, situs mengingat nama dan nomor WhatsApp
              agar tidak perlu diketik ulang. Bila Anda menolak atau mencabut
              izin, data yang sudah diingat langsung dihapus.
            </li>
          </ul>
        </Block>

        <Block title="Pilihan Anda">
          <p>
            Anda dapat mengubah atau mencabut persetujuan kapan saja lewat
            tombol di bawah ini.
          </p>
          <ConsentControls />
        </Block>

        <Block title="Berbagi data">
          <p>
            Isi form tidak dijual dan tidak dibagikan ke pihak ketiga untuk
            keperluan pemasaran. Data hanya sampai ke studio melalui pesan
            WhatsApp yang Anda kirim sendiri.
          </p>
        </Block>

        <Block title="Menghapus data">
          <p>
            Data pemesanan yang tersimpan di browser dapat dihapus kapan saja
            dengan menekan tombol Reset Demo di halaman admin, atau dengan
            membersihkan data situs lewat pengaturan browser Anda.
          </p>
          <p>
            Untuk pesan yang sudah dikirim lewat WhatsApp, permintaan penghapusan
            disampaikan langsung ke studio.
          </p>
        </Block>

        <Block title="Menghubungi kami">
          <p>
            Pertanyaan mengenai kebijakan ini dapat disampaikan lewat kontak
            studio.
            {isPending(STUDIO_EMAIL) && isPending(WHATSAPP_NUMBER)
              ? " Kontak resmi studio belum diisi di konfigurasi situs."
              : ""}
          </p>
          <p>
            <TransitionLink
              href="/kontak"
              className="text-[var(--color-accent)] underline underline-offset-2"
            >
              Buka halaman kontak
            </TransitionLink>
          </p>
        </Block>

        <Block title="Perubahan kebijakan">
          <p>
            Kebijakan ini dapat diperbarui bila cara kerja situs berubah,
            misalnya ketika basis data atau metode pembayaran ditambahkan.
            Versi terbaru selalu ditampilkan di halaman ini.
          </p>
        </Block>
      </div>
    </div>
  );
}
