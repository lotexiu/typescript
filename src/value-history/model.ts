import { derived, Signal, signal } from '@ts/signal/model';
import { TIndexedValue } from './types';

class ValueHistory<T> {
	// Mutado no lugar + `notify()` — sem copiar o array a cada `add`.
	readonly #entries = signal<T[]>([]);

	readonly index = signal(-1);

	readonly previous = derived(() => this.#at(this.index() - 1));
	readonly current = derived(() => this.#at(this.index()));
	readonly next = derived(() => this.#at(this.index() + 1));

	readonly length = derived(() => this.#entries().length);
	readonly history = derived(() => this.#entries().map((value, index) => ({ index, value })));

	// Quantas entradas manter (as mais antigas saem primeiro); negativo = sem limite.
	constructor(public cacheSize: number = -1) {}

	#at(index: number): TIndexedValue<T> | undefined {
		const entries = this.#entries();
		if (index < 0 || index >= entries.length) return undefined;
		return { index, value: entries[index] };
	}

	undo(): void {
		if (this.index() < 0) return;
		this.index.update((v) => v - 1);
	}

	redo(): void {
		if (this.index() >= this.#entries().length - 1) return;
		this.index.update((v) => v + 1);
	}

	add(value: T): void {
		Signal.batch(() => {
			const entries = this.#entries();
			// Registrar depois de um undo descarta o que dava para refazer.
			entries.length = this.index() + 1;
			entries.push(value);
			if (this.cacheSize >= 0 && entries.length > this.cacheSize) {
				entries.splice(0, entries.length - this.cacheSize);
			}
			this.#entries.notify();
			this.index.set(entries.length - 1);
		});
	}
}

export { ValueHistory };
