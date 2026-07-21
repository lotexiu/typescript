import { describe, expect, it, vi } from 'vitest';
import '@ts/declarations';
import { deleteProxy, proxyHandler } from '@tsn-object/proxy/implementations';
import { TProperty } from '@tsn-object/proxy/types';

describe('proxyHandler', () => {
	it('reads and writes plain properties like a normal object', () => {
		const proxy = proxyHandler({ count: 1 });
		expect(proxy.count).toBe(1);

		proxy.count = 2;
		expect(proxy.count).toBe(2);
	});

	it('calls onChanges with name/value/previousValue/state on every property update', () => {
		const onChanges = vi.fn();
		const proxy = proxyHandler({ count: 1 }, { onChanges });

		proxy.count = 2;

		expect(onChanges).toHaveBeenCalledWith({
			name: 'count',
			value: 2,
			previousValue: 1,
			state: 'updated',
		} satisfies TProperty<{ count: number }>);
	});

	it('does not notify when the value is set to the same reference/primitive', () => {
		const onChanges = vi.fn();
		const proxy = proxyHandler({ count: 1 }, { onChanges });

		proxy.count = 1;

		expect(onChanges).not.toHaveBeenCalled();
	});

	it('wraps nested object properties in their own proxy when allProxy is set', () => {
		const onChanges = vi.fn();
		const proxy = proxyHandler({ nested: { value: 1 } }, { allProxy: true, onChanges });

		proxy.nested.value = 2;

		expect(proxy.nested.value).toBe(2);
		expect(onChanges).toHaveBeenCalledWith({
			name: 'value',
			value: 2,
			previousValue: 1,
			state: 'updated',
		});
	});

	it('does not proxy nested objects unless allProxy/proxyVariable/onChanges opts in for that property', () => {
		const target = { nested: { value: 1 } };
		const proxy = proxyHandler(target);

		expect(proxy.nested).toBe(target.nested);
	});

	it('creates a fresh nested proxy (not a stale cached one) when a property is reassigned to a new object', () => {
		const proxy = proxyHandler<{ nested: { value: number } }>(
			{ nested: { value: 1 } },
			{ allProxy: true },
		);

		const firstNested = proxy.nested;
		expect(firstNested.value).toBe(1);

		proxy.nested = { value: 99 };

		expect(proxy.nested.value).toBe(99);
		expect(proxy.nested).not.toBe(firstNested);
	});

	it('deleteProxy manually invalidates a cached nested proxy', () => {
		const proxy = proxyHandler<{ nested: { value: number } }>(
			{ nested: { value: 1 } },
			{ allProxy: true },
		);

		const firstNested = proxy.nested;
		deleteProxy(proxy, 'nested');
		const secondNested = proxy.nested;

		expect(secondNested).not.toBe(firstNested);
		expect(secondNested.value).toBe(1);
	});

	it('rebinds methods to the proxy itself, so `this.x = y` inside a method is reactive', () => {
		const onChanges = vi.fn();

		class Counter {
			count = 0;
			increment() {
				this.count++;
			}
		}

		const proxy = proxyHandler(new Counter(), { onChanges });
		proxy.increment();

		expect(proxy.count).toBe(1);
		expect(onChanges).toHaveBeenCalledWith({
			name: 'count',
			value: 1,
			previousValue: 0,
			state: 'updated',
		});
	});

	it('notifies with state "defined" via Object.defineProperty and "deleted" via delete', () => {
		const onChanges = vi.fn();
		const proxy = proxyHandler<{ count?: number }>({}, { onChanges });

		Object.defineProperty(proxy, 'count', { value: 5, configurable: true, enumerable: true });
		expect(onChanges).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'count', value: 5, state: 'defined' }),
		);

		delete proxy.count;
		expect(onChanges).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'count', state: 'deleted' }),
		);
	});

	it('runs a per-property onSet/onGet without affecting other properties', () => {
		const onSet = vi.fn();
		const proxy = proxyHandler(
			{ count: 1, other: 'x' },
			{ properties: { count: { onSet, onGet: (v) => v * 10 } } },
		);

		proxy.count = 2;
		expect(onSet).toHaveBeenCalledWith(2);
		expect(proxy.count).toBe(20);

		proxy.other = 'y';
		expect(proxy.other).toBe('y');
	});
});
