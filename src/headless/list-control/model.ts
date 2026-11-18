import { Signal } from '@tsr-node/signal/model';
import { Collection } from '../collection/model';
import { KEYS } from '../declarations';
import { Navigation } from '../navigation/model';
import { TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';
import { Control } from '../control/model';
import { TListControlOptions, TListOrientation } from './types';

/**
 * Base of the controls over a list of items (`Listbox`, `Select`, `RadioGroup`, `Tabs`, `Menu`, `Combobox`): owns the `collection`, the keyboard `navigation` and the shared arrow/Home/End/typeahead handling.
 */
abstract class ListControl<T, K, V> extends Control<V> {
	/** The items, keyed and labelled. */
	readonly collection: Collection<T, K>;
	/** Which item is highlighted (focused for keyboard purposes). */
	readonly navigation: Navigation<T, K>;
	/** Which arrows move the highlight. */
	readonly orientation: TListOrientation;
	readonly #typeahead: boolean;

	/** Highlights an item under the pointer. */
	readonly hover = (key: K): boolean => this.act(() => this.navigation.setActive(key));

	constructor(prefix: string, options: TListControlOptions<T, K, V>, fallback: V, defaults: { orientation: TListOrientation; typeahead: boolean }) {
		super(prefix, options, fallback);
		this.collection = new Collection(options);
		this.navigation = new Navigation(this.collection, options);
		this.orientation = options.orientation ?? defaults.orientation;
		this.#typeahead = options.typeahead ?? defaults.typeahead;
	}

	/** DOM id of an item's element, `<id>-item-<index>`; `undefined` for unknown keys. */
	itemId(key: K | undefined): string | undefined {
		const entry = this.collection.get(key);
		return entry === undefined ? undefined : `${this.id}-item-${entry.index}`;
	}

	protected navigate(event: TKeyIntent): boolean {
		const vertical = this.orientation !== 'horizontal';
		const horizontal = this.orientation !== 'vertical';
		const { navigation } = this;
		if ((vertical && event.key === KEYS.ARROW_DOWN) || (horizontal && event.key === KEYS.ARROW_RIGHT)) return navigation.next() || this.#hasActive();
		if ((vertical && event.key === KEYS.ARROW_UP) || (horizontal && event.key === KEYS.ARROW_LEFT)) return navigation.previous() || this.#hasActive();
		if (event.key === KEYS.HOME) return navigation.first();
		if (event.key === KEYS.END) return navigation.last();
		if (this.#typeahead && HeadlessUtils.isPrintable(event) && event.key !== KEYS.SPACE) {
			navigation.typeahead(event.key);
			return true;
		}
		return false;
	}

	#hasActive(): boolean {
		return Signal.untracked(this.navigation.active) !== undefined;
	}
}

export { ListControl };
