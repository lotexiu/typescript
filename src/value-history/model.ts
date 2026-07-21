import { computed } from "../computed/model";
import { model } from "../model/model";
import { TIndexedValue } from "./types";

class ValueHistory<T> {
	#history: T[] = []

	index = model(-1)

	previous = computed(() => this.#toIndexedValue(this.index.value - 1), [this.index])
	current = computed(() => this.#toIndexedValue(this.index.value), [this.index])
	next = computed(() => this.#toIndexedValue(this.index.value + 1), [this.index])

	length = computed(() => this.#history.length, [this.index])
	history = computed(() => this.#history.map((value, index) => ({ index, value })), [this.length])

	constructor(public cacheSize: number = -1) { }

	#toIndexedValue(index: number): TIndexedValue<T> | undefined {
		if (index < 0 || index >= this.#history.length) return undefined;
		return { index, value: this.#history[index] };
	}

	undo() {
		if (this.index.value < 0) return;
		this.index.update((v) => v - 1);
	}

	redo() {
		if (this.index.value >= this.#history.length - 1) return;
		this.index.update((v) => v + 1);
	}

	add(value: T) {
		this.index.silentUpdate(v => v + 1)
		let index = this.index.value;
		if (this.cacheSize >= 0 && index >= this.cacheSize) {
			this.#history = this.#history.slice(index - (this.cacheSize - 1), index);
			this.index.silentSet(this.cacheSize - 1);
		} else {
			this.#history.length = index;
		}
		index = this.index.value;
		this.#history.push(value);
		this.index.notifies(index);
	}
}

export {
	ValueHistory
}