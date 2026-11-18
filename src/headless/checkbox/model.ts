import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { Control } from '../control/model';
import { KEYS } from '../declarations';
import { TAttributes, TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';
import { TCheckboxOptions, TCheckboxState, TCheckedState } from './types';

/**
 * A tri-state checkbox (checked, unchecked, mixed). Space toggles; from mixed it goes to checked.
 *
 * Anatomy: `parts.root()` on the clickable box (`role="checkbox"`).
 * @example
 * const terms = new Checkbox()
 * <div {...terms.parts.root()} onClick={terms.toggle} onKeyDown={terms.keydown} />
 */
class Checkbox extends Control<TCheckedState> {
	/** The value is exactly `true`. */
	readonly checked: Computed<boolean>;
	/** The value is `'mixed'`. */
	readonly indeterminate: Computed<boolean>;
	/** `checked`, `unchecked` or `indeterminate`. */
	readonly state: Computed<TCheckboxState>;
	/** Whether the box is required. */
	readonly required: TReactive<boolean>;

	/** Checks when unchecked or mixed, unchecks when checked. */
	readonly toggle = (): boolean => this.act(() => this.set(Signal.untracked(this.value) !== true));
	/** Checks the box. */
	readonly check = (): boolean => this.act(() => this.set(true));
	/** Unchecks the box. */
	readonly uncheck = (): boolean => this.act(() => this.set(false));

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		root: (): TAttributes => ({
			id: this.id,
			role: 'checkbox',
			tabindex: this.disabled() ? -1 : 0,
			'aria-checked': this.indeterminate() ? 'mixed' : HeadlessUtils.boolean(this.checked()),
			'aria-disabled': HeadlessUtils.ariaFlag(this.disabled()),
			'aria-readonly': HeadlessUtils.ariaFlag(this.readOnly()),
			'aria-required': HeadlessUtils.ariaFlag(this.required()),
			'data-state': this.state(),
			'data-disabled': HeadlessUtils.presence(this.disabled()),
		}),
	};

	constructor(options: TCheckboxOptions = {}) {
		super('checkbox', options, false);
		this.required = HeadlessUtils.reactive(options.required ?? false);
		this.checked = computed(() => this.value() === true);
		this.indeterminate = computed(() => this.value() === 'mixed');
		this.state = computed(() => (this.indeterminate() ? 'indeterminate' : this.checked() ? 'checked' : 'unchecked'));
	}

	protected override handleKey(event: TKeyIntent): boolean {
		if (event.key !== KEYS.SPACE) return false;
		return this.toggle();
	}
}

export { Checkbox };
