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

<a id="AsyncCheckPlugin.subscribe"></a>
- [`subscribe`](../../src/html/plugins/async-check/model.ts#L28)
  Subscribes to state changes. Returns an unsubscribe function.
<a id="AsyncCheckPlugin.request"></a>
- [`request`](../../src/html/plugins/async-check/model.ts#L33)
  Marca "pendente" já e dispara (com debounce) uma nova checagem para `input`.
<a id="AsyncCheckPlugin.reset"></a>
- [`reset`](../../src/html/plugins/async-check/model.ts#L39)
  Cancela qualquer checagem pendente/em voo e volta pro estado inicial.

<a id="TAsyncCheckState"></a>
#### [`TAsyncCheckState`](../../src/html/plugins/async-check/types.ts#L2) _(type, type-only)_

The lifecycle of an `AsyncCheckPlugin` check — the pending/rejected states a purely synchronous check never needs.

<a id="TAsyncCheckFn"></a>
#### [`TAsyncCheckFn`](../../src/html/plugins/async-check/types.ts#L9) _(type, type-only)_

The async check function an `AsyncCheckPlugin` wraps.
