"use client";

/**
 * A Link that routes through the transition sequence instead of navigating
 * immediately. Falls back to normal Link behaviour for modified clicks
 * (new tab, middle click) and for external hrefs.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { useTransition } from "@/components/transition/TransitionProvider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  onNavigate?: () => void;
};

export default function TransitionLink({
  href,
  onClick,
  onNavigate,
  children,
  ...rest
}: Props) {
  const { navigate } = useTransition();
  const pathname = usePathname();

  const isInternal = href.startsWith("/") && !href.startsWith("//");

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!isInternal) return;
    // Let the browser handle new-tab / download / modified clicks.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    e.preventDefault();
    onNavigate?.();
    if (href.split("#")[0] === pathname) return;
    navigate(href);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
