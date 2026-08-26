"use client";

/**
 * The two loaders.
 *
 *   variant "boot" -- first load and any navigation to home. Wordmark plus a
 *                     single arc that draws itself, on a solid field.
 *   variant "page" -- every other route change. A quieter panel wipe with the
 *                     studio mark only.
 *
 * Both are pure CSS transitions driven by the data-phase attribute, so the
 * visual state is always a direct function of the phase. Nothing here depends
 * on requestAnimationFrame to reach its end state.
 *
 * Depth comes from gradients, line work and contrast. There is deliberately no
 * grain, noise or speckle texture anywhere.
 */

import type { CurtainVariant, Phase } from "./TransitionProvider";
import { STUDIO_NAME } from "@/lib/config";
import { TIMING } from "./TransitionProvider";

export default function Curtain({
  phase,
  variant,
}: {
  phase: Phase;
  variant: CurtainVariant;
}) {
  const covering = phase === "boot" || phase === "closing";
  const done = phase === "idle";

  return (
    <div
      aria-hidden={done ? "true" : undefined}
      className="layer-curtain pointer-events-none fixed inset-0"
      style={{ visibility: done ? "hidden" : "visible" }}
      data-phase={phase}
      data-variant={variant}
    >
      {/* Live region so a screen reader is told the page is loading rather
          than being left in silence during the swap. */}
      <p className="sr-only" role="status" aria-live="polite">
        {phase === "closing"
          ? "Memuat halaman"
          : phase === "opening"
            ? "Halaman siap"
            : ""}
      </p>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background:
            variant === "boot"
              ? "linear-gradient(168deg, #1c5344 0%, #17453a 52%, #123528 100%)"
              : "linear-gradient(178deg, #f4f1ea 0%, #ebe7dc 100%)",
          transform: covering ? "translateY(0)" : "translateY(-101%)",
          transition: `transform ${covering ? TIMING.close : TIMING.open}ms cubic-bezier(0.72, 0, 0.24, 1)`,
        }}
      >
        <div
          className="flex flex-col items-center gap-5 px-6"
          style={{
            opacity: covering ? 1 : 0,
            transform: covering ? "translateY(0)" : "translateY(-10px)",
            transition: `opacity 340ms ease, transform 340ms ease`,
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
            className="curtain-mark"
          >
            <path
              d="M 12 34 A 20 26 0 0 1 52 34"
              fill="none"
              stroke={variant === "boot" ? "#e2ede7" : "#1c5344"}
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength={1}
            />
            <path
              d="M 12 34 A 20 26 0 0 0 52 34"
              fill="none"
              stroke={variant === "boot" ? "#e2ede7" : "#1c5344"}
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength={1}
              opacity="0.45"
            />
            <circle
              cx="32"
              cy="34"
              r="4"
              fill={variant === "boot" ? "#e2ede7" : "#1c5344"}
            />
          </svg>

          {variant === "boot" ? (
            <p
              className="text-center text-sm tracking-[0.28em] uppercase"
              style={{ color: "#e2ede7" }}
            >
              {STUDIO_NAME}
            </p>
          ) : null}
        </div>
      </div>

      <style>{`
        .curtain-mark path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: curtain-draw 1000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .curtain-mark path:nth-of-type(2) { animation-delay: 120ms; }
        .curtain-mark circle {
          opacity: 0;
          animation: curtain-dot 460ms ease 520ms forwards;
        }
        @keyframes curtain-draw { to { stroke-dashoffset: 0; } }
        @keyframes curtain-dot { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .curtain-mark path { animation: none; stroke-dashoffset: 0; }
          .curtain-mark circle { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
