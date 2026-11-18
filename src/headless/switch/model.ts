import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { Control } from '../control/model';
import { TControlOptions } from '../control/types';
import { KEYS } from '../declarations';
import { TAttributes, TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';

/**
 * An on/off switch. Space and Enter toggle.
 *
 * Anatomy: `parts.root()` on the track (`role="switch"`), `parts.thumb()` on the moving knob.
 */
class Switch extends Control<boolean> {
	/** `on` or `off`. */
	readonly state: Computed<'on' | 'off'>;

	/** Flips the switch. */
	readonly toggle = (): boolean => this.act(() => this.set(!Signal.untracked(this.value)));
	/** Turns the switch on. */
	readonly turnOn = (): boolean => this.act(() => this.set(true));
	/** Turns the switch off. */
	readonly turnOff = (): boolean => this.act(() => this.set(false));

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		root: (): TAttributes => ({
			id: this.id,
			role: 'switch',
			tabindex: this.disabled() ? -1 : 0,
			'aria-checked': HeadlessUtils.boolean(this.value()),
			'aria-disabled': HeadlessUtils.ariaFlag(this.disabled()),
			'aria-readonly': HeadlessUtils.ariaFlag(this.readOnly()),
			'data-state': this.state(),
			'data-disabled': HeadlessUtils.presence(this.disabled()),
		}),
		thumb: (): TAttributes => ({
			'data-state': this.state(),
		}),
	};

	constructor(options: TControlOptions<boolean> = {}) {
		super('switch', options, false);
		this.state = computed(() => (this.value() ? 'on' : 'off'));
	}

	protected override handleKey(event: TKeyIntent): boolean {
		if (event.key !== KEYS.SPACE && event.key !== KEYS.ENTER) return false;
		return this.toggle();
	}
}

export { Switch };
