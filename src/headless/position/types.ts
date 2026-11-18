/** A rectangle in any coordinate space (usually viewport pixels). */
type TRect = {
	/** Left edge. */
	readonly x: number;
	/** Top edge. */
	readonly y: number;
	/** Width. */
	readonly width: number;
	/** Height. */
	readonly height: number;
};

/** Width and height of the floating element. */
type TSize = {
	/** Width. */
	readonly width: number;
	/** Height. */
	readonly height: number;
};

/** Which side of the anchor the floating element sits on. */
type TSide = 'top' | 'bottom' | 'left' | 'right';

/** How the floating element lines up with the anchor along the side: start edges, centers or end edges. */
type TAlignment = 'start' | 'center' | 'end';

/** `side` or `side-alignment`, e.g. `'bottom'`, `'right-start'`. */
type TPlacement = TSide | `${TSide}-${Exclude<TAlignment, 'center'>}`;

/** How to place a floating element next to its anchor. */
type TPositionOptions = {
	/** Where to try first. Default `'bottom'`. */
	readonly placement?: TPlacement;
	/** Gap between anchor and floating element, in the same unit as the rects. Default `0`. */
	readonly offset?: number;
	/** Move to the opposite side when the preferred one does not fit but the opposite does. Default `true`. */
	readonly flip?: boolean;
	/** Slide along the side to stay inside the boundary. Default `true`. */
	readonly shift?: boolean;
	/** Minimum distance kept from the boundary edges by `shift`. Default `0`. */
	readonly padding?: number;
	/** Size of an arrow element, so its offset can be clamped away from the floating element's corners. */
	readonly arrowSize?: number;
};

/** Where to put the floating element. */
type TPositionResult = {
	/** Left edge of the floating element. */
	readonly x: number;
	/** Top edge of the floating element. */
	readonly y: number;
	/** The placement actually used (differs from the requested one after a flip). */
	readonly placement: TPlacement;
	/** Side actually used. */
	readonly side: TSide;
	/** Arrow position along the floating element's edge, pointing at the anchor's center. */
	readonly arrow: number;
	/** Room left between the anchor and the boundary on the chosen side — e.g. a `max-height` for a list. */
	readonly available: number;
};

export type { TRect, TSize, TSide, TAlignment, TPlacement, TPositionOptions, TPositionResult };
