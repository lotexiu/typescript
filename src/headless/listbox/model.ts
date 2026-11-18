import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TDefaultKey } from '../collection/types';
import { KEYS } from '../declarations';
import { ListControl } from '../list-control/model';
import { TAttributes, TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';
import { TListboxOptions, TSelectionMode } from './types';

/**
 * A list of options where one (`single`) or several (`multiple`) are selected; the highlight moves with arrows, Home/End and typing.
 *
 * Anatomy: `parts.root()` on the list (`role="listbox"`, focusable, uses `aria-activedescendant`), `parts.option(key)` on each option.
 * @example
 * const sizes = new Listbox({ items: ['S', 'M', 'L'], selectionMode: 'multiple' })
 * <ul {...sizes.parts.root()} onKeyDown={sizes.keydown}>{sizes.collection.keys().map((key) => <li {...sizes.parts.option(key)} onClick={() => sizes.press(key)} />)}</ul>
 */
class Listbox<T, K = TDefaultKey<T>> extends ListControl<T, K, readonly K[]> {
	/** `single` or `multiple`. */
	readonly selectionMode: TSelectionMode;
	/** The last selected option cannot be deselected. */
	readonly disallowEmpty: boolean;
	/** Items of the selected keys. */
	readonly selectedItems: Computed<readonly T[]>;

	/** Selects a key (replacing the selection in single mode). */
	readonly select = (key: K): boolean => this.act(() => this.set(this.selectionMode === 'single' ? [key] : [...Signal.untracked(this.value), key]));
	/** Deselects a key. */
	readonly deselect = (key: K): boolean => this.act(() => this.set(Signal.untracked(this.value).filter((selected) => selected !== key)));
	/** Selects or deselects a key. */
	readonly toggleSelection = (key: K): boolean => (Signal.untracked(() => this.isSelected(key)) ? this.deselect(key) : this.select(key));
	/** Selects every enabled key (multiple mode). */
	readonly selectAll = (): boolean => this.act(() => this.set(Signal.untracked(this.collection.enabledKeys)));
	/** Deselects everything. */
	readonly clearSelection = (): boolean => this.act(() => this.set([]));

	/** Pointer press on an option: highlights it and selects it (toggles it in multiple mode). */
	readonly press = (key: K): boolean => {
		if (!Signal.untracked(() => this.collection.isSelectable(key))) return false;
		return this.act(() => {
			this.navigation.setActive(key);
			if (this.selectionMode === 'multiple') this.toggleSelection(key);
			else this.select(key);
		});
	};

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		root: (): TAttributes => ({
			id: this.id,
			role: 'listbox',
			tabindex: this.disabled() ? -1 : 0,
			'aria-orientation': this.orientation === 'horizontal' ? 'horizontal' : 'vertical',
			'aria-multiselectable': HeadlessUtils.ariaFlag(this.selectionMode === 'multiple'),
			'aria-activedescendant': this.itemId(this.navigation.active()),
			'aria-disabled': HeadlessUtils.ariaFlag(this.disabled()),
			'aria-readonly': HeadlessUtils.ariaFlag(this.readOnly()),
			'data-disabled': HeadlessUtils.presence(this.disabled()),
		}),
		option: (key: K): TAttributes => {
			const entry = this.collection.get(key);
			const selected = this.isSelected(key);
			const highlighted = this.navigation.active() === key;
			return {
				id: this.itemId(key),
				role: 'option',
				'aria-selected': HeadlessUtils.boolean(selected),
				'aria-disabled': HeadlessUtils.ariaFlag(entry?.disabled ?? true),
				'data-state': selected ? 'selected' : 'unselected',
				'data-highlighted': HeadlessUtils.presence(highlighted),
				'data-disabled': HeadlessUtils.presence(entry?.disabled ?? true),
			};
		},
	};

	constructor(options: TListboxOptions<T, K>) {
		super('listbox', options, [], { orientation: 'vertical', typeahead: true });
		this.selectionMode = options.selectionMode ?? 'single';
		this.disallowEmpty = options.disallowEmpty ?? false;
		this.selectedItems = computed(() =>
			this.value().flatMap((key) => {
				const entry = this.collection.get(key);
				return entry === undefined ? [] : [entry.item];
			})
		);
	}

	/** Whether a key is selected. Reactive. */
	isSelected(key: K): boolean {
		return this.value().includes(key);
	}

	protected override normalize(next: readonly K[], current: readonly K[]): readonly K[] {
		const unique = [...new Set(next)];
		const fitted = this.selectionMode === 'single' ? unique.slice(-1) : unique;
		if (this.disallowEmpty && fitted.length === 0) return current;
		return fitted;
	}

	protected override equals(left: readonly K[], right: readonly K[]): boolean {
		return left.length === right.length && left.every((key, index) => key === right[index]);
	}

	protected override handleKey(event: TKeyIntent): boolean {
		const active = Signal.untracked(this.navigation.active);
		if ((event.key === KEYS.SPACE || event.key === KEYS.ENTER) && active !== undefined) return this.press(active);
		if (this.selectionMode === 'multiple' && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') return this.selectAll();
		return this.navigate(event);
	}
}

export { Listbox };
