[← Voltar para PROJECT.md](../PROJECT.md)

# html/managers/mouse

<a id="MOUSE_BUTTON_MAP"></a>
#### [`MOUSE_BUTTON_MAP`](../../src/html/managers/mouse/declarations.ts#L3) _(const)_

Maps `MouseEvent.button` numeric codes to their named `mouseManager` button values.

<a id="MouseManager"></a>
#### [`MouseManager`](../../src/html/managers/mouse/model.ts#L5) _(class)_

<a id="MouseManager.start"></a>
- [`start`](../../src/html/managers/mouse/model.ts#L12)
  Attaches the `mousemove`/`mousedown`/`mouseup`/`blur` listeners that track buttons and position.
<a id="MouseManager.stop"></a>
- [`stop`](../../src/html/managers/mouse/model.ts#L20)
  Detaches the `mousemove`/`mousedown`/`mouseup`/`blur` listeners.
<a id="MouseManager.lastId"></a>
- [`lastId`](../../src/html/managers/mouse/model.ts#L28)
  Next id to hand out for a registered callback.
<a id="MouseManager.register"></a>
- [`register`](../../src/html/managers/mouse/model.ts#L30)
  Registers `value` under a fresh numeric id.
<a id="MouseManager.unRegister"></a>
- [`unRegister`](../../src/html/managers/mouse/model.ts#L37)
  Unregisters the callback with `id`.

<a id="mouseManager"></a>
#### [`mouseManager`](../../src/html/managers/mouse/model.ts#L126) _(const)_

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
