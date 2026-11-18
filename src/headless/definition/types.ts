import { TMaskDefinition } from '@ts/mask/types';

/** A number inside a range — rendered as a `Slider`. */
type TRangeDefinition = {
	/** Discriminant. */
	readonly kind: 'range';
	/** Text shown next to the control. */
	readonly label?: string;
	/** Value when nothing was assigned; must fit the range. */
	readonly default: number;
	/** Smallest value. */
	readonly min: number;
	/** Largest value. */
	readonly max: number;
	/** Values snap to `min + n * step`. */
	readonly step?: number;
};

/** On or off — rendered as a `Switch` (default) or a `Checkbox`. */
type TToggleDefinition = {
	/** Discriminant. */
	readonly kind: 'toggle';
	/** Text shown next to the control. */
	readonly label?: string;
	/** Value when nothing was assigned. */
	readonly default: boolean;
	/** Which control `Form` creates. Default `switch`. */
	readonly control?: 'switch' | 'checkbox';
};

/** One option of a fixed list — rendered as a `Select` (default) or a `RadioGroup`. */
type TChoiceDefinition<Option extends string = string> = {
	/** Discriminant. */
	readonly kind: 'choice';
	/** Text shown next to the control. */
	readonly label?: string;
	/** Value when nothing was assigned; must be one of `options`. */
	readonly default: Option;
	/** The accepted values, in display order. */
	readonly options: readonly Option[];
	/** Text per option; the option itself is shown when missing. */
	readonly optionLabels?: Readonly<Partial<Record<Option, string>>>;
	/** Which control `Form` creates. Default `select`. */
	readonly control?: 'select' | 'radio';
};

/** Free text, optionally masked — rendered as a `TextField`. */
type TTextDefinition = {
	/** Discriminant. */
	readonly kind: 'text';
	/** Text shown next to the control. */
	readonly label?: string;
	/** Value when nothing was assigned. */
	readonly default: string;
	/** Mask pattern, preset id or definition (see `Mask`). */
	readonly mask?: string | TMaskDefinition;
	/** Longer text is cut. */
	readonly maxLength?: number;
	/** Empty text is an error. */
	readonly required?: boolean;
};

/**
 * Description of one setting or field, by `kind`. Plain data: it can come from JSON and build a screen at runtime.
 */
type TControlDefinition = TRangeDefinition | TToggleDefinition | TChoiceDefinition | TTextDefinition;

/** Definitions by id — the shape of a form or of a style's adjustments. */
type TControlDefinitions = Readonly<Record<string, TControlDefinition>>;

/** Value type of a definition: number, boolean, one of the options, or string. */
type TControlValue<Definition extends TControlDefinition> = Definition extends TRangeDefinition
	? number
	: Definition extends TToggleDefinition
		? boolean
		: Definition extends { readonly options: readonly (infer Option)[] }
			? Option
			: Definition extends TTextDefinition
				? string
				: never;

/** One value per definition id. */
type TControlValues<Definitions extends TControlDefinitions> = {
	readonly [Id in keyof Definitions]: TControlValue<Definitions[Id]>;
};

/** Some of the values; the rest stays as it is (or at the default). */
type TControlAssignment<Definitions extends TControlDefinitions> = Partial<TControlValues<Definitions>>;

/** Why a value or default was refused — returned instead of thrown. */
type TDefinitionIssue = {
	/** `undeclared`: unknown id. `invalid`: the value does not fit the definition. */
	readonly reason: 'undeclared' | 'invalid';
	/** Id of the definition. */
	readonly id: string;
	/** The refused value. */
	readonly value: unknown;
	/** The definition it was checked against. */
	readonly definition?: TControlDefinition;
	/** Ids that exist, for an undeclared one. */
	readonly declared?: readonly string[];
};

export type {
	TRangeDefinition,
	TToggleDefinition,
	TChoiceDefinition,
	TTextDefinition,
	TControlDefinition,
	TControlDefinitions,
	TControlValue,
	TControlValues,
	TControlAssignment,
	TDefinitionIssue,
};
