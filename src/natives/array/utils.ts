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
