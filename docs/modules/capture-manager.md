[← Voltar para PROJECT.md](../PROJECT.md)

# capture-manager

<a id="CaptureManager"></a>
#### [`CaptureManager`](../../src/capture-manager/model.ts#L9) _(class)_

Base class for singletons that manage global browser listeners (`keyboardManager`,
`mouseManager`, `hotkey`, `themeManager`) — centralizes the "activate the underlying
listener only while someone is subscribed" lifecycle. `add(value)` turns capture on
(calling `start()` on the first subscriber) and returns an unsubscribe function that
turns it back off (`stop()`) once the last subscriber is gone.

<a id="CaptureManager.callbackMap"></a>
- [`callbackMap`](../../src/capture-manager/model.ts#L11)
  Every registered callback, keyed by whatever `register()` returns as its id.
<a id="CaptureManager.start"></a>
- [`start`](../../src/capture-manager/model.ts#L22)
  Attaches the underlying browser listener(s) — called once, on the first subscriber.
<a id="CaptureManager.stop"></a>
- [`stop`](../../src/capture-manager/model.ts#L24)
  Detaches the underlying browser listener(s) — called once the last subscriber unsubscribes.
<a id="CaptureManager.beforeRegister"></a>
- [`beforeRegister`](../../src/capture-manager/model.ts#L26)
  Optional hook to transform a value before it's registered.
<a id="CaptureManager.register"></a>
- [`register`](../../src/capture-manager/model.ts#L28)
  Stores `value` in `callbackMap` and returns whatever key(s) `unRegister` will need to remove it later.
<a id="CaptureManager.unRegister"></a>
- [`unRegister`](../../src/capture-manager/model.ts#L30)
  Removes a previously `register`ed value by its id(s).
<a id="CaptureManager.add"></a>
- [`add`](../../src/capture-manager/model.ts#L33)
  Subscribes `value`, turning capture on if it's the first subscriber. Returns an unsubscribe function.
<a id="CaptureManager.callbacks"></a>
- [`callbacks`](../../src/capture-manager/model.ts#L45)
  All currently registered callback values.
<a id="CaptureManager.has"></a>
- [`has`](../../src/capture-manager/model.ts#L47)
  Whether a callback is registered under `key`.
<a id="CaptureManager.hasCallbacks"></a>
- [`hasCallbacks`](../../src/capture-manager/model.ts#L49)
  Whether any callback is currently registered.
<a id="CaptureManager.get"></a>
- [`get`](../../src/capture-manager/model.ts#L51)
  Reads the value at `key`, initializing it to `defaultValue` first if absent.
