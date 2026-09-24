import { TValueListener, TValueUnsubscribe } from '@ts/subscription/types';

type TEqual<T> = (a: T, b: T) => boolean;

// Qualquer valor reativo legível: chamar lê (e registra dependência dentro de um derived).
type TReadable<T> = {
	(): T;
	// Signal: chamado a cada escrita. Derived: só quando o valor muda de fato (recalcula na hora para comparar).
	// Os listeners rodam depois que a propagação termina (ou no fim do `Signal.batch` mais externo).
	subscribe(listener: TValueListener<T>): TValueUnsubscribe;
	dispose(): void;
};

type TSignal<T> = TReadable<T> & {
	set(next: T): boolean;
	update(fn: (value: T) => T): boolean;
	// Para mutação no lugar: altera o objeto que o signal já guarda e avisa sem comparar.
	notify(): void;
};

type TDerived<T> = TReadable<T>;

export type { TEqual, TReadable, TSignal, TDerived };
