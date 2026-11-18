import { describe, it, expect } from 'vitest';
import { sort } from '@ts/composables/sort/model';

describe('sort', () => {
	it('starts with no active key and the default direction', () => {
		const sorter = sort<string>();
		expect(sorter.key()).toBeUndefined();
		expect(sorter.direction()).toBe('ASC');
	});

	it('honors initialKey/initialDirection', () => {
		const sorter = sort<string>({ initialKey: 'name', initialDirection: 'DESC' });
		expect(sorter.key()).toBe('name');
		expect(sorter.direction()).toBe('DESC');
	});
});

describe('sort.toggle', () => {
	it('picking a new key activates it at the default direction', () => {
		const sorter = sort<string>();
		sorter.toggle('name');
		expect(sorter.key()).toBe('name');
		expect(sorter.direction()).toBe('ASC');
	});

	it('toggling the same key flips the direction back and forth', () => {
		const sorter = sort<string>();
		sorter.toggle('name');
		sorter.toggle('name');
		expect(sorter.direction()).toBe('DESC');
		sorter.toggle('name');
		expect(sorter.direction()).toBe('ASC');
	});

	it('switching to a different key resets to the initial direction', () => {
		const sorter = sort<string>({ initialDirection: 'ASC' });
		sorter.toggle('name');
		sorter.toggle('name'); // now DESC
		sorter.toggle('date'); // different key
		expect(sorter.key()).toBe('date');
		expect(sorter.direction()).toBe('ASC');
	});
});

describe('sort.clear', () => {
	it('resets to no active key and the initial direction', () => {
		const sorter = sort<string>({ initialDirection: 'DESC' });
		sorter.toggle('name');
		sorter.toggle('name');
		sorter.clear();
		expect(sorter.key()).toBeUndefined();
		expect(sorter.direction()).toBe('DESC');
	});
});
