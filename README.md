# Yoga Studio — Sistem Booking Kelas

Sistem booking kelas yoga milik sendiri, tanpa biaya langganan bulanan.

- **Live:** https://yogabooking.onyxcreative.asia
- **Alias Vercel:** https://yoga-booking-id.vercel.app
- **Repo:** https://github.com/adityasomaa/yoga-booking

---

## ⚠️ HAL YANG PERLU DIKONFIRMASI PEMILIK STUDIO

Bagian ini ditulis lebih dulu karena isinya menentukan apakah situs sudah
boleh dipakai untuk publik atau belum.

### 1. Nama studio belum dikonfirmasi

Situs memakai **nama kerja "Yoga Studio"**. Nama asli studio belum saya
ketahui, dan saya juga **belum memastikan apakah Anda pemilik studio atau
penyelenggara kelas** — dua hal itu mengubah cara halaman "Tentang", struktur
data `LocalBusiness`, dan bahasa di halaman Kontak.

Menggantinya cukup **satu baris**:

```ts
// src/lib/config.ts
export const STUDIO_NAME = "Yoga Studio";
```

Satu baris itu memperbarui nav, seluruh `<title>`, wordmark, gambar OG,
structured data, dan semua template pesan WhatsApp.

### 2. Nama instruktur: tidak ada satu pun, dan itu disengaja

Tidak ada nama instruktur, foto, biodata, atau sertifikasi di mana pun.
Mengarang instruktur untuk studio yoga bukan cuma bohong — itu juga klaim
kredensial.

Halaman detail kelas memakai `src/components/InstructorSlot.tsx`, yang
menampilkan **peran saja** ("Instruktur kelas") dan menyatakan terang-terangan
bahwa bagian itu masih menunggu diisi.

### 3. Harga, alamat, jam operasional, dan nomor WhatsApp

Semuanya **kosong dan ditandai jelas**, tidak ada satu angka pun yang dikarang.
Di `src/lib/config.ts` nilainya bertipe `Pending` (`null`):

| Konstanta | Status | Muncul di |
|---|---|---|
| `WHATSAPP_NUMBER` | belum diisi | semua tombol WhatsApp, form booking |
| `STUDIO_ADDRESS` | belum diisi | footer, halaman Kontak, structured data |
| `STUDIO_POSTAL_CODE` | belum diisi | structured data |
| `OPENING_HOURS` | belum diisi | footer, halaman Kontak |
| `STUDIO_EMAIL` | belum diisi | halaman Kontak |
| `STUDIO_INSTAGRAM` | belum diisi | halaman Kontak, `sameAs` |
| `STUDIO_MAPS_URL` | belum diisi | halaman Kontak |
| Harga kelas & paket | **tidak ada sama sekali** | — |

Selama `WHATSAPP_NUMBER` masih kosong, tombol WhatsApp tampil sebagai tombol
nonaktif bertanda jelas, bukan tautan ke nomor karangan.

Harga sengaja **tidak ada tempatnya** di struktur data. Halaman Paket
menjelaskan bentuk paket lalu mengarahkan ke konsultasi WhatsApp.

### 4. Riset kontak — apa yang saya cari dan kenapa hasilnya kosong

Sebelum memakai placeholder, saya menelusuri Google untuk mencari kontak resmi
yang dipublikasikan sendiri oleh bisnisnya. Yang saya cari:

1. Postingan Threads dari pemilik studio yoga Bandung yang membahas biaya
   sistem booking berlangganan.
2. `"studio yoga" Bandung booking kelas Instagram jadwal`
3. Penelusuran khusus soal keluhan harga platform booking studio di Indonesia.

**Hasil: tidak bisa diatribusikan.** Penelusuran memunculkan banyak studio
yoga Bandung — antara lain Elements Yoga Studio, Danta Yoga, Kalm Studio, Real
Yoga Bandung, NLV Studio, Amora Yoga, dan Bumi Yoga Studio — tetapi **tidak ada
satu pun yang bisa saya pastikan sebagai penulis postingan Threads itu.**
Postingan Threads yang muncul di hasil pencarian isinya orang **mencari**
rekomendasi studio yoga, bukan pemilik studio mencari alternatif sistem booking.

