import { describe, it, expect } from 'vitest';
import { DefinitionUtils } from '@ts/headless/definition/utils';

const definitions = {
	roundness: { kind: 'range', default: 1, min: 0, max: 2, step: 0.25 },
	blur: { kind: 'toggle', default: true },
	edge: { kind: 'choice', default: 'bottom', options: ['bottom', 'top'] },
} as const;

describe('DefinitionUtils.normalize', () => {
	it('clamps a range and snaps it to the step without floating point drift', () => {
		expect(DefinitionUtils.normalize(definitions.roundness, 9)).toBe(2);
		expect(DefinitionUtils.normalize(definitions.roundness, -3)).toBe(0);
		expect(DefinitionUtils.normalize(definitions.roundness, 0.6)).toBe(0.5);
		expect(DefinitionUtils.normalize({ kind: 'range', default: 0, min: 0, max: 1, step: 0.1 }, 0.3)).toBe(0.3);
	});

	it('refuses values of the wrong kind', () => {
		expect(DefinitionUtils.normalize(definitions.roundness, '1')).toBeUndefined();
		expect(DefinitionUtils.normalize(definitions.blur, 1)).toBeUndefined();
		expect(DefinitionUtils.normalize(definitions.edge, 'left')).toBeUndefined();
	});
});

describe('DefinitionUtils.resolve', () => {
	it('uses the defaults for what was not assigned and ignores ids the definitions do not declare', () => {
		expect(DefinitionUtils.resolve(definitions, { blur: false, unknown: 3 })).toEqual({ roundness: 1, blur: false, edge: 'bottom' });
	});

	it('falls back to the default when an assigned value is invalid', () => {
		expect(DefinitionUtils.resolve(definitions, { edge: 'left' }).edge).toBe('bottom');
	});
});

describe('DefinitionUtils with text and labelled choices', () => {
	it('accepts strings for a text definition and cuts them at maxLength', () => {
		expect(DefinitionUtils.normalize({ kind: 'text', default: '', maxLength: 3 }, 'abcdef')).toBe('abc');
		expect(DefinitionUtils.normalize({ kind: 'text', default: '' }, 3)).toBeUndefined();
	});

	it('reports issues as values instead of throwing', () => {
		expect(DefinitionUtils.invalidAssignment(definitions, { size: 1 })).toMatchObject({ reason: 'undeclared', id: 'size' });
		expect(DefinitionUtils.invalidAssignment(definitions, { blur: 'yes' })).toMatchObject({ reason: 'invalid', id: 'blur' });
		expect(DefinitionUtils.invalidAssignment(definitions, { roundness: 40 })).toBeUndefined();
		expect(DefinitionUtils.invalidDefault({ size: { kind: 'range', default: 5, min: 0, max: 2 } })).toMatchObject({ reason: 'invalid', id: 'size' });
		expect(DefinitionUtils.invalidDefault(definitions)).toBeUndefined();
	});
});
