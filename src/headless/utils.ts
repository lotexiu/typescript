import { signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { PRINTABLE_KEY_LENGTH } from './declarations';
import { TKeyIntent, TMaybeReactive, TWritable } from './types';

/**
 * Small helpers shared by the headless controls: lifting plain values into signals, ids and ARIA value formatting.
 */
class HeadlessUtils {
	static #sequence = 0;

	/** True for a `signal`, `computed` or anything with the same reactive shape. */
	static isReactive<T>(value: unknown): value is TReactive<T> {
		return typeof value === 'function' && typeof (value as TReactive<T>).version === 'function' && typeof (value as TReactive<T>).subscribe === 'function';
	}

	/** True for a reactive value that can also be `set`. */
	static isWritable<T>(value: unknown): value is TWritable<T> {
		return HeadlessUtils.isReactive(value) && typeof (value as TWritable<T>).set === 'function';
	}

	/** Returns `value` itself when it is reactive, otherwise a new signal holding it. */
	static reactive<T>(value: TMaybeReactive<T>): TReactive<T> {
		return HeadlessUtils.isReactive<T>(value) ? value : signal(value as T);
	}

	/**
	 * Returns `value` itself when it is writable (controlled), otherwise a new signal holding `value ?? fallback`.
	 */
	static writable<T>(value: T | TWritable<T> | undefined, fallback: T): TWritable<T> {
		if (HeadlessUtils.isWritable<T>(value)) return value;
		return signal<T>(value === undefined ? fallback : (value as T));
	}

	/**
	 * A unique id for this page, `prefix-<number>`. Pass your own `id` to a control when rendering on a server.
	 */
	static id(prefix: string): string {
		HeadlessUtils.#sequence += 1;
		return `${prefix}-${HeadlessUtils.#sequence}`;
	}

	/** `'true'`/`'false'`, for ARIA attributes that must always be present (`aria-checked`, `aria-expanded`). */
	static boolean(value: boolean): 'true' | 'false' {
		return value ? 'true' : 'false';
	}

	/**
	 * `''` when true and `undefined` when false, for boolean attributes and `data-*` flags (`hidden`, `data-disabled`).
	 */
	static presence(value: boolean): '' | undefined {
		return value ? '' : undefined;
	}

	/**
	 * `'true'` when true and `undefined` when false, for ARIA attributes that are simply absent when off (`aria-disabled`).
	 */
	static ariaFlag(value: boolean): 'true' | undefined {
		return value ? 'true' : undefined;
	}

	/** True for a single character typed without Control, Meta or Alt — what typeahead reacts to. */
	static isPrintable(event: TKeyIntent): boolean {
		return event.key.length === PRINTABLE_KEY_LENGTH && !event.ctrlKey && !event.metaKey && !event.altKey;
	}
}

export { HeadlessUtils };