Karena itu saya **tidak mengambil nomor, alamat, atau jam dari mana pun.**
Memilih salah satu dari daftar di atas sama saja menebak, dan memakai nomor
dari direktori pihak ketiga persis hal yang diminta untuk dihindari.

Begitu Anda menyebutkan nama studionya, saya bisa cek Google Maps / Instagram
resminya dan mengisi konstanta di atas dari sumber yang benar-benar milik
bisnisnya.

### 5. Logo dan site icon

Bisnisnya belum teridentifikasi, jadi belum ada logo asli yang bisa diambil.
Site icon saat ini adalah **wordmark buatan sendiri** berupa lengkung terbuka,
dibuat oleh `scripts/generate-graphics.mjs`, **berlatar transparan** (tidak ada
`<rect>` latar di `public/icon.svg`). Gambar OG memakai wordmark yang sama,
bukan foto stok.

Kalau studio sudah punya logo, ganti `public/icon.svg` dan sesuaikan
`src/app/opengraph-image.tsx`.

---

## Apa yang nyata dan apa yang masih lokal

Ini bagian paling penting untuk dipahami sebelum dipakai ke pelanggan asli.

### ✅ Nyata dan berjalan penuh

- **Ekspansi jadwal berulang.** Sesi diturunkan dari pola mingguan, jadi minggu
  depan dan seterusnya terbentuk otomatis tanpa mengetik ulang tanggal.
- **Pengecualian tanggal.** Libur atau instruktur berhalangan menghapus sesi
  dari jadwal peserta.
- **Semua aturan booking.** Kuota, daftar tunggu, sesi lewat, batas waktu
  pemesanan — semuanya dihitung sungguhan (33/33 tes lolos, lihat di bawah).
- **Validasi server.** Server Action membangun ulang sesi dari pola jadwal,
  bukan mempercayai tanggal/jam/kuota kiriman browser.
- **Pesan WhatsApp.** Terisi otomatis, satu field per baris, plus URL halaman
  asal dan label tombol yang ditekan.
- **Cookie consent.** Benar-benar menggerakkan sesuatu (lihat bagian Cookie).
- **Structured data.** `LocalBusiness` + satu `Event` per sesi kelas.

### ⚠️ Masih lokal (belum ada backend)

- **Penyimpanan pemesanan.** Data tersimpan di `localStorage` browser
  pengunjung. **Tidak** terkirim ke server, **tidak** terlihat di perangkat
  lain, dan **tidak** terlihat oleh pemilik studio di HP-nya.
- **Halaman admin.** Membaca store lokal yang sama. Tanpa login. Murni peraga.
- **Hitungan kursi di sisi server.** Karena kursi terpakai baru ada di browser,
  server menerima angka itu dari klien, lalu **membatasinya**: menurunkan
  kembali kapasitas asli dari file data dan menolak apa pun yang melebihi
  kuota. Server belum bisa melihat pemesanan orang lain. Ini jujur disebutkan
  di komentar `src/app/actions.ts`.

Semua akses data lewat satu lapisan adapter, jadi menyambungkan database
adalah pekerjaan yang terkurung rapi:

```
src/lib/store/types.ts    kontrak BookingStore
src/lib/store/local.ts    AKTIF — localStorage
src/lib/store/remote.ts   SKELETON — skema tabel + langkah lengkap ada di sini
src/lib/store/index.ts    satu baris untuk berpindah adapter
```

`remote.ts` sudah berisi skema tabel yang disarankan dan catatan soal
penulisan atomik agar dua orang tidak bisa merebut kursi terakhir bersamaan.

### 💳 Payment gateway: belum ada, dan lapisannya sudah disiapkan

Tidak ada payment gateway. Pembayaran diatur lewat WhatsApp — itu pilihan,
bukan kekurangan.

`src/lib/payments.ts` berisi adapter kosong. Alur booking **sudah memanggil**
`settleBooking()` tepat di titik tempat langkah pembayaran seharusnya berada.
Menambahkan Midtrans / Xendit / QRIS berarti mengisi satu file dan menukar satu
export — alur booking tidak perlu dibongkar.

