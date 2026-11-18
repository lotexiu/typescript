import { describe, it, expect, vi } from 'vitest';
import { Menu } from '@ts/headless/menu/model';
import { LayerStack } from '@ts/headless/layer/model';

const actions = [
	{ value: 'new', label: 'New file' },
	{ value: 'open', label: 'Open…' },
	{ value: 'save', label: 'Save', disabled: true },
	{ value: 'quit', label: 'Quit' },
];

describe('Menu', () => {
	it('opens from the trigger with the first or the last item highlighted', () => {
		const menu = new Menu({ items: actions, layers: new LayerStack() });
		menu.keydown({ key: 'ArrowUp' });
		expect(menu.value()).toBe(true);
		expect(menu.navigation.active()).toBe('quit');
		menu.hide();
		menu.keydown({ key: 'Enter' });
		expect(menu.navigation.active()).toBe('new');
	});

	it('activates the highlighted item, calls onAction and closes', () => {
		const onAction = vi.fn();
		const menu = new Menu({ items: actions, onAction, layers: new LayerStack() });
		menu.show();
		menu.keydown({ key: 'ArrowDown' });
		menu.keydown({ key: 'ArrowDown' });
		expect(menu.navigation.active()).toBe('quit');
		menu.keydown({ key: 'Enter' });
		expect(onAction).toHaveBeenCalledWith('quit', actions[3]);
		expect(menu.lastAction()).toBe('quit');
		expect(menu.value()).toBe(false);
	});

	it('ignores disabled items, jumps by typing and stays open when closeOnAction is false', () => {
		const menu = new Menu({ items: actions, closeOnAction: false, layers: new LayerStack() });
		menu.show();
		expect(menu.activate('save')).toBe(false);
		menu.keydown({ key: 'o' });
		expect(menu.navigation.active()).toBe('open');
		menu.activate('open');
		expect(menu.value()).toBe(true);
	});

	it('closes on Tab without preventing the focus move', () => {
		const menu = new Menu({ items: actions, layers: new LayerStack() });
		menu.show();
		expect(menu.keydown({ key: 'Tab' })).toBe(false);
		expect(menu.value()).toBe(false);
	});

	it('describes trigger, menu and items', () => {
		const menu = new Menu({ items: actions, id: 'file', layers: new LayerStack() });
		menu.show();
		expect(menu.parts.trigger()).toMatchObject({ 'aria-haspopup': 'menu', 'aria-expanded': 'true', 'aria-controls': 'file-menu' });
		expect(menu.parts.menu()).toMatchObject({ role: 'menu', 'aria-labelledby': 'file', 'aria-activedescendant': 'file-item-0' });
		expect(menu.parts.item('save')).toMatchObject({ role: 'menuitem', 'aria-disabled': 'true' });
	});
});

describe('Menu typing', () => {
	it('infers the key from the items even with an untyped onAction', () => {
		const received: string[] = [];
		const menu = new Menu({ items: [{ value: 'copy', label: 'Copy' }], onAction: (key) => received.push(key), layers: new LayerStack() });
		menu.show();
		menu.activate('copy');
		expect(received).toEqual(['copy']);
	});
});
