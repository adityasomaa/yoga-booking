import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import WeekSchedule from "@/components/schedule/WeekSchedule";
import WhatsAppLink from "@/components/WhatsAppLink";
import {
  addDaysISO,
  expandRange,
  studioTodayISO,
  weekStartISO,
} from "@/lib/schedule";
import { eventListJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import { BOOKING_LEAD_TIME_HOURS, STUDIO_CITY, STUDIO_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Jadwal Kelas Yoga Mingguan",
  description: `Jadwal kelas yoga mingguan di ${STUDIO_CITY}. Lihat hari, jam, tingkat dan sisa tempat setiap sesi, lalu pesan kelas lewat WhatsApp.`,
  alternates: { canonical: "/jadwal" },
};

// Sessions are derived from recurrence patterns, so the schedule is rebuilt
// periodically rather than frozen at build time.
export const revalidate = 3600;

export default function JadwalPage() {
  /* Build/revalidate-time seed only. The client re-anchors to the visitor's
   * real clock on mount (see useNow + the anchor effect in WeekSchedule), so a
   * stale value here can never make a past session look bookable. */
  // eslint-disable-next-line react-hooks/purity
  const todayISO = studioTodayISO(Date.now());
  const weekStart = weekStartISO(todayISO);

  // Event structured data for every session in the coming four weeks. This is
  // what allows individual dated classes to surface in search results.
  const upcoming = expandRange(todayISO, addDaysISO(todayISO, 28));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventListJsonLd(upcoming)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Jadwal", path: "/jadwal" },
            ])
          ),
        }}
      />

      <div className="shell section">
        <SectionHeader
          as="h1"
          eyebrow="Jadwal"
          headline="Jadwal kelas yoga mingguan"
          description={`Satu minggu penuh dalam satu tampilan, lengkap dengan sisa tempat tiap sesi. Pemesanan ditutup ${BOOKING_LEAD_TIME_HOURS} jam sebelum kelas dimulai, dan sesi yang sudah lewat tidak bisa dipesan.`}
          cta={
            <WhatsAppLink
              variant="secondary"
              label="Tanya Jadwal"
              intro={`Halo ${STUDIO_NAME}, saya ingin bertanya tentang jadwal kelas.`}
            />
          }
          className="mb-10"
        />

        <WeekSchedule initialWeekStart={weekStart} />
      </div>
    </>
  );
}
