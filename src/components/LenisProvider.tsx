"use client";

/**
 * Smooth scrolling, deliberately narrow in scope.
 *
 * Lenis is enabled ONLY when all of these hold:
 *   - the viewport is desktop-width (>= 1024px), and
 *   - the primary pointer is a mouse (so trackpad/mouse, not touch), and
 *   - the visitor has not asked for reduced motion, and
 *   - no modal or calendar is open, and
 *   - the current route is not the admin screen.
 *
 * On tablet and mobile it never runs: hijacking native touch momentum makes a
 * booking form feel broken on the exact devices most people book from.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useOverlayOpen } from "@/lib/overlay-state";

export default function LenisProvider() {
  const pathname = usePathname();
  const overlayOpen = useOverlayOpen();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const shouldRun = () =>
      desktop.matches && finePointer.matches && !reduced.matches;

    const start = () => {
      if (lenisRef.current) return;
      const lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        // Never take over touch scrolling.
        syncTouch: false,
        touchMultiplier: 0,
      });
      lenisRef.current = lenis;
      const loop = (time: number) => {
        lenis.raf(time);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };

    const sync = () => (shouldRun() ? start() : stop());
    sync();

    desktop.addEventListener("change", sync);
    finePointer.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      finePointer.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      stop();
    };
  }, [isAdmin]);

  // Pause while a modal or the calendar is open so the page behind cannot
  // drift under the dialog, then resume.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (overlayOpen) lenis.stop();
    else lenis.start();
  }, [overlayOpen]);

  // A route change resets scroll; make sure Lenis agrees with the DOM.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
