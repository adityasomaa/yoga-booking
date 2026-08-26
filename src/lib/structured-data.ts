/**
 * =============================================================================
 *  STRUCTURED DATA
 * =============================================================================
 *
 *  Two schemas:
 *
 *    LocalBusiness  -- who and where the studio is.
 *    Event          -- ONE PER CLASS SESSION, with its real date, time and
 *                      duration. This is what lets an upcoming class show up
 *                      as a dated result in search rather than as a generic
 *                      page link.
 *
 *  HONESTY RULE
 *  A field is emitted only when its value is actually known. Address, phone
 *  and opening hours are all still unconfirmed, so they are left OUT of the
 *  markup entirely -- publishing a placeholder as though it were a verified
 *  business fact would be worse than publishing nothing.
 *
 *  No `offers` block is emitted either, because there are no confirmed prices.
 * =============================================================================
 */

import {
  OPENING_HOURS,
  SITE_URL,
  STUDIO_ADDRESS,
  STUDIO_CITY,
  STUDIO_COUNTRY,
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM,
  STUDIO_NAME,
  STUDIO_POSTAL_CODE,
  STUDIO_REGION,
  STUDIO_TIMEZONE,
  WHATSAPP_NUMBER,
  isPending,
} from "@/lib/config";
import { getClassType, type Session } from "@/lib/schedule";

type Json = Record<string, unknown>;

export function localBusinessJsonLd(): Json {
  const address: Json = {
    "@type": "PostalAddress",
    addressLocality: STUDIO_CITY,
    addressRegion: STUDIO_REGION,
    addressCountry: STUDIO_COUNTRY,
  };
  if (!isPending(STUDIO_ADDRESS)) address.streetAddress = STUDIO_ADDRESS;
  if (!isPending(STUDIO_POSTAL_CODE)) address.postalCode = STUDIO_POSTAL_CODE;

  const data: Json = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    "@id": `${SITE_URL}/#studio`,
    name: STUDIO_NAME,
    description: `Studio kelas yoga terjadwal di ${STUDIO_CITY}.`,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/graphics/hero.svg`,
    address,
    areaServed: STUDIO_CITY,
  };

  if (!isPending(WHATSAPP_NUMBER)) data.telephone = `+${WHATSAPP_NUMBER}`;
  if (!isPending(STUDIO_EMAIL)) data.email = STUDIO_EMAIL;
  if (!isPending(STUDIO_INSTAGRAM)) {
    data.sameAs = [`https://www.instagram.com/${STUDIO_INSTAGRAM}`];
  }
  if (!isPending(OPENING_HOURS)) {
    data.openingHours = OPENING_HOURS.map(
      (h) => `${h.days} ${h.open}-${h.close}`
    );
  }

  return data;
}

/** ISO 8601 duration, e.g. 75 minutes -> "PT1H15M". */
function isoDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}` || "PT0M";
}

/** One Event per session, with real start/end timestamps in studio time. */
export function sessionEventJsonLd(session: Session): Json {
  const type = getClassType(session.classSlug);
  const location: Json = {
    "@type": "Place",
    name: STUDIO_NAME,
    address: {
      "@type": "PostalAddress",
      addressLocality: STUDIO_CITY,
      addressRegion: STUDIO_REGION,
      addressCountry: STUDIO_COUNTRY,
      ...(isPending(STUDIO_ADDRESS) ? {} : { streetAddress: STUDIO_ADDRESS }),
    },
  };

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${SITE_URL}/jadwal#${session.id}`,
    name: `Kelas ${session.className} - ${STUDIO_NAME}`,
    description:
      type?.summary ?? `Kelas ${session.className} di ${STUDIO_NAME}.`,
    startDate: new Date(session.startsAtMs).toISOString(),
    endDate: new Date(session.endsAtMs).toISOString(),
    duration: isoDuration(session.durationMinutes),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    maximumAttendeeCapacity: session.capacity,
    location,
    organizer: {
      "@type": "Organization",
      name: STUDIO_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/jadwal`,
    inLanguage: "id-ID",
    typicalAgeRange: "16-",
    // No `offers` block: prices are not confirmed, so none are claimed.
  };
}

export function eventListJsonLd(sessions: Session[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Jadwal kelas yoga ${STUDIO_NAME}`,
    itemListElement: sessions.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: sessionEventJsonLd(s),
    })),
  };
}

export function breadcrumbJsonLd(
  trail: { name: string; path: string }[]
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}

export const STUDIO_TZ_NOTE = STUDIO_TIMEZONE;
