import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TKeyIntent, TWritable } from '../types';
import { HeadlessUtils } from '../utils';
import { TControlOptions, TControlReducer } from './types';

/**
 * Base of every headless control: a value plus the rules to change it, with no DOM, CSS or framework.
 *
 * Two ways to change the value: `set()` is a programmatic write and always goes through (normalized and reduced);
 * the user intents (`toggle`, `increment`, `choose`, `keydown`, pointer handlers...) respect `disabled` and `readOnly`.
 * Handlers are arrow properties, so they can be passed around unbound (`onKeyDown={control.keydown}`).
 */
abstract class Control<V> {
	/** Base id of the control's parts. */
	readonly id: string;
	/** The state. Read it reactively (`control.value()`); it is the external writable when one was passed. */
	readonly value: TWritable<V>;
	/** Value when the control was created; `reset()` goes back to it and `dirty` compares against it. */
	readonly initial: V;
	/** Whether the control is disabled. */
	readonly disabled: TReactive<boolean>;
	/** Whether the control is read-only. */
	readonly readOnly: TReactive<boolean>;
	/** Neither disabled nor read-only: user intents are accepted. */
	readonly interactive: Computed<boolean>;
	/** The value differs from `initial`. */
	readonly dirty: Computed<boolean>;
	readonly #reducer: TControlReducer<V> | undefined;
	readonly #cleanups: (() => void)[] = [];

	/**
	 * Keyboard handler. Ignores events already handled by an inner control; calls `preventDefault` and returns `true` when it handled the key.
	 */
	readonly keydown = (event: TKeyIntent): boolean => {
		if (event.defaultPrevented || !Signal.untracked(this.interactive)) return false;
		const handled = this.handleKey(event);
		if (handled) event.preventDefault?.();
		return handled;
	};

	constructor(prefix: string, options: TControlOptions<V>, fallback: V) {
		this.id = options.id ?? HeadlessUtils.id(prefix);
		this.value = HeadlessUtils.writable(options.value, fallback);
		this.initial = Signal.untracked(this.value);
		this.disabled = HeadlessUtils.reactive(options.disabled ?? false);
		this.readOnly = HeadlessUtils.reactive(options.readOnly ?? false);
		this.#reducer = options.reducer;
		this.interactive = computed(() => !this.disabled() && !this.readOnly());
		this.dirty = computed(() => !this.equals(this.value(), this.initial));
	}

	/** Writes a value programmatically (normalized, then passed to the reducer). Returns whether it changed. */
	set(next: V): boolean {
		const current = Signal.untracked(this.value);
		const normalized = this.normalize(next, current);
		const reduced = this.#reducer === undefined ? normalized : this.#reducer(normalized, current);
		if (this.equals(reduced, current)) return false;
		this.value.set(reduced);
		return true;
	}

	/** Goes back to `initial`. */
	reset(): void {
		this.set(this.initial);
	}

	/**
	 * Releases subscriptions the control holds (layer tracking, value syncing). Call when the control is thrown away.
	 */
	dispose(): void {
		this.#cleanups.splice(0).forEach((cleanup) => cleanup());
	}

	protected onDispose(cleanup: () => void): void {
		this.#cleanups.push(cleanup);
	}

	protected normalize(next: V, _current: V): V {
		return next;
	}

	protected equals(left: V, right: V): boolean {
		return Object.is(left, right);
	}

	protected handleKey(_event: TKeyIntent): boolean {
		return false;
	}

	protected act(change: () => unknown): boolean {
		if (!Signal.untracked(this.interactive)) return false;
		change();
		return true;
	}
}

export { Control };