---

## Dua lapis data: Jenis Kelas vs Sesi

Ini pembeda utama dari booking studio foto. Studio foto menyewakan **ruangan
per jam**. Yoga menjual **kelas berjadwal dengan kuota**, satu kelas diikuti
banyak orang sampai penuh.

Situs kursus yang buruk mencampur keduanya, lalu peserta bingung mereka
mendaftar untuk jadwal yang mana. Di sini keduanya dipisah tegas:

| | Jenis Kelas | Sesi |
|---|---|---|
| Contoh | "Vinyasa" | "Vinyasa, Selasa 2 Sep, 18:00" |
| Punya | deskripsi, tingkat, durasi, bawaan | tanggal, jam, kuota, sisa tempat |
| Disimpan | ya, di `CLASS_TYPES` | **tidak** — diturunkan saat dibutuhkan |
| Halaman | `/kelas`, `/kelas/[slug]` | `/jadwal` |

Sesi **tidak pernah disimpan**. Sesi dihitung dengan cara memperluas pola
mingguan pada rentang tanggal, lalu membuang apa pun yang kena pengecualian.
Itulah yang membuat pemilik studio tidak perlu mengetik ulang jadwal tiap
minggu.

ID sesi berbentuk `<patternId>__<YYYY-MM-DD>`, jadi bisa diturunkan ulang dan
diverifikasi server tanpa database.

---

## Mengedit jadwal (untuk pemilik studio)

Semua ada di **satu file**: [`src/data/studio.ts`](src/data/studio.ts), dengan
komentar penjelasan di atasnya.

```ts
// Tambah kelas baru        -> CLASS_TYPES
// Ubah jadwal / jam / kuota -> WEEKLY_PATTERNS
// Tutup satu tanggal        -> DATE_EXCEPTIONS
// Ubah bentuk paket         -> PACKAGES
```

Contoh menutup studio satu hari:

```ts
{ date: "2026-12-25", patternId: "all", reason: "Studio libur" }
```

Contoh membatalkan satu kelas saja:

```ts
{ date: "2026-09-01", patternId: "sel-yin-malam", reason: "Instruktur berhalangan" }
```

Angka hari: `0` Minggu … `6` Sabtu. Jam format 24 jam, waktu WIB.

---

## Aturan booking

Diatur di `src/lib/config.ts`:

```ts
BOOKING_LEAD_TIME_HOURS = 2   // sesi ditutup 2 jam sebelum mulai
ALMOST_FULL_THRESHOLD   = 3   // sisa <= 3 -> "hampir penuh"
MAX_SEATS_PER_BOOKING   = 4   // maksimal per satu pemesanan
SCHEDULE_WEEKS_AHEAD    = 8   // batas navigasi ke depan
```

Lima status sesi, masing-masing **selalu punya label teks**, tidak pernah
dibedakan lewat warna saja:

| Status | Label | Bisa dipesan |
|---|---|---|
| `available` | "Tersedia — sisa N tempat" | ya |
| `almost-full` | "Hampir penuh — sisa N tempat" | ya |
| `full` | "Penuh" | tidak → **daftar tunggu** |
| `closed` | "Pemesanan ditutup" | tidak → daftar tunggu |
| `past` | "Sudah lewat" | tidak |

**Soal waktu:** Indonesia tidak punya DST, jadi WIB dihitung sebagai offset
tetap `+07:00`. Semua pengecekan "sudah lewat" membandingkan epoch milidetik
dari **jam sebenarnya** (`Date.now()`), bukan akumulasi frame animasi. Tab yang
ditinggal berjam-jam lalu dibuka lagi tetap memberi jawaban benar pada paint
pertama, karena `useNow()` juga membaca ulang saat `visibilitychange` dan
`focus`.

---

## Cookie: apa yang sebenarnya digerakkan

Banner cookie di sini bukan hiasan. Tidak ada skrip iklan atau analitik sama
sekali, jadi kategorinya cuma dua:

