/**
 * =============================================================================
 *  DATA KELAS & JADWAL
 * =============================================================================
 *
 *  CARA BACA FILE INI (untuk pemilik studio, tanpa perlu paham coding)
 *
 *  File ini punya 4 bagian:
 *
 *    1. JENIS KELAS   -- daftar jenis kelas yang studio tawarkan.
 *                        Contoh: Hatha, Vinyasa, Yin.
 *                        Ini BUKAN jadwal. Ini "menu" kelasnya.
 *
 *    2. POLA JADWAL   -- jadwal yang BERULANG SETIAP MINGGU.
 *                        Contoh: "Vinyasa, setiap Selasa, jam 18:00, kuota 14".
 *                        Cukup ditulis SEKALI di sini, lalu otomatis muncul di
 *                        semua minggu ke depan. Tidak perlu mengetik ulang
 *                        tanggal satu per satu setiap minggu.
 *
 *    3. TANGGAL LIBUR -- pengecualian. Kalau studio tutup di tanggal tertentu,
 *                        atau satu kelas saja yang batal, tulis di sini.
 *                        Sesi itu otomatis hilang dari jadwal.
 *
 *    4. PAKET KELAS   -- bentuk paket yang ditawarkan, tanpa harga.
 *
 *  MENAMBAH KELAS BARU  : tambahkan satu blok di CLASS_TYPES.
 *  MENGUBAH JADWAL      : ubah angka weekday atau startTime di WEEKLY_PATTERNS.
 *  MENGUBAH KUOTA       : ubah angka capacity.
 *  MENUTUP SATU TANGGAL : tambahkan satu baris di DATE_EXCEPTIONS.
 *
 *  Kode hari (weekday):  0 = Minggu, 1 = Senin, 2 = Selasa, 3 = Rabu,
 *                        4 = Kamis,  5 = Jumat, 6 = Sabtu
 *
 *  Jam ditulis 24 jam, contoh "06:00", "18:30". Waktu setempat (WIB).
 *
 *  CATATAN: harga TIDAK ada di file ini dan itu disengaja. Harga belum
 *  dikonfirmasi pemilik studio, jadi semua arah pembayaran lewat WhatsApp.
 * =============================================================================
 */

export type Level = "pemula" | "semua-level" | "menengah";

export type ClassType = {
  /** Dipakai di URL dan sebagai penghubung ke pola jadwal. Huruf kecil. */
  slug: string;
  /** Nama yang tampil di website. */
  name: string;
  /** Tingkat kesulitan. Salah satu dari: pemula | semua-level | menengah */
  level: Level;
  /** Durasi kelas dalam menit. */
  durationMinutes: number;
  /** Satu kalimat ringkas untuk kartu kelas. */
  summary: string;
  /** Penjelasan lebih panjang untuk halaman detail kelas. */
  description: string;
  /** Apa yang perlu dibawa peserta. */
  bring: string[];
  /** Untuk siapa kelas ini cocok. Deskriptif, bukan janji hasil. */
  suitableFor: string;
  /**
   * Kalau true, kelas ini TIDAK muncul di jadwal mingguan dan diatur
   * lewat permintaan terpisah. Dipakai untuk kelas privat.
   */
  byRequestOnly?: boolean;
};

/* =========================================================================
 * 1. JENIS KELAS
 * ====================================================================== */
