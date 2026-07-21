[← Voltar para PROJECT.md](../PROJECT.md)

# filters

<a id="DEFAULT_DEBOUNCE_DURATION"></a>
#### [`DEFAULT_DEBOUNCE_DURATION`](../../src/filters/declarations.ts#L4) _(const)_

Default `debounce()` delay in milliseconds, when none is given.

<a id="DEFAULT_THROTTLE_INTERVAL"></a>
#### [`DEFAULT_THROTTLE_INTERVAL`](../../src/filters/declarations.ts#L7) _(const)_

Default `throttle()` interval in milliseconds, when none is given.

<a id="DEFAULT_STEP_AMOUNT"></a>
#### [`DEFAULT_STEP_AMOUNT`](../../src/filters/declarations.ts#L10) _(const)_

Default `step()` call count, when none is given.

<a id="debounce"></a>
#### [`debounce`](../../src/filters/implementations.ts#L7) _(function)_

Delays calling `fn` until `delay` ms have passed with no further calls — each call reschedules with the latest arguments.

<a id="throttle"></a>
#### [`throttle`](../../src/filters/implementations.ts#L24) _(function)_

Calls `fn` immediately, then ignores further calls until `interval` ms have passed.

<a id="step"></a>
#### [`step`](../../src/filters/implementations.ts#L38) _(function)_

Calls `fn` every `amount` calls (resetting the counter afterwards unless `autoClear` is `false`).

<a id="once"></a>
#### [`once`](../../src/filters/implementations.ts#L52) _(function)_

Calls `fn` at most once — every call after the first is a no-op until `clear()` resets it.

<a id="TDebounceFn"></a>
#### [`TDebounceFn`](../../src/filters/types.ts#L4) _(type, type-only)_

The wrapped function `debounce()` returns — callable like `T`, plus `clear()` to cancel a pending call.

<a id="TThrottleFn"></a>
#### [`TThrottleFn`](../../src/filters/types.ts#L9) _(type, type-only)_

The wrapped function `throttle()` returns — callable like `T`, plus `clear()` to reset its interval tracking.

<a id="TStepFn"></a>
#### [`TStepFn`](../../src/filters/types.ts#L14) _(type, type-only)_

The wrapped function `step()` returns — callable like `T`, plus `clear()` to reset its call counter.

<a id="TOnceFn"></a>
#### [`TOnceFn`](../../src/filters/types.ts#L19) _(type, type-only)_

The wrapped function `once()` returns — callable like `T`, plus `clear()` to allow it to run again.
