import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookieBanner from "@/components/CookieBanner";
import LenisProvider from "@/components/LenisProvider";
import TransitionProvider from "@/components/transition/TransitionProvider";
import { localBusinessJsonLd } from "@/lib/structured-data";
import {
  SITE_LOCALE,
  SITE_URL,
  STUDIO_CITY,
  STUDIO_NAME,
  STUDIO_TAGLINE,
} from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${STUDIO_NAME} - ${STUDIO_TAGLINE}`,
    template: `%s - ${STUDIO_NAME}`,
  },
  description: `Jadwal kelas yoga mingguan di ${STUDIO_CITY}. Lihat jenis kelas, jam, sisa tempat, lalu pesan kelas langsung lewat WhatsApp.`,
  keywords: [
    "kelas yoga bandung",
    "studio yoga bandung",
    "jadwal kelas yoga",
    "booking kelas yoga",
    "yoga pemula bandung",
    "kelas hatha",
    "kelas vinyasa",
    "kelas yin",
    "yoga prenatal",
    "kelas yoga privat",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: STUDIO_NAME,
    title: `${STUDIO_NAME} - ${STUDIO_TAGLINE}`,
    description: `Jadwal kelas yoga mingguan di ${STUDIO_CITY}, lengkap dengan sisa tempat tiap sesi.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${STUDIO_NAME} - ${STUDIO_TAGLINE}`,
    description: `Jadwal kelas yoga mingguan di ${STUDIO_CITY}.`,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <script
          type="application/ld+json"
          // Only facts that are actually known are emitted here. Address,
          // phone and opening hours are omitted while unconfirmed rather than
          // published as placeholders.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd()),
          }}
        />
        <a href="#main" className="skip-link layer-skip">
          Lompat ke konten utama
        </a>
        <TransitionProvider>
          <LenisProvider />
          <SiteHeader />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <CookieBanner />
        </TransitionProvider>
      </body>
    </html>
  );
}
