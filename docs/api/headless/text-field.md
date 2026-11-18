# `headless/text-field`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](../README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TEXT_FIELD_ERRORS`](#text_field_errors) | constante | Error codes produced by `TextField` itself. Masks add their own (`pattern`, `range`...). Turn codes into messages in the app. |
| [`TextField`](#textfield) | classe | A text input with optional mask, validation and touched/focused state. Errors are codes, never messages. |
| [`TTextValidator`](#ttextvalidator) | tipo | Checks a text and returns an error code, or `undefined` when valid. Receives the text as shown and without the mask. |
| [`TTextFieldOptions`](#ttextfieldoptions) | tipo | Options of a `TextField`. |
| [`TTextInputResult`](#ttextinputresult) | tipo | What `input()` returns: the text to put back in the input and where to place the caret. |

---

## `TEXT_FIELD_ERRORS`

constante · [src/headless/text-field/declarations.ts:4](../../../src/headless/text-field/declarations.ts#L4)

Error codes produced by `TextField` itself. Masks add their own (`pattern`, `range`...). Turn codes into messages in the app.

```ts
const TEXT_FIELD_ERRORS = { REQUIRED: 'required', TOO_LONG: 'tooLong', } as const
```

### Estáticos

#### `REQUIRED: 'required'`

#### `TOO_LONG: 'tooLong'`

---

## `TextField`

classe · [src/headless/text-field/model.ts:23](../../../src/headless/text-field/model.ts#L23)

A text input with optional mask, validation and touched/focused state. Errors are codes, never messages.

Wire the input's change event to `input(text, caret)` and put back the returned text and caret; call `focus`/`blur` on the
matching events. `showError` turns true only after the user left the field.

Anatomy: `parts.label()`, `parts.input()`, `parts.error()`.

```ts
class TextField<T = string> extends Control<string>
```

Estende [`Control`](control.md#control) — os membros herdados estão documentados lá.

**Exemplo**

```ts
const phone = new TextField({ mask: '(00) 00000-0000', required: true })
const { text, caret } = phone.input('11987', 5) // text "(11) 987"
```

### Construtor

#### `constructor(options: TTextFieldOptions<T> = {})`

### Propriedades

#### `readonly formatter: MaskFormatter<T> | undefined`

The mask in use, if any.

#### `readonly required: TReactive<boolean>`

Whether empty text is an error.

#### `readonly maxLength: number | undefined`

Maximum length, if any.

#### `readonly labelId: string`

Id of the label element.

#### `readonly errorId: string`

Id of the error message element.

#### `readonly unmasked: Computed<string>`

The text without the mask's literals (what the user typed).

#### `readonly typed: Computed<T | undefined>`

The value the mask's codec reads from the text (a number, a date...); the text itself without a mask.

#### `readonly error: Computed<string | undefined>`

First error code, or `undefined` when valid.

#### `readonly invalid: Computed<boolean>`

There is an error.

#### `readonly touched: Signal<boolean>`

The user left the field at least once.

#### `readonly focused: Signal<boolean>`

The field has focus.

#### `readonly showError: Computed<boolean>`

Touched and invalid: time to show the error.

### Métodos

#### `focus(): void`

Call when the input gains focus.

#### `blur(): void`

Call when the input loses focus; marks the field as touched.

#### `input(text: string, caret: number = text.length): TTextInputResult`

Call on every change with the input's text and caret. Formats, stores and returns the text and caret to put back.

#### `parts.label(): TAttributes`

#### `parts.input(): TAttributes`

#### `parts.error(): TAttributes`

#### `override reset(): void`

Goes back to the initial text and forgets that the field was touched.

---

## `TTextValidator`

tipo · [src/headless/text-field/types.ts:9](../../../src/headless/text-field/types.ts#L9)

Checks a text and returns an error code, or `undefined` when valid. Receives the text as shown and without the mask.

```ts
type TTextValidator = (value: string, unmasked: string) => string | undefined
```

---

## `TTextFieldOptions`

tipo · [src/headless/text-field/types.ts:12](../../../src/headless/text-field/types.ts#L12)

Options of a `TextField`.

```ts
type TTextFieldOptions<T> = TControlOptions<string> & {
	/**
	 * Formats the text while typing: a pattern (`'(00) 0000-0000'`), a preset id, a mask definition or a ready `MaskFormatter`.
	 */
	readonly mask?: string | TMaskDefinition | MaskFormatter<T>;
	/** Empty text is an error (`required`). */
	readonly required?: TMaybeReactive<boolean>;
	/** Cuts longer text. */
	readonly maxLength?: number;
	/** Extra checks, run after the built-in ones; the first error wins. */
	readonly validators?: readonly TTextValidator[];
}
```

---

## `TTextInputResult`

tipo · [src/headless/text-field/types.ts:26](../../../src/headless/text-field/types.ts#L26)

What `input()` returns: the text to put back in the input and where to place the caret.

```ts
type TTextInputResult = { … }
```

### Propriedades

#### `readonly text: string`

Formatted text.

#### `readonly caret: number`

Caret position in the formatted text.
