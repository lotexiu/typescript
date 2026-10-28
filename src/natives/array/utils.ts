class ArrayUtils {
	static groupBy<T, K extends PropertyKey>(
		array: readonly T[],
		keySelector: (item: T) => K
	): Record<K, T[]> {
		return array.reduce(
			(acc, item) => {
				const key = keySelector(item);
				(acc[key] ||= []).push(item);
				return acc;
			},
			{} as Record<K, T[]>
		);
	}

	static uniqueBy<T, K>(array: readonly T[], keySelector: (item: T) => K): T[] {
		const seen = new Set<K>();
		return array.filter((item) => {
			const key = keySelector(item);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}

	/** Splits into `[matching, rest]`, keeping the original order in both. */
	static partition<T>(array: readonly T[], predicate: (item: T, index: number) => boolean): [T[], T[]] {
		const matching: T[] = [];
		const rest: T[] = [];
		array.forEach((item, index) => (predicate(item, index) ? matching : rest).push(item));
		return [matching, rest];
	}

	/** `[start, end)` stepping by `step` (default 1; negative steps count down). */
	static range(start: number, end: number, step = 1): number[] {
		if (step === 0) return [];
		const result: number[] = [];
		for (let value = start; step > 0 ? value < end : value > end; value += step) result.push(value);
		return result;
	}

	/** Pairs items by index; stops at the shortest array. */
	static zip<A, B>(first: readonly A[], second: readonly B[]): [A, B][] {
		const length = Math.min(first.length, second.length);
		return Array.from({ length }, (_, index) => [first[index], second[index]]);
	}

	static sortBy<T>(
		array: readonly T[],
		...selectors: Array<{ key: (item: T) => any; order?: 'asc' | 'desc' }>
	): T[] {
		return [...array].sort((a, b) => {
			for (const { key, order = 'asc' } of selectors) {
				const valA = key(a);
				const valB = key(b);
				if (valA < valB) return order === 'asc' ? -1 : 1;
				if (valA > valB) return order === 'asc' ? 1 : -1;
			}
			return 0;
		});
	}
}

export { ArrayUtils };
