# `locale`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`LocaleError`](#localeerror) | classe | An `Error` whose message comes from a locale map in the current locale; `type` is the message key, stable across languages. |
| [`TLocales`](#tlocales) | tipo | The supported locales. |
| [`TLocale`](#tlocale) | tipo | One supported locale. |
| [`TLocaleObject`](#tlocaleobject) | tipo | Message key → text. |
| [`TLocaleMap`](#tlocalemap) | tipo | Messages per locale. |
| [`LocaleUtils`](#localeutils) | classe | Chooses the locale of the library's messages. |

---

## `LocaleError`

classe · [src/locale/error.ts:7](../../src/locale/error.ts#L7)

An `Error` whose message comes from a locale map in the current locale; `type` is the message key, stable across languages.

```ts
class LocaleError<T extends TLocaleMap> extends Error
```

Estende [`TLocaleMap`](locale.md#tlocalemap) — os membros herdados estão documentados lá.

### Construtor

#### `constructor( LocaleMap: T, readonly type: keyof T[keyof T], options?: { cause?: unknown } )`

Builds the error from a locale map and a message key; details go in `cause`.

---

## `TLocales`

tipo · [src/locale/types.ts:4](../../src/locale/types.ts#L4)

The supported locales.

```ts
type TLocales = typeof LOCALES
```

---

## `TLocale`

tipo · [src/locale/types.ts:7](../../src/locale/types.ts#L7)

One supported locale.

```ts
type TLocale = TLocales[number]
```

---

## `TLocaleObject`

tipo · [src/locale/types.ts:10](../../src/locale/types.ts#L10)

Message key → text.

```ts
type TLocaleObject = Record<string, string>
```

---

## `TLocaleMap`

tipo · [src/locale/types.ts:13](../../src/locale/types.ts#L13)

Messages per locale.

```ts
type TLocaleMap<T extends TLocaleObject = TLocaleObject> = { … }
```

Estende [`TLocaleObject`](locale.md#tlocaleobject) — os membros herdados estão documentados lá.

---

## `LocaleUtils`

classe · [src/locale/utils.ts:5](../../src/locale/utils.ts#L5)

Chooses the locale of the library's messages.

```ts
class LocaleUtils
```

### Estáticos

#### `static default: TLocale`

Locale used when the system one is not supported.

#### `static readonly locales = LOCALES`

Supported locales.

#### `static get SystemLocale(): TLocale`

The system/browser locale when supported, otherwise `default`.

#### `static supportedLocales()`

Supported locales.

#### `static getLocaleObject<T extends TLocaleMap>(locales: T)`

The messages of the current locale from a locale map.
