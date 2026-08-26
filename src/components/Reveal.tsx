"use client";

/**
 * Scroll reveal.
 *
 * IMPORTANT: never place this inside a parent with `overflow: hidden` that
 * clips it. An IntersectionObserver on a fully clipped element reports a ratio
 * of 0 forever, so the reveal would never fire and the content would stay
 * invisible. The guard below makes that failure mode impossible: if the
 * observer has not reported a visible entry shortly after mount, the element
 * is revealed anyway. Content visibility never depends on an animation.
 */

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Reveal({
  children,
  className,
  as: Tag = "div",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delayMs?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let settled = false;
    const show = () => {
      if (settled) return;
      settled = true;
      if (delayMs > 0) window.setTimeout(() => setVisible(true), delayMs);
      else setVisible(true);
    };

    // No observer support: reveal on the next tick (asynchronously, so this
    // never becomes a synchronous setState inside the effect body).
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(show, 0);
      return () => window.clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    observer.observe(el);

    // Safety net: if the observer never fires -- clipped ancestor, zero-size
    // box, a browser that throttles it -- show the content regardless.
    const failsafe = window.setTimeout(show, 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delayMs]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn("reveal", className)}
      data-visible={visible ? "true" : "false"}
    >
      {children}
    </Tag>
  );
}
