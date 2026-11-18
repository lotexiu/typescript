import { describe, it, expect } from 'vitest';
import { Dialog } from '@ts/headless/dialog/model';
import { Popover } from '@ts/headless/popover/model';
import { Menu } from '@ts/headless/menu/model';
import { LayerStack } from '@ts/headless/layer/model';
import { signal } from '@tsr-node/signal/model';

function keyEvent(key: string) {
	const event = {
		key,
		defaultPrevented: false,
		preventDefault() {
			event.defaultPrevented = true;
		},
	};
	return event;
}

describe('LayerStack', () => {
	it('keeps the open order and follows a reactive open state', () => {
		const layers = new LayerStack();
		const open = signal(false);
		const stop = layers.track('menu', open);
		layers.push('dialog');
		open.set(true);
		expect(layers.layers()).toEqual(['dialog', 'menu']);
		expect(layers.isTop('menu')).toBe(true);
		stop();
		expect(layers.top()).toBe('dialog');
	});
});

describe('Dialog', () => {
	it('links trigger, content, title and description', () => {
		const dialog = new Dialog({ id: 'confirm', role: 'alertdialog', layers: new LayerStack() });
		expect(dialog.parts.trigger()).toMatchObject({ 'aria-haspopup': 'dialog', 'aria-controls': 'confirm-content', 'aria-expanded': 'false' });
		dialog.show();
		expect(dialog.parts.content()).toMatchObject({
			role: 'alertdialog',
			'aria-modal': 'true',
			'aria-labelledby': 'confirm-title',
			'aria-describedby': 'confirm-description',
			'data-state': 'open',
			'data-top': '',
		});
		expect(dialog.parts.title().id).toBe('confirm-title');
	});

	it('closes on Escape, but not on a click outside while modal', () => {
		const dialog = new Dialog({ value: true, layers: new LayerStack() });
		expect(dialog.interactOutside()).toBe(false);
		expect(dialog.keydown(keyEvent('Escape'))).toBe(true);
		expect(dialog.value()).toBe(false);
		expect(dialog.lastDismiss()).toBe('escape');
	});

	it('only lets the topmost overlay react, so Escape in a menu does not close the dialog around it', () => {
		const layers = new LayerStack();
		const dialog = new Dialog({ value: true, layers });
		const menu = new Menu({ items: ['copy', 'paste'], layers });
		menu.show();
		expect(dialog.isTop()).toBe(false);
		const escape = keyEvent('Escape');
		menu.keydown(escape);
		dialog.keydown(escape);
		expect(menu.value()).toBe(false);
		expect(dialog.value()).toBe(true);
		expect(dialog.keydown(keyEvent('Escape'))).toBe(true);
		expect(dialog.value()).toBe(false);
	});

	it('respects closeOnEscape and leaves the stack when disposed', () => {
		const layers = new LayerStack();
		const dialog = new Dialog({ value: true, closeOnEscape: false, layers });
		expect(dialog.dismiss('escape')).toBe(false);
		dialog.dispose();
		expect(layers.layers()).toEqual([]);
	});
});

describe('Popover', () => {
	it('closes on a click outside and keeps the computed position', () => {
		const popover = new Popover({ placement: 'bottom-start', offset: 4, layers: new LayerStack() });
		popover.show();
		const result = popover.place({ x: 10, y: 10, width: 80, height: 30 }, { width: 120, height: 60 }, { x: 0, y: 0, width: 500, height: 500 });
		expect(result).toMatchObject({ x: 10, y: 44, side: 'bottom' });
		expect(popover.parts.content()).toMatchObject({ 'aria-modal': undefined, 'data-side': 'bottom', 'data-placement': 'bottom-start' });
		expect(popover.parts.trigger()['aria-haspopup']).toBe('true');
		expect(popover.interactOutside()).toBe(true);
		expect(popover.value()).toBe(false);
	});
});
