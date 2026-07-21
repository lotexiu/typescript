[← Voltar para PROJECT.md](../PROJECT.md)

# html/managers/hotkey

<a id="HotkeyManager"></a>
#### [`HotkeyManager`](../../src/html/managers/hotkey/model.ts#L9) _(class)_

<a id="combo"></a>
#### [`combo`](../../src/html/managers/hotkey/model.ts#L42) _(const)_

<a id="bindings"></a>
#### [`bindings`](../../src/html/managers/hotkey/model.ts#L56) _(const)_

<a id="index"></a>
#### [`index`](../../src/html/managers/hotkey/model.ts#L57) _(const)_

<a id="value"></a>
#### [`value`](../../src/html/managers/hotkey/model.ts#L83) _(const)_

<a id="value"></a>
#### [`value`](../../src/html/managers/hotkey/model.ts#L88) _(const)_

<a id="datas"></a>
#### [`datas`](../../src/html/managers/hotkey/model.ts#L109) _(const)_

<a id="lowestDistance"></a>
#### [`lowestDistance`](../../src/html/managers/hotkey/model.ts#L112) _(const)_

<a id="activeHotkeys"></a>
#### [`activeHotkeys`](../../src/html/managers/hotkey/model.ts#L113) _(const)_

<a id="distance"></a>
#### [`distance`](../../src/html/managers/hotkey/model.ts#L115) _(const)_

<a id="distance"></a>
#### [`distance`](../../src/html/managers/hotkey/model.ts#L131) _(const)_

<a id="hotkey"></a>
#### [`hotkey`](../../src/html/managers/hotkey/model.ts#L158) _(const)_

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
