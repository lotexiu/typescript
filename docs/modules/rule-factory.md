[← Voltar para PROJECT.md](../PROJECT.md)

# rule-factory

<a id="createFactory"></a>
#### [`createFactory`](../../src/rule-factory/implementations.ts#L21) _(function)_

Cria uma factory reutilizável a partir de regras declaradas: cada slot
sabe calcular seu próprio valor (a partir das seeds e/ou de outros slots
já declarados antes dele, via `get`) e, opcionalmente, sugerir um valor
melhor sem forçá-lo — a sugestão nunca substitui o valor calculado, só
fica disponível à parte (em `suggestions`) pra quem quiser aplicar.

Resolução segue estritamente a ordem de declaração: `get('outroSlot')`
só enxerga slots já resolvidos (declarados antes). Isso é intencional —
exige um mínimo de organização de quem escreve as regras (pensar a ordem
de dependência), em troca de dispensar cache/rastreio de ciclo em runtime:
dependência circular fica estruturalmente impossível, não algo detectado
caro a cada resolução.

Base comum pensada pra paleta de cores e tema (ambos "seeds -> slots
derivados, com correção opcional") — este módulo não sabe nada de cor,
só resolve slots genéricos.

<a id="TRuleContext"></a>
#### [`TRuleContext`](../../src/rule-factory/types.ts#L2) _(type, type-only)_

What a slot's `derive`/`suggest` function receives: the factory's seeds, and `get()` to read an earlier-declared slot's resolved value.

<a id="TSlotRule"></a>
#### [`TSlotRule`](../../src/rule-factory/types.ts#L9) _(type, type-only)_

One slot's rule: how to compute its value, and optionally how to suggest a better one without forcing it.

<a id="TFactoryRules"></a>
#### [`TFactoryRules`](../../src/rule-factory/types.ts#L22) _(type, type-only)_

The full rule map `createFactory` takes — one `TSlotRule` per slot, resolved in declaration order.

<a id="TFactoryResult"></a>
#### [`TFactoryResult`](../../src/rule-factory/types.ts#L27) _(type, type-only)_

What `build(seeds)` returns: every slot's derived `values`, plus any `suggestions` a slot's `suggest` actually offered.
