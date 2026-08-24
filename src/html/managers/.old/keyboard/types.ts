import { TDigit } from "@tsn-number/types";
import { TState } from "../types";

type TDirectionX = "Left" | "Right";
type TDirectionY = "Up" | "Down";
type TDirections = TDirectionX | TDirectionY;

type TModifierKeys = "Alt" | "Control" | "Meta" | "Shift";

type TNumPadMathKeys = "Divide" | "Multiply" | "Subtract" | "Add";

type TWordKeys =
	| "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"
	| "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R"
	| "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

/* KeyCodes */

/** `KeyboardEvent.code` values for the function-key row (`F1`-`F12`). */
type TFnKeysCode = `F${1|2|3|4|5|6|7|8|9|10|11|12}`;

/** `KeyboardEvent.code` values for the letter keys (`KeyA`-`KeyZ`). */
type TWordKeysCode = `Key${TWordKeys}`;

/** `KeyboardEvent.code` values for the top-row digit keys (`Digit0`-`Digit9`). */
type TDigitKeysCode = `Digit${TDigit}`;

/** `KeyboardEvent.code` values for modifier keys, split by left/right side (e.g. `ShiftLeft`). */
type TModifierKeysCode = `${TModifierKeys}${TDirectionX}`;

/** `KeyboardEvent.code` values for the numeric keypad. */
type TNumPadKeysCode =
	| `Numpad${TDigit}`
	| `Numpad${TNumPadMathKeys}`
	| `Numpad${"Comma" | "Decimal" | "Enter"}`;

/** `KeyboardEvent.code` values for the arrow keys. */
type TArrowKeysCode = `Arrow${TDirections}`;

/** `KeyboardEvent.code` values for punctuation/whitespace/editing keys not covered by the other categories. */
type TSpecialKeysCode =
	| `Bracket${TDirectionX}`
	| `Page${TDirectionY}`
	| "Home" | "End"
	| "Insert" | "Delete"
	| "Backspace" | "Tab" | "Space"
	| "Escape" | "Enter"
	| "Backquote" | "Minus" | "Equal" | "Backslash" | "Semicolon" | "Quote" | "Slash"
	| "Comma" | "Period"
	| "CapsLock" | "NumLock" | "ScrollLock" | "Pause"
	| "ContextMenu"
	| "IntlBackslash" | "IntlRo";

/** Every `KeyboardEvent.code` value `keyboardManager` recognizes. */
type TKeyboardEventCode =
	| TFnKeysCode
	| TModifierKeysCode
	| TNumPadKeysCode
	| TDigitKeysCode
	| TWordKeysCode
	| TArrowKeysCode
	| TSpecialKeysCode;

/* KeyCodes */

/** Listener signature `keyboardManager.add(...)` accepts. */
type TKeyboardOnEvent = (value: TKeyboardValue) => boolean | void;

/** Which keyboard codes are currently held down. */
type TKeyboardState = Partial<Record<TKeyboardEventCode, boolean>>;

/** The event payload passed to `keyboardManager` listeners on every key down/up. */
type TKeyboardValue = {
	key: string,
	isDown: boolean,
	code: TKeyboardEventCode,
	combo: TState<TKeyboardEventCode[]>,
	comboChanged: boolean,
	target: EventTarget | null,
	preventDefault: () => void,
	defaultPrevented: boolean,
}

export {
	TKeyboardEventCode,
	TFnKeysCode,
	TModifierKeysCode,
	TNumPadKeysCode,
	TDigitKeysCode,
	TWordKeysCode,
	TArrowKeysCode,
	TSpecialKeysCode,
	TKeyboardState,
	TKeyboardValue,
	TKeyboardOnEvent,
}