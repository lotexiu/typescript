import { Computed, computed } from '@tsr-node/computed/model';
import { TReactive } from '@tsr-node/types';
import { HeadlessUtils } from '../utils';
import { TCollectionEntry, TCollectionOptions, TDefaultKey } from './types';
import { CollectionUtils } from './utils';

/**
 * A reactive list of items turned into keyed entries with label and disabled flag, plus the lookups and stepping (skipping disabled items) that lists, selects and menus share.
 * @example
 * const sizes = new Collection({ items: [{ value: 's', label: 'Small' }, { value: 'l', label: 'Large', disabled: true }] })
 * sizes.enabledKeys() // ['s']
 */
class Collection<T, K = TDefaultKey<T>> {
	/** The items as given. */
	readonly items: TReactive<readonly T[]>;
	/** Every item with key, label, disabled flag and index. */
	readonly entries: Computed<readonly TCollectionEntry<T, K>[]>;
	/** Every key, in order. */
	readonly keys: Computed<readonly K[]>;
	/** Keys of the items that are not disabled. */
	readonly enabledKeys: Computed<readonly K[]>;
	/** Number of items. */
	readonly size: Computed<number>;
	readonly #byKey: Computed<ReadonlyMap<K, TCollectionEntry<T, K>>>;

	constructor(options: TCollectionOptions<T, K>) {
		const keyOf = options.key ?? CollectionUtils.key<T, K>;
		const labelOf = options.label ?? CollectionUtils.label<T>;
		const disabledOf = options.disabled ?? CollectionUtils.disabled<T>;
		this.items = HeadlessUtils.reactive(options.items);
		this.entries = computed(() => this.items().map((item, index) => ({ key: keyOf(item), item, label: labelOf(item), disabled: disabledOf(item), index })));
		this.#byKey = computed(() => new Map(this.entries().map((entry) => [entry.key, entry])));
		this.keys = computed(() => this.entries().map((entry) => entry.key));
		this.enabledKeys = computed(() => this.entries().filter((entry) => !entry.disabled).map((entry) => entry.key));
		this.size = computed(() => this.entries().length);
	}

	/** Entry of a key; `undefined` when unknown. */
	get(key: K | undefined): TCollectionEntry<T, K> | undefined {
		if (key === undefined) return undefined;
		return this.#byKey().get(key);
	}

	/** Whether the key exists. */
	has(key: K | undefined): boolean {
		return this.get(key) !== undefined;
	}

	/** Whether the key exists and is not disabled. */
	isSelectable(key: K | undefined): boolean {
		const entry = this.get(key);
		return entry !== undefined && !entry.disabled;
	}

	/** Label of a key. */
	label(key: K | undefined): string | undefined {
		return this.get(key)?.label;
	}

	/** First enabled key. */
	first(): K | undefined {
		return this.enabledKeys()[0];
	}

	/** Last enabled key. */
	last(): K | undefined {
		const enabled = this.enabledKeys();
		return enabled[enabled.length - 1];
	}

	/** Next enabled key after `key` (wrapping around when `wrap`); from no key, the first one. */
	after(key: K | undefined, wrap: boolean): K | undefined {
		return this.#step(key, 1, wrap) ?? (key === undefined ? this.first() : undefined);
	}

	/** Previous enabled key before `key` (wrapping around when `wrap`); from no key, the last one. */
	before(key: K | undefined, wrap: boolean): K | undefined {
		return this.#step(key, -1, wrap) ?? (key === undefined ? this.last() : undefined);
	}

	/**
	 * First enabled key, after `from`, whose label starts with `text` (case-insensitive), wrapping around. `includeFrom` also tests `from` itself.
	 */
	search(text: string, from: K | undefined, includeFrom: boolean): K | undefined {
		const entries = this.entries();
		if (text === '' || entries.length === 0) return undefined;
		const start = this.get(from)?.index ?? -1;
		const offset = includeFrom && start >= 0 ? 0 : 1;
		for (let distance = 0; distance < entries.length; distance++) {
			const entry = entries[(start + offset + distance + entries.length) % entries.length];
			if (!entry.disabled && CollectionUtils.startsWith(entry.label, text)) return entry.key;
		}
		return undefined;
	}

	#step(key: K | undefined, direction: 1 | -1, wrap: boolean): K | undefined {
		const entries = this.entries();
		const start = this.get(key)?.index;
		if (start === undefined) return undefined;
		for (let distance = 1; distance <= entries.length; distance++) {
			const position = start + direction * distance;
			if (!wrap && (position < 0 || position >= entries.length)) return undefined;
			const entry = entries[(position + entries.length) % entries.length];
			if (!entry.disabled) return entry.key;
		}
		return undefined;
	}
}

export { Collection };
