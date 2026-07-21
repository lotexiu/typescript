[← Voltar para PROJECT.md](../PROJECT.md)

# capture-manager

<a id="CaptureManager"></a>
#### [`CaptureManager`](../../src/capture-manager/model.ts#L9) _(class)_

Base class for singletons that manage global browser listeners (`keyboardManager`,
`mouseManager`, `hotkey`, `themeManager`) — centralizes the "activate the underlying
listener only while someone is subscribed" lifecycle. `add(value)` turns capture on
(calling `start()` on the first subscriber) and returns an unsubscribe function that
turns it back off (`stop()`) once the last subscriber is gone.

<a id="newValue"></a>
#### [`newValue`](../../src/capture-manager/model.ts#L28) _(const)_

<a id="id"></a>
#### [`id`](../../src/capture-manager/model.ts#L29) _(const)_

<a id="value"></a>
#### [`value`](../../src/capture-manager/model.ts#L41) _(const)_
