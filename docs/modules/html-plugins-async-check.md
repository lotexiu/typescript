[← Voltar para PROJECT.md](../PROJECT.md)

# html/plugins/async-check

<a id="AsyncCheckPlugin"></a>
#### [`AsyncCheckPlugin`](../../src/html/plugins/async-check/model.ts#L16) _(class)_

O terceiro estado ("pendente") que uma checagem assíncrona (ex.: existe
esse e-mail no servidor?) precisa e que uma checagem síncrona
(`ValidationUtils`) não tem por quê modelar. Não reimplementa debounce —
usa o `debounce()` já existente. Descarta respostas desatualizadas via um
token crescente: se `request()` disparar de novo antes da checagem anterior
responder, só o resultado da checagem mais recente é aplicado.

<a id="token"></a>
#### [`token`](../../src/html/plugins/async-check/model.ts#L45) _(const)_

<a id="result"></a>
#### [`result`](../../src/html/plugins/async-check/model.ts#L47) _(const)_

<a id="TAsyncCheckState"></a>
#### [`TAsyncCheckState`](../../src/html/plugins/async-check/types.ts#L2) _(type, type-only)_

The lifecycle of an `AsyncCheckPlugin` check — the pending/rejected states a purely synchronous check never needs.

<a id="TAsyncCheckFn"></a>
#### [`TAsyncCheckFn`](../../src/html/plugins/async-check/types.ts#L9) _(type, type-only)_

The async check function an `AsyncCheckPlugin` wraps.
