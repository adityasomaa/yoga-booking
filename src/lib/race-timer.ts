/**
 * =============================================================================
 *  raceFrame  --  advance an animation sequence without ever getting stuck.
 * =============================================================================
 *
 *  requestAnimationFrame STOPS being called when a tab is moved to the
 *  background. Any sequence that chains its next step off rAF alone will
 *  therefore freeze mid-way, and a page-transition curtain that freezes
 *  half-drawn never lifts -- the visitor is left staring at a blank panel
 *  until they reload.
 *
 *  So every step of the transition races the two clocks:
 *
 *     setTimeout  -- keeps firing when the tab is hidden (throttled, but it
 *                    fires), guaranteeing the sequence always completes;
 *     rAF         -- fires in sync with the compositor when the tab is
 *                    visible, so the visible timing stays smooth.
 *
 *  Whichever arrives first wins, the other is cancelled, and the callback runs
 *  exactly once.
 * =============================================================================
 */

export type CancelFn = () => void;

export function raceFrame(ms: number, callback: () => void): CancelFn {
  if (typeof window === "undefined") {
    callback();
    return () => {};
  }

  let done = false;
  let rafId = 0;
  const start =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  const finish = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timeoutId);
    if (rafId) window.cancelAnimationFrame(rafId);
    callback();
  };

  // Clock A: survives backgrounding.
  const timeoutId = window.setTimeout(finish, ms);

  // Clock B: smooth while visible.
  const loop = (t: number) => {
    if (done) return;
    if (t - start >= ms) finish();
    else rafId = window.requestAnimationFrame(loop);
  };
  rafId = window.requestAnimationFrame(loop);

  return () => {
    if (done) return;
    done = true;
    window.clearTimeout(timeoutId);
    if (rafId) window.cancelAnimationFrame(rafId);
  };
}
