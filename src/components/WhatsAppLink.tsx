"use client";

/**
 * =============================================================================
 *  WhatsAppLink  --  the ONLY way the site opens WhatsApp.
 * =============================================================================
 *
 *  Every WhatsApp button on the site renders through this component so that
 *  two things are guaranteed without anyone remembering to add them:
 *
 *    1. the page the visitor was on is appended to the message, and
 *    2. the label of the button they pressed is appended too.
 *
 *  That is what lets the studio owner tell a "Tanya kelas" tap on the Hatha
 *  page apart from a "Daftar tunggu" tap on the schedule.
 *
 *  If the studio's WhatsApp number has not been configured yet, this renders a
 *  clearly-marked disabled state rather than inventing a number to dial.
 * =============================================================================
 */

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { SITE_URL, STUDIO_NAME, WHATSAPP_NUMBER, isPending } from "@/lib/config";
import { cn } from "@/lib/utils";

export type WhatsAppLinkProps = {
  /** Visible button text. Also appended to the message as the action name. */
  label: string;
  /** Body lines of the message, already human-readable. One entry per line. */
  lines?: string[];
  /** Opening sentence. Defaults to a neutral enquiry. */
  intro?: string;
  className?: string;
  variant?: "primary" | "secondary" | "quiet";
  /** Renders the label visually hidden, for icon-only placements. */
  children?: React.ReactNode;
  /** Overrides the detected page URL, e.g. when linking about another page. */
  sourceUrlOverride?: string;
};

/** Builds the message body. Exported so tests and the form can reuse it. */
export function buildWhatsAppMessage({
  intro,
  lines,
  label,
  sourceUrl,
}: {
  intro: string;
  lines: string[];
  label: string;
  sourceUrl: string;
}): string {
  const parts: string[] = [intro, ""];
  for (const line of lines) {
    if (line === "") parts.push("");
    else parts.push(line);
  }
  parts.push("");
  parts.push(`Dikirim dari: ${sourceUrl}`);
  parts.push(`Tombol: ${label}`);
  return parts.join("\n");
}

export function useWhatsAppHref({
  label,
  lines = [],
  intro,
  sourceUrlOverride,
}: {
  label: string;
  lines?: string[];
  intro?: string;
  sourceUrlOverride?: string;
}): string | null {
  const pathname = usePathname();

  return useMemo(() => {
    if (isPending(WHATSAPP_NUMBER)) return null;
    const sourceUrl =
      sourceUrlOverride ??
      (typeof window !== "undefined"
        ? window.location.href
        : `${SITE_URL}${pathname}`);

    const text = buildWhatsAppMessage({
      intro: intro ?? `Halo ${STUDIO_NAME}, saya ingin bertanya.`,
      lines,
      label,
      sourceUrl,
    });
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }, [label, lines, intro, pathname, sourceUrlOverride]);
}

const VARIANT_CLASS = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  quiet: "btn btn-quiet",
} as const;

export default function WhatsAppLink({
  label,
  lines = [],
  intro,
  className,
  variant = "primary",
  children,
  sourceUrlOverride,
}: WhatsAppLinkProps) {
  const href = useWhatsAppHref({ label, lines, intro, sourceUrlOverride });

  // Number not confirmed yet: say so plainly instead of linking nowhere.
  if (!href) {
    return (
      <span
        className={cn(VARIANT_CLASS[variant], className)}
        aria-disabled="true"
        title="Nomor WhatsApp studio belum dikonfigurasi"
      >
        {children ?? label}
        <span className="sr-only">
          {" "}
          (nomor WhatsApp belum diisi di konfigurasi situs)
        </span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(VARIANT_CLASS[variant], className)}
    >
      {children ?? label}
      <span className="sr-only"> (membuka WhatsApp di tab baru)</span>
    </a>
  );
}
