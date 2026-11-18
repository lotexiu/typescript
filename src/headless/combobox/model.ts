import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { Collection } from '../collection/model';
import { TDefaultKey } from '../collection/types';
import { KEYS } from '../declarations';
import { LayerStack } from '../layer/model';
import { ListControl } from '../list-control/model';
import { TAttributes, TKeyIntent, TWritable } from '../types';
import { HeadlessUtils } from '../utils';
import { TComboboxOptions } from './types';
import { ComboboxUtils } from './utils';

/**
 * An editable input with a filtered list of options (APG combobox with list autocomplete). `value` is the chosen key;
 * `inputValue` is the text. Typing filters and opens; arrows move; Enter chooses; Escape closes, then clears.
 * @example
 * const city = new Combobox({ items: cities })
 * <input {...city.parts.input()} value={city.inputValue()} onChange={(event) => city.input(event.target.value)} onKeyDown={city.keydown} onBlur={city.commit} />
 */
class Combobox<T, K = TDefaultKey<T>> extends ListControl<T, K, K | undefined> {
	/** Whether the list is shown. Controlled when a writable was passed. */
	readonly open: TWritable<boolean>;
	/** The text in the input. */
	readonly inputValue: TWritable<string>;
	/** Every option, filtered or not. `collection` holds only the visible ones. */
	readonly allOptions: Collection<T, K>;
	/** Typed text that matches no option is kept on `commit`. */
	readonly allowCustomValue: boolean;
	/** Stack used to decide which overlay is on top. */
	readonly layers: LayerStack;
	/** Id of the label element. */
	readonly labelId: string;
	/** Id of the list element. */
	readonly listboxId: string;
	/** `open` or `closed`. */
	readonly state: Computed<'open' | 'closed'>;
	/** True while this is the most recently opened overlay; only then do Escape and clicks outside close it. */
	readonly isTop: Computed<boolean>;
	/** True when the list is open but nothing matches — show a "no results" message. */
	readonly empty: Computed<boolean>;
	/** Item of the chosen key. */
	readonly selectedItem: Computed<T | undefined>;
	/** Label of the chosen key. */
	readonly selectedLabel: Computed<string | undefined>;
	readonly #filtering: Signal<boolean>;

	/** Call on every input change (the text as the user left it). */
	readonly input = (text: string): boolean =>
		this.act(() =>
			Signal.batch(() => {
				this.inputValue.set(text);
				this.#filtering.set(true);
				this.open.set(true);
				this.navigation.first();
			})
		);

	/** Opens the list showing every option, highlighting the chosen one (or the first). */
	readonly show = (): boolean =>
		this.act(() => {
			this.open.set(true);
			const selected = Signal.untracked(this.value);
			if (selected === undefined || !this.navigation.setActive(selected)) this.navigation.first();
		});

	/** Closes the list. */
	readonly hide = (): void => {
		this.open.set(false);
	};

	/** Opens when closed, closes when open — for a toggle button next to the input. */
	readonly toggleOpen = (): boolean => (Signal.untracked(this.open) ? (this.hide(), true) : this.show());

	/** Chooses an option: stores its key, writes its label in the input and closes. */
	readonly choose = (key: K): boolean => {
		if (!Signal.untracked(() => this.allOptions.isSelectable(key))) return false;
		return this.act(() =>
			Signal.batch(() => {
				this.set(key);
				this.#syncInput();
				this.hide();
			})
		);
	};

	/** Clears the choice and the text. */
	readonly clear = (): boolean =>
		this.act(() =>
			Signal.batch(() => {
				this.set(undefined);
				this.inputValue.set('');
				this.#filtering.set(false);
			})
		);

	/** Call when the input loses focus: closes and, unless `allowCustomValue`, puts back the chosen option's label. */
	readonly commit = (): void => {
		Signal.batch(() => {
			this.hide();
			if (!this.allowCustomValue) this.#syncInput();
		});
	};

