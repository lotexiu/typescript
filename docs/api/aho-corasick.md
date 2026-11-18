# `aho-corasick`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`AhoCorasick`](#ahocorasick) | classe | Busca de vários padrões de uma vez num texto, em uma passada (autômato Aho-Corasick em tabelas planas). |
| [`TAhoCorasickMatch`](#tahocorasickmatch) | tipo | Um padrão encontrado. |
| [`TOnPositionHook`](#tonpositionhook) | tipo | Chamado a cada posição; retornar `N` (> 0) pula `N` caracteres a partir dela. |
| [`TOnMatchHook`](#tonmatchhook) | tipo | Chamado a cada match; retornar `false` o deixa fora do resultado. |
| [`TAhoCorasickScanHooks`](#tahocorasickscanhooks) | tipo | Ganchos opcionais de `scan`. |

---

## `AhoCorasick`

classe · [src/aho-corasick/model.ts:17](../../src/aho-corasick/model.ts#L17)

Busca de vários padrões de uma vez num texto, em uma passada (autômato Aho-Corasick em tabelas planas).

```ts
class AhoCorasick
```

**Exemplo**

```ts
const automaton = AhoCorasick.compile('he', 'she', 'hers')
automaton.scan('ushers') // matches de 'she', 'he' e 'hers'
```

### Estáticos

#### `static compile(...patterns: string[]): AhoCorasick`

Monta o autômato. O `patternId` de cada match é o índice do padrão em `patterns`.

### Métodos

#### `scan(text: string, hooks: TAhoCorasickScanHooks = {}, start: number = 0, end: number = text.length): TAhoCorasickMatch[]`

Procura entre `start` e `end` e devolve os matches em ordem de fim. `onMatch` é chamado a cada um (retornar `false`
o deixa fora do resultado); `onPosition` pode pular trechos (retornar `N` avança `N` caracteres e reinicia o autômato).
Só caracteres ASCII participam dos padrões; os demais reiniciam o autômato.

---

## `TAhoCorasickMatch`

tipo · [src/aho-corasick/types.ts:2](../../src/aho-corasick/types.ts#L2)

Um padrão encontrado.

```ts
type TAhoCorasickMatch = { … }
```

### Propriedades

#### `patternId: number`

Índice do padrão em `compile`.

#### `start: number`

Offset inicial.

#### `end: number`

Offset final (exclusivo).

---

## `TOnPositionHook`

tipo · [src/aho-corasick/types.ts:12](../../src/aho-corasick/types.ts#L12)

Chamado a cada posição; retornar `N` (> 0) pula `N` caracteres a partir dela.

```ts
type TOnPositionHook = (index: number, code: number) => number | void
```

---

## `TOnMatchHook`

tipo · [src/aho-corasick/types.ts:15](../../src/aho-corasick/types.ts#L15)

Chamado a cada match; retornar `false` o deixa fora do resultado.

```ts
type TOnMatchHook = (patternId: number, start: number, end: number) => boolean | void
```

---

## `TAhoCorasickScanHooks`

tipo · [src/aho-corasick/types.ts:18](../../src/aho-corasick/types.ts#L18)

Ganchos opcionais de `scan`.

```ts
type TAhoCorasickScanHooks = { … }
```

### Propriedades

#### `onPosition?: TOnPositionHook`

Ver `TOnPositionHook`.

#### `onMatch?: TOnMatchHook`

Ver `TOnMatchHook`.
