"use client";

/**
 * Modal dialog.
 *
 *   - rendered through a portal to <body>, so no ancestor with
 *     overflow: hidden can clip it;
 *   - locks body scroll while open and restores the previous value on close,
 *     including the scrollbar-gutter compensation so the page does not jump;
 *   - traps Tab inside the dialog and returns focus to whatever opened it;
 *   - registers itself in the overlay counter so Lenis pauses.
 */

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock, useEscape, useHydrated } from "@/lib/store/hooks";
import { pushOverlay } from "@/lib/overlay-state";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  labelledBy,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  labelledBy?: string;
  size?: "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  // useSyncExternalStore-based: no setState-in-effect needed to know we
  // are past hydration.
  const mounted = useHydrated();
  useBodyScrollLock(open);
  useEscape(open, onClose);

  // Overlay registration -> Lenis stops while this is open.
  useEffect(() => {
    if (!open) return;
    return pushOverlay();
  }, [open]);

  // Remember the trigger, focus the panel, restore on close.
  useEffect(() => {
    if (!open) return;
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panelRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      restoreFocusTo.current?.focus?.();
    };
  }, [open]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="layer-overlay fixed inset-0 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-[rgba(21,24,26,0.42)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? "modal-title"}
        aria-describedby={description ? "modal-desc" : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={cn(
          "relative flex max-h-[92svh] w-full flex-col overflow-hidden bg-[var(--color-surface)] outline-none",
          "rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)]",
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={labelledBy ?? "modal-title"} className="t-title">
              {title}
            </h2>
            {description ? (
              <p
                id="modal-desc"
                className="mt-1 text-sm text-[var(--color-ink-soft)]"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[var(--color-line)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <span className="sr-only">Tutup</span>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
