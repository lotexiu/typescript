/** Maps linear progress (0 → 1) to eased progress. May overshoot for springy curves. */
type TEasing = (progress: number) => number;

export type { TEasing };
