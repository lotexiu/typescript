import { Signal, signal } from '@tsr-node/signal/model';
import { Dialog } from '../dialog/model';
import { TPopoverOptions } from './types';
import { TPositionOptions, TPositionResult, TRect, TSize } from '../position/types';
import { PositionUtils } from '../position/utils';
import { TAttributes } from '../types';

/**
 * A non-modal `Dialog` anchored to another element, closed by a click outside by default, that also keeps the
 * computed position. The adapter measures anchor and content, calls `place`, and applies `position()`.
 */
class Popover extends Dialog {
	/** Placement, offset, flip and shift used by `place`. */
	readonly positionOptions: TPositionOptions;
	/** Last computed position; `undefined` until `place` runs. */
	readonly position: Signal<TPositionResult | undefined>;

	/**
	 * Computes and stores the position from the measured anchor, content size and boundary (usually the viewport).
	 */
	readonly place = (anchor: TRect, floating: TSize, boundary: TRect): TPositionResult => {
		const result = PositionUtils.compute(anchor, floating, boundary, this.positionOptions);
		this.position.set(result);
		return result;
	};

	constructor(options: TPopoverOptions = {}) {
		super({ ...options, modal: options.modal ?? false });
		const { placement, offset, flip, shift, padding, arrowSize } = options;
		this.positionOptions = { placement, offset, flip, shift, padding, arrowSize };
		this.position = signal<TPositionResult | undefined>(undefined);
	}

	protected override popupKind(): string {
		return 'true';
	}

	protected override contentAttributes(): TAttributes {
		const position = this.position();
		return { 'data-side': position?.side, 'data-placement': position?.placement };
	}
}

export { Popover };
