/**
 * @internal
 */
const SLIDER_DEFAULTS = {
	MIN: 0,
	MAX: 100,
	STEP: 1,
	STEPS_PER_LARGE_STEP: 10,
} as const;

/**
 * @internal
 */
const STEP_PRECISION_DIGITS = 12;

export { SLIDER_DEFAULTS, STEP_PRECISION_DIGITS };
