# `parser/node`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`ParserGate`](#parsergate) | classe | Um par de delimitadores (`open`/`close`). `opaque` ignora outros gates dentro (strings, comentários). |
| [`ParserGap`](#parsergap) | classe | Um trecho de texto entre escopos, guardado quando `trackGaps` está ligado. O texto é fatiado só quando lido. |
| [`ParserNode`](#parsernode) | classe | Um escopo aberto por um gate: posições, filhos, trechos entre filhos e o conteúdo (fatiado só quando lido). |
| [`ParserRoot`](#parserroot) | classe | Raiz da árvore: o texto inteiro e todos os nós, em ordem de abertura. |

---

## `ParserGate`

classe · [src/parser/node/model.ts:5](../../../src/parser/node/model.ts#L5)

Um par de delimitadores (`open`/`close`). `opaque` ignora outros gates dentro (strings, comentários).

```ts
class ParserGate
```

### Construtor

#### `constructor( public readonly open: string, public readonly close: string, public readonly opaque: boolean = false, /** false = fecha ao encontrar `close` sem incluí-lo no node (ex: comentário de linha terminado por `\n` — a quebra de linha não é parte do comentário). */ public readonly consumeClose: boolean = true, /** * Semi-transparente: o gate é opaco (ignora todo outro gate lá dentro) **exceto** pelo * `open` deste `holeGate`, que abre um escopo normal (transparente) dentro dele. É o * modo de template string — `` ` … ` `` opaco, mas `${ … }` volta a ser código. O * `holeGate` só é reconhecido enquanto o escopo pai está aberto; nunca abre sozinho. */ public readonly holeGate: ParserGate | null = null, )`

### Propriedades

#### `public readonly symetric: boolean`

`open` e `close` são iguais (aspas).

---

## `ParserGap`

classe · [src/parser/node/model.ts:30](../../../src/parser/node/model.ts#L30)

Um trecho de texto entre escopos, guardado quando `trackGaps` está ligado. O texto é fatiado só quando lido.

```ts
class ParserGap
```

### Construtor

#### `constructor( public readonly parent: ParserNode | ParserRoot, root: ParserRoot, public readonly start: number, public readonly end: number, )`

### Propriedades

#### `get text()`

Cria o wrapper lazy só no primeiro acesso — evita alocar closure para gaps nunca lidos.

---

## `ParserNode`

classe · [src/parser/node/model.ts:53](../../../src/parser/node/model.ts#L53)

Um escopo aberto por um gate: posições, filhos, trechos entre filhos e o conteúdo (fatiado só quando lido).

```ts
class ParserNode
```

### Construtor

#### `constructor( public readonly parent: ParserNode | ParserRoot, public readonly root: ParserRoot, public readonly gate: ParserGate, public readonly start: number, )`

### Propriedades

#### `public end: number`

Offset logo depois do fechamento (ou o fim do texto, se não fechou).

#### `public unclosed: boolean`

O texto acabou antes do `close`.

#### `public readonly children: ParserNode[]`

Escopos dentro deste.

#### `public readonly gaps: ParserGap[]`

Trechos entre os filhos (com `trackGaps`).

#### `get contentStart()`

Offset onde o conteúdo começa, depois do `open`.

#### `get content(): TReadOnlyValue<string>`

Cria o wrapper lazy só no primeiro acesso — evita alocar closure para nodes nunca lidos.

---

## `ParserRoot`

classe · [src/parser/node/model.ts:95](../../../src/parser/node/model.ts#L95)

Raiz da árvore: o texto inteiro e todos os nós, em ordem de abertura.

```ts
class ParserRoot
```

### Construtor

#### `constructor( public readonly text: string, )`

### Propriedades

#### `public readonly children: ParserNode[]`

Escopos de primeiro nível.

#### `public readonly nodes: ParserNode[]`

Todos os escopos, de todos os níveis, em ordem de abertura.

#### `public readonly gaps: ParserGap[]`

Gaps diretos do escopo raiz (simétrico a `ParserNode.gaps`) — não inclui gaps de dentro de nodes.

#### `public readonly allGaps: ParserGap[]`

Todos os gaps da árvore, de qualquer profundidade — simétrico a `nodes` vs `children`.
