import { describe, it, expect } from 'vitest';
import { AdjustmentUtils } from '@ts/theme/adjustment/utils';

const definitions = {
	roundness: { kind: 'range', default: 1, min: 0, max: 2, step: 0.25 },
	blur: { kind: 'toggle', default: true },
	edge: { kind: 'choice', default: 'bottom', options: ['bottom', 'top'] },
} as const;

describe('AdjustmentUtils.validate and check', () => {
	it('refuses a default outside the definition', () => {
		expect(() => AdjustmentUtils.validate({ size: { kind: 'range', default: 5, min: 0, max: 2 } })).toThrow(expect.objectContaining({ type: 'invalidAdjustment' }));
		expect(() => AdjustmentUtils.validate({ edge: { kind: 'choice', default: 'left', options: ['top'] } })).toThrow(expect.objectContaining({ type: 'invalidAdjustment' }));
	});

	it('refuses undeclared ids and invalid values in an assignment', () => {
		expect(() => AdjustmentUtils.check(definitions, { size: 1 })).toThrow(expect.objectContaining({ type: 'undeclaredAdjustment' }));
		expect(() => AdjustmentUtils.check(definitions, { blur: 'yes' })).toThrow(expect.objectContaining({ type: 'invalidAdjustment' }));
		expect(() => AdjustmentUtils.check(definitions, { roundness: 40, blur: undefined })).not.toThrow();
	});
});
