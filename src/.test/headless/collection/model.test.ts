import { describe, it, expect } from 'vitest';
import { Collection } from '@ts/headless/collection/model';
import { Navigation } from '@ts/headless/navigation/model';
import { signal } from '@tsr-node/signal/model';

const fruits = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'apricot', label: 'Apricot', disabled: true },
	{ value: 'banana', label: 'Banana' },
	{ value: 'blueberry', label: 'Blueberry' },
	{ value: 'cherry', label: 'Cherry' },
];

describe('Collection', () => {
	it('reads key, label and disabled from plain strings and from described objects', () => {
		const plain = new Collection({ items: ['red', 'green'] });
		expect(plain.keys()).toEqual(['red', 'green']);
		expect(plain.label('green')).toBe('green');
		const described = new Collection({ items: fruits });
		expect(described.label('banana')).toBe('Banana');
		expect(described.isSelectable('apricot')).toBe(false);
		expect(described.enabledKeys()).toEqual(['apple', 'banana', 'blueberry', 'cherry']);
	});

	it('accepts custom accessors and follows a reactive item list', () => {
		const people = signal([{ code: 7, name: 'Ana' }]);
		const collection = new Collection({ items: people, key: (person) => person.code, label: (person) => person.name });
		expect(collection.get(7)?.label).toBe('Ana');
		people.set([...people(), { code: 9, name: 'Bia' }]);
		expect(collection.keys()).toEqual([7, 9]);
	});

	it('steps over disabled items, with and without wrapping', () => {
		const collection = new Collection({ items: fruits });
		expect(collection.after('apple', false)).toBe('banana');
		expect(collection.before('banana', false)).toBe('apple');
		expect(collection.after('cherry', false)).toBeUndefined();
		expect(collection.after('cherry', true)).toBe('apple');
		expect(collection.after(undefined, false)).toBe('apple');
		expect(collection.before(undefined, false)).toBe('cherry');
	});
});

describe('Navigation', () => {
	it('refuses disabled or unknown keys and forgets an active key that disappears', () => {
		const items = signal(fruits);
		const navigation = new Navigation(new Collection({ items }));
		expect(navigation.setActive('apricot')).toBe(false);
		expect(navigation.setActive('banana')).toBe(true);
		items.set(fruits.filter((fruit) => fruit.value !== 'banana'));
		expect(navigation.active()).toBeUndefined();
	});

	it('moves to the first item from nothing and stops at the ends without wrap', () => {
		const navigation = new Navigation(new Collection({ items: fruits }), { wrap: false });
		navigation.next();
		expect(navigation.active()).toBe('apple');
		navigation.last();
		expect(navigation.next()).toBe(false);
		expect(navigation.active()).toBe('cherry');
	});

	it('types ahead: accumulates characters in a short window and cycles on a repeated letter', () => {
		let now = 0;
		const navigation = new Navigation(new Collection({ items: fruits }), { now: () => now });
		navigation.typeahead('b');
		expect(navigation.active()).toBe('banana');
		now += 100;
		navigation.typeahead('l');
		expect(navigation.active()).toBe('blueberry');
		now += 1000;
		navigation.typeahead('b');
		expect(navigation.active()).toBe('banana');
		now += 100;
		navigation.typeahead('b');
		expect(navigation.active()).toBe('blueberry');
		now += 1000;
		navigation.typeahead('a');
		expect(navigation.active()).toBe('apple');
	});
});
