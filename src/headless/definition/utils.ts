import { SliderUtils } from '../slider/utils';
import { TControlDefinition, TControlDefinitions, TControlValues, TDefinitionIssue } from './types';

/**
 * Checks and resolves values against control definitions. Problems are returned as `TDefinitionIssue`, never thrown.
 */
class DefinitionUtils {
	/**
	 * Fits a value to a definition (clamps and snaps ranges, cuts text), or `undefined` when it is of the wrong kind or not an option.
	 */
	static normalize(definition: TControlDefinition, value: unknown): number | boolean | string | undefined {
		switch (definition.kind) {
			case 'range':
				return typeof value === 'number' && !Number.isNaN(value) ? SliderUtils.normalize(value, definition) : undefined;
			case 'toggle':
				return typeof value === 'boolean' ? value : undefined;
			case 'choice':
				return typeof value === 'string' && definition.options.includes(value) ? value : undefined;
			case 'text':
				if (typeof value !== 'string') return undefined;
				return definition.maxLength === undefined ? value : value.slice(0, definition.maxLength);
		}
	}

	/** First definition whose default does not fit it. */
	static invalidDefault(definitions: TControlDefinitions): TDefinitionIssue | undefined {
		for (const [id, definition] of Object.entries(definitions)) {
			const fitsRange = definition.kind !== 'range' || (definition.min <= definition.default && definition.default <= definition.max);
			if (!fitsRange || DefinitionUtils.normalize(definition, definition.default) === undefined) {
				return { reason: 'invalid', id, value: definition.default, definition };
			}
		}
		return undefined;
	}

	/**
	 * First assigned value with an unknown id or that does not fit its definition. `undefined` values are ignored.
	 */
	static invalidAssignment(definitions: TControlDefinitions, assignment: Readonly<Record<string, unknown>>): TDefinitionIssue | undefined {
		for (const [id, value] of Object.entries(assignment)) {
			if (value === undefined) continue;
			const definition = definitions[id];
			if (definition === undefined) return { reason: 'undeclared', id, value, declared: Object.keys(definitions) };
			if (DefinitionUtils.normalize(definition, value) === undefined) return { reason: 'invalid', id, value, definition };
		}
		return undefined;
	}

	/** Every definition's value: the assigned one when valid, otherwise the default. */
	static resolve<Definitions extends TControlDefinitions>(definitions: Definitions, assignment: Readonly<Record<string, unknown>>): TControlValues<Definitions> {
		return Object.fromEntries(
			Object.entries(definitions).map(([id, definition]) => [id, DefinitionUtils.normalize(definition, assignment[id]) ?? definition.default])
		) as TControlValues<Definitions>;
	}
}

export { DefinitionUtils };
