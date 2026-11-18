/** Schedules `callback` for the next frame with the current time in milliseconds; returns the function that cancels it. */
type TFrameScheduler = (callback: (now: number) => void) => () => void;

/**
 * @internal
 */
type TAnimationFrameHost = {
	requestAnimationFrame?: (callback: (now: number) => void) => number;
	cancelAnimationFrame?: (handle: number) => void;
};

export type { TFrameScheduler, TAnimationFrameHost };