- **Diperlukan** — store booking demo dan pilihan consent itu sendiri.
- **Preferensi** — *mati* sampai diizinkan. Kalau diizinkan, form booking
  mengingat nama dan nomor WhatsApp. Kalau ditolak atau dicabut, data yang
  sudah diingat **langsung dihapus** (`clearRememberedDetails()`).

Pengunjung bisa mengubah atau mencabut kapan saja di `/kebijakan-privasi`.

Banner juga **menyingkir sepenuhnya** saat menu mobile atau modal terbuka, dan
pembungkusnya `pointer-events: none` sehingga tidak menelan klik tombol di
dekat tepi bawah layar.

---

## Perintah

```bash
npm run dev            # server pengembangan
npm run build          # build produksi
npm run verify         # kontras + z-index + aturan jadwal
npm run contrast       # audit WCAG AA semua pasangan warna
npm run audit:z        # pastikan nol raw z-index
npm run verify:rules   # 33 tes aturan jadwal & kuota
npm run graphics       # regenerate SVG (deterministik)
npm run fonts          # konversi TTF -> WOFF2
```

---

## Catatan teknis

**Stack.** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Lenis. Server Actions untuk validasi sisi server.

**Font.** Neue Montreal, dikonversi TTF → WOFF2 oleh `scripts/convert-fonts.mjs`
dan **di-host sendiri**. Tidak ada permintaan ke host font eksternal. File TTF
sumber sengaja tidak ikut di-commit; jalankan `npm run fonts` dengan
`NEUE_MONTREAL_DIR` menunjuk ke folder font berlisensi Anda.

**Gambar.** `images.unoptimized = true` disetel **sejak awal**. Kuota Vercel
Image Optimization di akun ini sudah habis; kalau optimizer menyala semua
gambar kena 402 dan produksi tampil kosong.

**Grafik.** Semua placeholder adalah SVG generatif deterministik dari
`scripts/generate-graphics.mjs` (PRNG mulberry32 di-seed dari nama file), jadi
bisa di-regenerate byte-identical. Bukan stok, bukan picsum. Tidak ada satu pun
yang berpura-pura jadi foto kelas atau wajah orang, dan alt text-nya menyebut
sendiri bahwa itu grafik abstrak. **Tidak ada grain, noise, atau tekstur
bintik** di mana pun — kedalaman visual datang dari gradasi, garis, dan bentuk.

**Z-index.** Satu skala token di `globals.css`, nol raw z-index di seluruh
codebase (diverifikasi `npm run audit:z`):

```
konten(1) < header(100) < menu mobile(200) < modal & kalender(300)
          < cookie(400) < curtain transisi(450) < skip link(500)
```

Cookie banner memang berada di atas menu mobile pada skala, tapi
**disembunyikan** saat menu terbuka — jadi urutan skala tetap utuh tanpa
menutupi menu.

**Transisi halaman.** Urutannya: *page closes → content change → scroll to top
→ page opens*. Semua pergantian konten terjadi saat tirai menutup.

Setiap langkah **membalapkan `setTimeout` dengan `requestAnimationFrame`**
(`src/lib/race-timer.ts`). rAF berhenti dijalankan saat tab dipindah ke
belakang; sequence yang bergantung pada rAF saja akan membeku dan tirai tidak
pernah terangkat. Ada juga failsafe keras: kalau router tidak pernah melapor,
tirai tetap naik.

Ada **dua loader**: satu untuk kunjungan pertama dan navigasi ke Home, satu
lagi yang lebih ringan untuk perpindahan halaman lain.

**Lenis.** Hanya menyala di desktop (≥1024px) dengan pointer presisi, saat
tidak ada modal/kalender terbuka, dan **tidak pernah** di halaman admin maupun
di tablet/mobile. Membajak momentum sentuh justru merusak form booking di
perangkat yang paling banyak dipakai memesan.

**Overflow.** Jadwal mingguan adalah sumber overflow horizontal paling sering.
Di bawah `lg` jadwal jadi **daftar per hari yang ditumpuk**, bukan 7 kolom
dipaksa muat. Di `lg` ke atas barulah pakai kolom, dan itu pun di dalam
kontainer `overflow-x: auto` sendiri. Honeypot form memakai `clip`, bukan
`absolute left-[-9999px]`.

