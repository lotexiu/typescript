import { describe, it, expect, vi } from 'vitest';
import { MouseState } from '@ts/state/mouse/model';

describe('MouseState.move', () => {
	it('updates the position', () => {
		const mouse = new MouseState<string>();
		mouse.move(10, 20);
		expect(mouse.position()).toEqual({ x: 10, y: 20 });
	});

	it('does not notify when moving to the same position', () => {
		const mouse = new MouseState<string>();
		mouse.move(10, 20);
		const listener = vi.fn();
		mouse.position.subscribe(listener);
		mouse.move(10, 20);
		expect(listener).not.toHaveBeenCalled();
	});

	it('notifies on an actual position change', () => {
		const mouse = new MouseState<string>();
		const listener = vi.fn();
		mouse.position.subscribe(listener);
		mouse.move(5, 5);
		expect(listener).toHaveBeenCalledWith({ x: 5, y: 5 });
	});
});

describe('MouseState.press / release / isPressed', () => {
	it('press() marks a button as pressed', () => {
		const mouse = new MouseState<'left' | 'right'>();
		mouse.press('left');
		expect(mouse.isPressed('left')).toBe(true);
		expect(mouse.isPressed('right')).toBe(false);
	});

	it('release() marks a button as no longer pressed', () => {
		const mouse = new MouseState<'left' | 'right'>();
		mouse.press('left');
		mouse.release('left');
		expect(mouse.isPressed('left')).toBe(false);
	});

	it('pressing an already-pressed button does not notify again', () => {
		const mouse = new MouseState<'left'>();
		const listener = vi.fn();
		mouse.buttons.subscribe(listener);
		mouse.press('left');
		mouse.press('left');
		expect(listener).toHaveBeenCalledOnce();
	});
});

describe('MouseState.combo / anyPressed', () => {
	it('combo lists every pressed button, sorted', () => {
		const mouse = new MouseState<'left' | 'right' | 'middle'>();
		mouse.press('right');
		mouse.press('left');
		expect(mouse.combo()).toEqual(['left', 'right']);
	});

	it('anyPressed reflects whether any button is down', () => {
		const mouse = new MouseState<'left'>();
		expect(mouse.anyPressed()).toBe(false);
		mouse.press('left');
		expect(mouse.anyPressed()).toBe(true);
	});
});

describe('MouseState.reset', () => {
	it('clears every pressed button but leaves position untouched', () => {
		const mouse = new MouseState<'left'>();
		mouse.move(1, 2);
		mouse.press('left');
		mouse.reset();
		expect(mouse.anyPressed()).toBe(false);
		expect(mouse.position()).toEqual({ x: 1, y: 2 });
	});
});
