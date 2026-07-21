import { describe, expect, it, vi } from 'vitest';
import { ValueCell } from '@ts/value-cell/model';

describe('ValueCell', () => {
	it('starts with the initial value', () => {
		const cell = new ValueCell(10);
		expect(cell.value).toBe(10);
	});

	it('notifies subscribers only when the value actually changes', () => {
		const cell = new ValueCell(1);
		const listener = vi.fn();
		cell.subscribe(listener);

		cell.set(1);
		expect(listener).not.toHaveBeenCalled();

		cell.set(2);
		expect(listener).toHaveBeenCalledWith(2);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('stops notifying after unsubscribe', () => {
		const cell = new ValueCell(0);
		const listener = vi.fn();
		const unsubscribe = cell.subscribe(listener);

		unsubscribe();
		cell.set(1);

		expect(listener).not.toHaveBeenCalled();
	});
});
