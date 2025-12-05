import { TNullable } from "dist";

type TKeyboardEventCode =
  "AltLeft"|"AltRight"|
  "ArrowDown"|"ArrowLeft"|"ArrowRight"|"ArrowUp"|
  "Backquote"|"Backslash"|"Backspace"|"BracketLeft"|
  "BracketRight"|"CapsLock"|"Comma"|"ContextMenu"|
  "ControlLeft"|"ControlRight"|"Delete"|
  "Digit0"|"Digit1"|"Digit2"|"Digit3"|"Digit4"|
  "Digit5"|"Digit6"|"Digit7"|"Digit8"|"Digit9"|
  "End"|"Equal"|"Escape"|"Enter"|
  "F1"|"F2"|"F3"|"F4"|"F5"|"F6"|"F7"|"F8"|"F9"|"F10"|"F11"|"F12"|
  "Home"|"Insert"|"IntlBackslash"|"IntlRo"|
  "KeyA"|"KeyB"|"KeyC"|"KeyD"|"KeyE"|"KeyF"|"KeyG"|"KeyH"|"KeyI"|
  "KeyJ"|"KeyK"|"KeyL"|"KeyM"|"KeyN"|"KeyO"|"KeyP"|"KeyQ"|"KeyR"|
  "KeyS"|"KeyT"|"KeyU"|"KeyV"|"KeyW"|"KeyX"|"KeyY"|"KeyZ"|
  "MetaRight"|"Minus"|"NumLock"|
  "Numpad0"|"Numpad1"|"Numpad2"|"Numpad3"|"Numpad4"|
  "Numpad5"|"Numpad6"|"Numpad7"|"Numpad8"|"Numpad9"|
  "NumpadAdd"|"NumpadComma"|"NumpadDecimal"|
  "NumpadDivide"|"NumpadEnter"|"NumpadMultiply"|"NumpadSubtract"|
  "PageDown"|"PageUp"|"Pause"|"Period"|"Quote"|"ScrollLock"|
  "Semicolon"|"ShiftLeft"|"ShiftRight"|"Slash"|"Space"|"Tab"

type TKeyboardEvent = KeyboardEvent & { code: TKeyboardEventCode }

interface TKeyboardAction {
  oneCallPerTrigger?: boolean;
  combo: TKeyboardEventCode[];
  keyDown?: (event: TKeyboardEvent) => void;
  keyUp?: (event: TKeyboardEvent) => void;
}

type TKeyboardMapHandlers = Map<TObserveTarget, TKeyboardAction[]>;

type TKeyboardCombo = Partial<Record<TKeyboardEventCode, true>>

type TObserveTarget = HTMLElement | Document;

type UnListener = () => void;

export type {
  TKeyboardEventCode,
  TKeyboardEvent,
	TKeyboardAction,
	TKeyboardMapHandlers,
	TKeyboardCombo,
	TObserveTarget,
	UnListener,
}
