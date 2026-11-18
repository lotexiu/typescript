import { writable } from '@ts/composables/writable/model';
import { LocaleError } from '@ts/locale/error';
import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { Checkbox } from '../checkbox/model';
import { TCheckedState } from '../checkbox/types';
import { Control } from '../control/model';
import { DEFINITION_LOCALES } from '../definition/declarations';
import { TControlAssignment, TControlDefinition, TControlDefinitions, TControlValues, TDefinitionIssue } from '../definition/types';
import { DefinitionUtils } from '../definition/utils';
import { RadioGroup } from '../radio-group/model';
import { Select } from '../select/model';
import { Slider } from '../slider/model';
import { Switch } from '../switch/model';
import { TextField } from '../text-field/model';
import { TWritable } from '../types';
import { HeadlessUtils } from '../utils';
import { TFormControls, TFormField, TFormOptions } from './types';

/**
 * Builds one headless control per definition, all bound to a single record of values — a screen assembled from data.
 * Each `kind` gets its control (`range` → `Slider`, `toggle` → `Switch`/`Checkbox`, `choice` → `Select`/`RadioGroup`, `text` → `TextField`),
 * typed per id. The values can live outside (`values: writable(read, write)`), e.g. a theme's adjustments.
 * @example
 * const form = new Form({ definitions: { volume: { kind: 'range', default: 5, min: 0, max: 10 }, mute: { kind: 'toggle', default: false } } })
 * form.controls.volume.increment()
 * form.values() // { volume: 6, mute: false }
 */
class Form<Definitions extends TControlDefinitions> {
	/** Base id; each control gets `<form id>-<definition id>`. */
	readonly id: string;
	/** The definitions the form was built from. */
	readonly definitions: Definitions;
	/** Every value by id. */
	readonly values: TWritable<TControlValues<Definitions>>;
	/** Disables every control. */
	readonly disabled: TReactive<boolean>;
	/** The control of each definition, by id. */
	readonly controls: TFormControls<Definitions>;
	/** Id, definition and control of each definition, in declaration order — iterate it to render the form. */
	readonly fields: readonly TFormField<Definitions>[];
	/** Some control differs from its initial value. */
	readonly dirty: Computed<boolean>;
	/** Some text control has an error. */
	readonly invalid: Computed<boolean>;

	constructor(options: TFormOptions<Definitions>) {
		Form.#throwIfIssue(DefinitionUtils.invalidDefault(options.definitions));
		this.id = options.id ?? HeadlessUtils.id('form');
		this.definitions = options.definitions;
		this.disabled = HeadlessUtils.reactive(options.disabled ?? false);
		this.values = this.#source(options.values);
		const entries = Object.entries(this.definitions).map(([id, definition]) => [id, this.#create(id, definition)] as const);
		this.controls = Object.fromEntries(entries) as unknown as TFormControls<Definitions>;
		this.fields = entries.map(([id, control]) => ({ id, definition: this.definitions[id], control })) as unknown as TFormField<Definitions>[];
		const controls = entries.map(([, control]) => control as Control<unknown>);
		this.dirty = computed(() => controls.some((control) => control.dirty()));
		this.invalid = computed(() => controls.some((control) => control instanceof TextField && control.invalid()));
	}

	/** Sets some values at once. Throws `LocaleError` for an unknown id or a value that does not fit. */
	assign(assignment: TControlAssignment<Definitions>): void {
		Form.#throwIfIssue(DefinitionUtils.invalidAssignment(this.definitions, assignment));
		this.values.set(DefinitionUtils.resolve(this.definitions, { ...Signal.untracked(this.values), ...assignment }));
	}

	/** Puts every control back to its initial value. */
	reset(): void {
		Signal.batch(() => this.fields.forEach((field) => (field.control as Control<unknown>).reset()));
	}

	#source(values: TFormOptions<Definitions>['values']): TWritable<TControlValues<Definitions>> {
		if (HeadlessUtils.isWritable<TControlValues<Definitions>>(values)) return values;
		Form.#throwIfIssue(DefinitionUtils.invalidAssignment(this.definitions, values ?? {}));
		return signal(DefinitionUtils.resolve(this.definitions, values ?? {}));
	}

	#binding<V>(id: string, read: (value: unknown) => V, write: (value: V) => unknown): TWritable<V> {
		return writable(
			() => read(this.values()[id]),
			(value) => {
				const normalized = DefinitionUtils.normalize(this.definitions[id], write(value));
				if (normalized === undefined) return;
				this.values.set({ ...Signal.untracked(this.values), [id]: normalized });
			}
		);
	}

	#create(id: string, definition: TControlDefinition): Control<unknown> {
		const common = { id: `${this.id}-${id}`, disabled: this.disabled };
		const same = <V>(value: unknown) => value as V;
		switch (definition.kind) {
			case 'range':
				return new Slider({ ...common, min: definition.min, max: definition.max, step: definition.step, value: this.#binding(id, same<number>, same) }) as Control<unknown>;
			case 'toggle':
				if (definition.control === 'checkbox') return new Checkbox({ ...common, value: this.#binding<TCheckedState>(id, same<TCheckedState>, (value) => value === true) }) as Control<unknown>;
				return new Switch({ ...common, value: this.#binding(id, same<boolean>, same) }) as Control<unknown>;
			case 'choice': {
				const choice = {
					...common,
					items: definition.options,
					label: (option: string) => definition.optionLabels?.[option] ?? option,
					value: this.#binding<string | undefined>(id, same<string>, (value) => value ?? definition.default),
				};
				if (definition.control === 'radio') return new RadioGroup<string>(choice) as Control<unknown>;
				return new Select<string>(choice) as Control<unknown>;
			}
			case 'text':
				return new TextField({
					...common,
					mask: definition.mask,
					maxLength: definition.maxLength,
					required: definition.required,
					value: this.#binding(id, same<string>, same),
				}) as Control<unknown>;
		}
	}

	static #throwIfIssue(issue: TDefinitionIssue | undefined): void {
		if (issue === undefined) return;
		throw new LocaleError(DEFINITION_LOCALES, issue.reason === 'undeclared' ? 'undeclaredControl' : 'invalidControl', { cause: issue });
	}
}

export { Form };
