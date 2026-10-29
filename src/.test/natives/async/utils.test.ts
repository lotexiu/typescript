import { describe, expect, it } from 'vitest';
import { TimeoutError } from '@tsn/async/error';
import { AsyncUtils } from '@tsn/async/utils';

describe('AsyncUtils.timeout', () => {
	it('devolve o valor se terminar a tempo', async () => {
		await expect(AsyncUtils.timeout(AsyncUtils.sleep(1).then(() => 'ok'), 100)).resolves.toBe('ok');
	});

	it('estoura com TimeoutError', async () => {
		const error = await AsyncUtils.timeout(AsyncUtils.sleep(50), 5).catch((reason: unknown) => reason);
		expect(error).toBeInstanceOf(TimeoutError);
		expect((error as TimeoutError).ms).toBe(5);
	});

	it('com função, aborta o sinal no estouro', async () => {
		let signal: AbortSignal | undefined;
		await expect(
			AsyncUtils.timeout((abortSignal) => {
				signal = abortSignal;
				return AsyncUtils.sleep(50);
			}, 5)
		).rejects.toBeInstanceOf(TimeoutError);
		expect(signal?.aborted).toBe(true);
		expect(signal?.reason).toBeInstanceOf(TimeoutError);
	});

	it('propaga a rejeição do trabalho', async () => {
		await expect(AsyncUtils.timeout(Promise.reject(new Error('falhou')), 100)).rejects.toThrow('falhou');
	});
});
