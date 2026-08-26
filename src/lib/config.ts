/**
 * =============================================================================
 *  STUDIO CONFIG  --  single place to change identity + operational numbers
 * =============================================================================
 *
 *  Values typed `Pending` are NOT YET CONFIRMED by the studio owner.
 *  They deliberately render as a neutral "belum diisi" state in the UI instead
 *  of a made-up placeholder number. Nothing in this file is invented.
 *
 *  To go live, replace each `PENDING` with the real value. That is the only
 *  edit required -- no component reads these facts from anywhere else.
 * =============================================================================
 */

/** Marker for a fact the studio owner has not confirmed yet. */
export const PENDING = null;
export type Pending = null;
export type Confirmed<T> = T | Pending;

/** True when a config value is still waiting on the owner. */
export function isPending<T>(v: Confirmed<T>): v is Pending {
  return v === null || v === undefined || v === "";
}

/* -------------------------------------------------------------------------
 * 1. IDENTITY
 * ---------------------------------------------------------------------- */

/**
 * Working name only. The real studio name has not been confirmed.
 * Change this ONE line and it updates the nav, every page title, the OG image,
 * the wordmark, the structured data and the WhatsApp message templates.
 */
export const STUDIO_NAME = "Yoga Studio";

/** Short descriptor used after the name in <title> tags. */
export const STUDIO_TAGLINE = "Kelas Yoga Terjadwal di Bandung";

/** City is the one location fact that came from the brief, so it is safe. */
export const STUDIO_CITY = "Bandung";
export const STUDIO_REGION = "Jawa Barat";
export const STUDIO_COUNTRY = "ID";

/* -------------------------------------------------------------------------
 * 2. CONTACT  --  all unconfirmed
 *
 * A Google / Google Maps / Instagram search was run before these were left
 * blank. See README section "Riset kontak" for exactly what was searched and
 * why nothing could be attributed to this business with confidence.
 * ---------------------------------------------------------------------- */

/** Digits only, international format, e.g. "6281234567890". */
export const WHATSAPP_NUMBER: Confirmed<string> = PENDING;

/** Full street address. */
export const STUDIO_ADDRESS: Confirmed<string> = PENDING;

/** e.g. "40115" */
export const STUDIO_POSTAL_CODE: Confirmed<string> = PENDING;

/** Public email, if the studio wants one shown. */
export const STUDIO_EMAIL: Confirmed<string> = PENDING;

/** Instagram handle without the "@". */
export const STUDIO_INSTAGRAM: Confirmed<string> = PENDING;

/** Google Maps share link for the "Lokasi" block. */
export const STUDIO_MAPS_URL: Confirmed<string> = PENDING;

/**
 * Operating hours. Leave as PENDING until the owner confirms.
 * Shape when filled: [{ days: "Senin - Jumat", open: "06:00", close: "21:00" }]
 */
export type OpeningHours = { days: string; open: string; close: string };
export const OPENING_HOURS: Confirmed<OpeningHours[]> = PENDING;

/* -------------------------------------------------------------------------
 * 3. BOOKING RULES  --  safe operational defaults, owner can tune
 * ---------------------------------------------------------------------- */

/**
 * A session closes for booking this many hours before it starts.
 * Set to 0 to allow booking right up to the start time.
 */
export const BOOKING_LEAD_TIME_HOURS = 2;

/** At or below this many seats left, a session is labelled "hampir penuh". */
export const ALMOST_FULL_THRESHOLD = 3;

/** Hard cap on seats one person may book in a single request. */
export const MAX_SEATS_PER_BOOKING = 4;

/** How many weeks forward the schedule may be browsed from today. */
export const SCHEDULE_WEEKS_AHEAD = 8;

/** How many weeks back the schedule may be browsed. */
export const SCHEDULE_WEEKS_BEHIND = 1;

/* -------------------------------------------------------------------------
 * 4. TIME
 *
 * Indonesia does not observe daylight saving, so WIB is a permanent +07:00.
 * Every "is this session in the past" check is resolved against this offset
 * rather than the visitor's device clock, so the answer is the same in any
 * timezone.
 * ---------------------------------------------------------------------- */
export const STUDIO_TIMEZONE = "Asia/Jakarta";
export const STUDIO_UTC_OFFSET = "+07:00";

/* -------------------------------------------------------------------------
 * 5. SITE
 * ---------------------------------------------------------------------- */

/**
 * Canonical origin. Updated to the final domain at deploy time.
 * Used by metadata, canonical tags, sitemap, robots and structured data.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://yogabooking.onyxcreative.asia";

export const SITE_LOCALE = "id_ID";

/** Routes excluded from the sitemap and served with noindex. */
export const PRIVATE_ROUTES = ["/admin"];