export const CLASS_TYPES: ClassType[] = [
  {
    slug: "hatha",
    name: "Hatha",
    level: "pemula",
    durationMinutes: 60,
    summary:
      "Kelas bertempo pelan dengan pose yang ditahan lebih lama dan dijelaskan langkah demi langkah.",
    description:
      "Hatha berjalan dengan tempo pelan. Setiap pose diperkenalkan satu per satu dan ditahan beberapa tarikan napas, sehingga ada waktu menyesuaikan posisi sebelum lanjut ke pose berikutnya. Instruksi diberikan cukup rinci, termasuk pilihan versi yang lebih ringan bila sebuah pose terasa belum nyaman. Kelas ini sering dipilih peserta yang baru pertama kali masuk kelas yoga.",
    bring: [
      "Matras (tersedia di studio bila belum punya)",
      "Pakaian yang nyaman untuk bergerak",
      "Air minum",
    ],
    suitableFor: "Peserta baru, atau siapa pun yang ingin tempo lebih pelan.",
  },
  {
    slug: "vinyasa",
    name: "Vinyasa",
    level: "semua-level",
    durationMinutes: 60,
    summary:
      "Rangkaian pose yang mengalir dan disambungkan mengikuti pengaturan napas.",
    description:
      "Vinyasa menyambung satu pose ke pose berikutnya mengikuti irama napas, sehingga kelas terasa lebih mengalir dan bergerak terus. Tempo bisa berubah di tengah kelas. Instruktur menyebutkan pilihan yang lebih ringan di setiap rangkaian, jadi peserta dapat memilih intensitas sendiri. Mengenal pose-pose dasar lebih dulu akan membuat kelas ini lebih mudah diikuti.",
    bring: ["Matras", "Handuk kecil", "Air minum"],
    suitableFor:
      "Peserta yang sudah mengenal pose dasar dan ingin bergerak lebih aktif.",
  },
  {
    slug: "yin",
    name: "Yin",
    level: "semua-level",
    durationMinutes: 75,
    summary:
      "Pose ditahan lama dalam posisi pasif, sebagian besar sambil duduk atau berbaring.",
    description:
      "Yin menahan setiap pose dalam waktu yang jauh lebih lama, umumnya beberapa menit, dan hampir seluruhnya dilakukan sambil duduk atau berbaring. Bantal dan balok dipakai untuk menopang tubuh agar posisi dapat dipertahankan tanpa menahan beban. Kelas berlangsung tenang dengan sedikit perpindahan. Sering dipilih sebagai pelengkap kelas yang lebih aktif.",
    bring: ["Matras", "Kaus kaki atau lapisan hangat", "Air minum"],
    suitableFor:
      "Semua tingkat, termasuk peserta baru yang ingin kelas bertempo tenang.",
  },
  {
    slug: "prenatal",
    name: "Prenatal",
    level: "pemula",
    durationMinutes: 60,
    summary:
      "Kelas khusus peserta yang sedang hamil, dengan pilihan pose yang disesuaikan.",
    description:
      "Kelas prenatal disusun khusus untuk peserta yang sedang hamil. Pilihan pose dan penggunaan alat bantu disesuaikan, dan instruktur menyediakan variasi untuk tiap tahap kehamilan. Silakan konsultasikan lebih dulu dengan tenaga medis yang menangani kehamilan Anda sebelum mengikuti kelas, dan sampaikan usia kehamilan saat memesan agar kelas dapat disiapkan.",
    bring: ["Matras", "Bantal atau guling kecil bila punya", "Air minum"],
    suitableFor:
      "Peserta yang sedang hamil dan sudah mendapat izin dari tenaga medis yang menanganinya.",
  },
  {
    slug: "private",
    name: "Kelas Privat",
    level: "semua-level",
    durationMinutes: 60,
    byRequestOnly: true,
    summary:
      "Sesi satu lawan satu atau kelompok kecil, jadwal dan materi diatur bersama.",
    description:
      "Kelas privat berjalan satu lawan satu atau dalam kelompok kecil tertutup. Jadwal, durasi dan fokus materi disepakati sebelum sesi dimulai, jadi isi kelas mengikuti kebutuhan peserta. Karena diatur per permintaan, kelas privat tidak muncul di jadwal mingguan dan diatur lewat percakapan langsung.",
    bring: ["Matras", "Air minum"],
    suitableFor: "Peserta yang ingin jadwal fleksibel atau materi yang disesuaikan.",
  },
];

/* =========================================================================
 * 2. POLA JADWAL MINGGUAN  (berulang otomatis setiap minggu)
 *
 *    id        : kode unik, bebas, jangan diubah setelah dipakai.
 *    classSlug : harus sama persis dengan slug di CLASS_TYPES di atas.
 *    weekday   : 0 Minggu, 1 Senin, 2 Selasa, 3 Rabu, 4 Kamis, 5 Jumat, 6 Sabtu
 *    startTime : jam mulai, format 24 jam.
 *    capacity  : jumlah tempat yang tersedia untuk sesi itu.
 *    room      : nama ruang, boleh dikosongkan.
 * ====================================================================== */
export type WeeklyPattern = {
  id: string;
  classSlug: string;
  weekday: number;
  startTime: string;
  capacity: number;
  room?: string;
  /** Opsional. Sesi hanya dibuat mulai tanggal ini (format YYYY-MM-DD). */
  activeFrom?: string;
  /** Opsional. Sesi berhenti dibuat setelah tanggal ini. */
  activeUntil?: string;
};

