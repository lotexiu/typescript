# `headless`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`KEYS`](#keys) | constante | `KeyboardEvent.key` values the headless controls react to. |
| [`TMaybeReactive`](#tmaybereactive) | tipo | A plain value or a reactive one (`signal`, `computed`). Options typed with it follow the reactive version live. |
| [`TWritable`](#twritable) | tipo | Anything that can be read reactively and written with `set`: a `signal`, a `field`, a `writable`. Passing one as a control `value` makes the control use it as its state (controlled mode). |
| [`TKeyIntent`](#tkeyintent) | tipo | The part of a keyboard event the headless controls read. A DOM `KeyboardEvent` or a React keyboard event fits as is. |
| [`TAttributeValue`](#tattributevalue) | tipo | A value in a part's attributes; `undefined` means "leave the attribute out". |
| [`TAttributes`](#tattributes) | tipo | Plain HTML attributes for one part of a control (`role`, `aria-*`, `data-*`, `id`, `tabindex`, `hidden`), named as in HTML. Adapters rename what their framework spells differently. |
| [`TOrientation`](#torientation) | tipo | Layout axis of a control; it decides which arrow keys move it. |
| [`TTextDirection`](#ttextdirection) | tipo | Reading direction; `rtl` swaps the meaning of the left and right arrows. |
| [`HeadlessUtils`](#headlessutils) | classe | Small helpers shared by the headless controls: lifting plain values into signals, ids and ARIA value formatting. |

---

## `KEYS`

constante · [src/headless/declarations.ts:2](../../src/headless/declarations.ts#L2)

`KeyboardEvent.key` values the headless controls react to.

```ts
const KEYS
```

### Estáticos

#### `ARROW_UP: 'ArrowUp'`

#### `ARROW_DOWN: 'ArrowDown'`

#### `ARROW_LEFT: 'ArrowLeft'`

#### `ARROW_RIGHT: 'ArrowRight'`

#### `HOME: 'Home'`

#### `END: 'End'`

#### `PAGE_UP: 'PageUp'`

#### `PAGE_DOWN: 'PageDown'`

#### `ENTER: 'Enter'`

#### `SPACE: ' '`

#### `ESCAPE: 'Escape'`

#### `TAB: 'Tab'`

---

## `TMaybeReactive`

tipo · [src/headless/types.ts:6](../../src/headless/types.ts#L6)

A plain value or a reactive one (`signal`, `computed`). Options typed with it follow the reactive version live.

```ts
type TMaybeReactive<T> = T | TReactive<T>
```

---

## `TWritable`

tipo · [src/headless/types.ts:11](../../src/headless/types.ts#L11)

Anything that can be read reactively and written with `set`: a `signal`, a `field`, a `writable`. Passing one as a control `value` makes the control use it as its state (controlled mode).

```ts
type TWritable<T> = TReactive<T> & { /** Replaces the value. */ set(value: T): unknown; }
```

---

## `TKeyIntent`

tipo · [src/headless/types.ts:19](../../src/headless/types.ts#L19)

The part of a keyboard event the headless controls read. A DOM `KeyboardEvent` or a React keyboard event fits as is.

```ts
type TKeyIntent = { … }
```

### Propriedades

#### `readonly key: string`

The `KeyboardEvent.key` value (`'ArrowDown'`, `' '`, `'a'`...).

#### `readonly shiftKey?: boolean`

Shift was held.

#### `readonly ctrlKey?: boolean`

Control was held.

#### `readonly altKey?: boolean`

Alt/Option was held.

#### `readonly metaKey?: boolean`

Meta/Command was held.

#### `readonly defaultPrevented?: boolean`

An inner control already handled this event; outer controls then ignore it.

### Métodos

#### `preventDefault?(): void`

Called by a control when it handled the key.

---

## `TAttributeValue`

tipo · [src/headless/types.ts:37](../../src/headless/types.ts#L37)

A value in a part's attributes; `undefined` means "leave the attribute out".

```ts
type TAttributeValue = string | number | undefined
```

---

## `TAttributes`

tipo · [src/headless/types.ts:42](../../src/headless/types.ts#L42)

Plain HTML attributes for one part of a control (`role`, `aria-*`, `data-*`, `id`, `tabindex`, `hidden`), named as in HTML. Adapters rename what their framework spells differently.

```ts
type TAttributes = Readonly<Record<string, TAttributeValue>>
```

---

## `TOrientation`

tipo · [src/headless/types.ts:45](../../src/headless/types.ts#L45)

Layout axis of a control; it decides which arrow keys move it.

```ts
type TOrientation = 'horizontal' | 'vertical'
```

---

## `TTextDirection`

tipo · [src/headless/types.ts:48](../../src/headless/types.ts#L48)

Reading direction; `rtl` swaps the meaning of the left and right arrows.

```ts
type TTextDirection = 'ltr' | 'rtl'
```

---

## `HeadlessUtils`

classe · [src/headless/utils.ts:9](../../src/headless/utils.ts#L9)

Small helpers shared by the headless controls: lifting plain values into signals, ids and ARIA value formatting.

```ts
class HeadlessUtils
```

### Estáticos

#### `static isReactive<T>(value: unknown): value is TReactive<T>`

True for a `signal`, `computed` or anything with the same reactive shape.

#### `static isWritable<T>(value: unknown): value is TWritable<T>`

True for a reactive value that can also be `set`.

#### `static reactive<T>(value: TMaybeReactive<T>): TReactive<T>`

Returns `value` itself when it is reactive, otherwise a new signal holding it.

#### `static writable<T>(value: T | TWritable<T> | undefined, fallback: T): TWritable<T>`

Returns `value` itself when it is writable (controlled), otherwise a new signal holding `value ?? fallback`.

#### `static id(prefix: string): string`

A unique id for this page, `prefix-<number>`. Pass your own `id` to a control when rendering on a server.

#### `static boolean(value: boolean): 'true' | 'false'`

`'true'`/`'false'`, for ARIA attributes that must always be present (`aria-checked`, `aria-expanded`).

#### `static presence(value: boolean): '' | undefined`

`''` when true and `undefined` when false, for boolean attributes and `data-*` flags (`hidden`, `data-disabled`).

#### `static ariaFlag(value: boolean): 'true' | undefined`

`'true'` when true and `undefined` when false, for ARIA attributes that are simply absent when off (`aria-disabled`).

#### `static isPrintable(event: TKeyIntent): boolean`

True for a single character typed without Control, Meta or Alt — what typeahead reacts to.
