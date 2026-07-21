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

<a id="current"></a>
#### [`current`](../../src/html/plugins/interaction/model.ts#L42) _(const)_

<a id="next"></a>
#### [`next`](../../src/html/plugins/interaction/model.ts#L43) _(const)_

<a id="TInteractionState"></a>
#### [`TInteractionState`](../../src/html/plugins/interaction/types.ts#L2) _(type, type-only)_

The state `InteractionPlugin` tracks — focus/touched/dirty, with no notion of validity.
