import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TDefaultKey } from '../collection/types';
import { KEYS } from '../declarations';
import { LayerStack } from '../layer/model';
import { ListControl } from '../list-control/model';
import { TAttributes, TKeyIntent, TWritable } from '../types';
import { HeadlessUtils } from '../utils';
import { TSelectOptions } from './types';

/**
 * A button that opens a list and shows the chosen option (the APG "select-only combobox").
 * Closed: arrows, Enter or Space open it; typing jumps to an option. Open: arrows/Home/End move, Enter/Space choose, Escape closes, Tab chooses and moves on.
 *
 * Anatomy: `parts.label()`, `parts.trigger()` (`role="combobox"`, focus stays here), `parts.listbox()`, `parts.option(key)`.
 * @example
 * const size = new Select({ items: [{ value: 's', label: 'Small' }, { value: 'l', label: 'Large' }] })
 * size.selectedLabel() // undefined until something is chosen
 */
class Select<T, K = TDefaultKey<T>> extends ListControl<T, K, K | undefined> {
	/** Whether the list is shown. Controlled when a writable was passed. */
	readonly open: TWritable<boolean>;
	/** Id of the label element. */
	readonly labelId: string;
	/** Id of the list element. */
	readonly listboxId: string;
	/** `open` or `closed`. */
	readonly state: Computed<'open' | 'closed'>;
	/** Stack used to decide which overlay is on top. */
	readonly layers: LayerStack;
	/** True while this is the most recently opened overlay; only then do Escape and clicks outside close it. */
	readonly isTop: Computed<boolean>;
	/** Item of the chosen key. */
	readonly selectedItem: Computed<T | undefined>;
	/** Label of the chosen key — what the trigger shows. */
	readonly selectedLabel: Computed<string | undefined>;

	/** Opens, highlighting the chosen option (or the first). */
	readonly show = (): boolean =>
		this.act(() => {
			this.open.set(true);
			const selected = Signal.untracked(this.value);
			if (selected === undefined || !this.navigation.setActive(selected)) this.navigation.first();
		});

	/** Closes. */
	readonly hide = (): void => {
		this.open.set(false);
	};

	/** Opens when closed, closes when open — the trigger's click. */
	readonly toggleOpen = (): boolean => {
		if (!Signal.untracked(this.open)) return this.show();
		this.hide();
		return true;
	};

	/** Chooses an option and closes. */
	readonly choose = (key: K): boolean => {
		if (!Signal.untracked(() => this.collection.isSelectable(key))) return false;
		return this.act(() => {
			this.set(key);
			this.hide();
		});
	};

	/** Clears the choice. */
	readonly clear = (): boolean => this.act(() => this.set(undefined));

	/** Call on a pointer down outside trigger and list. Closes when on top. */
	readonly interactOutside = (): boolean => {
		if (!Signal.untracked(this.isTop)) return false;
		this.hide();
		return true;
	};

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		label: (): TAttributes => ({
			id: this.labelId,
		}),
		trigger: (): TAttributes => ({
			id: this.id,
			role: 'combobox',
			tabindex: this.disabled() ? -1 : 0,
			'aria-haspopup': 'listbox',
			'aria-expanded': HeadlessUtils.boolean(this.open()),
			'aria-controls': this.listboxId,
			'aria-labelledby': `${this.labelId} ${this.id}`,
			'aria-activedescendant': this.open() ? this.itemId(this.navigation.active()) : undefined,
			'aria-disabled': HeadlessUtils.ariaFlag(this.disabled()),
			'aria-readonly': HeadlessUtils.ariaFlag(this.readOnly()),
			'data-state': this.state(),
			'data-placeholder': HeadlessUtils.presence(this.value() === undefined),
			'data-disabled': HeadlessUtils.presence(this.disabled()),
		}),
		listbox: (): TAttributes => ({
			id: this.listboxId,
			role: 'listbox',
			tabindex: -1,
			'aria-labelledby': this.labelId,
			hidden: HeadlessUtils.presence(!this.open()),
			'data-state': this.state(),
		}),
		option: (key: K): TAttributes => {
			const entry = this.collection.get(key);
			const selected = this.value() === key;
			return {
				id: this.itemId(key),
				role: 'option',
				'aria-selected': HeadlessUtils.boolean(selected),
				'aria-disabled': HeadlessUtils.ariaFlag(entry?.disabled ?? true),
				'data-state': selected ? 'selected' : 'unselected',
				'data-highlighted': HeadlessUtils.presence(this.navigation.active() === key),
				'data-disabled': HeadlessUtils.presence(entry?.disabled ?? true),
			};
		},
	};

	constructor(options: TSelectOptions<T, K>) {
		super('select', options, undefined, { orientation: 'vertical', typeahead: true });
		this.open = HeadlessUtils.writable(options.open, false);
		this.labelId = `${this.id}-label`;
		this.listboxId = `${this.id}-listbox`;
		this.state = computed(() => (this.open() ? 'open' : 'closed'));
		this.layers = options.layers ?? LayerStack.shared;
		this.isTop = computed(() => this.open() && this.layers.isTop(this.id));
		this.onDispose(this.layers.track(this.id, this.open));
		this.selectedItem = computed(() => this.collection.get(this.value())?.item);
		this.selectedLabel = computed(() => this.collection.label(this.value()));
	}

	protected override handleKey(event: TKeyIntent): boolean {
		return Signal.untracked(this.open) ? this.#handleOpenKey(event) : this.#handleClosedKey(event);
	}

	#handleClosedKey(event: TKeyIntent): boolean {
		switch (event.key) {
			case KEYS.ARROW_DOWN:
			case KEYS.ARROW_UP:
			case KEYS.ENTER:
			case KEYS.SPACE:
				return this.show();
			case KEYS.HOME:
				return this.show() && this.navigation.first();
			case KEYS.END:
				return this.show() && this.navigation.last();
		}
		if (!HeadlessUtils.isPrintable(event)) return false;
		this.show();
		return this.navigate(event);
	}

	#handleOpenKey(event: TKeyIntent): boolean {
		const active = Signal.untracked(this.navigation.active);
		switch (event.key) {
			case KEYS.ESCAPE:
				this.hide();
				return true;
			case KEYS.ENTER:
			case KEYS.SPACE:
				if (active === undefined) this.hide();
				else this.choose(active);
				return true;
			case KEYS.TAB:
				if (active !== undefined) this.choose(active);
				this.hide();
				return false;
		}
		if (event.altKey && event.key === KEYS.ARROW_UP) {
			if (active === undefined) this.hide();
			else this.choose(active);
			return true;
		}
		return this.navigate(event);
	}
}

export { Select };
