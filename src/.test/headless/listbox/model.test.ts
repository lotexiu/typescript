import { describe, it, expect } from 'vitest';
import { Listbox } from '@ts/headless/listbox/model';
import { Select } from '@ts/headless/select/model';
import { RadioGroup } from '@ts/headless/radio-group/model';
import { Tabs } from '@ts/headless/tabs/model';

const sizes = [
	{ value: 'small', label: 'Small' },
	{ value: 'medium', label: 'Medium', disabled: true },
	{ value: 'large', label: 'Large' },
];

describe('Listbox', () => {
	it('selects one key at a time in single mode, from the keyboard', () => {
		const listbox = new Listbox({ items: sizes, id: 'size' });
		listbox.keydown({ key: 'ArrowDown' });
		listbox.keydown({ key: 'Enter' });
		expect(listbox.value()).toEqual(['small']);
		listbox.keydown({ key: 'ArrowDown' });
		expect(listbox.navigation.active()).toBe('large');
		listbox.keydown({ key: ' ' });
		expect(listbox.value()).toEqual(['large']);
		expect(listbox.parts.root()['aria-activedescendant']).toBe('size-item-2');
	});

	it('toggles keys in multiple mode and selects every enabled key with ctrl+a', () => {
		const listbox = new Listbox({ items: sizes, selectionMode: 'multiple' });
		listbox.press('small');
		listbox.press('large');
		listbox.press('small');
		expect(listbox.value()).toEqual(['large']);
		listbox.keydown({ key: 'a', ctrlKey: true });
		expect(listbox.value()).toEqual(['small', 'large']);
		expect(listbox.selectedItems().map((size) => size.label)).toEqual(['Small', 'Large']);
		expect(listbox.parts.root()['aria-multiselectable']).toBe('true');
	});

	it('refuses to empty the selection when disallowEmpty is set and ignores disabled options', () => {
		const listbox = new Listbox({ items: sizes, value: ['small'], disallowEmpty: true, selectionMode: 'multiple' });
		listbox.press('small');
		expect(listbox.value()).toEqual(['small']);
		expect(listbox.press('medium')).toBe(false);
	});

	it('describes each option', () => {
		const listbox = new Listbox({ items: sizes, value: ['large'] });
		listbox.hover('small');
		expect(listbox.parts.option('small')).toMatchObject({ role: 'option', 'aria-selected': 'false', 'data-highlighted': '' });
		expect(listbox.parts.option('medium')).toMatchObject({ 'aria-disabled': 'true', 'data-disabled': '' });
		expect(listbox.parts.option('large')).toMatchObject({ 'aria-selected': 'true', 'data-state': 'selected' });
	});
});

describe('Select', () => {
	it('opens on ArrowDown highlighting the selected option, chooses with Enter and closes', () => {
		const select = new Select({ items: sizes, value: 'large' });
		expect(select.keydown({ key: 'ArrowDown' })).toBe(true);
		expect(select.open()).toBe(true);
		expect(select.navigation.active()).toBe('large');
		select.keydown({ key: 'ArrowUp' });
		select.keydown({ key: 'Enter' });
		expect(select.value()).toBe('small');
		expect(select.open()).toBe(false);
		expect(select.selectedLabel()).toBe('Small');
	});

	it('closes with Escape without changing the value', () => {
		const select = new Select({ items: sizes, value: 'small' });
		select.show();
		select.keydown({ key: 'End' });
		select.keydown({ key: 'Escape' });
		expect(select.value()).toBe('small');
		expect(select.open()).toBe(false);
	});

	it('opens and jumps to a match when typing on the closed trigger', () => {
		const select = new Select({ items: sizes });
		select.keydown({ key: 'l' });
		expect(select.open()).toBe(true);
		expect(select.navigation.active()).toBe('large');
	});

	it('chooses the highlighted option on Tab but lets the focus move', () => {
		const select = new Select({ items: sizes });
		select.show();
		expect(select.keydown({ key: 'Tab' })).toBe(false);
		expect(select.value()).toBe('small');
		expect(select.open()).toBe(false);
	});

	it('links label, trigger and listbox', () => {
		const select = new Select({ items: sizes, id: 'size' });
		expect(select.parts.trigger()).toMatchObject({ role: 'combobox', 'aria-controls': 'size-listbox', 'aria-labelledby': 'size-label size', 'aria-expanded': 'false', 'data-placeholder': '' });
		expect(select.parts.listbox()).toMatchObject({ id: 'size-listbox', role: 'listbox', hidden: '' });
		select.show();
		expect(select.parts.trigger()['aria-activedescendant']).toBe('size-item-0');
	});
});

describe('RadioGroup', () => {
	it('moves the selection with the arrows, skipping disabled radios and wrapping', () => {
		const group = new RadioGroup({ items: sizes, value: 'small' });
		group.keydown({ key: 'ArrowRight' });
		expect(group.value()).toBe('large');
		group.keydown({ key: 'ArrowDown' });
		expect(group.value()).toBe('small');
	});

	it('keeps exactly one radio in the tab order', () => {
		const group = new RadioGroup({ items: sizes });
		expect(group.parts.item('small').tabindex).toBe(0);
		expect(group.parts.item('large').tabindex).toBe(-1);
		group.choose('large');
		expect(group.parts.item('large')).toMatchObject({ tabindex: 0, 'aria-checked': 'true', 'data-state': 'checked' });
		expect(group.parts.item('small').tabindex).toBe(-1);
	});
});

describe('Tabs', () => {
	const sections = ['general', 'colors', 'about'];

	it('selects the first tab by default and follows the focus in automatic mode', () => {
		const tabs = new Tabs({ items: sections, id: 'settings' });
		expect(tabs.selected()).toBe('general');
		tabs.keydown({ key: 'ArrowRight' });
		expect(tabs.selected()).toBe('colors');
		expect(tabs.parts.tab('colors')).toMatchObject({ 'aria-selected': 'true', 'aria-controls': 'settings-panel-1', tabindex: 0 });
		expect(tabs.parts.panel('colors')).toMatchObject({ role: 'tabpanel', 'aria-labelledby': 'settings-item-1' });
		expect(tabs.parts.panel('general').hidden).toBe('');
	});

	it('only moves the focus in manual mode until Enter', () => {
		const tabs = new Tabs({ items: sections, activation: 'manual' });
		tabs.keydown({ key: 'End' });
		expect(tabs.selected()).toBe('general');
		expect(tabs.navigation.active()).toBe('about');
		tabs.keydown({ key: 'Enter' });
		expect(tabs.selected()).toBe('about');
	});
});
