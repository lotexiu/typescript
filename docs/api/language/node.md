# `language/node`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`AstNode`](#astnode) | classe | Nó genérico de uma árvore sintática. `kind` é uma string livre definida pela gramática que o produziu — o motor não conhece nenhum vocabulário fixo. Guarda apenas offsets no source da raiz (flyweight); `text` fatia sob demanda, igual `ParserNode.content`. |
| [`AstRoot`](#astroot) | classe | Raiz de uma árvore sintática — dona do `source` (fonte única da verdade para os flyweights) e dos índices de navegação. |
| [`TAstVisitor`](#tastvisitor) | tipo | Callback de `AstNode.walk` / `AstRoot.walk` — retornar `false` poda a subárvore atual. |

---

## `AstNode`

classe · [src/language/node/model.ts:8](../../../src/language/node/model.ts#L8)

Nó genérico de uma árvore sintática. `kind` é uma string livre definida pela gramática
que o produziu — o motor não conhece nenhum vocabulário fixo. Guarda apenas offsets no
source da raiz (flyweight); `text` fatia sob demanda, igual `ParserNode.content`.

```ts
class AstNode
```

### Construtor

#### `constructor( readonly kind: string, readonly root: AstRoot, public start: number, public end: number, /** Texto pré-definido (folhas guardam o `value` do token); ausente = fatiar de `root.source`. */ text?: string, )`

### Propriedades

#### `readonly children: AstNode[]`

Filhos diretos, em ordem de fonte.

#### `readonly fields = new Map<string, AstNode | AstNode[]>()`

Filhos indexados por papel — `field('name', ...)` na gramática popula isto.

#### `parent: AstNode | AstRoot | undefined`

Nó pai, ou a raiz para nós de topo. Definido quando o nó é anexado.

#### `get text(): string`

Fatia de `root.source` coberta por este nó — computada e cacheada no 1º acesso.

### Métodos

#### `field(name: string): AstNode | undefined`

Primeiro filho registrado no campo `name` (ou `undefined`).

#### `fieldList(name: string): AstNode[]`

Todos os nós registrados no campo `name` (lista vazia se não houver).

#### `child(kind: string): AstNode | undefined`

Primeiro filho direto de um dado `kind`.

#### `walk(visitor: TAstVisitor): void`

Percorre este nó e a subárvore em pré-ordem; retornar `false` no visitor poda os filhos.

---

## `AstRoot`

classe · [src/language/node/model.ts:61](../../../src/language/node/model.ts#L61)

Raiz de uma árvore sintática — dona do `source` (fonte única da verdade para os
flyweights) e dos índices de navegação.

```ts
class AstRoot
```

### Construtor

#### `constructor(readonly source: string)`

### Propriedades

#### `readonly children: AstNode[]`

Nós de topo (o que a regra-start devolveu).

#### `readonly nodes: AstNode[]`

Todos os nós compostos da árvore, de qualquer profundidade — ordem de criação.

### Métodos

#### `walk(visitor: TAstVisitor): void`

Percorre toda a árvore em pré-ordem; retornar `false` no visitor poda os filhos.

#### `lineAt(offset: number): number`

Linha 1-indexada em `offset` (ex: `root.lineAt(node.start)`) — índice de starts de linha cacheado no root, busca binária por chamada.

---

## `TAstVisitor`

tipo · [src/language/node/types.ts:4](../../../src/language/node/types.ts#L4)

Callback de `AstNode.walk` / `AstRoot.walk` — retornar `false` poda a subárvore atual.

```ts
type TAstVisitor = (node: AstNode) => boolean | void
```
