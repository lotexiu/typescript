import { OPPOSITE_SIDE } from './declarations';
import { TAlignment, TPlacement, TPositionOptions, TPositionResult, TRect, TSide, TSize } from './types';

/**
 * Where to put a floating element (popover, menu, tooltip, select list) next to an anchor, with flip and shift —
 * pure geometry over rectangles, the same job Floating UI does. Measuring elements and applying `x`/`y` is the adapter's part.
 */
class PositionUtils {
	/** Splits `'right-start'` into `['right', 'start']`; a bare side is centered. */
	static parse(placement: TPlacement): readonly [TSide, TAlignment] {
		const [side, alignment] = placement.split('-') as [TSide, TAlignment | undefined];
		return [side, alignment ?? 'center'];
	}

	/** Builds a placement from side and alignment (`center` gives the bare side). */
	static join(side: TSide, alignment: TAlignment): TPlacement {
		return (alignment === 'center' ? side : `${side}-${alignment}`) as TPlacement;
	}

	/** Whether the side is `top` or `bottom`. */
	static isVertical(side: TSide): boolean {
		return side === 'top' || side === 'bottom';
	}

	/**
	 * Positions `floating` against `anchor` inside `boundary` (usually the viewport).
	 * @example
	 * const { x, y, placement } = PositionUtils.compute(buttonRect, { width: 200, height: 300 }, viewport, { placement: 'bottom-start', offset: 4 })
	 */
	static compute(anchor: TRect, floating: TSize, boundary: TRect, options: TPositionOptions = {}): TPositionResult {
		const { placement = 'bottom', offset = 0, flip = true, shift = true, padding = 0, arrowSize = 0 } = options;
		const [preferredSide, alignment] = PositionUtils.parse(placement);
		const side = flip ? PositionUtils.#bestSide(preferredSide, anchor, floating, boundary, offset) : preferredSide;
		let [x, y] = PositionUtils.#place(side, alignment, anchor, floating, offset);
		if (shift) [x, y] = PositionUtils.#shift(side, x, y, floating, boundary, padding);
		return {
			x,
			y,
			placement: PositionUtils.join(side, alignment),
			side,
			arrow: PositionUtils.#arrow(side, x, y, anchor, floating, arrowSize),
			available: PositionUtils.#space(side, anchor, boundary, offset),
		};
	}

	static #space(side: TSide, anchor: TRect, boundary: TRect, offset: number): number {
		switch (side) {
			case 'top':
				return anchor.y - boundary.y - offset;
			case 'bottom':
				return boundary.y + boundary.height - (anchor.y + anchor.height) - offset;
			case 'left':
				return anchor.x - boundary.x - offset;
			case 'right':
				return boundary.x + boundary.width - (anchor.x + anchor.width) - offset;
		}
	}

	static #bestSide(preferred: TSide, anchor: TRect, floating: TSize, boundary: TRect, offset: number): TSide {
		const needed = PositionUtils.isVertical(preferred) ? floating.height : floating.width;
		const room = PositionUtils.#space(preferred, anchor, boundary, offset);
		if (room >= needed) return preferred;
		const opposite = OPPOSITE_SIDE[preferred];
		return PositionUtils.#space(opposite, anchor, boundary, offset) > room ? opposite : preferred;
	}

	static #align(alignment: TAlignment, anchorStart: number, anchorLength: number, floatingLength: number): number {
		if (alignment === 'start') return anchorStart;
		if (alignment === 'end') return anchorStart + anchorLength - floatingLength;
		return anchorStart + (anchorLength - floatingLength) / 2;
	}

	static #place(side: TSide, alignment: TAlignment, anchor: TRect, floating: TSize, offset: number): [number, number] {
		switch (side) {
			case 'top':
				return [PositionUtils.#align(alignment, anchor.x, anchor.width, floating.width), anchor.y - floating.height - offset];
			case 'bottom':
				return [PositionUtils.#align(alignment, anchor.x, anchor.width, floating.width), anchor.y + anchor.height + offset];
			case 'left':
				return [anchor.x - floating.width - offset, PositionUtils.#align(alignment, anchor.y, anchor.height, floating.height)];
			case 'right':
				return [anchor.x + anchor.width + offset, PositionUtils.#align(alignment, anchor.y, anchor.height, floating.height)];
		}
	}

	static #clamp(value: number, minimum: number, maximum: number): number {
		return maximum < minimum ? minimum : Math.min(maximum, Math.max(minimum, value));
	}

	static #shift(side: TSide, x: number, y: number, floating: TSize, boundary: TRect, padding: number): [number, number] {
		if (PositionUtils.isVertical(side)) {
			return [PositionUtils.#clamp(x, boundary.x + padding, boundary.x + boundary.width - floating.width - padding), y];
		}
		return [x, PositionUtils.#clamp(y, boundary.y + padding, boundary.y + boundary.height - floating.height - padding)];
	}

	static #arrow(side: TSide, x: number, y: number, anchor: TRect, floating: TSize, arrowSize: number): number {
		const vertical = PositionUtils.isVertical(side);
		const anchorCenter = vertical ? anchor.x + anchor.width / 2 : anchor.y + anchor.height / 2;
		const start = vertical ? x : y;
		const length = vertical ? floating.width : floating.height;
		return PositionUtils.#clamp(anchorCenter - start - arrowSize / 2, 0, length - arrowSize);
	}
}

export { PositionUtils };
