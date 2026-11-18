# `natives/bitwise`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`BitwiseUtils`](#bitwiseutils) | classe | Bit flags kept in a single number: build named flags, combine and test them. |
| [`bitEnum`](#bitenum) | constante | Shortcut for `BitwiseUtils.enum`. |

---

## `BitwiseUtils`

classe · [src/natives/bitwise/utils.ts:4](../../../src/natives/bitwise/utils.ts#L4)

Bit flags kept in a single number: build named flags, combine and test them.

```ts
class BitwiseUtils
```

### Estáticos

#### `static enum<K extends string, T extends string[]>( noneKey: K, ...keys: T ): TRecord<[K | T[number], number]>`

Named flags: `noneKey` is 0 and each following key gets the next bit (1, 2, 4...).

**Exemplo**

```ts
const flags = BitwiseUtils.enum('none', 'bold', 'italic') // { none: 0, bold: 1, italic: 2 }
```

#### `static enabledKeys<T extends TRecord<[string, number]>>( value: number, enumObject: T ): (keyof T)[]`

Names of the flags set in `value`.

#### `static disabledKeys<T extends TRecord<[string, number]>>( value: number, enumObject: T ): (keyof T)[]`

Names of the flags not set in `value`.

#### `static isEnabled(value: number, ...flags: number[]): boolean`

Whether every given flag is set.

#### `static isDisabled(value: number, ...flags: number[]): boolean`

Whether every given flag is unset.

#### `static toggle(value: number, ...flags: number[]): number`

Flips the given flags.

#### `static disable(value: number, ...flags: number[]): number`

Clears the given flags.

#### `static enable(value: number, ...flags: number[]): number`

Sets the given flags.

---

## `bitEnum`

constante · [src/natives/bitwise/utils.ts:76](../../../src/natives/bitwise/utils.ts#L76)

Shortcut for `BitwiseUtils.enum`.

```ts
const bitEnum = BitwiseUtils
```
