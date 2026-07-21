[← Voltar para PROJECT.md](../PROJECT.md)

# natives/object/proxy

<a id="isProxyKey"></a>
#### [`isProxyKey`](../../src/natives/object/proxy/implementations.ts#L4) _(function)_

<a id="getProxyKey"></a>
#### [`getProxyKey`](../../src/natives/object/proxy/implementations.ts#L11) _(function)_

<a id="isProxyEnabled"></a>
#### [`isProxyEnabled`](../../src/natives/object/proxy/implementations.ts#L17) _(function)_

<a id="createProxyProperty"></a>
#### [`createProxyProperty`](../../src/natives/object/proxy/implementations.ts#L29) _(function)_

<a id="get"></a>
#### [`get`](../../src/natives/object/proxy/implementations.ts#L55) _(function)_

<a id="set"></a>
#### [`set`](../../src/natives/object/proxy/implementations.ts#L96) _(function)_

<a id="defineProperty"></a>
#### [`defineProperty`](../../src/natives/object/proxy/implementations.ts#L127) _(function)_

<a id="deleteProperty"></a>
#### [`deleteProperty`](../../src/natives/object/proxy/implementations.ts#L146) _(function)_

<a id="proxyHandler"></a>
#### [`proxyHandler`](../../src/natives/object/proxy/implementations.ts#L177) _(function)_

Cria um Proxy reativo sobre `targetObj`. Toda mudança de propriedade
dispara `onChanges`/`onSet` (globais ou por propriedade, via `options`).
Métodos são rebindados ao próprio proxy automaticamente, memorizados por
instância na primeira leitura. Propriedades-objeto ganham proxy aninhado
sob demanda (nunca antecipado) quando `allProxy` ou a config da
propriedade pedir — reatribuir a propriedade invalida o aninhado antigo
sozinho, sem precisar de `deleteProxy` manual antes (ele continua
disponível pra invalidação explícita, se algum dia fizer sentido).

<a id="deleteProxy"></a>
#### [`deleteProxy`](../../src/natives/object/proxy/implementations.ts#L192) _(function)_

Invalida o proxy aninhado cacheado de uma propriedade específica, se houver.

<a id="TPropertyState"></a>
#### [`TPropertyState`](../../src/natives/object/proxy/types.ts#L2) _(type, type-only)_

The kind of change a property mutation represents, passed to `proxyHandler` listeners.

<a id="TProperty"></a>
#### [`TProperty`](../../src/natives/object/proxy/types.ts#L5) _(interface, type-only)_

Change payload passed to a `proxyHandler` listener: which property changed, its new/previous value, and the kind of change.

<a id="TProxyCallFunction"></a>
#### [`TProxyCallFunction`](../../src/natives/object/proxy/types.ts#L13) _(type, type-only)_

Listener signature for a `TProperty<T, K>` change.

<a id="TProxyOptions"></a>
#### [`TProxyOptions`](../../src/natives/object/proxy/types.ts#L18) _(type, type-only)_

Configuration for `proxyHandler` — global and per-property change listeners, and whether/how nested object properties get their own reactive proxy.
