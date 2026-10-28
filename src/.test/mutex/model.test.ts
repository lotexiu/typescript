import { describe, expect, it } from 'vitest';
import { Mutex } from '@ts/mutex/model';
import { AsyncUtils } from '@tsn/async/utils';

describe('Mutex', () => {
	it('serializa seções críticas (sem intercalar)', async () => {
		const mutex = new Mutex();
		const log: string[] = [];
		const job = (name: string) =>
			mutex.run(async () => {
				log.push(`${name}:início`);
				await AsyncUtils.sleep(3);
				log.push(`${name}:fim`);
			});
		await Promise.all([job('a'), job('b'), job('c')]);
		expect(log).toEqual(['a:início', 'a:fim', 'b:início', 'b:fim', 'c:início', 'c:fim']);
	});

	it('locked reflete o estado', async () => {
		const mutex = new Mutex();
		expect(mutex.locked).toBe(false);
		const release = await mutex.acquire();
		expect(mutex.locked).toBe(true);
		release();
		expect(mutex.locked).toBe(false);
	});
});
