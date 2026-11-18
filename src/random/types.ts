/** Estado completo do gerador: 4 palavras de 32 bits. Guardar e restaurar reproduz a sequência exatamente. */
type TRandomState = readonly [number, number, number, number];

/** Semente: número (usa os 32 bits baixos do inteiro) ou texto (hash FNV-1a de 32 bits). */
type TRandomSeed = number | string;

/** A value with its relative weight, for `Random.weighted`. */
type TWeighted<T> = Readonly<{ value: T; weight: number }>;

export type { TRandomState, TRandomSeed, TWeighted };
