import { TControlOptions } from '../control/types';
import { TOrientation, TTextDirection } from '../types';

/** Bounds of a numeric value and the step it snaps to. */
type TRange = {
	/** Smallest value. */
	readonly min: number;
	/** Largest value. */
	readonly max: number;
	/** Values snap to `min + n * step`. Without it any value inside the range is kept. */
	readonly step?: number;
};

/** Options of a `Slider`. `min` 0, `max` 100 and `step` 1 by default. */
type TSliderOptions = TControlOptions<number> &
	Partial<TRange> & {
		/** Distance for PageUp/PageDown and Shift+arrows. Default `step * 10`. */
		readonly largeStep?: number;
		/** Default `horizontal`. */
		readonly orientation?: TOrientation;
		/** Default `ltr`. */
		readonly direction?: TTextDirection;
		/** Text read by screen readers for a value (`aria-valuetext`) and shown by `text`. Default `String`. */
		readonly format?: (value: number) => string;
	};

export type { TRange, TSliderOptions };
