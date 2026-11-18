import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { Control } from '../control/model';
import { TControlOptions } from '../control/types';
import { KEYS } from '../declarations';
import { TAttributes, TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';

/**
 * Shows and hides a piece of content (accordion section, "more details"). `value` is whether it is open.
 *
 * Anatomy: `parts.trigger()` on the button, `parts.content()` on the content.
 */
class Disclosure extends Control<boolean> {
	/** Id of the content element. */
	readonly contentId: string;
	/** `open` or `closed`. */
	readonly state: Computed<'open' | 'closed'>;

	/** Opens. */
	readonly show = (): boolean => this.act(() => this.set(true));
	/** Closes. */
	readonly hide = (): boolean => this.act(() => this.set(false));
	/** Opens when closed, closes when open. */
	readonly toggle = (): boolean => this.act(() => this.set(!Signal.untracked(this.value)));

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		trigger: (): TAttributes => ({
			id: this.id,
			'aria-expanded': HeadlessUtils.boolean(this.value()),
			'aria-controls': this.contentId,
			'aria-disabled': HeadlessUtils.ariaFlag(this.disabled()),
			'data-state': this.state(),
			'data-disabled': HeadlessUtils.presence(this.disabled()),
		}),
		content: (): TAttributes => ({
			id: this.contentId,
			hidden: HeadlessUtils.presence(!this.value()),
			'data-state': this.state(),
		}),
	};

	constructor(options: TControlOptions<boolean> = {}) {
		super('disclosure', options, false);
		this.contentId = `${this.id}-content`;
		this.state = computed(() => (this.value() ? 'open' : 'closed'));
	}

	protected override handleKey(event: TKeyIntent): boolean {
		if (event.key === KEYS.ESCAPE && Signal.untracked(this.value)) return this.hide();
		if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) return this.toggle();
		return false;
	}
}

export { Disclosure };
