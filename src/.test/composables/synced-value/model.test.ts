import { describe, it, expect, vi } from 'vitest';
import { syncedValue } from '@ts/composables/synced-value/model';

describe('syncedValue', () => {
	it('reads the initial value from `read`', () => {
		const store = { value: 'stored' };
		const sv = syncedValue(() => store.value);
		expect(sv()).toBe('stored');
	});

	it('without a `write`, behaves like a plain signal (only reads the source once, at creation)', () => {
		const read = vi.fn(() => 'a');
		const sv = syncedValue(read);
		sv.set('b');
		expect(sv()).toBe('b');
		expect(read).toHaveBeenCalledTimes(1);
	});

	it('calls `write` when the value is set', () => {
		const store = { value: 'a' };
		const write = vi.fn((v: string) => (store.value = v));
		const sv = syncedValue(() => store.value, write);
		sv.set('b');
		expect(write).toHaveBeenCalledWith('b');
		expect(store.value).toBe('b');
		expect(sv()).toBe('b');
	});

	it('does not call `write` when set() does not actually change the value', () => {
		const write = vi.fn();
		const sv = syncedValue(() => 'a', write);
		sv.set('a');
		expect(write).not.toHaveBeenCalled();
	});

	it('calls `write` with the result of update()', () => {
		const store = { value: 1 };
		const write = vi.fn((v: number) => (store.value = v));
		const sv = syncedValue(() => store.value, write);
		sv.update((v) => v + 1);
		expect(write).toHaveBeenCalledWith(2);
		expect(sv()).toBe(2);
	});

	it('respects a custom `equal` when deciding whether to write', () => {
		const write = vi.fn();
		const sv = syncedValue(() => 1, write, () => true); // always "equal" -> never changes
		sv.set(2);
		expect(write).not.toHaveBeenCalled();
		expect(sv()).toBe(1);
	});
});