export const WEEKLY_PATTERNS: WeeklyPattern[] = [
  // --- Senin ---
  { id: "sen-hatha-pagi", classSlug: "hatha", weekday: 1, startTime: "06:30", capacity: 12, room: "Ruang A" },
  { id: "sen-vinyasa-sore", classSlug: "vinyasa", weekday: 1, startTime: "18:00", capacity: 14, room: "Ruang A" },

  // --- Selasa ---
  { id: "sel-vinyasa-pagi", classSlug: "vinyasa", weekday: 2, startTime: "06:30", capacity: 14, room: "Ruang A" },
  { id: "sel-yin-malam", classSlug: "yin", weekday: 2, startTime: "19:30", capacity: 10, room: "Ruang B" },

  // --- Rabu ---
  { id: "rab-hatha-pagi", classSlug: "hatha", weekday: 3, startTime: "06:30", capacity: 12, room: "Ruang A" },
  { id: "rab-prenatal-siang", classSlug: "prenatal", weekday: 3, startTime: "10:00", capacity: 8, room: "Ruang B" },
  { id: "rab-vinyasa-sore", classSlug: "vinyasa", weekday: 3, startTime: "18:00", capacity: 14, room: "Ruang A" },

  // --- Kamis ---
  { id: "kam-vinyasa-pagi", classSlug: "vinyasa", weekday: 4, startTime: "06:30", capacity: 14, room: "Ruang A" },
  { id: "kam-yin-malam", classSlug: "yin", weekday: 4, startTime: "19:30", capacity: 10, room: "Ruang B" },

  // --- Jumat ---
  { id: "jum-hatha-pagi", classSlug: "hatha", weekday: 5, startTime: "06:30", capacity: 12, room: "Ruang A" },
  { id: "jum-vinyasa-sore", classSlug: "vinyasa", weekday: 5, startTime: "18:00", capacity: 14, room: "Ruang A" },

  // --- Sabtu ---
  { id: "sab-hatha-pagi", classSlug: "hatha", weekday: 6, startTime: "07:00", capacity: 16, room: "Ruang A" },
  { id: "sab-prenatal-siang", classSlug: "prenatal", weekday: 6, startTime: "09:30", capacity: 8, room: "Ruang B" },
  { id: "sab-yin-sore", classSlug: "yin", weekday: 6, startTime: "16:00", capacity: 12, room: "Ruang B" },

  // --- Minggu ---
  { id: "min-vinyasa-pagi", classSlug: "vinyasa", weekday: 0, startTime: "07:00", capacity: 16, room: "Ruang A" },
  { id: "min-yin-sore", classSlug: "yin", weekday: 0, startTime: "16:00", capacity: 12, room: "Ruang B" },
];

/* =========================================================================
 * 3. TANGGAL LIBUR / PENGECUALIAN
 *
 *    date      : tanggal yang dikecualikan, format YYYY-MM-DD.
 *    patternId : tulis "all" untuk menutup SELURUH kelas di tanggal itu.
 *                Isi dengan id pola jadwal untuk membatalkan SATU kelas saja.
 *    reason    : keterangan singkat, ditampilkan ke peserta.
 *
 *  Contoh menutup seluruh studio satu hari:
 *    { date: "2026-12-25", patternId: "all", reason: "Studio libur" }
 *
 *  Contoh membatalkan satu kelas saja:
 *    { date: "2026-09-01", patternId: "sel-yin-malam", reason: "Instruktur berhalangan" }
 * ====================================================================== */
export type DateException = {
  date: string;
  patternId: string | "all";
  reason: string;
};

export const DATE_EXCEPTIONS: DateException[] = [];

/* =========================================================================
 * 4. PAKET KELAS  (tanpa harga -- semua diarahkan ke konsultasi)
 * ====================================================================== */
export type Package = {
  slug: string;
  name: string;
  /** Ringkasan bentuk paketnya, bukan klaim nilai. */
  summary: string;
  /** Poin-poin netral tentang cara paket dipakai. */
  points: string[];
};

export const PACKAGES: Package[] = [
  {
    slug: "sekali-datang",
    name: "Sekali Datang",
    summary: "Satu kali kehadiran untuk satu sesi kelas yang dipilih dari jadwal.",
    points: [
      "Berlaku untuk satu sesi",
      "Bisa dipakai untuk jenis kelas mana pun di jadwal mingguan",
      "Cocok untuk mencoba satu kelas lebih dulu",
    ],
  },
  {
    slug: "paket-beberapa-kali",
    name: "Paket Beberapa Kali",
    summary:
      "Sejumlah kehadiran yang bisa dipakai bertahap pada sesi mana pun di jadwal.",
    points: [
      "Jumlah kehadiran dan masa berlaku dikonfirmasi lewat WhatsApp",
      "Bisa dipakai lintas jenis kelas",
      "Pemesanan tetap dilakukan per sesi lewat jadwal mingguan",
    ],
  },
  {
    slug: "bulanan",
    name: "Bulanan",
    summary: "Akses kelas dalam satu periode bulanan berjalan.",
    points: [
      "Ketentuan jumlah kelas per periode dikonfirmasi lewat WhatsApp",
      "Bisa dipakai lintas jenis kelas",
      "Pemesanan tetap dilakukan per sesi lewat jadwal mingguan",
    ],
  },
];
