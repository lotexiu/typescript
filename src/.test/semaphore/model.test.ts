import { describe, expect, it } from 'vitest';
import { Semaphore } from '@ts/semaphore/model';
import { AsyncUtils } from '@tsn/async/utils';

describe('Semaphore', () => {
	it('limita a concorrência e libera na ordem de chegada', async () => {
		const semaphore = new Semaphore(2);
		let running = 0;
		let peak = 0;
		const order: number[] = [];
		await Promise.all(
			Array.from({ length: 6 }, (_, id) =>
				semaphore.run(async () => {
					order.push(id);
					running++;
					peak = Math.max(peak, running);
					await AsyncUtils.sleep(5);
					running--;
				})
			)
		);
		expect(peak).toBe(2);
		expect(order).toEqual([0, 1, 2, 3, 4, 5]);
		expect(semaphore.available).toBe(2);
		expect(semaphore.pending).toBe(0);
	});

	it('devolve a permissão mesmo se a tarefa lançar', async () => {
		const semaphore = new Semaphore(1);
		await expect(semaphore.run(() => Promise.reject(new Error('x')))).rejects.toThrow('x');
		expect(semaphore.available).toBe(1);
	});

	it('release duas vezes não cria permissão extra', async () => {
		const semaphore = new Semaphore(1);
		const release = await semaphore.acquire();
		release();
		release();
		expect(semaphore.available).toBe(1);
	});

	it('tryAcquire não espera', () => {
		const semaphore = new Semaphore(1);
		const release = semaphore.tryAcquire();
		expect(release).toBeDefined();
		expect(semaphore.tryAcquire()).toBeUndefined();
		release!();
		expect(semaphore.tryAcquire()).toBeDefined();
	});

	it('cancelar na fila rejeita e libera o lugar', async () => {
		const semaphore = new Semaphore(1);
		const release = await semaphore.acquire();
		const controller = new AbortController();
		const waiting = semaphore.acquire(controller.signal);
		expect(semaphore.pending).toBe(1);
		controller.abort(new Error('cancelado'));
		await expect(waiting).rejects.toThrow('cancelado');
		expect(semaphore.pending).toBe(0);
		release();
		expect(semaphore.available).toBe(1);
		await expect(semaphore.acquire(controller.signal)).rejects.toThrow('cancelado');
	});

	it('permits inválido é recusado', () => {
		expect(() => new Semaphore(0)).toThrow(RangeError);
	});
});
