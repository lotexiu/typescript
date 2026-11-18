import { TDescribedItem } from './types';

/**
 * @internal
 */
class CollectionUtils {
	static isDescribed(item: unknown): item is TDescribedItem {
		return typeof item === 'object' && item !== null;
	}

	static key<T, K>(item: T): K {
		if (!CollectionUtils.isDescribed(item)) return item as unknown as K;
		if (item.value !== undefined) return item.value as K;
		if (item.id !== undefined) return item.id as K;
		return item as unknown as K;
	}

	static label<T>(item: T): string {
		if (CollectionUtils.isDescribed(item) && typeof item.label === 'string') return item.label;
		return String(CollectionUtils.key(item));
	}

	static disabled<T>(item: T): boolean {
		return CollectionUtils.isDescribed(item) && item.disabled === true;
	}

	static startsWith(label: string, text: string): boolean {
		return label.toLocaleLowerCase().startsWith(text.toLocaleLowerCase());
	}
}

export { CollectionUtils };
