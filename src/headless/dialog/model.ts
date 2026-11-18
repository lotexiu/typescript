import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { Control } from '../control/model';
import { KEYS } from '../declarations';
import { LayerStack } from '../layer/model';
import { TAttributes, TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';
import { TDialogOptions, TDismissReason } from './types';

/**
 * A window over the page: open state, which overlay is on top, Escape and click-outside rules, and the ids that tie
 * trigger, title, description and content together. Moving focus into it and trapping Tab are the adapter's job.
 * @example
 * const confirm = new Dialog({ role: 'alertdialog' })
 * confirm.show()
 * confirm.parts.content() // { role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': '<id>-title', ... }
 */
class Dialog extends Control<boolean> {
	/** Blocks the rest of the page. */
	readonly modal: boolean;
	/** `dialog` or `alertdialog`. */
	readonly role: 'dialog' | 'alertdialog';
	/** Escape closes it. */
	readonly closeOnEscape: boolean;
	/** A click outside closes it. */
	readonly closeOnOutside: boolean;
	/** Stack used to decide which overlay is on top. */
	readonly layers: LayerStack;
	/** Id of the content element. */
	readonly contentId: string;
	/** Id of the title element (`aria-labelledby`). */
	readonly titleId: string;
	/** Id of the description element (`aria-describedby`). */
	readonly descriptionId: string;
	/** `open` or `closed`. */
	readonly state: Computed<'open' | 'closed'>;
	/** True while this is the most recently opened overlay. */
	readonly isTop: Computed<boolean>;
	/** Why it was last closed by the user (`undefined` after a programmatic `hide`). */
	readonly lastDismiss: Signal<TDismissReason | undefined>;

	/** Opens. */
	readonly show = (): boolean => this.act(() => this.set(true));
	/** Closes, regardless of `closeOnEscape`/`closeOnOutside`. */
	readonly hide = (): void => {
		this.set(false);
	};
	/** Opens when closed, closes when open. */
	readonly toggle = (): boolean => (Signal.untracked(this.value) ? (this.hide(), true) : this.show());

	/** Closes because of the user, following `closeOnEscape`/`closeOnOutside` and only when on top. */
	readonly dismiss = (reason: TDismissReason): boolean => {
		if (!Signal.untracked(this.value) || !Signal.untracked(this.isTop)) return false;
		if (reason === 'escape' && !this.closeOnEscape) return false;
		if (reason === 'outside' && !this.closeOnOutside) return false;
		Signal.batch(() => {
			this.lastDismiss.set(reason);
			this.set(false);
		});
		return true;
	};

	/** Call on a pointer down outside the content (and outside the trigger). */
	readonly interactOutside = (): boolean => this.dismiss('outside');

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		trigger: (): TAttributes => ({
			'aria-haspopup': this.popupKind(),
			'aria-expanded': HeadlessUtils.boolean(this.value()),
			'aria-controls': this.contentId,
			'data-state': this.state(),
		}),
		backdrop: (): TAttributes => ({
			hidden: HeadlessUtils.presence(!this.value()),
			'data-state': this.state(),
		}),
		content: (): TAttributes => ({
			id: this.contentId,
			role: this.role,
			tabindex: -1,
			'aria-modal': HeadlessUtils.ariaFlag(this.modal),
			'aria-labelledby': this.titleId,
			'aria-describedby': this.descriptionId,
			hidden: HeadlessUtils.presence(!this.value()),
			'data-state': this.state(),
			'data-top': HeadlessUtils.presence(this.isTop()),
			...this.contentAttributes(),
		}),
		title: (): TAttributes => ({ id: this.titleId }),
		description: (): TAttributes => ({ id: this.descriptionId }),
	};

	constructor(options: TDialogOptions = {}) {
		super('dialog', options, false);
		this.modal = options.modal ?? true;
		this.role = options.role ?? 'dialog';
		this.closeOnEscape = options.closeOnEscape ?? true;
		this.closeOnOutside = options.closeOnOutside ?? !this.modal;
		this.layers = options.layers ?? LayerStack.shared;
		this.contentId = `${this.id}-content`;
		this.titleId = `${this.id}-title`;
		this.descriptionId = `${this.id}-description`;
		this.lastDismiss = signal<TDismissReason | undefined>(undefined);
		this.state = computed(() => (this.value() ? 'open' : 'closed'));
		this.isTop = computed(() => this.value() && this.layers.isTop(this.id));
		this.onDispose(this.layers.track(this.id, this.value));
	}

	protected popupKind(): string {
		return 'dialog';
	}

	protected contentAttributes(): TAttributes {
		return {};
	}

	protected override handleKey(event: TKeyIntent): boolean {
		return event.key === KEYS.ESCAPE && this.dismiss('escape');
	}
}

export { Dialog };
