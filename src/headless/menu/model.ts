import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TDefaultKey } from '../collection/types';
import { KEYS } from '../declarations';
import { LayerStack } from '../layer/model';
import { ListControl } from '../list-control/model';
import { TAttributes, TKeyIntent } from '../types';
import { HeadlessUtils } from '../utils';
import { TMenuOptions } from './types';

/**
 * A button that opens a list of actions (the APG "menu button"). `value` is whether the menu is open; activating an
 * item calls `onAction` and records it in `lastAction`.
 * @example
 * const menu = new Menu({ items: ['copy', 'paste'], onAction: (key) => run(key) })
 * <button {...menu.parts.trigger()} onKeyDown={menu.keydown} onClick={menu.toggle} />
 * <ul {...menu.parts.menu()} onKeyDown={menu.keydown}>{keys.map((key) => <li {...menu.parts.item(key)} onClick={() => menu.activate(key)} />)}</ul>
 */
class Menu<T, K = TDefaultKey<T>> extends ListControl<T, K, boolean> {
	/** Id of the menu element. */
	readonly menuId: string;
	/** Closes after an item is activated. */
	readonly closeOnAction: boolean;
	/** Stack used to decide which overlay is on top. */
	readonly layers: LayerStack;
	/** `open` or `closed`. */
	readonly state: Computed<'open' | 'closed'>;
	/** True while this is the most recently opened overlay; only then do Escape and clicks outside close it. */
	readonly isTop: Computed<boolean>;
	/** The key of the last activated item. */
	readonly lastAction: Signal<K | undefined>;
	readonly #onAction: ((key: K, item: T) => void) | undefined;

	/** Opens with `'first'` (default) or `'last'` item highlighted. */
	readonly show = (highlight: 'first' | 'last' = 'first'): boolean =>
		this.act(() => {
			this.set(true);
			if (highlight === 'last') this.navigation.last();
			else this.navigation.first();
		});

	/** Closes and drops the highlight. */
	readonly hide = (): void => {
		this.set(false);
		this.navigation.clear();
	};

	/** Opens when closed, closes when open. */
	readonly toggle = (): boolean => (Signal.untracked(this.value) ? (this.hide(), true) : this.show());

	/**
	 * Runs an item: records it in `lastAction`, calls `onAction` and closes (unless `closeOnAction` is false). Ignores disabled items.
	 */
	readonly activate = (key: K): boolean => {
		const entry = Signal.untracked(() => this.collection.get(key));
		if (entry === undefined || entry.disabled) return false;
		return this.act(() => {
			this.lastAction.set(key);
			this.#onAction?.(key, entry.item);
			if (this.closeOnAction) this.hide();
		});
	};

	/** Call on a pointer down outside the trigger and the menu. Only closes when this menu is on top. */
	readonly interactOutside = (): boolean => {
		if (!Signal.untracked(this.isTop)) return false;
		this.hide();
		return true;
	};

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		trigger: (): TAttributes => ({
			id: this.id,
			'aria-haspopup': 'menu',
			'aria-expanded': HeadlessUtils.boolean(this.value()),
			'aria-controls': this.menuId,
			'aria-disabled': HeadlessUtils.ariaFlag(this.disabled()),
			'data-state': this.state(),
		}),
		menu: (): TAttributes => ({
			id: this.menuId,
			role: 'menu',
			tabindex: -1,
			'aria-labelledby': this.id,
			'aria-orientation': this.orientation === 'horizontal' ? 'horizontal' : 'vertical',
			'aria-activedescendant': this.itemId(this.navigation.active()),
			hidden: HeadlessUtils.presence(!this.value()),
			'data-state': this.state(),
		}),
		item: (key: K): TAttributes => {
			const entry = this.collection.get(key);
			return {
				id: this.itemId(key),
				role: 'menuitem',
				tabindex: -1,
				'aria-disabled': HeadlessUtils.ariaFlag(entry?.disabled ?? true),
				'data-highlighted': HeadlessUtils.presence(this.navigation.active() === key),
				'data-disabled': HeadlessUtils.presence(entry?.disabled ?? true),
			};
		},
	};

	constructor(options: TMenuOptions<T, K>) {
		super('menu', options, false, { orientation: 'vertical', typeahead: true });
		this.menuId = `${this.id}-menu`;
		this.closeOnAction = options.closeOnAction ?? true;
		this.layers = options.layers ?? LayerStack.shared;
		this.#onAction = options.onAction;
		this.lastAction = signal<K | undefined>(undefined);
		this.state = computed(() => (this.value() ? 'open' : 'closed'));
		this.isTop = computed(() => this.value() && this.layers.isTop(this.id));
		this.onDispose(this.layers.track(this.id, this.value));
	}

	protected override handleKey(event: TKeyIntent): boolean {
		if (!Signal.untracked(this.value)) {
			if (event.key === KEYS.ARROW_UP) return this.show('last');
			if (event.key === KEYS.ARROW_DOWN || event.key === KEYS.ENTER || event.key === KEYS.SPACE) return this.show('first');
			return false;
		}
		const active = Signal.untracked(this.navigation.active);
		switch (event.key) {
			case KEYS.ESCAPE:
				this.hide();
				return true;
			case KEYS.TAB:
				this.hide();
				return false;
			case KEYS.ENTER:
			case KEYS.SPACE:
				if (active !== undefined) this.activate(active);
				return true;
		}
		return this.navigate(event);
	}
}

export { Menu };
