import { MaskFormatter } from '@ts/mask/formatter/model';
import { TMaskDefinition } from '@ts/mask/types';
import { TControlOptions } from '../control/types';
import { TMaybeReactive } from '../types';

/**
 * Checks a text and returns an error code, or `undefined` when valid. Receives the text as shown and without the mask.
 */
type TTextValidator = (value: string, unmasked: string) => string | undefined;

/** Options of a `TextField`. */
type TTextFieldOptions<T> = TControlOptions<string> & {
	/**
	 * Formats the text while typing: a pattern (`'(00) 0000-0000'`), a preset id, a mask definition or a ready `MaskFormatter`.
	 */
	readonly mask?: string | TMaskDefinition | MaskFormatter<T>;
	/** Empty text is an error (`required`). */
	readonly required?: TMaybeReactive<boolean>;
	/** Cuts longer text. */
	readonly maxLength?: number;
	/** Extra checks, run after the built-in ones; the first error wins. */
	readonly validators?: readonly TTextValidator[];
};

/** What `input()` returns: the text to put back in the input and where to place the caret. */
type TTextInputResult = {
	/** Formatted text. */
	readonly text: string;
	/** Caret position in the formatted text. */
	readonly caret: number;
};

export type { TTextValidator, TTextFieldOptions, TTextInputResult };
