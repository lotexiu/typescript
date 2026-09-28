import { describe, it, expect, vi } from 'vitest';
import { ProxyUtils, proxy } from '@tsn/proxy/utils';

describe('ProxyUtils.proxy', () => {
	it('creates a real Proxy wrapping the target with the given handler', () => {
		const target = { a: 1 };
		const get = vi.fn((t: any, key: string | symbol) => t[key]);
		const wrapped = ProxyUtils.proxy(target, { get });
		expect(wrapped.a).toBe(1);
		expect(get).toHaveBeenCalledWith(target, 'a', wrapped);
	});

	it('intercepts writes via the set trap', () => {
		const target: any = { a: 1 };
		const wrapped = ProxyUtils.proxy(target, {
			set(t, key, value) {
				t[key as string] = value;
				return true;
			},
		});
		wrapped.a = 5;
		expect(target.a).toBe(5);
	});

	it('is re-exported as the bare `proxy` function', () => {
		const wrapped = proxy({ a: 1 }, {});
		expect(wrapped.a).toBe(1);
	});
});
