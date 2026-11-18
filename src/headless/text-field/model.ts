import { MaskFormatter } from '@ts/mask/formatter/model';
import { Mask } from '@ts/mask/model';
import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { Control } from '../control/model';
import { TAttributes } from '../types';
import { HeadlessUtils } from '../utils';
import { TEXT_FIELD_ERRORS } from './declarations';
import { TTextFieldOptions, TTextInputResult, TTextValidator } from './types';

/**
 * A text input with optional mask, validation and touched/focused state. Errors are codes, never messages.
 *
 * Wire the input's change event to `input(text, caret)` and put back the returned text and caret; call `focus`/`blur` on the
 * matching events. `showError` turns true only after the user left the field.
 *
 * Anatomy: `parts.label()`, `parts.input()`, `parts.error()`.
 * @example
 * const phone = new TextField({ mask: '(00) 00000-0000', required: true })
 * const { text, caret } = phone.input('11987', 5) // text "(11) 987"
 */
class TextField<T = string> extends Control<string> {
	/** The mask in use, if any. */
	readonly formatter: MaskFormatter<T> | undefined;
	/** Whether empty text is an error. */
	readonly required: TReactive<boolean>;
	/** Maximum length, if any. */
	readonly maxLength: number | undefined;
	/** Id of the label element. */
	readonly labelId: string;
	/** Id of the error message element. */
	readonly errorId: string;
	/** The text without the mask's literals (what the user typed). */
	readonly unmasked: Computed<string>;
	/** The value the mask's codec reads from the text (a number, a date...); the text itself without a mask. */
	readonly typed: Computed<T | undefined>;
	/** First error code, or `undefined` when valid. */
	readonly error: Computed<string | undefined>;
	/** There is an error. */
	readonly invalid: Computed<boolean>;
	/** The user left the field at least once. */
	readonly touched: Signal<boolean>;
	/** The field has focus. */
	readonly focused: Signal<boolean>;
	/** Touched and invalid: time to show the error. */
	readonly showError: Computed<boolean>;
	readonly #validators: readonly TTextValidator[];

	/** Call when the input gains focus. */
	readonly focus = (): void => {
		this.focused.set(true);
	};

	/** Call when the input loses focus; marks the field as touched. */
	readonly blur = (): void => {
		Signal.batch(() => {
			this.focused.set(false);
			this.touched.set(true);
		});
	};

	/**
	 * Call on every change with the input's text and caret. Formats, stores and returns the text and caret to put back.
	 */
	readonly input = (text: string, caret: number = text.length): TTextInputResult => {
		const current = Signal.untracked(this.value);
		if (!Signal.untracked(this.interactive)) return { text: current, caret: Math.min(caret, current.length) };
		this.set(text);
		const next = Signal.untracked(this.value);
		const nextCaret = this.formatter === undefined ? Math.min(caret, next.length) : this.formatter.caret(text, caret, next);
		return { text: next, caret: nextCaret };
	};

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		label: (): TAttributes => ({
			id: this.labelId,
			for: this.id,
		}),
		input: (): TAttributes => ({
			id: this.id,
			maxlength: this.formatter === undefined ? this.maxLength : undefined,
			disabled: HeadlessUtils.presence(this.disabled()),
			readonly: HeadlessUtils.presence(this.readOnly()),
			required: HeadlessUtils.presence(this.required()),
			'aria-invalid': HeadlessUtils.ariaFlag(this.showError()),
			'aria-describedby': this.showError() ? this.errorId : undefined,
			'data-invalid': HeadlessUtils.presence(this.showError()),
			'data-focused': HeadlessUtils.presence(this.focused()),
			'data-disabled': HeadlessUtils.presence(this.disabled()),
		}),
		error: (): TAttributes => ({
			id: this.errorId,
			'aria-live': 'polite',
			hidden: HeadlessUtils.presence(!this.showError()),
		}),
	};

	constructor(options: TTextFieldOptions<T> = {}) {
		const formatter = TextField.#formatter(options.mask);
		const value = typeof options.value === 'string' && formatter !== undefined ? formatter.apply(options.value) : options.value;
		super('text-field', { ...options, value }, '');
		this.formatter = formatter;
		this.required = HeadlessUtils.reactive(options.required ?? false);
		this.maxLength = options.maxLength;
		this.#validators = options.validators ?? [];
		this.labelId = `${this.id}-label`;
		this.errorId = `${this.id}-error`;
		this.touched = signal(false);
		this.focused = signal(false);
		this.unmasked = computed(() => (this.formatter === undefined ? this.value() : this.formatter.unapply(this.value())));
		this.typed = computed(() => (this.formatter === undefined ? (this.value() as unknown as T) : this.formatter.parse(this.value()).typed));
		this.error = computed(() => this.#findError(this.value(), this.unmasked()));
		this.invalid = computed(() => this.error() !== undefined);
		this.showError = computed(() => this.touched() && this.invalid());
	}

	/** Goes back to the initial text and forgets that the field was touched. */
	override reset(): void {
		Signal.batch(() => {
			super.reset();
			this.touched.set(false);
		});
	}

	protected override normalize(next: string, current: string): string {
		if (typeof next !== 'string') return current;
		const formatted = this.formatter === undefined ? next : this.formatter.apply(next);
		return this.maxLength === undefined ? formatted : formatted.slice(0, this.maxLength);
	}

	#findError(value: string, unmasked: string): string | undefined {
		if (unmasked === '') return this.required() ? TEXT_FIELD_ERRORS.REQUIRED : undefined;
		if (this.maxLength !== undefined && value.length > this.maxLength) return TEXT_FIELD_ERRORS.TOO_LONG;
		if (this.formatter !== undefined) {
			const check = this.formatter.check(value);
			if (!check.ok) return check.reason;
		}
		for (const validator of this.#validators) {
			const error = validator(value, unmasked);
			if (error !== undefined) return error;
		}
		return undefined;
	}

	static #formatter<T>(mask: TTextFieldOptions<T>['mask']): MaskFormatter<T> | undefined {
		if (mask === undefined) return undefined;
		if (mask instanceof MaskFormatter) return mask;
		return Mask.of<T>(mask);
	}
}

export { TextField };
