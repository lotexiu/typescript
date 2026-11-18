# `composables/bit-flag`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`BitFlag`](#bitflag) | tipo | A signal holding several on/off flags in one number, with named flags and set operations. |
| [`BitFlag`](#bitflag) | constante | Methods shared by every instance (assigned to each one) and the `instanceof` check. |
| [`bitFlag`](#bitflag) | função | Creates a `BitFlag` with one flag per key (`none` is 0). |

---

## `BitFlag`

tipo · [src/composables/bit-flag/model.ts:6](../../../src/composables/bit-flag/model.ts#L6)

A signal holding several on/off flags in one number, with named flags and set operations.

```ts
type BitFlag<T> = Signal<number> & {
	toggle: (...flags: number[]) => void;
	disable: (...flags: number[]) => void;
	enable: (...flags: number[]) => void;
	enabled: (...flags: number[]) => boolean;
	disabled: (...flags: number[]) => boolean;
	reset: () => void;
	flags: TRecord<['none' | T, number]>;
}
```

---

## `BitFlag`

constante · [src/composables/bit-flag/model.ts:16](../../../src/composables/bit-flag/model.ts#L16)

Methods shared by every instance (assigned to each one) and the `instanceof` check.

```ts
const BitFlag
```

---

## `bitFlag`

função · [src/composables/bit-flag/model.ts:59](../../../src/composables/bit-flag/model.ts#L59)

Creates a `BitFlag` with one flag per key (`none` is 0).

```ts
function bitFlag<T extends string[]>(...keys: T)
```

Estende `string`.

**Exemplo**

```ts
const state = bitFlag('hovered', 'pressed')
state.enable(state.flags.hovered)
```
