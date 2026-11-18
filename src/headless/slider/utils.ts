import { TOrientation, TTextDirection } from '../types';
import { STEP_PRECISION_DIGITS } from './declarations';
import { TRange } from './types';

/**
 * Pure math of a range: clamping, snapping to a step, and converting between value, ratio and pointer position.
 */
class SliderUtils {
	/** Keeps `value` inside `[min, max]`. */
	static clamp(value: number, range: TRange): number {
		return Math.min(range.max, Math.max(range.min, value));
	}

	/** Clamps and snaps to the step, without floating point drift (`0.1 + 0.2` gives `0.3`). */
	static normalize(value: number, range: TRange): number {
		const clamped = SliderUtils.clamp(value, range);
		if (range.step === undefined || range.step <= 0) return clamped;
		const steps = Math.round((clamped - range.min) / range.step);
		const snapped = Number((range.min + steps * range.step).toPrecision(STEP_PRECISION_DIGITS));
		return Math.min(range.max, snapped);
	}

	/** Where `value` sits in the range, from 0 to 1 — use it to position the thumb and fill the track. */
	static ratio(value: number, range: TRange): number {
		const span = range.max - range.min;
		if (span <= 0) return 0;
		return (SliderUtils.clamp(value, range) - range.min) / span;
	}

	/** The normalized value at a ratio from 0 to 1. */
	static fromRatio(ratio: number, range: TRange): number {
		const bounded = Math.min(1, Math.max(0, ratio));
		return SliderUtils.normalize(range.min + bounded * (range.max - range.min), range);
	}

	/**
	 * Ratio under the pointer, given its distance from the start edge of the track and the track length. Vertical sliders grow upwards; right-to-left ones grow leftwards.
	 */
	static pointerRatio(offset: number, length: number, orientation: TOrientation, direction: TTextDirection): number {
		if (length <= 0) return 0;
		const ratio = Math.min(1, Math.max(0, offset / length));
		const reversed = orientation === 'vertical' || direction === 'rtl';
		return reversed ? 1 - ratio : ratio;
	}
}

export { SliderUtils };
