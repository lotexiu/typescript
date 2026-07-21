import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AsyncCheckPlugin } from '@ts/html/plugins/async-check/model';

describe('AsyncCheckPlugin', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('starts idle', () => {
		const plugin = new AsyncCheckPlugin(async (v: string) => v.length);
		expect(plugin.value).toEqual({ status: 'idle' });
	});

	it('goes pending immediately on request, then resolved once the check settles', async () => {
		const check = vi.fn(async (email: string) => email.includes('@'));
		const plugin = new AsyncCheckPlugin(check, 100);

		plugin.request('a@b.com');
		expect(plugin.value).toEqual({ status: 'pending' });
		expect(check).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(100);
		expect(check).toHaveBeenCalledWith('a@b.com');
		expect(plugin.value).toEqual({ status: 'resolved', result: true });
	});

	it('debounces rapid requests — only the last input is actually checked', async () => {
		const check = vi.fn(async (v: string) => v);
		const plugin = new AsyncCheckPlugin(check, 100);

		plugin.request('a');
		await vi.advanceTimersByTimeAsync(50);
		plugin.request('ab');
		await vi.advanceTimersByTimeAsync(50);
		plugin.request('abc');
		await vi.advanceTimersByTimeAsync(100);

		expect(check).toHaveBeenCalledTimes(1);
		expect(check).toHaveBeenCalledWith('abc');
		expect(plugin.value).toEqual({ status: 'resolved', result: 'abc' });
	});

	it('ignores a stale response if a newer request already superseded it', async () => {
		let resolveFirst!: (v: boolean) => void;
		const first = new Promise<boolean>((resolve) => { resolveFirst = resolve; });
		const check = vi.fn()
			.mockImplementationOnce(() => first)
			.mockImplementationOnce(async () => true);

		const plugin = new AsyncCheckPlugin(check, 0);

		plugin.request('slow');
		await vi.advanceTimersByTimeAsync(0);
		plugin.request('fast');
		await vi.advanceTimersByTimeAsync(0);

		expect(plugin.value).toEqual({ status: 'resolved', result: true });

		resolveFirst(false);
		await vi.advanceTimersByTimeAsync(0);

		// A resposta lenta chegou depois, mas não deve sobrescrever o resultado
		// da checagem mais recente.
		expect(plugin.value).toEqual({ status: 'resolved', result: true });
	});

	it('reports rejected status when the check throws', async () => {
		const check = vi.fn(async () => { throw new Error('boom'); });
		const plugin = new AsyncCheckPlugin(check, 0);

		plugin.request('x');
		await vi.advanceTimersByTimeAsync(0);

		expect(plugin.value).toEqual({ status: 'rejected', error: new Error('boom') });
	});

	it('reset() cancels a pending check and returns to idle', async () => {
		const check = vi.fn(async () => true);
		const plugin = new AsyncCheckPlugin(check, 100);

		plugin.request('x');
		plugin.reset();
		await vi.advanceTimersByTimeAsync(200);

		expect(check).not.toHaveBeenCalled();
		expect(plugin.value).toEqual({ status: 'idle' });
	});

	it('notifies subscribers on every status transition', async () => {
		const check = vi.fn(async () => true);
		const plugin = new AsyncCheckPlugin(check, 0);
		const listener = vi.fn();
		plugin.subscribe(listener);

		plugin.request('x');
		await vi.advanceTimersByTimeAsync(0);

		expect(listener).toHaveBeenNthCalledWith(1, { status: 'pending' });
		expect(listener).toHaveBeenNthCalledWith(2, { status: 'resolved', result: true });
	});
});
