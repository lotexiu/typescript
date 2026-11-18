import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TDefaultKey } from '../collection/types';
import { KEYS } from '../declarations';
import { ListControl } from '../list-control/model';
import { TAttributes, TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';
import { TTabsActivation, TTabsOptions } from './types';

/**
 * Tabs and their panels. `automatic` activation selects as the arrows move; `manual` only moves the focus until Enter/Space.
 * With no valid value the first enabled tab is selected. Move the DOM focus to `navigation.active()` when it changes.
 *
 * Anatomy: `parts.list()` (`role="tablist"`), `parts.tab(key)`, `parts.panel(key)`.
 */
class Tabs<T, K = TDefaultKey<T>> extends ListControl<T, K, K | undefined> {
	/** `automatic` or `manual`. */
	readonly activation: TTabsActivation;
	/** The selected tab: the value when valid, otherwise the first enabled tab. */
	readonly selected: Computed<K | undefined>;

	/** Selects a tab. */
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
		list: (): TAttributes => ({
			id: this.id,
			role: 'tablist',
			'aria-orientation': this.orientation === 'vertical' ? 'vertical' : 'horizontal',
			'data-orientation': this.orientation,
		}),
		tab: (key: K): TAttributes => {
			const entry = this.collection.get(key);
			const selected = this.selected() === key;
			const disabled = this.disabled() || (entry?.disabled ?? true);
			return {
				id: this.itemId(key),
				role: 'tab',
				tabindex: selected && !disabled ? 0 : -1,
				'aria-selected': HeadlessUtils.boolean(selected),
				'aria-controls': this.panelId(key),
				'aria-disabled': HeadlessUtils.ariaFlag(disabled),
				'data-state': selected ? 'active' : 'inactive',
				'data-highlighted': HeadlessUtils.presence(this.navigation.active() === key),
				'data-disabled': HeadlessUtils.presence(disabled),
			};
		},
		panel: (key: K): TAttributes => {
			const selected = this.selected() === key;
			return {
				id: this.panelId(key),
				role: 'tabpanel',
				tabindex: 0,
				'aria-labelledby': this.itemId(key),
				hidden: HeadlessUtils.presence(!selected),
				'data-state': selected ? 'active' : 'inactive',
			};
		},
	};

	constructor(options: TTabsOptions<T, K>) {
		super('tabs', options, undefined, { orientation: 'horizontal', typeahead: false });
		this.activation = options.activation ?? 'automatic';
		this.selected = computed(() => {
			const value = this.value();
			return this.collection.isSelectable(value) ? value : this.collection.first();
		});
	}

	/** Id of a tab's panel. */
	panelId(key: K): string | undefined {
		const entry = this.collection.get(key);
		return entry === undefined ? undefined : `${this.id}-panel-${entry.index}`;
	}

	protected override handleKey(event: TKeyIntent): boolean {
		if (Signal.untracked(this.navigation.active) === undefined) this.navigation.setActive(Signal.untracked(this.selected));
		const active = Signal.untracked(this.navigation.active);
		if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) return active !== undefined && this.choose(active);
		if (!this.navigate(event)) return false;
		const moved = Signal.untracked(this.navigation.active);
		if (this.activation === 'automatic' && moved !== undefined) this.choose(moved);
		return true;
	}
}

export { Tabs };
