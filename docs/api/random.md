# `random`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Random`](#random) | classe | Gerador pseudoaleatório **determinístico** (xoshiro128**, estado de 4×32 bits, semente via splitmix32). Mesma semente → mesma sequência em qualquer plataforma/linguagem (só aritmética de inteiros de 32 bits): serve para jogos, simulação, testes reproduzíveis e replays. **Não** é criptográfico — para segredos use `IdUtils`. |
| [`TRandomState`](#trandomstate) | tipo | Estado completo do gerador: 4 palavras de 32 bits. Guardar e restaurar reproduz a sequência exatamente. |
| [`TRandomSeed`](#trandomseed) | tipo | Semente: número (usa os 32 bits baixos do inteiro) ou texto (hash FNV-1a de 32 bits). |
| [`TWeighted`](#tweighted) | tipo | A value with its relative weight, for `Random.weighted`. |
| [`RandomUtils`](#randomutils) | classe | Aritmética de 32 bits usada pelo `Random` (só inteiros: dá o mesmo resultado em qualquer plataforma). |

---

## `Random`

classe · [src/random/model.ts:10](../../src/random/model.ts#L10)

Gerador pseudoaleatório **determinístico** (xoshiro128**, estado de 4×32 bits, semente via splitmix32).
Mesma semente → mesma sequência em qualquer plataforma/linguagem (só aritmética de inteiros de 32 bits):
serve para jogos, simulação, testes reproduzíveis e replays. **Não** é criptográfico — para segredos use `IdUtils`.

```ts
class Random
```

### Construtor

#### `constructor(seed: TRandomSeed = Math.floor(Math.random() * UINT32_RANGE))`

Sem semente: usa `Math.random()` (não reproduzível).

### Estáticos

#### `static fromState(state: TRandomState): Random`

Recria um gerador exatamente no ponto em que `state()` foi lido.

### Métodos

#### `state(): TRandomState`

The generator state, to save and restore a sequence.

#### `setState(state: TRandomState): void`

Restores a state saved with `state()`.

#### `clone(): Random`

Cópia independente (avançar uma não mexe na outra).

#### `nextUint32(): number`

Próxima palavra de 32 bits sem sinal.

#### `uniform(): number`

Real em `[0, 1)`.

#### `int(min: number, max: number): number`

Inteiro em `[min, max]` (**os dois inclusivos**); a amplitude cabe em 2³².

#### `chance(probability = 0.5): boolean`

`true` com probabilidade `p` (padrão 0,5).

#### `normal(mean = 0, deviation = 1): number`

Distribuição normal (Box–Muller).

#### `pick<T>(items: readonly T[]): T | undefined`

Um item ao acaso (`undefined` se vazio).

#### `shuffle<T>(items: readonly T[]): T[]`

Cópia embaralhada (Fisher–Yates); a entrada não muda.

#### `weighted<T>(entries: readonly TWeighted<T>[]): T | undefined`

Escolhe por peso (pesos ≤ 0 nunca saem). `undefined` se nenhum peso positivo.

#### `bytes(size: number): Uint8Array`

`size` bytes (little-endian por palavra). Base para `IdUtils.uuid(random.bytes(16))` determinístico.

---

## `TRandomState`

tipo · [src/random/types.ts:2](../../src/random/types.ts#L2)

Estado completo do gerador: 4 palavras de 32 bits. Guardar e restaurar reproduz a sequência exatamente.

```ts
type TRandomState = readonly [number, number, number, number]
```

---

## `TRandomSeed`

tipo · [src/random/types.ts:5](../../src/random/types.ts#L5)

Semente: número (usa os 32 bits baixos do inteiro) ou texto (hash FNV-1a de 32 bits).

```ts
type TRandomSeed = number | string
```

---

## `TWeighted`

tipo · [src/random/types.ts:8](../../src/random/types.ts#L8)

A value with its relative weight, for `Random.weighted`.

```ts
type TWeighted<T> = Readonly<{ value: T; weight: number }>
```

---

## `RandomUtils`

classe · [src/random/utils.ts:4](../../src/random/utils.ts#L4)

Aritmética de 32 bits usada pelo `Random` (só inteiros: dá o mesmo resultado em qualquer plataforma).

```ts
class RandomUtils
```

### Estáticos

#### `static rotl(value: number, shift: number): number`

Rotação à esquerda de uma palavra de 32 bits.

#### `static hashSeed(text: string): number`

Hash FNV-1a de 32 bits (texto → semente).

#### `static splitmix(seed: number): () => number`

splitmix32: espalha uma semente de 32 bits em palavras de estado bem misturadas.
