import { ImageResponse } from "next/og";
import { STUDIO_CITY, STUDIO_NAME, STUDIO_TAGLINE } from "@/lib/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${STUDIO_NAME} - ${STUDIO_TAGLINE}`;

/**
 * OG image: the studio wordmark and the mark, drawn here rather than pulled
 * from a stock library. No photograph, and nothing that could be mistaken for
 * documentation of a real class.
 *
 * Depth comes from a gradient and line work only -- no grain or noise.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(150deg, #1C5344 0%, #17453A 55%, #123528 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Concentric arcs, echoing the site's shape language. */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -80,
            width: 620,
            height: 620,
            display: "flex",
          }}
        >
          <svg width="620" height="620" viewBox="0 0 620 620">
            <circle cx="360" cy="260" r="120" fill="none" stroke="#E2EDE7" strokeWidth="1.5" opacity="0.35" />
            <circle cx="360" cy="260" r="180" fill="none" stroke="#E2EDE7" strokeWidth="1.5" opacity="0.26" />
            <circle cx="360" cy="260" r="240" fill="none" stroke="#E2EDE7" strokeWidth="1.5" opacity="0.18" />
            <circle cx="360" cy="260" r="300" fill="none" stroke="#E2EDE7" strokeWidth="1.5" opacity="0.1" />
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 64 64">
            <path d="M 12 34 A 20 26 0 0 1 52 34" fill="none" stroke="#E2EDE7" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 12 34 A 20 26 0 0 0 52 34" fill="none" stroke="#E2EDE7" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
            <circle cx="32" cy="34" r="5" fill="#E2EDE7" />
          </svg>
          <div
            style={{
              color: "#E2EDE7",
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {STUDIO_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 76,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              maxWidth: 820,
              display: "flex",
            }}
          >
            Jadwal kelas yoga mingguan
          </div>
          <div
            style={{
              color: "#B8CFC5",
              fontSize: 30,
              letterSpacing: -0.5,
              display: "flex",
            }}
          >
            {STUDIO_CITY} · lihat sisa tempat lalu pesan kelas
          </div>
        </div>
      </div>
    ),
    size
  );
}
