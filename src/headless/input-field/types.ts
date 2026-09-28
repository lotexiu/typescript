import { Computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { Toggle } from '@tsr/toggle/model';

type TInputFieldConfig<T> = {
	initial?: T;
	/** This lib's `Mask` pattern syntax (e.g. `"000.000.000-00"`). Omit for an unmasked field. */
	mask?: string;
	/** Unmasked raw text -> domain value. Defaults to identity (only valid when `T` is `string`). */
	parse?: (raw: string) => T;
	/** Domain value -> unmasked raw text, used by `setValue`. Defaults to `String(value)`. */
	format?: (value: T) => string;
	disabled?: boolean;
	/** Debounce (ms) before `settledValue` catches up to `value`. Default `0`. */
	debounce?: TReactive<number> | number;
};

type TInputField<T> = {
	/** What the real `<input>` should show — feed every keystroke's current text into `setText`. */
	display: Signal<string>;
	/** `display` with the mask's literal characters stripped back out. */
	raw: Computed<string>;
	/** `raw` parsed into the domain type — updates on every keystroke. */
	value: Computed<T>;
	/** `value`, settled after `debounce`. */
	settledValue: Computed<T>;
	disabled: Signal<boolean>;
	/** Shared by any field that wants a show/hide toggle (passwords); unused fields just never read it. */
	showPassword: Toggle;
	/** Called by the UI binding on every input event with the field's current text; re-applies the mask. */
	setText(next: string): void;
	/** Sets the domain value programmatically (e.g. pre-filling a form) and reformats `display` to match. */
	setValue(next: T): void;
};

export type { TInputFieldConfig, TInputField };
