[← Voltar para PROJECT.md](../PROJECT.md)

# html/plugins/interaction

<a id="InteractionPlugin"></a>
#### [`InteractionPlugin`](../../src/html/plugins/interaction/model.ts#L14) _(class)_

InteractionPlugin
Responsabilidade única: rastrear o ciclo de interação de um campo — foi
focado, perdeu foco (touched), mudou (dirty). Não sabe nada de validação
nem do valor do campo; só quando/como foi interagido. Pensado pra
responder "já dá pra mostrar erro?" (normalmente: `touched && !focused`)
sem cada componente reimplementar esse controle na mão.

<a id="InteractionPlugin.subscribe"></a>
- [`subscribe`](../../src/html/plugins/interaction/model.ts#L20)
  Subscribes to interaction-state changes. Returns an unsubscribe function.
<a id="InteractionPlugin.onFocus"></a>
- [`onFocus`](../../src/html/plugins/interaction/model.ts#L25)
  Call when the field gains focus.
<a id="InteractionPlugin.onBlur"></a>
- [`onBlur`](../../src/html/plugins/interaction/model.ts#L30)
  Call when the field loses focus — marks it `touched`.
<a id="InteractionPlugin.onChange"></a>
- [`onChange`](../../src/html/plugins/interaction/model.ts#L35)
  Call when the field's value changes — marks it `dirty`.
<a id="InteractionPlugin.reset"></a>
- [`reset`](../../src/html/plugins/interaction/model.ts#L40)
  Volta ao estado inicial — útil quando o campo é reaproveitado pra outro valor.

<a id="TInteractionState"></a>
#### [`TInteractionState`](../../src/html/plugins/interaction/types.ts#L2) _(type, type-only)_

The state `InteractionPlugin` tracks — focus/touched/dirty, with no notion of validity.
