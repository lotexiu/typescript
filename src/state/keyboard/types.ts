/**
 * A keyboard key identifier. Kept as a plain `string` (matches
 * `KeyboardEvent.code`-shaped values like `"KeyA"`/`"ShiftLeft"`) rather
 * than importing `html/managers/keyboard`'s exhaustive literal union —
 * this module has no dependency on the DOM-facing manager, on purpose
 * (see `model.ts`).
 */
type TKeyCode = string;

export type {
	TKeyCode,
}
