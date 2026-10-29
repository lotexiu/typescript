import type { TCompare, TEntry } from './types';

/**
 * Fila de prioridade (heap binário). Sai primeiro o menor segundo `compare`; empates saem na **ordem de chegada** (estável).
 * Base de agendadores, timers, Dijkstra/A*. `push`/`pop` custam O(log n), `peek` O(1).
 */
class PriorityQueue<T> {
	readonly #heap: TEntry<T>[] = [];
	readonly #compare: TCompare<T>;
	#counter = 0;

	constructor(compare: TCompare<T>, items: Iterable<T> = []) {
		this.#compare = compare;
		for (const item of items) this.push(item);
	}

	get size(): number {
		return this.#heap.length;
	}

	get isEmpty(): boolean {
		return this.#heap.length === 0;
	}

	push(item: T): void {
		this.#heap.push({ item, order: this.#counter++ });
		this.#up(this.#heap.length - 1);
	}

	peek(): T | undefined {
		return this.#heap[0]?.item;
	}

	pop(): T | undefined {
		const top = this.#heap[0];
		if (!top) return undefined;
		const last = this.#heap.pop()!;
		if (this.#heap.length > 0) {
			this.#heap[0] = last;
			this.#down(0);
		}
		return top.item;
	}

	clear(): void {
		this.#heap.length = 0;
	}

	/** Itens na ordem de saída; a fila não é alterada. */
	toSortedArray(): T[] {
		const copy = new PriorityQueue(this.#compare);
		copy.#heap.push(...this.#heap);
		copy.#counter = this.#counter;
		const sorted: T[] = [];
		while (!copy.isEmpty) sorted.push(copy.pop()!);
		return sorted;
	}

	#before(left: TEntry<T>, right: TEntry<T>): boolean {
		const order = this.#compare(left.item, right.item);
		return order < 0 || (order === 0 && left.order < right.order);
	}

	#up(index: number): void {
		const heap = this.#heap;
		while (index > 0) {
			const parent = (index - 1) >> 1;
			if (!this.#before(heap[index], heap[parent])) return;
			[heap[index], heap[parent]] = [heap[parent], heap[index]];
			index = parent;
		}
	}

	#down(index: number): void {
		const heap = this.#heap;
		for (;;) {
			let best = index;
			for (const child of [index * 2 + 1, index * 2 + 2]) if (child < heap.length && this.#before(heap[child], heap[best])) best = child;
			if (best === index) return;
			[heap[index], heap[best]] = [heap[best], heap[index]];
			index = best;
		}
	}
}

export { PriorityQueue };
