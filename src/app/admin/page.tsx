import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { studioTodayISO, weekStartISO } from "@/lib/schedule";

/**
 * Admin is deliberately excluded from the navigation and from the sitemap,
 * and is served with noindex/nofollow.
 */
export const metadata: Metadata = {
  title: "Admin Demo",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminPage() {
  /* Build/revalidate-time seed only. The client re-anchors to the visitor's
   * real clock on mount (see useNow + the anchor effect in WeekSchedule), so a
   * stale value here can never make a past session look bookable. */
  // eslint-disable-next-line react-hooks/purity
  const todayISO = studioTodayISO(Date.now());
  return <AdminDashboard initialWeekStart={weekStartISO(todayISO)} />;
}
