import { describe, it, expect } from 'vitest';
import { sort } from '@ts/composables/sort/model';

describe('sort', () => {
	it('starts with no active key and the default direction', () => {
		const s = sort<string>();
		expect(s.key()).toBeUndefined();
		expect(s.direction()).toBe('ASC');
	});

	it('honors initialKey/initialDirection', () => {
		const s = sort<string>({ initialKey: 'name', initialDirection: 'DESC' });
		expect(s.key()).toBe('name');
		expect(s.direction()).toBe('DESC');
	});
});

describe('sort.toggle', () => {
	it('picking a new key activates it at the default direction', () => {
		const s = sort<string>();
		s.toggle('name');
		expect(s.key()).toBe('name');
		expect(s.direction()).toBe('ASC');
	});

	it('toggling the same key flips the direction back and forth', () => {
		const s = sort<string>();
		s.toggle('name');
		s.toggle('name');
		expect(s.direction()).toBe('DESC');
		s.toggle('name');
		expect(s.direction()).toBe('ASC');
	});

	it('switching to a different key resets to the initial direction', () => {
		const s = sort<string>({ initialDirection: 'ASC' });
		s.toggle('name');
		s.toggle('name'); // now DESC
		s.toggle('date'); // different key
		expect(s.key()).toBe('date');
		expect(s.direction()).toBe('ASC');
	});
});

describe('sort.clear', () => {
	it('resets to no active key and the initial direction', () => {
		const s = sort<string>({ initialDirection: 'DESC' });
		s.toggle('name');
		s.toggle('name');
		s.clear();
		expect(s.key()).toBeUndefined();
		expect(s.direction()).toBe('DESC');
	});
});
