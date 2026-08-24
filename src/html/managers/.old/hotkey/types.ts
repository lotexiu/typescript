import { TKeyboardEventCode, TKeyboardValue } from '../keyboard/types'
import { TMouseButtons, TMouseValue } from '../mouse/types'

/** A single input making up a hotkey combo — either a keyboard code or a mouse button. */
type THotkeyItem = TKeyboardEventCode | TMouseButtons

/** A set of inputs that must all be active together to trigger a hotkey. */
type THotkeyCombo = THotkeyItem[]

/** The underlying keyboard or mouse event that drove a hotkey check. */
type THotkeyEvent = TKeyboardValue | TMouseValue

/** Predicate deciding whether an event's target counts as "inside" a hotkey's bound element. */
type THotkeyElementValidator = (target: EventTarget | null) => boolean

/** The payload passed to a hotkey's `trigger`/`untrigger` callbacks. */
type THotkeyMatchData = {
	event: THotkeyEvent,
	combo: THotkeyCombo,
	isKeyboardEvent: boolean,
	isMouseEvent: boolean,
	preventDefault: () => void,
	defaultPrevented: boolean,
}

/** A registered hotkey binding: which combo(s) trigger it, on which element, and its trigger/untrigger callbacks. */
type THotkeyData = {
	combos: THotkeyCombo[],
	element?: THotkeyElementValidator,
	/**Prevent the combo from being triggered multiple times while the keys remain pressed (key-repeat).
	 * Specific to keyboard events.*/
	alternate?: boolean,
	/**When active, re-triggers the combo on every mouse movement while the combo is satisfied.*/
	triggerOnMouseMove?: boolean,
	preventDefault?: boolean,
	trigger: (data: THotkeyMatchData) => boolean | void,
	untrigger?: (data: THotkeyMatchData) => void,
}

export {
	THotkeyItem,
	THotkeyCombo,
	THotkeyEvent,
	THotkeyElementValidator,
	THotkeyMatchData,
	THotkeyData,
}