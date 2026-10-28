/** Fonte de bytes: por padrão `crypto.getRandomValues`; passe `Random.bytes` para ids reproduzíveis. */
type TByteSource = (size: number) => Uint8Array;

type TShortIdOptions = Readonly<{ size?: number; alphabet?: string; bytes?: TByteSource }>;

export type { TByteSource, TShortIdOptions };
