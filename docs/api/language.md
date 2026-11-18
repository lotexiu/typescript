# `language`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`SKIPPED_KIND`](#skipped_kind) | constante | `kind` dos nós que `G.skip()` deixa na árvore — tokens que nenhuma regra reconheceu. |
| [`G`](#g) | classe | Combinadores para montar a gramática de uma `TLanguageSpec` — todos `static`, sem estado. Chamadas entre irmãos usam sempre `G.x` (nunca `this`) para sobreviver a destructuring. |
| [`Language`](#language) | classe | Linguagem compilada de uma única `TLanguageSpec`. `parse` faz 1 passada estrutural (o `Parser` monta a árvore de escopo) e roda a gramática sobre o stream de tokens — descendo em escopos aninhados só quando uma regra pede (`G.into`); `G.placeholder` deixa o escopo como folha, sem processar o conteúdo. `analyze` acrescenta diagnósticos (escopos não fechados + as `TValidation`s da espec). |
| [`TLanguageSpec`](#tlanguagespec) | tipo | Espec declarativa de uma linguagem — fonte única para o autômato, a tokenização e a gramática. Não há um "conjunto de regras do lexer" separado: `scope`/`delimited`/`literal` já são tudo que o scanner precisa, e a gramática referencia esses mesmos `kind`s. |
| [`TDelimitedSpec`](#tdelimitedspec) | tipo | Uma região opaca (string, comentário, template): o conteúdo não é tokenizado, vira 1 token do `kind` da família. |
| [`TCharClassSpec`](#tcharclassspec) | tipo | Uma classe de caracteres reconhecida por predicado sobre o código UTF-16 (identificador, número, espaço...). |
| [`TLangToken`](#tlangtoken) | tipo | Token achatado. `kind` é o nome de uma família de `literal`, uma `charClass`, um `delimited`, ou `scope:<nome>` para o placeholder de um escopo aninhado — nesse caso `scope` aponta o nó a descer sob demanda (via `G.into`), mantendo o conteúdo do escopo não-processado até ser pedido. |
| [`TLangCtx`](#tlangctx) | tipo | Estado compartilhado durante um parse — passado a todo matcher. |
| [`TLangCapture`](#tlangcapture) | tipo | O que um matcher capturou: um nó, opcionalmente rotulado como campo. |
| [`TLangMatch`](#tlangmatch) | tipo | Resultado de uma regra: casou (com a próxima posição e as capturas) ou não. |
| [`TRule`](#trule) | tipo | Função de reconhecimento: consome tokens a partir de `pos`. |
| [`TDiagnosticSeverity`](#tdiagnosticseverity) | tipo | `error` quebra o build com `docs:check`; `warning` só aparece no relatório. |
| [`TDiagnostic`](#tdiagnostic) | tipo | Um problema encontrado numa fonte — estrutural (parser) ou de uma `TValidation`. |
| [`TValidationCtx`](#tvalidationctx) | tipo | Contexto passado a uma `TValidation` — stream achatado (todos os níveis, com trivia) + AST. |
| [`TValidation`](#tvalidation) | tipo | Uma regra de projeto (estilo ESLint) que roda depois da gramática em `Language.analyze`. |
| [`TAnalysis`](#tanalysis) | tipo | Resultado de `Language.analyze` — a árvore + diagnósticos + o stream achatado. |
| [`LanguageUtils`](#languageutils) | classe | Helpers estáticos da `Language` — compilação da espec e tokenização de um escopo. Todas as chamadas entre irmãos via `LanguageUtils.x`, nunca `this`. |

---

## `SKIPPED_KIND`

constante · [src/language/declarations.ts:11](../../src/language/declarations.ts#L11)

`kind` dos nós que `G.skip()` deixa na árvore — tokens que nenhuma regra reconheceu.

```ts
const SKIPPED_KIND = "Skipped"
```

---

## `G`

classe · [src/language/grammar.ts:13](../../src/language/grammar.ts#L13)

Combinadores para montar a gramática de uma `TLanguageSpec` — todos `static`, sem estado.
Chamadas entre irmãos usam sempre `G.x` (nunca `this`) para sobreviver a destructuring.

Diferença para um motor de gramática comum: dois combinadores conhecem a árvore de escopo
que o `Parser` já montou — `into` desce num escopo aninhado e o parseia com outra regra;
`placeholder` casa o escopo como 1 nó-folha sem descer (ponto de corte para lazy).

```ts
class G
```

### Estáticos

#### `static tok(kind: string): TRule`

Casa 1 token de um dado `kind` (família de literal, charClass ou delimited).

#### `static val(value: string): TRule`

Casa 1 token por `value` literal, de qualquer `kind` (ex: `val("=>")`, `val("const")`).

#### `static adjacent(...values: string[]): TRule`

Casa tokens consecutivos **colados** (sem espaço entre eles) com os valores dados, como um terminal só.
Permite operadores que o lexer não junta para não colidir com outra sintaxe — ex: `>>` e `>=` não são tokens
(fecham generics aninhados, `Map<K, Set<T>>= x`), mas `adjacent(">", ">")` reconhece o shift.

#### `static sameLine(rule: TRule): TRule`

Casa `rule` só se o token em `pos` estiver na mesma linha do anterior — a regra de ASI do JS para
`return`/`break`/`continue`: `return\nvalor` devolve `undefined`.

#### `static not(rule: TRule): TRule`

Lookahead negativo: casa (sem consumir nada) só quando `rule` **não** casa em `pos`.

#### `static seq(...rules: TRule[]): TRule`

Sequência: todos em ordem, concatenando capturas.

#### `static choice(...rules: TRule[]): TRule`

Escolha ordenada (PEG): o primeiro que casa vence.

#### `static many(rule: TRule): TRule`

Zero ou mais (para no 1º fail ou ao deixar de avançar).

#### `static opt(rule: TRule): TRule`

Opcional — sempre casa; sem capturas quando ausente.

#### `static sepBy(item: TRule, separator: TRule): TRule`

`item` separado por `separator` (zero ou mais itens).

#### `static skip(): TRule`

Consome 1 token que nenhuma regra reconheceu. Deixa um nó `Skipped` na árvore (só se a regra que o envolve casar),
para `Language.analyze` avisar onde a gramática não cobre a fonte.

#### `static field(name: string, rule: TRule): TRule`

Rotula as capturas de `rule` como campo `name` do `node(...)` que as envolve (e resgata terminais).

#### `static ref(name: string): TRule`

Referência lazy a uma regra nomeada — permite recursão.

#### `static placeholder(scopeName: string): TRule`

Casa o placeholder do escopo `scopeName` e **não desce** — vira 1 nó-folha (`kind = scopeName`)
cobrindo o bloco inteiro. É o ponto de corte para lazy: quem quiser o conteúdo fatia
`node.text` (ou, no futuro, pede `node.ast`) sob demanda; a gramática não paga o corpo.

#### `static into(scopeName: string, rule: TRule | string): TRule`

Casa o placeholder do escopo `scopeName` e **desce**: tokeniza o stream direto daquele
escopo (memoizado) e o parseia com `rule`. As capturas de dentro sobem para o `node(...)`
externo. O pareamento `open`/`close` não é refeito — veio do `Parser`.

`rule` aceita tanto o nome de uma regra registrada (`"ParamList"`, para permitir
recursão/reuso) quanto uma regra inline (`G.sepBy(...)`) para composições ad-hoc que não
merecem virar uma entrada nomeada em `grammar` — ex: `G.into("paren", G.sepBy(item, val(",")))`.

#### `static node(kind: string, rule: TRule): TRule`

Constrói um `AstNode` de `kind` cobrindo tudo que `rule` consumiu. Entram como filhos:
nós rotulados (`field`) e nós compostos. Terminais soltos (pontuação por `val`/`tok` sem
`field`) são descartados.

#### `static build(ctx: TLangCtx, kind: string, start: number, end: number, fields: Record<string, AstNode | AstNode[]>): AstNode`

Construção de baixo nível de um `AstNode` a partir de campos já resolvidos (não de um
`TRule` casado) — escape hatch para combinadores que precisam montar um nó fora do fluxo
normal de `seq`/`field` (`binary`, `chain`). Registra em `ctx.root.nodes` como `node()`.

#### `static binary(kind: string, operand: TRule, operator: TRule): TRule`

Cadeia binária esquerda-associativa **achatada**: 1 nó `kind` só, com `left` (1º operando)
e `op`/`right` repetidos quando há mais de um operador do mesmo nível (`a + b + c` → um
`BinaryExpr` com `left=a`, `op=[+,+]`, `right=[b,c]`) — não uma árvore binária real, mas
suficiente pra reconhecer precedência sem multiplicar 1 nó por operador. Sem operador
nenhum, devolve `operand` sem envolver em nada.

#### `static chain(base: TRule, step: (prev: AstNode) => TRule): TRule`

Encadeamento postfix esquerda-associativo: casa `base`, depois tenta repetidamente `step`
— que recebe o `AstNode` já construído até aqui e devolve a `TRule` que, casando a partir
dali, decide como envolvê-lo (ex: `a.b` → `MemberExpr{object: a, property: b}`, `f()` →
`CallExpr{callee: f, args: […]}`). Um `step` que falha simplesmente encerra a cadeia — é
exatamente `member/call/index/non-null` de uma `CallExpr` de expressões.

---

## `Language`

classe · [src/language/model.ts:19](../../src/language/model.ts#L19)

Linguagem compilada de uma única `TLanguageSpec`. `parse` faz 1 passada estrutural (o
`Parser` monta a árvore de escopo) e roda a gramática sobre o stream de tokens — descendo
em escopos aninhados só quando uma regra pede (`G.into`); `G.placeholder` deixa o escopo
como folha, sem processar o conteúdo. `analyze` acrescenta diagnósticos (escopos não
fechados + as `TValidation`s da espec).

Protótipo: `parse` ainda percorre a gramática inteira de forma eager (todo escopo
alcançável acaba materializado). O corte real de lazy é o próximo passo — `descend` /
`G.into` / `G.placeholder` já são o gancho.

```ts
class Language
```

### Construtor

#### `constructor(spec: TLanguageSpec)`

### Estáticos

#### `static define(spec: TLanguageSpec): Language`

Compila uma `TLanguageSpec` (autômato de literais, gates do `Parser`, regras) uma vez só; o `Language` devolvido parseia quantas fontes quiser.

### Métodos

#### `parse(source: string): AstRoot`

Tokeniza e roda a gramática a partir de `start`, devolvendo só a árvore. Para diagnósticos e tokens, use `analyze`.

#### `analyze(source: string, file = "<anon>"): TAnalysis`

`parse` + escopos não fechados (erro) + as `TValidation`s da espec, sobre o stream achatado.

---

## `TLanguageSpec`

tipo · [src/language/types.ts:10](../../src/language/types.ts#L10)

Espec declarativa de uma linguagem — fonte única para o autômato, a tokenização e a
gramática. Não há um "conjunto de regras do lexer" separado: `scope`/`delimited`/`literal`
já são tudo que o scanner precisa, e a gramática referencia esses mesmos `kind`s.

```ts
type TLanguageSpec = { … }
```

### Propriedades

#### `scope: Record<string, readonly [open: string, close: string]>`

Delimitadores pareados que formam a árvore de escopo (transparentes — conteúdo é tokenizado).

#### `delimited: Record<string, TDelimitedSpec | readonly TDelimitedSpec[]>`

Regiões opacas: nada dentro é tokenizado, o bloco inteiro vira 1 token do `kind` da família.

#### `charClass: Record<string, TCharClassSpec>`

Classes de caractere por predicado (identificador, número, espaço, ...).

#### `literal: Record<string, readonly string[]>`

Famílias de literais (keywords, operadores, pontuação). Alimentam o autômato; o `kind` do token é o nome da família.

#### `grammar: Record<string, TRule>`

Regras nomeadas da gramática, montadas com os combinadores de `G`.

#### `start: string`

Nome da regra de entrada.

#### `escape?: string`

Caractere de escape (ex: `"\\"`) — um `open`/`close`/`${` precedido por ele em número ímpar não conta.

#### `validate?: readonly TValidation[]`

Validações extras (camada estilo ESLint) — rodam sobre o stream achatado + a AST e
emitem `TDiagnostic`s. Separadas da gramática de propósito: a gramática são as regras
absolutas da linguagem, isto é opt-in (regras de projeto/framework).

---

## `TDelimitedSpec`

tipo · [src/language/types.ts:36](../../src/language/types.ts#L36)

Uma região opaca (string, comentário, template): o conteúdo não é tokenizado, vira 1 token do `kind` da família.

```ts
type TDelimitedSpec = { … }
```

### Propriedades

#### `open: string`

Texto que abre a região.

#### `close: string`

Texto que fecha a região.

#### `consumeClose?: boolean`

false = o `close` não entra no token (ex: comentário de linha terminado por `\n`). Default: true.

#### `trivia?: boolean`

Marca o `kind` como trivia — filtrado antes da gramática.

#### `subtype?: (source: string, start: number, end: number) => string | undefined`

Roda 1x por match (offsets, não o `value` fatiado). Retornar um `kind` troca o `kind`
do token só nesse match (ex: `/**` dentro de `blockComment` virar `jsdoc`); o teste de
trivia é refeito sobre o `kind` final.

#### `interpolate?: readonly [open: string, close: string]`

Semi-transparente: opaco **exceto** por janelas `[open, close]` que voltam a ser código
(o `${ … }` de uma template string). Em vez de 1 token só, o stream recebe pedaços de
texto (`kind` da família) alternados com placeholders de escopo `scope:<nome>Interp`,
nos quais a gramática pode descer (`G.into`).

---

## `TCharClassSpec`

tipo · [src/language/types.ts:63](../../src/language/types.ts#L63)

Uma classe de caracteres reconhecida por predicado sobre o código UTF-16 (identificador, número, espaço...).

```ts
type TCharClassSpec = { … }
```

### Propriedades

#### `start: (code: number) => boolean`

Testado no 1º char do run.

#### `continue?: (code: number) => boolean`

Testado do 2º char em diante. Default: mesmo predicado de `start`.

#### `trivia?: boolean`

Marca o `kind` como trivia — filtrado antes da gramática.

---

## `TLangToken`

tipo · [src/language/types.ts:77](../../src/language/types.ts#L77)

Token achatado. `kind` é o nome de uma família de `literal`, uma `charClass`, um `delimited`,
ou `scope:<nome>` para o placeholder de um escopo aninhado — nesse caso `scope` aponta o nó
a descer sob demanda (via `G.into`), mantendo o conteúdo do escopo não-processado até ser pedido.

```ts
type TLangToken = { … }
```

### Propriedades

#### `kind: string`

Família do token (nome de `literal`, `charClass`, `delimited`) ou `scope:<nome>`.

#### `value: string`

Texto do token.

#### `start: number`

Offset inicial na fonte.

#### `end: number`

Offset final (exclusivo) na fonte.

#### `scope?: ParserNode`

Nó do `Parser` a descer, quando o token é placeholder de escopo.

---

## `TLangCtx`

tipo · [src/language/types.ts:91](../../src/language/types.ts#L91)

Estado compartilhado durante um parse — passado a todo matcher.

```ts
type TLangCtx = { … }
```

### Propriedades

#### `tokens: readonly TLangToken[]`

Tokens do nível sendo parseado.

#### `readonly root: AstRoot`

Raiz da árvore em construção (dá acesso à fonte).

#### `readonly rules: ReadonlyMap<string, TRule>`

Regras nomeadas da espec, para `G.ref`.

#### `readonly descend: (node: ParserNode) => readonly TLangToken[]`

Tokeniza (memoizado) o stream direto de um escopo — usado por `G.into` para descer sob demanda.

#### `readonly memo: Map<string, TLangMatch>`

Memo packrat por regra nomeada: `"<rule>@<pos>"` → resultado.

#### `furthest: number`

Posição de token mais distante em que algum matcher falhou (diagnóstico).

---

## `TLangCapture`

tipo · [src/language/types.ts:107](../../src/language/types.ts#L107)

O que um matcher capturou: um nó, opcionalmente rotulado como campo.

```ts
type TLangCapture = { … }
```

### Propriedades

#### `field?: string`

Nome do campo no nó que envolve a captura (`G.field`).

#### `leaf?: boolean`

Terminal (pontuação/keyword) — descartado por `G.node` se não for rotulado por `field`.

#### `node: AstNode`

O nó capturado.

---

## `TLangMatch`

tipo · [src/language/types.ts:117](../../src/language/types.ts#L117)

Resultado de uma regra: casou (com a próxima posição e as capturas) ou não.

```ts
type TLangMatch = { ok: true; next: number; captures: TLangCapture[] } | { ok: false }
```

---

## `TRule`

tipo · [src/language/types.ts:120](../../src/language/types.ts#L120)

Função de reconhecimento: consome tokens a partir de `pos`.

```ts
type TRule = (ctx: TLangCtx, pos: number) => TLangMatch
```

---

## `TDiagnosticSeverity`

tipo · [src/language/types.ts:123](../../src/language/types.ts#L123)

`error` quebra o build com `docs:check`; `warning` só aparece no relatório.

```ts
type TDiagnosticSeverity = 'error' | 'warning'
```

---

## `TDiagnostic`

tipo · [src/language/types.ts:126](../../src/language/types.ts#L126)

Um problema encontrado numa fonte — estrutural (parser) ou de uma `TValidation`.

```ts
type TDiagnostic = { … }
```

### Propriedades

#### `severity: TDiagnosticSeverity`

Gravidade.

#### `rule: string`

Slug da regra que emitiu (`unclosed-scope`, `prefer-hash-private`, ...).

#### `message: string`

Descrição para quem lê.

#### `file: string`

Arquivo analisado.

#### `line: number`

Linha 1-indexada.

---

## `TValidationCtx`

tipo · [src/language/types.ts:140](../../src/language/types.ts#L140)

Contexto passado a uma `TValidation` — stream achatado (todos os níveis, com trivia) + AST.

```ts
type TValidationCtx = { … }
```

### Propriedades

#### `file: string`

Arquivo analisado.

#### `source: string`

Fonte completa.

#### `tokens: readonly TLangToken[]`

Todos os tokens do arquivo, de qualquer profundidade de escopo, trivia incluída.

#### `root: AstRoot`

Árvore da gramática.

#### `lineAt: (offset: number) => number`

Linha (1-indexada) de um offset.

---

## `TValidation`

tipo · [src/language/types.ts:154](../../src/language/types.ts#L154)

Uma regra de projeto (estilo ESLint) que roda depois da gramática em `Language.analyze`.

```ts
type TValidation = { … }
```

### Propriedades

#### `name: string`

Slug da regra.

#### `check: (ctx: TValidationCtx) => TDiagnostic[]`

Devolve os diagnósticos encontrados.

---

## `TAnalysis`

tipo · [src/language/types.ts:162](../../src/language/types.ts#L162)

Resultado de `Language.analyze` — a árvore + diagnósticos + o stream achatado.

```ts
type TAnalysis = { … }
```

### Propriedades

#### `root: AstRoot`

A árvore.

#### `diagnostics: TDiagnostic[]`

Escopos não fechados, sintaxe não reconhecida e o que as validações acharam, por linha.

#### `tokens: readonly TLangToken[]`

Todos os tokens, de todos os níveis, com trivia.

---

## `LanguageUtils`

classe · [src/language/utils.ts:10](../../src/language/utils.ts#L10)

Helpers estáticos da `Language` — compilação da espec e tokenização de um escopo. Todas as
chamadas entre irmãos via `LanguageUtils.x`, nunca `this`.

```ts
class LanguageUtils
```

### Estáticos

#### `static compileGates(spec: TLanguageSpec): { gates: ParserGate[]; infoByGate: Map<ParserGate, TGateInfo> }`

Um `ParserGate` por `scope` (transparente) e por `delimited` (opaco), com o mapa gate → `kind`.

#### `static compileLiterals(spec: TLanguageSpec): TLiteralAutomaton`

Um autômato Aho-Corasick sobre todos os `literal` da espec — os terminais da gramática são exatamente estes.

#### `static triviaKinds(spec: TLanguageSpec): Set<string>`

`kind`s marcados `trivia` (charClass ou delimited) — filtrados antes da gramática.

#### `static streamOf(scope: ParserRoot | ParserNode, ctx: TScanContext, keepTrivia = false): TLangToken[]`

Stream direto de um escopo: gaps tokenizados finamente, intercalados com 1 token por
filho — placeholder (`scope:<nome>`, com `scope` apontando o nó) para escopo aninhado,
ou 1 token opaco para `delimited`. Não desce em escopo nenhum. Trivia é filtrada quando
`keepTrivia` é `false`.

#### `static flatten(scope: ParserRoot | ParserNode, ctx: TScanContext): TLangToken[]`

Stream achatado do arquivo inteiro: desce recursivamente em todos os escopos e devolve
cada token em ordem de fonte, trivia incluída. Base das `TValidation`s (que precisam ver
o que a gramática, por ser lazy, nunca tocou — ex: `private` dentro de um corpo de classe).
