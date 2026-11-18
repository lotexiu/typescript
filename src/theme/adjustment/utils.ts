import { TDefinitionIssue } from '@ts/headless/definition/types';
import { DefinitionUtils } from '@ts/headless/definition/utils';
import { LocaleError } from '@ts/locale/error';
import { ADJUSTMENT_LOCALES } from './declarations';
import { TAdjustmentDefinitions } from './types';

/** Validation of adjustments with theme-specific errors, on top of `DefinitionUtils`. */
class AdjustmentUtils {
	/** Throws `LocaleError` (`invalidAdjustment`) when a default does not fit its definition. */
	static validate(definitions: TAdjustmentDefinitions): void {
		AdjustmentUtils.#throwIfIssue(DefinitionUtils.invalidDefault(definitions));
	}

	/** Throws `LocaleError` for an id the definitions do not declare or a value that does not fit. */
	static check(definitions: TAdjustmentDefinitions, assignment: Readonly<Record<string, unknown>>): void {
		AdjustmentUtils.#throwIfIssue(DefinitionUtils.invalidAssignment(definitions, assignment));
	}

	static #throwIfIssue(issue: TDefinitionIssue | undefined): void {
		if (issue === undefined) return;
		throw new LocaleError(ADJUSTMENT_LOCALES, issue.reason === 'undeclared' ? 'undeclaredAdjustment' : 'invalidAdjustment', { cause: issue });
	}
}

export { AdjustmentUtils };
