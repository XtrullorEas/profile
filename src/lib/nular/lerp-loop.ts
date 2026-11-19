/**
 * lerp-loop — exponential smoothing toward moving targets on a
 * self-stopping requestAnimationFrame loop: the cheap stand-in for a
 * spring. Each frame every value moves `factor` of its remaining distance;
 * once all values are within `epsilon` of their targets they snap exactly
 * onto them, one final frame fires, and the loop stops until the next
 * `setTarget`.
 *
 * `setTarget` performs one synchronous step (immediate visual feedback on
 * pointer/scroll events) and keeps the loop alive while anything is still
 * moving. `snap` jumps instantly — use it for teleports and as the
 * reduced-motion path.
 *
 * Shared nularUI utility — self-contained by design. In your project it
 * lives at `src/lib/nular/lerp-loop.ts`, copied once and reused by every
 * nularUI component that needs it.
 */

export interface LerpLoopOptions {
  /** Fraction of the remaining distance covered per frame. Default 0.18. */
  factor?: number;
  /** Distance at which a value counts as settled. Default 0.5. */
  epsilon?: number;
  /** Receives the smoothed values every frame (including the final snap). */
  onFrame: (values: readonly number[]) => void;
}

export interface LerpLoop {
  /** Current smoothed values. */
  readonly values: readonly number[];
  /** Retargets and steps once synchronously; keeps animating until settled. */
  setTarget(...targets: number[]): void;
  /** Jumps values and targets instantly (teleports, reduced motion). */
  snap(...targets: number[]): void;
  destroy(): void;
}

export function createLerpLoop(
  initial: readonly number[],
  options: LerpLoopOptions,
): LerpLoop {
  const factor = options.factor ?? 0.18;
  const epsilon = options.epsilon ?? 0.5;
  const values = [...initial];
  const targets = [...initial];
  let frame = 0;

  const step = () => {
    let settled = true;
    for (let i = 0; i < values.length; i++) {
      const target = targets[i]!;
      const next = values[i]! + (target - values[i]!) * factor;
      values[i] = Math.abs(target - next) <= epsilon ? target : next;
      if (values[i] !== target) settled = false;
    }
    options.onFrame(values);
    if (settled) {
      frame = 0;
    } else {
      frame = requestAnimationFrame(step);
    }
  };

  return {
    get values(): readonly number[] {
      return values;
    },
    setTarget(...next: number[]) {
      for (let i = 0; i < next.length && i < targets.length; i++) {
        targets[i] = next[i]!;
      }
      cancelAnimationFrame(frame);
      frame = 0;
      step();
    },
    snap(...next: number[]) {
      for (let i = 0; i < next.length && i < targets.length; i++) {
        targets[i] = next[i]!;
        values[i] = next[i]!;
      }
      cancelAnimationFrame(frame);
      frame = 0;
      options.onFrame(values);
    },
    destroy() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
