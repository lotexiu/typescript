/** Devolve a permissão. Chamar de novo não faz nada (idempotente). */
type TRelease = () => void;

/** @internal Quem está na fila esperando uma permissão. */
type TWaiter = { grant: () => void; reject: (reason: unknown) => void };

export type { TRelease, TWaiter };
