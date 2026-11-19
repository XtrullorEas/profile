/**
 * scroll-progress — element-vs-viewport scroll progress as a 0..1 value.
 *
 * Reproduces the `useScroll({ target, offset })` idiom without a library:
 * progress is 0 while the start anchor has not been crossed and 1 once the
 * end anchor has. An anchor pairs a fraction of the element's height with a
 * fraction of the viewport height: `[0, 1]` reads "the element's top edge
 * meets the bottom of the viewport"; `[1, 0.5]` reads "the element's bottom
 * edge meets 50% down the viewport".
 *
 * Scroll/resize listeners are passive and coalesced onto animation frames;
 * `onChange` only fires when the clamped value actually changes. Call
 * `update()` after mutating content yourself — it re-measures synchronously
 * and always re-fires.
 *
 * Shared nularUI utility — self-contained by design. In your project it
 * lives at `src/lib/nular/scroll-progress.ts`, copied once and reused by
 * every nularUI component that needs it.
 */

/** `[elementFraction, viewportFraction]` — see the module doc above. */
export type ScrollAnchor = readonly [element: number, viewport: number];

export interface ScrollProgressOptions {
  /** Anchor where progress hits 0. Default `[0, 1]` (top meets bottom). */
  start?: ScrollAnchor;
  /** Anchor where progress hits 1. Default `[1, 0]` (bottom meets top). */
  end?: ScrollAnchor;
  /** Receives the clamped 0..1 progress whenever it changes. */
  onChange: (progress: number) => void;
}

export interface ScrollProgressHandle {
  /** Synchronous re-measure that always re-fires `onChange`. */
  update(): void;
  /** Removes the listeners and cancels any pending frame. */
  destroy(): void;
}

export function trackScrollProgress(
  element: Element,
  options: ScrollProgressOptions,
): ScrollProgressHandle {
  const [startElement, startViewport] = options.start ?? [0, 1];
  const [endElement, endViewport] = options.end ?? [1, 0];
  const abort = new AbortController();
  let frame = 0;
  let last = Number.NaN;

  const measure = () => {
    frame = 0;
    const viewport = window.innerHeight;
    const rect = element.getBoundingClientRect();
    // `rect.top` value at which each anchor line is crossed.
    const startTop = startViewport * viewport - startElement * rect.height;
    const endTop = endViewport * viewport - endElement * rect.height;
    const span = startTop - endTop;
    const progress =
      span === 0
        ? rect.top <= startTop
          ? 1
          : 0
        : Math.min(1, Math.max(0, (startTop - rect.top) / span));
    if (progress === last) return;
    last = progress;
    options.onChange(progress);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };

  window.addEventListener('scroll', schedule, {
    passive: true,
    signal: abort.signal,
  });
  window.addEventListener('resize', schedule, {
    passive: true,
    signal: abort.signal,
  });
  measure();

  return {
    update() {
      cancelAnimationFrame(frame);
      last = Number.NaN;
      measure();
    },
    destroy() {
      abort.abort();
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
