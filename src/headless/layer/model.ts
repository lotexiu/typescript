import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TValueUnsubscribe } from '@ts/subscription/types';

/**
 * Order in which overlays (dialogs, menus, popovers, open selects) were opened. Only the topmost one reacts to
 * Escape or to a click outside, so closing a menu inside a dialog never closes the dialog too.
 * Controls register themselves in `LayerStack.shared` unless given another stack.
 */
class LayerStack {
	/** The stack every overlay uses by default. */
	static readonly shared = new LayerStack();

	readonly #layers: Signal<readonly string[]> = signal<readonly string[]>([]);
	/** Ids of the open layers, oldest first. */
	readonly layers: Computed<readonly string[]> = computed(() => this.#layers());
	/** Id of the most recently opened layer, if any. */
	readonly top: Computed<string | undefined> = computed(() => this.#layers().at(-1));

	/** Puts `id` on top (moving it if already there). */
	push(id: string): void {
		this.#layers.set([...Signal.untracked(this.#layers).filter((layer) => layer !== id), id]);
	}

	/** Takes `id` out of the stack. */
	remove(id: string): void {
		const layers = Signal.untracked(this.#layers);
		if (layers.includes(id)) this.#layers.set(layers.filter((layer) => layer !== id));
	}

	/** Whether `id` is the topmost layer. Reactive. */
	isTop(id: string): boolean {
		return this.top() === id;
	}

	/** Keeps `id` in the stack while `open` is true. Returns the function that stops tracking (and removes it). */
	track(id: string, open: TReactive<boolean>): TValueUnsubscribe {
		const sync = (isOpen: boolean) => (isOpen ? this.push(id) : this.remove(id));
		sync(Signal.untracked(open));
		const unsubscribe = open.subscribe(sync);
		return () => {
			unsubscribe();
			this.remove(id);
		};
	}
}

export { LayerStack };
