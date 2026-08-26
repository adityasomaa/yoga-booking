"use client";

/**
 * =============================================================================
 *  PAGE TRANSITION
 * =============================================================================
 *
 *  Order, strictly:
 *
 *      1. page CLOSES          curtain covers the viewport
 *      2. content CHANGES      router commits the new route, hidden behind it
 *      3. SCROLL TO TOP        while still hidden
 *      4. page OPENS           curtain lifts to reveal the new page
 *
 *  Steps 2 and 3 happen entirely underneath the curtain, so the visitor never
 *  sees a half-swapped page or a scroll jump.
 *
 *  TWO LOADERS
 *      "boot" -- first load of the site, and any navigation to the home page
 *      "page" -- every other route change
 *
 *  Every step is advanced by raceFrame(), never by rAF alone. See race-timer.ts
 *  for why. There is also a hard failsafe: if the router never reports the new
 *  route, the curtain lifts anyway rather than trapping the visitor.
 * =============================================================================
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { raceFrame, type CancelFn } from "@/lib/race-timer";
import Curtain from "./Curtain";

export type Phase = "boot" | "idle" | "closing" | "opening";
export type CurtainVariant = "boot" | "page";

export const TIMING = {
  /** How long the curtain takes to cover the screen. */
  close: 620,
  /** How long the curtain takes to lift. */
  open: 680,
  /** How long the first-load loader holds before lifting. */
  bootHold: 1150,
  /** Absolute ceiling before the curtain force-lifts. */
  failsafe: 5000,
} as const;

type TransitionContextValue = {
  phase: Phase;
  variant: CurtainVariant;
  navigate: (href: string) => void;
  isBusy: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("useTransition must be used inside <TransitionProvider>");
  }
  return ctx;
}

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>("boot");
  const [variant, setVariant] = useState<CurtainVariant>("boot");

  const pendingHref = useRef<string | null>(null);
  const lastPath = useRef(pathname);
  const cancels = useRef<CancelFn[]>([]);

  const clearTimers = useCallback(() => {
    for (const c of cancels.current) c();
    cancels.current = [];
  }, []);

  const schedule = useCallback((ms: number, fn: () => void) => {
    const cancel = raceFrame(ms, fn);
    cancels.current.push(cancel);
  }, []);

  /* --- initial load: hold the boot loader, then open ------------------- */
  useEffect(() => {
    schedule(TIMING.bootHold, () => {
      setPhase("opening");
      schedule(TIMING.open, () => setPhase("idle"));
    });
    return clearTimers;
    // Runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- step 1: close ---------------------------------------------------- */
  const navigate = useCallback(
    (href: string) => {
      const target = href.split("#")[0];
      if (target === pathname) return;

      clearTimers();
      pendingHref.current = target;
      // Navigating to home uses the first-load loader, everything else the
      // lighter page curtain.
      setVariant(target === "/" ? "boot" : "page");
      setPhase("closing");

      // Step 2 fires only once the curtain has fully covered the screen.
      schedule(TIMING.close, () => {
        router.push(target);
      });

      // Failsafe: never leave the curtain down forever.
      schedule(TIMING.failsafe, () => {
        if (pendingHref.current) {
          pendingHref.current = null;
          window.scrollTo(0, 0);
          setPhase("opening");
          schedule(TIMING.open, () => setPhase("idle"));
        }
      });
    },
    [pathname, router, schedule, clearTimers]
  );

  /* --- steps 3 + 4: scroll to top, then open ---------------------------- */
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    if (!pendingHref.current) {
      // Browser back/forward, or a navigation that did not go through
      // navigate(). No curtain is down, so nothing to lift.
      return;
    }
    pendingHref.current = null;
    clearTimers();

    // Still fully hidden here: reset scroll before revealing.
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;

    setPhase("opening");
    schedule(TIMING.open, () => setPhase("idle"));
  }, [pathname, schedule, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo(
    () => ({
      phase,
      variant,
      navigate,
      isBusy: phase === "closing" || phase === "boot",
    }),
    [phase, variant, navigate]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <Curtain phase={phase} variant={variant} />
    </TransitionContext.Provider>
  );
}
