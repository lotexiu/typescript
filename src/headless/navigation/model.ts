import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { Collection } from '../collection/model';
import { TYPEAHEAD_TIMEOUT_MILLISECONDS } from '../declarations';
import { TNavigationOptions } from './types';

/**
 * The highlighted item of a list, by key: next/previous/first/last skipping disabled items, and typeahead. The highlight is dropped when its item disappears or becomes disabled.
 */
class Navigation<T, K> {
	/** The list being navigated. */
	readonly collection: Collection<T, K>;
	/** Highlighted key, or `undefined`. */
	readonly active: Computed<K | undefined>;
	/** Whether moving past an end goes around. */
	readonly wrap: boolean;
	readonly #requested: Signal<K | undefined>;
	readonly #now: () => number;
	#typed = '';
	#typedAt = Number.NEGATIVE_INFINITY;

	constructor(collection: Collection<T, K>, options: TNavigationOptions = {}) {
		this.collection = collection;
		this.wrap = options.wrap ?? true;
		this.#now = options.now ?? Date.now;
		this.#requested = signal<K | undefined>(undefined);
		this.active = computed(() => {
			const requested = this.#requested();
			return this.collection.isSelectable(requested) ? requested : undefined;
		});
	}

	/** Highlights a key (or clears with `undefined`). Refuses unknown or disabled keys. */
	setActive(key: K | undefined): boolean {
		if (key !== undefined && !Signal.untracked(() => this.collection.isSelectable(key))) return false;
		this.#requested.set(key);
		return true;
	}

	/** Removes the highlight. */
	clear(): void {
		this.#requested.set(undefined);
	}

	/** Highlights the first enabled item. */
	first(): boolean {
		return this.setActive(Signal.untracked(() => this.collection.first()));
	}

	/** Highlights the last enabled item. */
	last(): boolean {
		return this.setActive(Signal.untracked(() => this.collection.last()));
	}

	/** Highlights the next enabled item (the first, when nothing is highlighted). */
	next(): boolean {
		return this.#move(Signal.untracked(() => this.collection.after(Signal.untracked(this.active), this.wrap)));
	}

	/** Highlights the previous enabled item (the last, when nothing is highlighted). */
	previous(): boolean {
		return this.#move(Signal.untracked(() => this.collection.before(Signal.untracked(this.active), this.wrap)));
	}

	/**
	 * Feeds one typed character. Characters typed in quick succession form a prefix; repeating the same letter cycles through the items starting with it.
	 */
	typeahead(character: string): boolean {
		const now = this.#now();
		const continuing = now - this.#typedAt < TYPEAHEAD_TIMEOUT_MILLISECONDS;
		this.#typed = continuing ? this.#typed + character : character;
		this.#typedAt = now;
		const repeating = [...this.#typed].every((typed) => typed === character);
		const text = repeating ? character : this.#typed;
		const found = Signal.untracked(() => this.collection.search(text, Signal.untracked(this.active), !repeating));
		return this.#move(found);
	}

	#move(key: K | undefined): boolean {
		if (key === undefined) return false;
		return this.setActive(key);
	}
}

export { Navigation };
