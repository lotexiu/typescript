[← Voltar para PROJECT.md](../PROJECT.md)

# html/managers/hotkey

<a id="HotkeyManager"></a>
#### [`HotkeyManager`](../../src/html/managers/hotkey/model.ts#L9) _(class)_

<a id="HotkeyManager.start"></a>
- [`start`](../../src/html/managers/hotkey/model.ts#L30)
  Subscribes to `keyboardManager`/`mouseManager` to track the currently held combo.
<a id="HotkeyManager.stop"></a>
- [`stop`](../../src/html/managers/hotkey/model.ts#L36)
  Unsubscribes from `keyboardManager`/`mouseManager`.
<a id="HotkeyManager.register"></a>
- [`register`](../../src/html/managers/hotkey/model.ts#L42)
  Registers `data` under every combo string it declares (defaulting `element` to the whole document).
<a id="HotkeyManager.unRegister"></a>
- [`unRegister`](../../src/html/managers/hotkey/model.ts#L52)
  Removes `data` from one or more combo bindings.
<a id="HotkeyManager.triggerUntriggeringHotkeys"></a>
- [`triggerUntriggeringHotkeys`](../../src/html/managers/hotkey/model.ts#L98)
  Calls `untrigger` on every hotkey active from the previous combo, then clears the active list.
<a id="HotkeyManager.triggerPreviousHotkeys"></a>
- [`triggerPreviousHotkeys`](../../src/html/managers/hotkey/model.ts#L104)
  Re-triggers still-active hotkeys when the combo hasn't changed (e.g. repeated mouse move).
<a id="HotkeyManager.triggerMatchingHotkeys"></a>
- [`triggerMatchingHotkeys`](../../src/html/managers/hotkey/model.ts#L115)
  Triggers every hotkey bound to `comboStr` whose target element is closest to the event target.
<a id="HotkeyManager.getDistanceToTarget"></a>
- [`getDistanceToTarget`](../../src/html/managers/hotkey/model.ts#L138)
  Number of DOM-tree hops from `target` up to the nearest ancestor `elementValidator` accepts, or `Infinity` if none matches.
<a id="HotkeyManager.buildValue"></a>
- [`buildValue`](../../src/html/managers/hotkey/model.ts#L150)
  Builds the match-data payload (event, combo, `preventDefault`) passed to a hotkey's `trigger`/`untrigger`.

<a id="hotkey"></a>
#### [`hotkey`](../../src/html/managers/hotkey/model.ts#L167) _(const)_

Singleton `CaptureManager` combining keyboard + mouse state to trigger callbacks on key/button combos, picking the closest matching bound element when several combos tie.

<a id="THotkeyItem"></a>
#### [`THotkeyItem`](../../src/html/managers/hotkey/types.ts#L5) _(type, type-only)_

A single input making up a hotkey combo — either a keyboard code or a mouse button.

<a id="THotkeyCombo"></a>
#### [`THotkeyCombo`](../../src/html/managers/hotkey/types.ts#L8) _(type, type-only)_

A set of inputs that must all be active together to trigger a hotkey.

<a id="THotkeyEvent"></a>
#### [`THotkeyEvent`](../../src/html/managers/hotkey/types.ts#L11) _(type, type-only)_

The underlying keyboard or mouse event that drove a hotkey check.

<a id="THotkeyElementValidator"></a>
#### [`THotkeyElementValidator`](../../src/html/managers/hotkey/types.ts#L14) _(type, type-only)_

Predicate deciding whether an event's target counts as "inside" a hotkey's bound element.

<a id="THotkeyMatchData"></a>
#### [`THotkeyMatchData`](../../src/html/managers/hotkey/types.ts#L17) _(type, type-only)_

The payload passed to a hotkey's `trigger`/`untrigger` callbacks.

<a id="THotkeyData"></a>
#### [`THotkeyData`](../../src/html/managers/hotkey/types.ts#L27) _(type, type-only)_

A registered hotkey binding: which combo(s) trigger it, on which element, and its trigger/untrigger callbacks.
