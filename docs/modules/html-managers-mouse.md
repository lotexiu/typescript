[← Voltar para PROJECT.md](../PROJECT.md)

# html/managers/mouse

<a id="MOUSE_BUTTON_MAP"></a>
#### [`MOUSE_BUTTON_MAP`](../../src/html/managers/mouse/declarations.ts#L3) _(const)_

Maps `MouseEvent.button` numeric codes to their named `mouseManager` button values.

<a id="MouseManager"></a>
#### [`MouseManager`](../../src/html/managers/mouse/model.ts#L5) _(class)_

<a id="id"></a>
#### [`id`](../../src/html/managers/mouse/model.ts#L27) _(const)_

<a id="value"></a>
#### [`value`](../../src/html/managers/mouse/model.ts#L47) _(const)_

<a id="result"></a>
#### [`result`](../../src/html/managers/mouse/model.ts#L83) _(const)_

<a id="moveEvent"></a>
#### [`moveEvent`](../../src/html/managers/mouse/model.ts#L91) _(const)_

<a id="button"></a>
#### [`button`](../../src/html/managers/mouse/model.ts#L103) _(const)_

<a id="isDown"></a>
#### [`isDown`](../../src/html/managers/mouse/model.ts#L104) _(const)_

<a id="nextButtons"></a>
#### [`nextButtons`](../../src/html/managers/mouse/model.ts#L113) _(const)_

<a id="mouseManager"></a>
#### [`mouseManager`](../../src/html/managers/mouse/model.ts#L121) _(const)_

Singleton `CaptureManager` tracking cursor position and held mouse buttons, active only while someone subscribes via `add()`.

<a id="TMouseButtonMap"></a>
#### [`TMouseButtonMap`](../../src/html/managers/mouse/types.ts#L4) _(type, type-only)_

<a id="TMouseButtonsCode"></a>
#### [`TMouseButtonsCode`](../../src/html/managers/mouse/types.ts#L7) _(type, type-only)_

The numeric `MouseEvent.button` codes `mouseManager` recognizes (keys of `MOUSE_BUTTON_MAP`).

<a id="TMouseButtons"></a>
#### [`TMouseButtons`](../../src/html/managers/mouse/types.ts#L10) _(type, type-only)_

The named mouse buttons `mouseManager` reports (`"MouseLeft"`, etc.), or `"Unknown"` for an unrecognized code.

<a id="TMouseCoord"></a>
#### [`TMouseCoord`](../../src/html/managers/mouse/types.ts#L13) _(type, type-only)_

Current vs. previous cursor position, tracked per axis.

<a id="TMouseOnEvent"></a>
#### [`TMouseOnEvent`](../../src/html/managers/mouse/types.ts#L19) _(type, type-only)_

Listener signature `mouseManager.add(...)` accepts.

<a id="TMouseValue"></a>
#### [`TMouseValue`](../../src/html/managers/mouse/types.ts#L22) _(type, type-only)_

The event payload passed to `mouseManager` listeners on move/down/up.

<a id="TMouseState"></a>
#### [`TMouseState`](../../src/html/managers/mouse/types.ts#L33) _(type, type-only)_

Which mouse buttons are currently held down, and the last known cursor position.
