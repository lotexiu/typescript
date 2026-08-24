/**
 * Named mouse buttons this state tracks. Mirrors the vocabulary
 * `html/managers/mouse`'s `MOUSE_BUTTON_MAP` already uses, but declared
 * independently here — this module has no dependency on the DOM-facing
 * manager, on purpose (see `model.ts`).
 */
type TMouseButton = 'MouseLeft' | 'MouseMiddle' | 'MouseRight' | 'MouseBack' | 'MouseForward';

/** A plain `{x, y}` cursor position — no DOM types involved. */
type TMousePosition = {
	x: number,
	y: number,
}

export type {
	TMouseButton,
	TMousePosition,
}