**Aksesibilitas.** Semua pasangan warna ≥ 4.5:1 (22/22 lolos). Dropdown custom
mengimplementasi pola ARIA listbox penuh (panah, Home/End, type-ahead,
Enter/Space, Escape, fokus balik ke trigger) — tidak ada `<select>` native.
Perubahan sisa tempat diumumkan lewat live region. Teks yang dipecah per
segmen untuk animasi diberi `aria-label` sekali di induk dan `aria-hidden` di
tiap pecahannya.

**Komponen dari componentry.dev.** Diambil `text-animate` (dipatch: ARIA
`aria-label`/`aria-hidden` ditambahkan, dan `motion.create()` dipindah ke scope
modul agar tidak me-remount tiap render). **Dibuang** `spotlight-card`
(import monorepo rusak + glow ungu yang bentrok dengan arah desain) dan
`pricing-01` (harga `$0/$29/$99` di-hardcode — bertentangan langsung dengan
aturan nol harga). Sisa katalognya didominasi efek dither/pixel/matrix/plasma
yang bertabrakan dengan arah tenang, dan `noise-texture` yang memang dilarang.

---

## Struktur halaman

Nav 5 halaman: **Home · Jadwal · Kelas · Paket · Kontak**.
Rute `/admin` terpisah, tidak muncul di nav, dikecualikan dari sitemap, dan
diberi `noindex`.

Setiap section memakai `SectionHeader` dengan urutan tetap: **judul section →
headline → deskripsi singkat → CTA**. Footer juga berakhir dengan CTA, dan CTA
itu **bertukar target otomatis** kalau pengunjung sedang berada di halaman
tujuannya.

---

## Lisensi & kepemilikan

Kode ini milik pemilik studio. Tidak ada biaya langganan, tidak ada vendor
lock-in, tidak ada nama penyedia sistem booking mana pun yang disebut di
situs — itu urusan internal, bukan pesan untuk peserta.

---

## Hasil verifikasi di produksi

Diverifikasi di `https://yogabooking.onyxcreative.asia`, bukan hanya localhost.

### Rute dan aset
- **16/16 rute dan aset 200** di domain final (semua halaman, sitemap, robots,
  OG image, site icon, grafik SVG, kedua file font).
- **0 error console**, **29/29 request sukses**, dan **tidak ada satu pun
  request ke `/_next/image`** — optimizer benar-benar mati, jadi tidak ada
  risiko 402.
- **0 gambar broken** dari 13 gambar yang diperiksa.

### Overflow horizontal
Diperiksa di 9 halaman × 3 lebar (mobile, tablet, desktop):

| Lebar viewport terukur | Halaman | Offender | Halaman menggeser ke samping |
|---|---|---|---|
| 360 px | 9 | **0** | 0 |
| 753 px | 9 | **0** | 0 |
| 1425 px | 9 | **0** | 0 |

Jadwal mingguan di lebar kecil memang berubah jadi daftar per hari yang
ditumpuk (bukan 7 kolom dipaksa muat), dan versi kolomnya tetap punya
kontainer `overflow-x` sendiri.

### Anggaran baris heading
92 heading diperiksa di tiap lebar:

| Lebar | Batas | Maksimum terukur | Melanggar |
|---|---|---|---|
| 360 px | 3 baris | 2 | **0** |
| 753 px | 2 baris | 2 | **0** |
| 1425 px | 1 baris | 1 | **0** |

Pada pemeriksaan pertama ada 2 heading yang masih 2 baris di desktop; itu
diperbaiki lewat ukuran font dan lebar kolom, bukan line break manual.

### Aturan kuota dan waktu (dijalankan sungguhan di produksi)
Kuota satu sesi diturunkan jadi 2 lewat halaman admin, lalu dipesan lewat form
asli sampai habis:

