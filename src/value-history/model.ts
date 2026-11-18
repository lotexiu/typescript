import { computed } from "@tsr-node/computed/model";
import { Signal, signal } from "@tsr-node/signal/model";
import { TIndexedValue } from "./types";

/** Undo/redo over a list of values: `add` drops the redo branch, `cacheSize` limits how many are kept. */
class ValueHistory<T> {
	// Mutado no lugar + `notify()` — sem copiar o array a cada `add`.
	readonly #entries = signal<T[]>([]);

	/** Position of the current value (-1 when empty or fully undone). */
	readonly index = signal(-1);

	/** Value before the current one. */
	readonly previous = computed(() => this.#at(this.index() - 1));
	/** Current value. */
	readonly current = computed(() => this.#at(this.index()));
	/** Value after the current one (what `redo` goes to). */
	readonly next = computed(() => this.#at(this.index() + 1));

	/** `undo()` would move (it can step back to `index === -1`, the state before the first entry). */
	readonly canUndo = computed(() => this.index() >= 0);
	/** Whether there is something to redo. */
	readonly canRedo = computed(() => this.index() < this.#entries().length - 1);

	/** Number of values kept. */
	readonly length = computed(() => this.#entries().length);
	/** Every value with its index. */
	readonly history = computed(() => this.#entries().map((value, index) => ({ index, value })));

	// Quantas entradas manter (as mais antigas saem primeiro); negativo = sem limite.
	/** Creates an empty history; `cacheSize` -1 keeps everything. */
	constructor(public cacheSize: number = -1) {}

	#at(index: number): TIndexedValue<T> | undefined {
		const entries = this.#entries();
		if (index < 0 || index >= entries.length) return undefined;
		return { index, value: entries[index] };
	}

	/** Moves one value back. */
	undo(): void {
		if (this.index() < 0) return;
		this.index.update((current) => current - 1);
	}

	/** Moves one value forward. */
	redo(): void {
		if (this.index() >= this.#entries().length - 1) return;
		this.index.update((current) => current + 1);
	}

	/** Adds a value after the current one, dropping what could be redone. */
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
