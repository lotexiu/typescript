/**
 * @internal
 */
const SPRING_DEFAULTS = {
	STIFFNESS: 170,
	DAMPING: 26,
	MASS: 1,
	PRECISION: 0.001,
} as const;

/**
 * @internal
 * Longest integration step: a late frame is split into steps of at most this many seconds, so the spring never explodes.
 */
const MAX_STEP_SECONDS = 1 / 120;

/**
 * @internal
 */
const MILLISECONDS_PER_SECOND = 1000;

export { SPRING_DEFAULTS, MAX_STEP_SECONDS, MILLISECONDS_PER_SECOND };
