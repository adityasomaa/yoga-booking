/**
 * Verifies the booking rules against the real schedule engine.
 * Run: npm run verify:rules
 *
 * These are the rules that must not be wrong:
 *   - a full session cannot be booked, and switches to a waiting list
 *   - a past session cannot be booked, including an earlier hour of today
 *   - the booking lead time closes a session before it starts
 *   - the recurring pattern really does produce sessions next week
 *   - a date exception really does remove that session
 */

import {
  addDaysISO,
  expandRange,
  expandWeek,
  getSessionStatus,
  materialise,
  studioEpoch,
  studioTodayISO,
  weekStartISO,
} from "../src/lib/schedule";
import { WEEKLY_PATTERNS } from "../src/data/studio";
import { BOOKING_LEAD_TIME_HOURS, ALMOST_FULL_THRESHOLD } from "../src/lib/config";
import { resolveSession, checkSeatsAndTiming } from "../src/lib/validation";

let pass = 0;
let fail = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    pass++;
    console.log(`  PASS  ${name}${detail ? `  (${detail})` : ""}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? `  (${detail})` : ""}`);
  }
}

console.log("\n=== SCHEDULE + BOOKING RULE VERIFICATION ===\n");

// Fixed reference point so the run is reproducible: Tue 2026-09-01, 09:00 WIB.
const NOW = studioEpoch("2026-09-01", "09:00");
console.log(`  Reference clock: 2026-09-01 09:00 WIB\n`);

/* --- 1. Recurrence produces sessions in future weeks -------------------- */
console.log("1. Pola jadwal berulang");

const thisWeek = weekStartISO("2026-09-01");
const nextWeek = addDaysISO(thisWeek, 7);
const weekAfter = addDaysISO(thisWeek, 14);

const w0 = expandWeek(thisWeek);
const w1 = expandWeek(nextWeek);
const w2 = expandWeek(weekAfter);

const count = (w: ReturnType<typeof expandWeek>) =>
  w.reduce((n, d) => n + d.sessions.length, 0);

check(
  "minggu ini menghasilkan sesi",
  count(w0) === WEEKLY_PATTERNS.length,
  `${count(w0)} sesi`
);
check(
  "minggu berikutnya menghasilkan sesi yang sama banyak",
  count(w1) === WEEKLY_PATTERNS.length,
  `${count(w1)} sesi`
);
check(
  "dua minggu ke depan juga",
  count(w2) === WEEKLY_PATTERNS.length,
  `${count(w2)} sesi`
);

const selYin = "sel-yin-malam";
const inW1 = w1.some((d) => d.sessions.some((s) => s.patternId === selYin));
check(`pola "${selYin}" muncul di minggu berikutnya`, inW1);

// Same pattern, different dates -> different session ids.
const idsW0 = w0.flatMap((d) => d.sessions.map((s) => s.id));
const idsW1 = w1.flatMap((d) => d.sessions.map((s) => s.id));
check(
  "id sesi minggu ini dan minggu depan tidak bertabrakan",
  idsW0.every((id) => !idsW1.includes(id))
);

/* --- 2. Date exception removes the session ------------------------------ */
console.log("\n2. Pengecualian tanggal libur");

const targetDay = w1.find((d) => d.sessions.some((s) => s.patternId === selYin));
const targetDate = targetDay!.dateISO;

const withSingleException = expandWeek(nextWeek, [
  { date: targetDate, patternId: selYin, reason: "Instruktur berhalangan" },
]);
check(
  "membatalkan satu kelas menghapus sesi itu saja",
  !withSingleException.some((d) => d.sessions.some((s) => s.patternId === selYin)) &&
    count(withSingleException) === count(w1) - 1,
  `${count(w1)} -> ${count(withSingleException)}`
);

const withFullClosure = expandWeek(nextWeek, [
  { date: targetDate, patternId: "all", reason: "Studio libur" },
]);
const closedDay = withFullClosure.find((d) => d.dateISO === targetDate)!;
check(
  "menutup seluruh tanggal mengosongkan hari itu",
  closedDay.sessions.length === 0 && closedDay.closedReason === "Studio libur"
);
check(
  "hari lain di minggu itu tidak terpengaruh",
  count(withFullClosure) === count(w1) - (targetDay!.sessions.length)
);

/* --- 3. Past sessions cannot be booked ---------------------------------- */
console.log("\n3. Sesi yang sudah lewat");

const morningToday = materialise(
  WEEKLY_PATTERNS.find((p) => p.id === "sel-vinyasa-pagi")!, // Tuesday 06:30
  "2026-09-01"
)!;
const statusMorning = getSessionStatus(morningToday, 0, NOW);
check(
  "sesi 06:30 hari ini sudah lewat pada jam 09:00",
  statusMorning.kind === "past" && !statusMorning.bookable,
  statusMorning.label
);

const yesterday = materialise(
  WEEKLY_PATTERNS.find((p) => p.id === "sen-vinyasa-sore")!,
  "2026-08-31"
)!;
check(
  "sesi kemarin tidak bisa dipesan",
  getSessionStatus(yesterday, 0, NOW).kind === "past"
);

const serverPast = checkSeatsAndTiming({
  session: morningToday,
  seats: 1,
  takenSeats: 0,
  nowMs: NOW,
});
check(
  "server menolak pemesanan sesi lewat",
  Boolean(serverPast.form),
  serverPast.form
);

/* --- 4. Lead time ------------------------------------------------------- */
console.log(`\n4. Batas waktu pemesanan (${BOOKING_LEAD_TIME_HOURS} jam)`);

const tonight = materialise(
  WEEKLY_PATTERNS.find((p) => p.id === selYin)!, // Tuesday 19:30
  "2026-09-01"
)!;

