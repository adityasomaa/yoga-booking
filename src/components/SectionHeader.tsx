/**
 * SectionHeader -- every section on the site uses this, in this order:
 *
 *     1. section title (eyebrow)
 *     2. headline
 *     3. short description
 *     4. call to action
 *
 * Keeping it in one component is what makes that order impossible to get
 * wrong, and means a change to section rhythm happens in one place.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/Reveal";

export type SectionHeaderProps = {
  /** 1. Small label above the headline. */
  eyebrow: string;
  /** 2. The headline. Keep it short: it must fit one line on desktop. */
  headline: string;
  /** 3. One or two sentences. */
  description: string;
  /** 4. Call to action. */
  cta?: ReactNode;
  /** Heading level so document outline stays correct per page. */
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  className?: string;
  id?: string;
};

export default function SectionHeader({
  eyebrow,
  headline,
  description,
  cta,
  as: Heading = "h2",
  align = "left",
  className,
  id,
}: SectionHeaderProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <p className="t-eyebrow">{eyebrow}</p>
      <Heading
        id={id}
        className={cn("t-headline", align === "center" && "mx-auto")}
      >
        {headline}
      </Heading>
      <p className={cn("t-lede", align === "center" && "mx-auto")}>
        {description}
      </p>
      {cta ? <div className="mt-2 flex flex-wrap gap-3">{cta}</div> : null}
    </Reveal>
  );
}
