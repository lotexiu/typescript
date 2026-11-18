/**
 * @internal
 * Decimal places kept in path numbers: enough for sub-pixel precision, short enough to keep the text small.
 */
const PATH_DECIMALS = 3;

/**
 * @internal
 */
const FULL_TURN_DEGREES = 360;

/**
 * @internal
 * Angle 0 points up (12 o'clock) and grows clockwise, like a clock or a pie chart.
 */
const QUARTER_TURN_DEGREES = 90;

export { PATH_DECIMALS, FULL_TURN_DEGREES, QUARTER_TURN_DEGREES };