| Percobaan | Status sebelum | Label | Tombol | Server |
|---|---|---|---|---|
| 1 | `almost-full` | "Hampir penuh - sisa 2 tempat" | **Pesan** | diterima |
| 2 | `almost-full` | "Hampir penuh - sisa 1 tempat" | **Pesan** | diterima |
| 3 | `full` | **"Penuh"** | **Daftar Tunggu** | tidak dilanjutkan |

Sisa tempat berkurang tanpa refresh, dan live region mengumumkan
`"Yin 27 Agu pukul 19:30: kuota penuh."`

- **Sesi lewat**: 8 sesi berstatus `past` dengan label "Sudah lewat" dan tombol
  "Tidak tersedia" — termasuk jam yang sudah lewat di hari yang sama.
- **Batas waktu pemesanan**: diverifikasi di `npm run verify:rules` pada presisi
  1 menit sebelum dan sesudah batas (lolos / ditutup). Saat pengujian di
  produksi tidak ada sesi yang kebetulan berada di dalam jendela 2 jam, jadi
  status "Pemesanan ditutup" belum sempat terlihat langsung di layar.
- **Validasi server**: `npm run verify:rules` menjalankan modul yang sama persis
  dengan yang ter-deploy — 33/33 lolos, termasuk penolakan sesi palsu, tanggal
  yang tidak cocok dengan hari pola, sesi yang sudah dibatalkan, dan jumlah
  orang melebihi sisa tempat.

### Jadwal berulang dan pengecualian tanggal
- Minggu ini, minggu depan, dan dua minggu ke depan masing-masing menghasilkan
  **16 sesi** dari pola yang sama, tanpa entri manual. ID sesi antar minggu
  tidak bertabrakan.
- **Tanggal libur**: menandai Jumat sebagai libur membuat hari itu jadi 0 sesi
  dengan keterangan "Studio tutup. Studio libur", dan hari lain tidak berubah.
- **Pembatalan sesi dari admin langsung hilang di sisi peserta**: sesi Kamis
  19:30 dibatalkan di `/admin`, lalu di `/jadwal` hari Kamis tersisa satu sesi
  saja. Perubahan kuota juga langsung terlihat di sisi peserta.
- **Reset Demo**: 13 sesi kembali jadi 16, penyimpanan browser kembali kosong.

### Transisi halaman
Urutan fase terekam langsung dari DOM saat menekan link nav:

```
idle    /        scroll 1200
closing /        scroll 1200   <- tirai menutup, konten belum berubah
opening /kelas   scroll 0      <- konten berganti DAN scroll direset saat tertutup
idle    /kelas   scroll 0
```

Loader "boot" dipakai saat menuju Home, loader "page" untuk rute lain.

**Uji rAF mati:** `requestAnimationFrame` di-patch agar tidak pernah memanggil
callback-nya (meniru tab yang dipindah ke belakang), lalu navigasi dijalankan.
3 panggilan rAF ditelan, dan sequence **tetap selesai** sampai `idle`. Tirai
tidak nyangkut — inilah yang dijamin oleh balapan `setTimeout` vs rAF.

### Aksesibilitas
- **Kontras**: 22/22 pasangan warna lolos WCAG AA (`npm run contrast`).
- **Z-index**: 0 raw z-index di seluruh codebase (`npm run audit:z`), 9 token.
- **Listbox ARIA**: fokus masuk ke daftar, panah memindah opsi aktif, End ke
  opsi terakhir, type-ahead "J" mendarat di "Jumat", Enter memilih dan menutup,
  Escape menutup, fokus selalu kembali ke trigger, popup di-portal ke `<body>`.
- **Status tidak hanya warna**: seluruh kartu sesi menampilkan label teks.
- **Hamburger**: menu buka/tutup, `aria-expanded` berubah, scroll body dikunci
  lalu dikembalikan, dan Escape menutup.
- **Cookie banner menyingkir** saat menu mobile terbuka (bukan menumpuk).
- **Lenis**: aktif di `/jadwal` desktop, mati total di `/admin`.

### Yang belum sempat dilihat mata
Verifikasi motion di atas dilakukan lewat DOM, state, dan API — fase transisi
dibaca dari atribut `data-phase`, bukan dari menonton animasinya berjalan.
Kehalusan animasi secara visual belum dinilai.