	/** Call on a pointer down outside the input and the list. Commits and closes when on top. */
	readonly interactOutside = (): boolean => {
		if (!Signal.untracked(this.isTop)) return false;
		this.commit();
		return true;
	};

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		label: (): TAttributes => ({ id: this.labelId, for: this.id }),
		input: (): TAttributes => ({
			id: this.id,
			role: 'combobox',
			autocomplete: 'off',
			'aria-autocomplete': 'list',
			'aria-expanded': HeadlessUtils.boolean(this.open()),
			'aria-controls': this.listboxId,
			'aria-activedescendant': this.open() ? this.itemId(this.navigation.active()) : undefined,
			disabled: HeadlessUtils.presence(this.disabled()),
			readonly: HeadlessUtils.presence(this.readOnly()),
			'data-state': this.state(),
		}),
		toggle: (): TAttributes => ({
			tabindex: -1,
			'aria-controls': this.listboxId,
			'aria-expanded': HeadlessUtils.boolean(this.open()),
			'data-state': this.state(),
		}),
		listbox: (): TAttributes => ({
			id: this.listboxId,
			role: 'listbox',
			tabindex: -1,
			'aria-labelledby': this.labelId,
			hidden: HeadlessUtils.presence(!this.open()),
			'data-state': this.state(),
			'data-empty': HeadlessUtils.presence(this.empty()),
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

	constructor(options: TComboboxOptions<T, K>) {
		const inputValue = HeadlessUtils.writable(options.inputValue, '');
		const filtering = signal(false);
		const allOptions = new Collection(options);
		const filter = options.filter ?? ComboboxUtils.contains;
		const visible = computed(() => {
			const text = inputValue();
			const entries = allOptions.entries();
			if (!filtering()) return entries.map((entry) => entry.item);
			return entries.filter((entry) => filter(entry.label, text)).map((entry) => entry.item);
		});
		super('combobox', { ...options, items: visible }, undefined, { orientation: 'vertical', typeahead: false });
		this.inputValue = inputValue;
		this.#filtering = filtering;
		this.allOptions = allOptions;
		this.allowCustomValue = options.allowCustomValue ?? false;
		this.layers = options.layers ?? LayerStack.shared;
		this.open = HeadlessUtils.writable(options.open, false);
		this.labelId = `${this.id}-label`;
		this.listboxId = `${this.id}-listbox`;
		this.state = computed(() => (this.open() ? 'open' : 'closed'));
		this.isTop = computed(() => this.open() && this.layers.isTop(this.id));
		this.empty = computed(() => this.open() && this.collection.size() === 0);
		this.selectedItem = computed(() => this.allOptions.get(this.value())?.item);
		this.selectedLabel = computed(() => this.allOptions.label(this.value()));
		if (Signal.untracked(this.inputValue) === '') this.#syncInput();
		this.onDispose(this.layers.track(this.id, this.open));
		this.onDispose(this.value.subscribe(() => this.#syncInput()));
	}

	#syncInput(): void {
		Signal.batch(() => {
			this.inputValue.set(Signal.untracked(this.selectedLabel) ?? '');
			this.#filtering.set(false);
		});
	}

	protected override handleKey(event: TKeyIntent): boolean {
		const open = Signal.untracked(this.open);
		const active = Signal.untracked(this.navigation.active);
		switch (event.key) {
			case KEYS.ARROW_DOWN:
				if (!open) return this.show();
				if (event.altKey) return true;
				return this.navigation.next() || true;
			case KEYS.ARROW_UP:
				if (!open) return this.show() && this.navigation.last();
				if (event.altKey) {
					if (active !== undefined) this.choose(active);
					else this.hide();
					return true;
				}
				return this.navigation.previous() || true;
			case KEYS.ENTER:
				if (!open) return false;
				if (active !== undefined) this.choose(active);
				else this.hide();
				return true;
			case KEYS.ESCAPE:
				if (open) {
					this.hide();
					return true;
				}
				if (Signal.untracked(this.inputValue) === '') return false;
				return this.clear();
			default:
				return false;
		}
	}
}

export { Combobox };
