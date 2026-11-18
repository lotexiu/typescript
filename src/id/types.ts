/** Fonte de bytes: por padrão `crypto.getRandomValues`; passe `Random.bytes` para ids reproduzíveis. */
type TByteSource = (size: number) => Uint8Array;

/** Options of `IdUtils.short`: length, alphabet and random byte source. */
type TShortIdOptions = Readonly<{ size?: number; alphabet?: string; bytes?: TByteSource }>;

export type { TByteSource, TShortIdOptions };
