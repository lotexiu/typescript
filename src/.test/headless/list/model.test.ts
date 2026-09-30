import { describe, it, expect, vi } from 'vitest';
import { list } from '@ts/headless/list/model';

type Person = { id: number; name: string; age: number };
const people: Person[] = [
	{ id: 1, name: 'Ana', age: 30 },
	{ id: 2, name: 'Bruno', age: 25 },
	{ id: 3, name: 'Carla', age: 40 },
	{ id: 4, name: 'Ana Paula', age: 22 },
];

function peopleList(overrides: Partial<Parameters<typeof list<Person, number>>[0]> = {}) {
	return list<Person, number>({
		getKey: (p) => p.id,
		items: people,
		pageSize: 2,
		searchableText: (p) => p.name,
		sortValue: (p, key) => (key === 'age' ? p.age : p.name),
		...overrides,
	});
}

describe('list.rows (pagination)', () => {
	it('shows `pageSize` items per page, in the original order by default', () => {
		const l = peopleList();
		expect(l.rows().map((p) => p.name)).toEqual(['Ana', 'Bruno']);
		l.pagination.nextPage();
		expect(l.rows().map((p) => p.name)).toEqual(['Carla', 'Ana Paula']);
	});
});

describe('list.sort', () => {
	it('reorders `rows` by the given key/direction', () => {
		const l = peopleList();
		l.sort.toggle('age');
		expect(l.rows().map((p) => p.name)).toEqual(['Ana Paula', 'Bruno']); // 22, 25 ascending
		l.sort.toggle('age'); // same key -> flips to DESC
		expect(l.rows().map((p) => p.name)).toEqual(['Carla', 'Ana']); // 40, 30 descending
	});

	it('resets to page 1 when the sort changes', () => {
		const l = peopleList();
		l.pagination.nextPage();
		expect(l.pagination.currentPage()).toBe(2);
		l.sort.toggle('age');
		expect(l.pagination.currentPage()).toBe(1);
	});

	it('leaves order untouched when `sortValue` is not configured', () => {
		const l = peopleList({ sortValue: undefined });
		l.sort.toggle('age');
		expect(l.rows().map((p) => p.name)).toEqual(['Ana', 'Bruno']);
	});
});

describe('list.query (search)', () => {
	it('filters items by `searchableText`, case-insensitively', () => {
		const l = peopleList();
		l.query.set('ana');
		expect(l.filteredCount()).toBe(2);
		expect(l.rows().map((p) => p.name).sort()).toEqual(['Ana', 'Ana Paula']);
	});

	it('resets to page 1 when the query changes', () => {
		const l = peopleList();
		l.pagination.nextPage();
		l.query.set('a');
		expect(l.pagination.currentPage()).toBe(1);
	});

	it('does nothing when `searchableText` is not configured', () => {
		const l = peopleList({ searchableText: undefined });
		l.query.set('ana');
		expect(l.filteredCount()).toBe(4);
	});
});

describe('list selection ("select all" master checkbox)', () => {
	it('toggleSelectAll() selects every item matching the current search, across every page — not just the current page', () => {
		const l = peopleList();
		l.query.set('ana'); // matches Ana (page-1-sized result would normally hide nothing here, but pageSize=2 still applies)
		l.toggleSelectAll();
		expect([...l.selection()].sort()).toEqual([1, 4]);
		expect(l.allRowsSelected()).toBe(true);
	});

	it('somePartiallySelected() is true once some but not all filtered items are selected', () => {
		const l = peopleList();
		l.query.set('ana');
		l.selection.select(1);
		expect(l.somePartiallySelected()).toBe(true);
		expect(l.allRowsSelected()).toBe(false);
	});

	it('clearing the filter after a "select all" leaves the selection alone, so allRowsSelected drops back to false', () => {
		const l = peopleList();
		l.query.set('ana');
		l.toggleSelectAll();
		l.query.set('');
		expect([...l.selection()].sort()).toEqual([1, 4]); // still selected
		expect(l.allRowsSelected()).toBe(false); // but no longer "all" of the now-larger filtered set
		expect(l.somePartiallySelected()).toBe(true);
	});
});
