"use client";

/**
 * =============================================================================
 *  Listbox  --  custom dropdown implementing the ARIA listbox pattern.
 * =============================================================================
 *
 *  No native <select> is used anywhere on this site, so this component has to
 *  carry the full keyboard contract itself:
 *
 *    ArrowDown / ArrowUp   move the active option
 *    Home / End            jump to first / last
 *    printable characters  type-ahead, buffered, resets after 600ms
 *    Enter / Space         choose the active option and close
 *    Escape                close without choosing
 *    Tab                   close and continue
 *    on close              focus returns to the trigger, always
 *
 *  The popup is rendered through a portal to <body> so it cannot be clipped by
 *  an ancestor with overflow: hidden -- the schedule filters sit inside
 *  scrolling containers, where an in-flow popup would be cut off.
 * =============================================================================
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/store/hooks";

export type ListboxOption<T extends string = string> = {
  value: T;
  label: string;
  /** Optional second line inside the option. */
  hint?: string;
  disabled?: boolean;
};

export type ListboxProps<T extends string = string> = {
  label: string;
  value: T;
  options: ListboxOption<T>[];
  onChange: (value: T) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  id?: string;
  className?: string;
  buttonClassName?: string;
  invalid?: boolean;
  describedBy?: string;
  /** Hides the visible label but keeps it for assistive tech. */
  hideLabel?: boolean;
  disabled?: boolean;
};

type Rect = { top: number; left: number; width: number; openUp: boolean };

export default function Listbox<T extends string = string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Pilih salah satu",
  id,
  className,
  buttonClassName,
  invalid,
  describedBy,
  hideLabel,
  disabled,
}: ListboxProps<T>) {
  const reactId = useId();
  const baseId = id ?? `lb-${reactId}`;
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ buffer: "", at: 0 });

  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const mounted = useHydrated();

  const selectedIndex = options.findIndex((o) => o.value === value);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0
  );

  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const position = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    // Flip upward when there is not enough room beneath the trigger.
    const openUp = spaceBelow < 240 && r.top > spaceBelow;
    setRect({
      top: openUp ? r.top : r.bottom,
      left: r.left,
      width: r.width,
      openUp,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    position();
    const onScroll = () => position();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, position]);

  // Move DOM focus into the list the moment it mounts, so ArrowDown / ArrowUp /
  // Home / End / type-ahead reach the list instead of the trigger.
  //
  // This is done from the ref callback rather than an effect. The popup is only
  // rendered once `rect` has been measured, which happens a render AFTER `open`
  // flips true -- so an effect keyed on `open` runs while the <ul> does not yet
  // exist and focuses nothing, leaving the whole keyboard contract dead. The
  // ref callback fires exactly when the node enters the DOM, which removes the
  // ordering question entirely.
  const focusedThisOpen = useRef(false);
  useEffect(() => {
    if (!open) focusedThisOpen.current = false;
  }, [open]);

  const attachList = useCallback((node: HTMLUListElement | null) => {
    listRef.current = node;
    if (node && !focusedThisOpen.current) {
      focusedThisOpen.current = true;
      node.focus();
    }
  }, []);

  /** Opens the list with the active option aligned to the current value. */
  const openList = useCallback(() => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [selectedIndex]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      onChange(option.value);
      close();
    },
    [options, onChange, close]
  );

  const moveActive = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        const n = options.length;
        if (n === 0) return current;
        let next = current;
        for (let step = 0; step < n; step++) {
          next = (next + delta + n) % n;
          if (!options[next].disabled) return next;
        }
        return current;
      });
    },
    [options]
  );

  const jumpTo = useCallback(
    (from: "start" | "end") => {
      const n = options.length;
      if (!n) return;
      if (from === "start") {
        const i = options.findIndex((o) => !o.disabled);
        if (i >= 0) setActiveIndex(i);
      } else {
        for (let i = n - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            setActiveIndex(i);
            return;
          }
        }
      }
    },
    [options]
  );

  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(1);
        return;
      case "ArrowUp":
        e.preventDefault();
        moveActive(-1);
        return;
      case "Home":
        e.preventDefault();
        jumpTo("start");
        return;
      case "End":
        e.preventDefault();
        jumpTo("end");
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(activeIndex);
        return;
      case "Escape":
        e.preventDefault();
        close();
        return;
      case "Tab":
        close(false);
        return;
      default:
        break;
    }

    // Type-ahead: buffer printable characters, reset after a pause.
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const now = Date.now();
      const state = typeahead.current;
      state.buffer = now - state.at > 600 ? e.key : state.buffer + e.key;
      state.at = now;
      const needle = state.buffer.toLowerCase();
      const startAt = state.buffer.length === 1 ? activeIndex + 1 : activeIndex;
      const n = options.length;
      for (let i = 0; i < n; i++) {
        const idx = (startAt + i) % n;
        const o = options[idx];
        if (!o.disabled && o.label.toLowerCase().startsWith(needle)) {
          setActiveIndex(idx);
          return;
        }
      }
    }
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (open) return; // already open: the list owns the keyboard
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  // Outside click closes without stealing focus back.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (listRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const popup = useMemo(() => {
    if (!open || !rect || !mounted) return null;
    return createPortal(
      <ul
        ref={attachList}
        id={listId}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={labelId}
        aria-activedescendant={
          options[activeIndex] ? optionId(activeIndex) : undefined
        }
        onKeyDown={onListKeyDown}
        className="layer-overlay fixed max-h-60 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] py-1 shadow-[0_18px_40px_-24px_rgba(21,24,26,0.45)] outline-none"
        style={{
          top: rect.openUp ? undefined : rect.top + 6,
          bottom: rect.openUp ? window.innerHeight - rect.top + 6 : undefined,
          left: rect.left,
          width: rect.width,
        }}
      >
        {options.map((o, i) => (
          <li
            key={o.value}
            id={optionId(i)}
            role="option"
            aria-selected={o.value === value}
            aria-disabled={o.disabled || undefined}
            onPointerEnter={() => !o.disabled && setActiveIndex(i)}
            onClick={() => commit(i)}
            className={cn(
              "cursor-pointer px-3 py-2 text-sm leading-snug",
              i === activeIndex && "bg-[var(--color-accent-soft)]",
              o.value === value && "font-medium text-[var(--color-accent)]",
              o.disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="block">{o.label}</span>
            {o.hint ? (
              <span className="mt-0.5 block text-xs text-[var(--color-ink-soft)]">
                {o.hint}
              </span>
            ) : null}
          </li>
        ))}
      </ul>,
      document.body
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rect, mounted, options, activeIndex, value, listId, labelId]);

  return (
    <div className={cn("relative", className)}>
      <span id={labelId} className={cn("field-label", hideLabel && "sr-only")}>
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "field-input flex items-center justify-between gap-2 text-left",
          !selected && "text-[var(--color-ink-soft)]",
          disabled && "cursor-not-allowed opacity-60",
          buttonClassName
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
          className={cn(
            "flex-none transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <path
            d="M1 1.5 6 6.5 11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {popup}
    </div>
  );
}
