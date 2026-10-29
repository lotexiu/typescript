import { describe, expect, it } from 'vitest';
import { ResultUtils } from '@ts/result/utils';

describe('ResultUtils', () => {
	it('attempt captura o que for lançado como Error', () => {
		expect(ResultUtils.attempt(() => 7)).toEqual({ ok: true, value: 7 });
		const failed = ResultUtils.attempt(() => JSON.parse('{'));
		expect(failed.ok).toBe(false);
		const text = ResultUtils.attempt(() => {
			throw 'texto';
		});
		expect(!text.ok && text.error).toBeInstanceOf(Error);
		expect(!text.ok && text.error.message).toBe('texto');
	});

	it('attemptAsync', async () => {
		expect(await ResultUtils.attemptAsync(async () => 'ok')).toEqual({ ok: true, value: 'ok' });
		const failed = await ResultUtils.attemptAsync(async () => {
			throw new Error('x');
		});
		expect(!failed.ok && failed.error.message).toBe('x');
	});

	it('map / mapError / unwrapOr / unwrap', () => {
		const ok = ResultUtils.ok(2);
		const err = ResultUtils.err('falhou');
		expect(ResultUtils.map(ok, (value) => value * 3)).toEqual({ ok: true, value: 6 });
		expect(ResultUtils.map(err, () => 1)).toBe(err);
		expect(ResultUtils.mapError(err, (message) => message.length)).toEqual({ ok: false, error: 6 });
		expect(ResultUtils.unwrapOr(err, 9)).toBe(9);
		expect(ResultUtils.unwrap(ok)).toBe(2);
		expect(() => ResultUtils.unwrap(err)).toThrow('falhou');
		const boom = new Error('boom');
		expect(() => ResultUtils.unwrap(ResultUtils.err(boom))).toThrow(boom);
	});
});
