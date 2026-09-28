import { describe, it, expect, vi } from 'vitest';
import { select } from '@ts/headless/select/model';

type Fruit = { id: number; name: string };
const fruits: Fruit[] = [
	{ id: 1, name: 'Maçã' },
	{ id: 2, name: 'Banana' },
	{ id: 3, name: 'Uva' },
];

function fruitSelect(mode?: 'single' | 'multi') {
	return select<Fruit, number>({
		getValue: (f) => f.id,
		getLabel: (f) => f.name,
		items: fruits,
		mode,
	});
}

describe('select (local filter)', () => {
	it('starts with every item in `options`', () => {
		const s = fruitSelect();
		expect(s.options()).toEqual(fruits);
	});

	it('filters `options` by `query`, case- and accent-insensitively', () => {
		const s = fruitSelect();
		s.query.set('maca');
		expect(s.options().map((f) => f.name)).toEqual(['Maçã']);
	});

	it('an empty query restores the full list', () => {
		const s = fruitSelect();
		s.query.set('uva');
		s.query.set('');
		expect(s.options()).toEqual(fruits);
	});
});

describe('select.selectOption (single mode)', () => {
	it('selects the item, clears `query`, and closes `open`', () => {
		const s = fruitSelect('single');
		s.open.on();
		s.query.set('ban');
		s.selectOption(fruits[1]);
		expect(s.selectedItem()).toEqual(fruits[1]);
		expect(s.query()).toBe('');
		expect(s.open()).toBe(false);
	});

	it('selecting the already-selected item again deselects it (toggle)', () => {
		const s = fruitSelect('single');
		s.selectOption(fruits[0]);
		s.selectOption(fruits[0]);
		expect(s.selectedItem()).toBeUndefined();
	});

	it('keeps `selectedItem` resolvable even after the item is filtered out of `options`', () => {
		const s = fruitSelect('single');
		s.selectOption(fruits[1]); // Banana
		s.query.set('uva'); // narrows options away from Banana
		expect(s.options()).not.toContainEqual(fruits[1]);
		expect(s.selectedItem()).toEqual(fruits[1]);
	});
});

describe('select.selectOption (multi mode)', () => {
	it('accumulates selections and does not close `open`', () => {
		const s = fruitSelect('multi');
		s.open.on();
		s.selectOption(fruits[0]);
		s.selectOption(fruits[1]);
		expect(s.selectedItems()).toEqual([fruits[0], fruits[1]]);
		expect(s.open()).toBe(true);
	});
});

describe('select "select all" (multi mode master checkbox)', () => {
	it('optionsAllSelected/optionsPartiallySelected reflect the current selection against `options`', () => {
		const s = fruitSelect('multi');
		expect(s.optionsAllSelected()).toBe(false);
		expect(s.optionsPartiallySelected()).toBe(false);
		s.selectOption(fruits[0]);
		expect(s.optionsPartiallySelected()).toBe(true);
		expect(s.optionsAllSelected()).toBe(false);
	});

	it('toggleAllOptions() selects every visible option when not all are selected', () => {
		const s = fruitSelect('multi');
		s.toggleAllOptions();
		expect(s.selectedItems()).toEqual(fruits);
		expect(s.optionsAllSelected()).toBe(true);
	});

	it('toggleAllOptions() deselects everything when all visible options are already selected', () => {
		const s = fruitSelect('multi');
		s.toggleAllOptions();
		s.toggleAllOptions();
		expect(s.selectedItems()).toEqual([]);
	});

	it('toggleAllOptions() only affects the currently filtered `options`, not the whole item set', () => {
		const s = fruitSelect('multi');
		s.query.set('uva'); // narrows options to just Uva
		s.toggleAllOptions();
		expect(s.selectedItems()).toEqual([fruits[2]]);
	});
});

describe('select.activateAndSelect', () => {
	it('selects whatever `active.index` currently points to in `options`', () => {
		const s = fruitSelect('single');
		s.active.next();
		s.active.next();
		s.activateAndSelect();
		expect(s.selectedItem()).toEqual(fruits[1]);
	});

	it('is a no-op when nothing is active', () => {
		const s = fruitSelect('single');
		s.activateAndSelect();
		expect(s.selectedItem()).toBeUndefined();
	});
});

describe('select with `search` (remote)', () => {
	it('drives `options`/`loading` from the async `search` callback instead of local filtering', async () => {
		const search = vi.fn(async (query: string) => fruits.filter((f) => f.name.includes(query)));
		const s = select<Fruit, number>({ getValue: (f) => f.id, getLabel: (f) => f.name, search });

		expect(s.options()).toEqual([]);
		s.query.set('Ban');
		expect(s.loading()).toBe(true);
		await vi.waitFor(() => expect(s.loading()).toBe(false));

		expect(search).toHaveBeenCalledWith('Ban');
		expect(s.options()).toEqual([fruits[1]]);
	});

	it('surfaces a rejected `search` through `error` and clears `loading`', async () => {
		const search = vi.fn(async () => {
			throw new Error('network down');
		});
		const s = select<Fruit, number>({ getValue: (f) => f.id, getLabel: (f) => f.name, search });

		s.query.set('x');
		await vi.waitFor(() => expect(s.loading()).toBe(false));

		expect((s.error() as Error).message).toBe('network down');
	});
});
