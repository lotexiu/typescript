[← Voltar para PROJECT.md](../PROJECT.md)

# html/managers/keyboard

<a id="KeyboardManager"></a>
#### [`KeyboardManager`](../../src/html/managers/keyboard/model.ts#L4) _(class)_

<a id="id"></a>
#### [`id`](../../src/html/managers/keyboard/model.ts#L24) _(const)_

<a id="value"></a>
#### [`value`](../../src/html/managers/keyboard/model.ts#L40) _(const)_

<a id="key"></a>
#### [`key`](../../src/html/managers/keyboard/model.ts#L70) _(const)_

<a id="pressed"></a>
#### [`pressed`](../../src/html/managers/keyboard/model.ts#L71) _(const)_

<a id="nextPressed"></a>
#### [`nextPressed`](../../src/html/managers/keyboard/model.ts#L80) _(const)_

<a id="keyboardManager"></a>
#### [`keyboardManager`](../../src/html/managers/keyboard/model.ts#L88) _(const)_

Singleton `CaptureManager` tracking which keys are currently held down, active only while someone subscribes via `add()`.

<a id="TDirectionX"></a>
#### [`TDirectionX`](../../src/html/managers/keyboard/types.ts#L4) _(type, type-only)_

<a id="TDirectionY"></a>
#### [`TDirectionY`](../../src/html/managers/keyboard/types.ts#L5) _(type, type-only)_

<a id="TDirections"></a>
#### [`TDirections`](../../src/html/managers/keyboard/types.ts#L6) _(type, type-only)_

<a id="TModifierKeys"></a>
#### [`TModifierKeys`](../../src/html/managers/keyboard/types.ts#L8) _(type, type-only)_

<a id="TNumPadMathKeys"></a>
#### [`TNumPadMathKeys`](../../src/html/managers/keyboard/types.ts#L10) _(type, type-only)_

<a id="TWordKeys"></a>
#### [`TWordKeys`](../../src/html/managers/keyboard/types.ts#L12) _(type, type-only)_

<a id="TFnKeysCode"></a>
#### [`TFnKeysCode`](../../src/html/managers/keyboard/types.ts#L20) _(type, type-only)_

`KeyboardEvent.code` values for the function-key row (`F1`-`F12`).

<a id="TWordKeysCode"></a>
#### [`TWordKeysCode`](../../src/html/managers/keyboard/types.ts#L23) _(type, type-only)_

`KeyboardEvent.code` values for the letter keys (`KeyA`-`KeyZ`).

<a id="TDigitKeysCode"></a>
#### [`TDigitKeysCode`](../../src/html/managers/keyboard/types.ts#L26) _(type, type-only)_

`KeyboardEvent.code` values for the top-row digit keys (`Digit0`-`Digit9`).

<a id="TModifierKeysCode"></a>
#### [`TModifierKeysCode`](../../src/html/managers/keyboard/types.ts#L29) _(type, type-only)_

`KeyboardEvent.code` values for modifier keys, split by left/right side (e.g. `ShiftLeft`).

<a id="TNumPadKeysCode"></a>
#### [`TNumPadKeysCode`](../../src/html/managers/keyboard/types.ts#L32) _(type, type-only)_

`KeyboardEvent.code` values for the numeric keypad.

<a id="TArrowKeysCode"></a>
#### [`TArrowKeysCode`](../../src/html/managers/keyboard/types.ts#L38) _(type, type-only)_

`KeyboardEvent.code` values for the arrow keys.

<a id="TSpecialKeysCode"></a>
#### [`TSpecialKeysCode`](../../src/html/managers/keyboard/types.ts#L41) _(type, type-only)_

`KeyboardEvent.code` values for punctuation/whitespace/editing keys not covered by the other categories.

<a id="TKeyboardEventCode"></a>
#### [`TKeyboardEventCode`](../../src/html/managers/keyboard/types.ts#L55) _(type, type-only)_

Every `KeyboardEvent.code` value `keyboardManager` recognizes.

<a id="TKeyboardOnEvent"></a>
#### [`TKeyboardOnEvent`](../../src/html/managers/keyboard/types.ts#L67) _(type, type-only)_

Listener signature `keyboardManager.add(...)` accepts.

<a id="TKeyboardState"></a>
#### [`TKeyboardState`](../../src/html/managers/keyboard/types.ts#L70) _(type, type-only)_

Which keyboard codes are currently held down.

<a id="TKeyboardValue"></a>
#### [`TKeyboardValue`](../../src/html/managers/keyboard/types.ts#L73) _(type, type-only)_

The event payload passed to `keyboardManager` listeners on every key down/up.
