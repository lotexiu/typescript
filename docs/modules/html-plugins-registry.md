[← Voltar para PROJECT.md](../PROJECT.md)

# html/plugins/registry

<a id="TYPE_PLUGIN_FACTORY"></a>
#### [`TYPE_PLUGIN_FACTORY`](../../src/html/plugins/registry/implementations.ts#L13) _(const)_

Registro `tipo -> factory` pros plugins de tipo (mutuamente exclusivos por
campo — um input genérico usa isso pra resolver qual instanciar a partir
de uma config declarada, ex.: `{ type: 'number' }`). Não é um "gerenciador
de plugins" genérico: plugins modificadores (mask, validação) nunca entram
aqui, continuam sempre livres, compostos por quem consome.

<a id="TTypePluginFactory"></a>
#### [`TTypePluginFactory`](../../src/html/plugins/registry/implementations.ts#L18) _(type, type-only)_

<a id="TTypePluginName"></a>
#### [`TTypePluginName`](../../src/html/plugins/registry/implementations.ts#L20) _(type, type-only)_

The declared `type` names `createTypePlugin` can resolve (currently `"number"` and `"date"`).

<a id="createTypePlugin"></a>
#### [`createTypePlugin`](../../src/html/plugins/registry/implementations.ts#L23) _(function)_

Resolve e instancia o plugin de tipo certo a partir do nome declarado.