const wayBefore = studioEpoch("2026-09-01", "12:00");
const justInside = tonight.startsAtMs - (BOOKING_LEAD_TIME_HOURS * 3600_000 + 60_000);
const justAfterCutoff = tonight.startsAtMs - (BOOKING_LEAD_TIME_HOURS * 3600_000 - 60_000);

check(
  "jauh sebelum kelas: bisa dipesan",
  getSessionStatus(tonight, 0, wayBefore).bookable
);
check(
  "1 menit sebelum batas: masih bisa dipesan",
  getSessionStatus(tonight, 0, justInside).bookable
);
check(
  "1 menit setelah batas: pemesanan ditutup",
  getSessionStatus(tonight, 0, justAfterCutoff).kind === "closed" &&
    !getSessionStatus(tonight, 0, justAfterCutoff).bookable,
  getSessionStatus(tonight, 0, justAfterCutoff).label
);
check(
  "sesi yang ditutup mengarah ke daftar tunggu",
  getSessionStatus(tonight, 0, justAfterCutoff).waitlist
);

const serverClosed = checkSeatsAndTiming({
  session: tonight,
  seats: 1,
  takenSeats: 0,
  nowMs: justAfterCutoff,
});
check("server menolak setelah batas waktu", Boolean(serverClosed.form));

/* --- 5. Quota ----------------------------------------------------------- */
console.log("\n5. Kuota dan daftar tunggu");

const cap = tonight.capacity; // 10
let taken = 0;
let sawAlmostFull = false;

while (taken < cap) {
  const st = getSessionStatus(tonight, taken, wayBefore);
  if (st.kind === "almost-full") sawAlmostFull = true;
  if (!st.bookable) break;
  taken += 1;
}

check(
  `terisi sampai kuota penuh (${cap} tempat)`,
  taken === cap,
  `terisi ${taken}/${cap}`
);
check(
  `status "hampir penuh" muncul saat sisa <= ${ALMOST_FULL_THRESHOLD}`,
  sawAlmostFull
);

const fullStatus = getSessionStatus(tonight, cap, wayBefore);
check(
  "kuota penuh: tidak bisa dipesan",
  !fullStatus.bookable && fullStatus.kind === "full",
  fullStatus.label
);
check(
  "kuota penuh: tombol berubah jadi daftar tunggu",
  fullStatus.waitlist === true
);
check("kuota penuh: sisa tempat 0", fullStatus.seatsLeft === 0);

const serverFull = checkSeatsAndTiming({
  session: tonight,
  seats: 1,
  takenSeats: cap,
  nowMs: wayBefore,
});
check("server menolak saat penuh", Boolean(serverFull.form), serverFull.form);

const serverOverbook = checkSeatsAndTiming({
  session: tonight,
  seats: 3,
  takenSeats: cap - 1,
  nowMs: wayBefore,
});
check(
  "server menolak jumlah orang melebihi sisa tempat",
  Boolean(serverOverbook.seats),
  serverOverbook.seats
);

const serverOk = checkSeatsAndTiming({
  session: tonight,
  seats: 2,
  takenSeats: cap - 4,
  nowMs: wayBefore,
});
check(
  "server menerima pemesanan yang sah",
  !serverOk.form && !serverOk.seats
);

/* --- 6. Capacity override ---------------------------------------------- */
console.log("\n6. Perubahan kuota dari admin");

const reduced = checkSeatsAndTiming({
  session: tonight,
  seats: 1,
  takenSeats: 4,
  nowMs: wayBefore,
  capacityOverride: 4,
});
check(
  "menurunkan kuota ke jumlah yang sudah terisi menutup sesi",
  Boolean(reduced.form),
  reduced.form
);

/* --- 7. Forged session ids --------------------------------------------- */
console.log("\n7. Sesi palsu ditolak server");

check(
  "id sesi tidak dikenal ditolak",
  resolveSession("tidak-ada__2026-09-01").ok === false
);
check(
  "tanggal yang tidak cocok dengan hari pola ditolak",
  // sel-yin-malam is a Tuesday pattern; 2026-09-02 is a Wednesday.
  resolveSession(`${selYin}__2026-09-02`).ok === false
);
check(
  "tanggal yang cocok diterima",
  resolveSession(`${selYin}__2026-09-01`).ok === true
);
check(
  "sesi yang dibatalkan lewat pengecualian ditolak server",
  resolveSession(`${selYin}__2026-09-01`, [
    { date: "2026-09-01", patternId: selYin, reason: "Instruktur berhalangan" },
  ]).ok === false
);
check(
  "kelas privat tidak bisa dipesan lewat jadwal",
  resolveSession("private__2026-09-01").ok === false
);

/* --- 8. Clock independence --------------------------------------------- */
console.log("\n8. Perhitungan waktu memakai jam sebenarnya");

const longGap = NOW + 7 * 24 * 3600_000; // simulate tab left open a week
check(
  "sesi malam ini sudah lewat bila dibuka seminggu kemudian",
  getSessionStatus(tonight, 0, longGap).kind === "past"
);

const todayFromClock = studioTodayISO(NOW);
check(
  "tanggal studio diturunkan dari jam sebenarnya",
  todayFromClock === "2026-09-01",
  todayFromClock
);

const rangeCount = expandRange("2026-09-01", "2026-09-28").length;
check(
  "rentang 4 minggu menghasilkan 4x pola",
  rangeCount === WEEKLY_PATTERNS.length * 4,
  `${rangeCount} sesi`
);

/* --- summary ------------------------------------------------------------ */
console.log(`\n${"=".repeat(46)}`);
console.log(`  ${pass} pass, ${fail} fail`);
console.log(`${"=".repeat(46)}\n`);
if (fail > 0) process.exit(1);
