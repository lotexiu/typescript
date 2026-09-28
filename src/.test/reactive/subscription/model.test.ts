import { describe, it, expect, vi } from 'vitest';
import { Subscription } from '@tsr/subscription/model';

describe('Subscription', () => {
	it('calls a subscribed listener with the notified value', () => {
		const sub = new Subscription<number>();
		const listener = vi.fn();
		sub.subscribe(listener);
		sub.notify(42);
		expect(listener).toHaveBeenCalledWith(42);
	});

	it('supports multiple listeners', () => {
		const sub = new Subscription<number>();
		const a = vi.fn();
		const b = vi.fn();
		sub.subscribe(a);
		sub.subscribe(b);
		sub.notify(1);
		expect(a).toHaveBeenCalledWith(1);
		expect(b).toHaveBeenCalledWith(1);
	});

	it('notifying with no listeners is a no-op', () => {
		const sub = new Subscription<number>();
		expect(() => sub.notify(1)).not.toThrow();
	});

	it('unsubscribe stops that listener from receiving further notifications', () => {
		const sub = new Subscription<number>();
		const listener = vi.fn();
		const unsubscribe = sub.subscribe(listener);
		unsubscribe();
		sub.notify(1);
		expect(listener).not.toHaveBeenCalled();
	});

	it('unsubscribing one listener does not affect others', () => {
		const sub = new Subscription<number>();
		const a = vi.fn();
		const b = vi.fn();
		const unsubA = sub.subscribe(a);
		sub.subscribe(b);
		unsubA();
		sub.notify(1);
		expect(a).not.toHaveBeenCalled();
		expect(b).toHaveBeenCalledWith(1);
	});

	it('calling unsubscribe twice is a no-op', () => {
		const sub = new Subscription<number>();
		const listener = vi.fn();
		const unsubscribe = sub.subscribe(listener);
		unsubscribe();
		expect(() => unsubscribe()).not.toThrow();
	});

	it('a listener that throws still lets other listeners run, then the error is thrown', () => {
		const sub = new Subscription<number>();
		const good = vi.fn();
		sub.subscribe(() => {
			throw new Error('boom');
		});
		sub.subscribe(good);
		expect(() => sub.notify(1)).toThrow();
		expect(good).toHaveBeenCalledWith(1);
	});

	it('aggregates errors from multiple failing listeners into an AggregateError', () => {
		const sub = new Subscription<number>();
		sub.subscribe(() => {
			throw new Error('first');
		});
		sub.subscribe(() => {
			throw new Error('second');
		});
		let thrown: unknown;
		try {
			sub.notify(1);
		} catch (error) {
			thrown = error;
		}
		expect(thrown).toBeInstanceOf(AggregateError);
		expect((thrown as AggregateError).errors).toHaveLength(2);
	});

	it('dispose() clears all listeners', () => {
		const sub = new Subscription<number>();
		const listener = vi.fn();
		sub.subscribe(listener);
		sub.dispose();
		sub.notify(1);
		expect(listener).not.toHaveBeenCalled();
	});

	it('supports a void payload (default type param)', () => {
		const sub = new Subscription();
		const listener = vi.fn();
		sub.subscribe(listener);
		sub.notify();
		expect(listener).toHaveBeenCalledWith(undefined);
	});
});
