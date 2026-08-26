import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import TransitionLink from "@/components/TransitionLink";
import { BOOKING_LEAD_TIME_HOURS, STUDIO_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description: `Ketentuan penggunaan situs ${STUDIO_NAME}, termasuk cara pemesanan kelas, konfirmasi, dan batas waktu pemesanan.`,
  alternates: { canonical: "/ketentuan-layanan" },
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

export default function TermsPage() {
  return (
    <div className="shell section">
      <SectionHeader
        as="h1"
        eyebrow="Ketentuan"
        headline="Ketentuan layanan"
        description="Halaman ini menjelaskan cara situs ini dipakai untuk memesan kelas dan hal-hal yang perlu diketahui sebelum memesan."
        cta={
          <TransitionLink href="/kebijakan-privasi" className="btn btn-secondary">
            Kebijakan Privasi
          </TransitionLink>
        }
        className="mb-10"
      />

      <div className="flex max-w-3xl flex-col gap-8">
        <Block title="Ruang lingkup">
          <p>
            Situs ini menampilkan jadwal kelas dan menerima permintaan
            pemesanan. Dengan menggunakan situs ini, Anda menyetujui ketentuan
            di halaman ini.
          </p>
        </Block>

        <Block title="Status pemesanan">
          <p>
            Mengirim form pemesanan berarti mengajukan permintaan tempat pada
            sebuah sesi. Permintaan itu belum final sampai studio
            mengonfirmasinya lewat WhatsApp.
          </p>
          <p>
            Sisa tempat yang ditampilkan di jadwal bersifat indikatif dan dapat
            berubah bila ada permintaan lain yang masuk lebih dulu.
          </p>
        </Block>

        <Block title="Batas waktu pemesanan">
          <p>
            Sebuah sesi berhenti menerima pemesanan {BOOKING_LEAD_TIME_HOURS}{" "}
            jam sebelum kelas dimulai. Sesi yang sudah dimulai tidak dapat
            dipesan, termasuk sesi yang jamnya sudah lewat pada hari yang sama.
          </p>
          <p>
            Bila kuota sebuah sesi sudah terisi penuh, yang tersedia adalah
            daftar tunggu, bukan pemesanan.
          </p>
        </Block>

        <Block title="Pembatalan dan pemindahan jadwal">
          <p>
            Ketentuan pembatalan oleh peserta dan pemindahan jadwal ke sesi lain
            akan diisi oleh pemilik studio dan ditampilkan di bagian ini.
          </p>
          <p>
            Sampai bagian tersebut diisi, permintaan pembatalan atau pemindahan
            jadwal disampaikan langsung ke studio lewat WhatsApp.
          </p>
        </Block>

        <Block title="Perubahan jadwal oleh studio">
          <p>
            Studio dapat membatalkan atau memindahkan sebuah sesi, misalnya pada
            hari libur atau bila instruktur berhalangan. Sesi yang dibatalkan
            akan hilang dari jadwal di situs ini.
          </p>
        </Block>

        <Block title="Pembayaran">
          <p>
            Tidak ada pembayaran yang diproses di situs ini. Cara dan waktu
            pembayaran disepakati lewat percakapan WhatsApp dengan studio.
          </p>
        </Block>

        <Block title="Tanggung jawab peserta">
          <p>
            Peserta mengikuti kelas sesuai kemampuan masing-masing dan dapat
            berhenti kapan saja selama kelas berlangsung. Bila Anda memiliki
            kondisi kesehatan tertentu, sedang hamil, atau baru pulih dari
            cedera, konsultasikan lebih dulu dengan tenaga medis yang menangani
            Anda sebelum mengikuti kelas, dan sampaikan hal itu kepada studio
            saat memesan.
          </p>
          <p>
            Situs ini tidak memberikan nasihat medis dan tidak menjanjikan hasil
            apa pun dari mengikuti kelas.
          </p>
        </Block>

        <Block title="Ketepatan informasi">
          <p>
            Jadwal, durasi dan kuota ditampilkan sesuai data yang dimasukkan
            studio dan dapat berubah sewaktu-waktu. Bila ada perbedaan antara
            situs dan konfirmasi dari studio, yang berlaku adalah konfirmasi
            dari studio.
          </p>
        </Block>

        <Block title="Perubahan ketentuan">
          <p>
            Ketentuan ini dapat diperbarui bila layanan berubah. Versi terbaru
            selalu ditampilkan di halaman ini.
          </p>
        </Block>
      </div>
    </div>
  );
}
