import { TState } from "../types";
import { MOUSE_BUTTON_MAP } from "./declarations";

type TMouseButtonMap = typeof MOUSE_BUTTON_MAP;

/** The numeric `MouseEvent.button` codes `mouseManager` recognizes (keys of `MOUSE_BUTTON_MAP`). */
type TMouseButtonsCode = keyof TMouseButtonMap;

/** The named mouse buttons `mouseManager` reports (`"MouseLeft"`, etc.), or `"Unknown"` for an unrecognized code. */
type TMouseButtons = TMouseButtonMap[keyof TMouseButtonMap] | "Unknown";

/** Current vs. previous cursor position, tracked per axis. */
type TMouseCoord = {
	x: TState<number>,
	y: TState<number>,
}

/** Listener signature `mouseManager.add(...)` accepts. */
type TMouseOnEvent = (value: TMouseValue) => boolean | void;

/** The event payload passed to `mouseManager` listeners on move/down/up. */
type TMouseValue = {
	isMove: boolean,
	coord: TMouseCoord,
	buttons: TState<TMouseButtons[]>,
	buttonsChanged: boolean,
	target: EventTarget | null,
	preventDefault: () => void,
	defaultPrevented: boolean,
}

/** Which mouse buttons are currently held down, and the last known cursor position. */
type TMouseState = {
	buttons: Partial<Record<TMouseButtonsCode, boolean>>,
	x?: number,
	y?: number,
}

export {
	TMouseButtonsCode,
	TMouseButtons,
	TMouseCoord,
	TMouseOnEvent,
	TMouseValue,
	TMouseState,
}