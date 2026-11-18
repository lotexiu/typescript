import { Checkbox } from '../checkbox/model';
import { TChoiceDefinition, TControlAssignment, TControlDefinitions, TControlValues, TRangeDefinition, TTextDefinition, TToggleDefinition } from '../definition/types';
import { RadioGroup } from '../radio-group/model';
import { Select } from '../select/model';
import { Slider } from '../slider/model';
import { Switch } from '../switch/model';
import { TextField } from '../text-field/model';
import { TMaybeReactive, TWritable } from '../types';

/** Headless control type `Form` creates for a definition. */
type TControlFor<Definition> = Definition extends TRangeDefinition
	? Slider
	: Definition extends TToggleDefinition
		? Definition extends { readonly control: 'checkbox' }
			? Checkbox
			: Switch
		: Definition extends TChoiceDefinition<infer Option>
			? Definition extends { readonly control: 'radio' }
				? RadioGroup<Option, Option>
				: Select<Option, Option>
			: Definition extends TTextDefinition
				? TextField
				: never;

/** The controls of a form, by id. */
type TFormControls<Definitions extends TControlDefinitions> = {
	readonly [Id in keyof Definitions]: TControlFor<Definitions[Id]>;
};

/** Id, definition and control of one form entry. */
type TFormField<Definitions extends TControlDefinitions> = {
	readonly [Id in keyof Definitions & string]: {
		readonly id: Id;
		readonly definition: Definitions[Id];
		readonly control: TControlFor<Definitions[Id]>;
	};
}[keyof Definitions & string];

/** Options of a `Form`. */
type TFormOptions<Definitions extends TControlDefinitions> = {
	/** What to build. */
	readonly definitions: Definitions;
	/** Initial values (checked against the definitions), or a writable holding every value. */
	readonly values?: TControlAssignment<Definitions> | TWritable<TControlValues<Definitions>>;
	/** Base id of the controls. */
	readonly id?: string;
	/** Disables every control. */
	readonly disabled?: TMaybeReactive<boolean>;
};

export type { TControlFor, TFormControls, TFormField, TFormOptions };
