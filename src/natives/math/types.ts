/** Bounds and fallback used when clamping. */
type TClamp = {
	/** Value used when the input is not a number. */
	default?: number;
	/** Lower bound. */
	min?: number;
	/** Upper bound. */
	max?: number;
};

export { TClamp };
