# `id`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`TByteSource`](#tbytesource) | tipo | Fonte de bytes: por padrão `crypto.getRandomValues`; passe `Random.bytes` para ids reproduzíveis. |
| [`TShortIdOptions`](#tshortidoptions) | tipo | Options of `IdUtils.short`: length, alphabet and random byte source. |
| [`IdUtils`](#idutils) | classe | Geração de identificadores. A formatação é pura; só `bytes` (fonte de aleatoriedade) é trocável. |

---

## `TByteSource`

tipo · [src/id/types.ts:2](../../src/id/types.ts#L2)

Fonte de bytes: por padrão `crypto.getRandomValues`; passe `Random.bytes` para ids reproduzíveis.

```ts
type TByteSource = (size: number) => Uint8Array
```

---

## `TShortIdOptions`

tipo · [src/id/types.ts:5](../../src/id/types.ts#L5)

Options of `IdUtils.short`: length, alphabet and random byte source.

```ts
type TShortIdOptions = Readonly<{ size?: number; alphabet?: string; bytes?: TByteSource }>
```

---

## `IdUtils`

classe · [src/id/utils.ts:6](../../src/id/utils.ts#L6)

Geração de identificadores. A formatação é pura; só `bytes` (fonte de aleatoriedade) é trocável.

```ts
class IdUtils
```

### Estáticos

#### `static readonly urlAlphabet = URL_ALPHABET`

Alfabeto padrão de `short` (64 símbolos seguros para URL).

#### `static bytes(size: number): Uint8Array`

Bytes seguros do ambiente (`crypto.getRandomValues`). Lança se o ambiente não tiver `crypto`.

#### `static uuid(bytes: Uint8Array = IdUtils.bytes(UUID_BYTES)): string`

UUID v4 (RFC 4122). Passe `bytes` (16) para resultado determinístico.

#### `static isUuid(text: string): boolean`

Whether the text is a UUID (any version, case-insensitive).

#### `static short({ size = DEFAULT_SHORT_SIZE, alphabet = IdUtils.urlAlphabet, bytes = IdUtils.bytes }: TShortIdOptions = {}): string`

Id curto (estilo nanoid): `size` símbolos do `alphabet`, sem viés (amostragem por rejeição).
