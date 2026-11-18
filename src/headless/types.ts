import { TReactive } from '@tsr-node/types';

/**
 * A plain value or a reactive one (`signal`, `computed`). Options typed with it follow the reactive version live.
 */
type TMaybeReactive<T> = T | TReactive<T>;

/**
 * Anything that can be read reactively and written with `set`: a `signal`, a `field`, a `writable`. Passing one as a control `value` makes the control use it as its state (controlled mode).
 */
type TWritable<T> = TReactive<T> & {
	/** Replaces the value. */
	set(value: T): unknown;
};

/**
 * The part of a keyboard event the headless controls read. A DOM `KeyboardEvent` or a React keyboard event fits as is.
 */
type TKeyIntent = {
	/** The `KeyboardEvent.key` value (`'ArrowDown'`, `' '`, `'a'`...). */
	readonly key: string;
	/** Shift was held. */
	readonly shiftKey?: boolean;
	/** Control was held. */
	readonly ctrlKey?: boolean;
	/** Alt/Option was held. */
	readonly altKey?: boolean;
	/** Meta/Command was held. */
	readonly metaKey?: boolean;
	/** An inner control already handled this event; outer controls then ignore it. */
	readonly defaultPrevented?: boolean;
	/** Called by a control when it handled the key. */
	preventDefault?(): void;
};

/** A value in a part's attributes; `undefined` means "leave the attribute out". */
type TAttributeValue = string | number | undefined;

/**
 * Plain HTML attributes for one part of a control (`role`, `aria-*`, `data-*`, `id`, `tabindex`, `hidden`), named as in HTML. Adapters rename what their framework spells differently.
 */
type TAttributes = Readonly<Record<string, TAttributeValue>>;

/** Layout axis of a control; it decides which arrow keys move it. */
type TOrientation = 'horizontal' | 'vertical';

/** Reading direction; `rtl` swaps the meaning of the left and right arrows. */
type TTextDirection = 'ltr' | 'rtl';

export type { TMaybeReactive, TWritable, TKeyIntent, TAttributeValue, TAttributes, TOrientation, TTextDirection };
