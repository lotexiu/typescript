import { describe, it, expect } from 'vitest';
import { Combobox } from '@ts/headless/combobox/model';
import { ComboboxUtils } from '@ts/headless/combobox/utils';
import { LayerStack } from '@ts/headless/layer/model';

const cities = [
	{ value: 'sp', label: 'São Paulo' },
	{ value: 'rj', label: 'Rio de Janeiro' },
	{ value: 'sa', label: 'Salvador' },
	{ value: 'bh', label: 'Belo Horizonte', disabled: true },
];

function create(options: Partial<ConstructorParameters<typeof Combobox<(typeof cities)[number]>>[0]> = {}) {
	return new Combobox({ items: cities, layers: new LayerStack(), id: 'city', ...options });
}

describe('ComboboxUtils', () => {
	it('matches ignoring case and accents', () => {
		expect(ComboboxUtils.contains('São Paulo', 'sao')).toBe(true);
		expect(ComboboxUtils.contains('São Paulo', 'PAUL')).toBe(true);
		expect(ComboboxUtils.startsWith('São Paulo', 'paulo')).toBe(false);
	});
});

describe('Combobox', () => {
	it('filters while typing, highlights the first match and chooses with Enter', () => {
		const city = create();
		city.input('sa');
		expect(city.open()).toBe(true);
		expect(city.collection.keys()).toEqual(['sp', 'sa']);
		expect(city.navigation.active()).toBe('sp');
		city.keydown({ key: 'ArrowDown' });
		city.keydown({ key: 'Enter' });
		expect(city.value()).toBe('sa');
		expect(city.inputValue()).toBe('Salvador');
		expect(city.open()).toBe(false);
	});

	it('shows every option again when reopened after a choice', () => {
		const city = create({ value: 'rj' });
		expect(city.inputValue()).toBe('Rio de Janeiro');
		city.keydown({ key: 'ArrowDown' });
		expect(city.collection.size()).toBe(4);
		expect(city.navigation.active()).toBe('rj');
	});

	it('puts the chosen label back on commit unless custom values are allowed', () => {
		const city = create({ value: 'sp' });
		city.input('xyz');
		expect(city.empty()).toBe(true);
		city.commit();
		expect(city.inputValue()).toBe('São Paulo');
		const free = create({ allowCustomValue: true });
		free.input('Curitiba');
		free.commit();
		expect(free.inputValue()).toBe('Curitiba');
		expect(free.value()).toBeUndefined();
	});

	it('closes on the first Escape and clears on the second', () => {
		const city = create({ value: 'sp' });
		city.show();
		city.keydown({ key: 'Escape' });
		expect(city.open()).toBe(false);
		city.keydown({ key: 'Escape' });
		expect(city.value()).toBeUndefined();
		expect(city.inputValue()).toBe('');
	});

	it('follows a value set from outside', () => {
		const city = create();
		city.set('rj');
		expect(city.inputValue()).toBe('Rio de Janeiro');
	});

	it('describes input, listbox and options', () => {
		const city = create();
		city.input('rio');
		expect(city.parts.input()).toMatchObject({ role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'true', 'aria-controls': 'city-listbox', 'aria-activedescendant': 'city-item-0' });
		expect(city.parts.option('rj')).toMatchObject({ role: 'option', 'data-highlighted': '' });
	});
});
