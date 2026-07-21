import { describe, expect, it, vi } from 'vitest';
import { VariantCell } from '@ts/variant-cell/model';

describe('VariantCell', () => {
	it('starts on the initial variant and derives its value', () => {
		const derive = vi.fn((name: 'a' | 'b') => name.toUpperCase());
		const cell = new VariantCell(derive, 'a');

		expect(cell.active).toBe('a');
		expect(cell.value).toBe('A');
		expect(derive).toHaveBeenCalledTimes(1);
	});

	it('caches the derived value per name instead of recomputing on every read', () => {
		const derive = vi.fn((name: 'a' | 'b') => name.toUpperCase());
		const cell = new VariantCell<'a' | 'b', string>(derive, 'a');

		cell.value;
		cell.value;
		expect(derive).toHaveBeenCalledTimes(1);

		cell.set('b');
		cell.value;
		cell.value;
		expect(derive).toHaveBeenCalledTimes(2);

		cell.set('a');
		cell.value;
		expect(derive).toHaveBeenCalledTimes(2);
	});

	it('notifies subscribers with the active name, not the derived value', () => {
		const cell = new VariantCell<'a' | 'b', string>((name) => name.toUpperCase(), 'a');
		const listener = vi.fn();
		cell.subscribe(listener);

		cell.set('b');
		expect(listener).toHaveBeenCalledWith('b');
		expect(cell.value).toBe('B');
	});

	it('does not notify when set to the already-active name', () => {
		const cell = new VariantCell<'a' | 'b', 'a' | 'b'>((name) => name, 'a');
		const listener = vi.fn();
		cell.subscribe(listener);

		cell.set('a');
		expect(listener).not.toHaveBeenCalled();
	});

	it('stops notifying after unsubscribe', () => {
		const cell = new VariantCell<'a' | 'b', 'a' | 'b'>((name) => name, 'a');
		const listener = vi.fn();
		const unsubscribe = cell.subscribe(listener);

		unsubscribe();
		cell.set('b');

		expect(listener).not.toHaveBeenCalled();
	});
});
