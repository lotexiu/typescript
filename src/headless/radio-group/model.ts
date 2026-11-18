import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TDefaultKey } from '../collection/types';
import { KEYS } from '../declarations';
import { ListControl } from '../list-control/model';
import { TAttributes, TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';
import { TRadioGroupOptions } from './types';

/**
 * One option out of a few, all visible. Arrows move and select at once (wrapping, skipping disabled radios); only one radio is in the tab order.
 * Move the DOM focus to `navigation.active()` when it changes.
 *
 * Anatomy: `parts.root()` on the group (`role="radiogroup"`), `parts.item(key)` on each radio.
 */
class RadioGroup<T, K = TDefaultKey<T>> extends ListControl<T, K, K | undefined> {
	/** Whether a choice is required. */
	readonly required: TReactive<boolean>;
	/** The radio that gets `tabindex=0`: the checked one, or the first enabled. */
	readonly focusable: Computed<K | undefined>;
	/** Item of the checked key. */
	readonly selectedItem: Computed<T | undefined>;

	/** Checks a radio and highlights it. */
	readonly choose = (key: K): boolean => {
		if (!Signal.untracked(() => this.collection.isSelectable(key))) return false;
		return this.act(() => {
			this.navigation.setActive(key);
			this.set(key);
		});
	};

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		root: (): TAttributes => ({
			id: this.id,
			role: 'radiogroup',
			'aria-orientation': this.orientation === 'both' ? undefined : this.orientation,
			'aria-disabled': HeadlessUtils.ariaFlag(this.disabled()),
			'aria-readonly': HeadlessUtils.ariaFlag(this.readOnly()),
			'aria-required': HeadlessUtils.ariaFlag(this.required()),
			'data-disabled': HeadlessUtils.presence(this.disabled()),
		}),
		item: (key: K): TAttributes => {
			const entry = this.collection.get(key);
			const checked = this.value() === key;
			const disabled = this.disabled() || (entry?.disabled ?? true);
			return {
				id: this.itemId(key),
				role: 'radio',
				tabindex: !disabled && this.focusable() === key ? 0 : -1,
				'aria-checked': HeadlessUtils.boolean(checked),
				'aria-disabled': HeadlessUtils.ariaFlag(disabled),
				'data-state': checked ? 'checked' : 'unchecked',
				'data-disabled': HeadlessUtils.presence(disabled),
			};
		},
	};

	constructor(options: TRadioGroupOptions<T, K>) {
		super('radio-group', options, undefined, { orientation: 'both', typeahead: false });
		this.required = HeadlessUtils.reactive(options.required ?? false);
		this.focusable = computed(() => {
			const selected = this.value();
			return this.collection.isSelectable(selected) ? selected : this.collection.first();
		});
		this.selectedItem = computed(() => this.collection.get(this.value())?.item);
	}

	protected override handleKey(event: TKeyIntent): boolean {
		if (Signal.untracked(this.navigation.active) === undefined) this.navigation.setActive(Signal.untracked(this.focusable));
		const active = Signal.untracked(this.navigation.active);
		if (event.key === KEYS.SPACE) return active !== undefined && this.choose(active);
		if (!this.navigate(event)) return false;
		const moved = Signal.untracked(this.navigation.active);
		if (moved !== undefined) this.choose(moved);
		return true;
	}
}

export { RadioGroup };
