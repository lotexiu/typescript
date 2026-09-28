import { signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TActiveIndex, TActiveIndexOptions } from './types';

const NONE = -1;

/**
 * Index arithmetic (next/prev/first/last, optional wraparound) over a list
 * whose length can change — e.g. options narrowed by a text filter. Doesn't
 * know what the list contains; resolving `index()` to an item is the caller's job.
 */
function activeIndex(
	length: TReactive<number> | number,
	options: TActiveIndexOptions = {}
): TActiveIndex {
	const { loop = true } = options;
	const readLength = typeof length === 'number' ? () => length : length;
	const index = signal(NONE);

	function clampWithin(size: number, next: number): number {
		if (loop) return ((next % size) + size) % size;
		return Math.min(Math.max(next, 0), size - 1);
	}

	function first(): void {
		const size = readLength();
		index.set(size > 0 ? 0 : NONE);
	}

	function last(): void {
		const size = readLength();
		index.set(size > 0 ? size - 1 : NONE);
	}

	function next(): void {
		const size = readLength();
		if (size <= 0) {
			index.set(NONE);
			return;
		}
		index.set(index() === NONE ? 0 : clampWithin(size, index() + 1));
	}

	function prev(): void {
		const size = readLength();
		if (size <= 0) {
			index.set(NONE);
			return;
		}
		index.set(index() === NONE ? size - 1 : clampWithin(size, index() - 1));
	}

	function clear(): void {
		index.set(NONE);
	}

	if (typeof length !== 'number') {
		// re-clamp when the underlying list shrinks (e.g. a filter narrows it) past the active index
		length.subscribe(() => {
			const size = readLength();
			if (size <= 0) return index.set(NONE);
			if (index() >= size) index.set(size - 1);
		});
	}

	return { index, next, prev, first, last, clear };
}

export { activeIndex };
