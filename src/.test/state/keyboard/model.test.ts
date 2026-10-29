import { describe, it, expect, vi } from 'vitest';
import { KeyboardState } from '@ts/state/keyboard/model';

describe('KeyboardState.press / release / isPressed', () => {
	it('press() marks a key as pressed', () => {
		const keyboard = new KeyboardState<string>();
		keyboard.press('KeyA');
		expect(keyboard.isPressed('KeyA')).toBe(true);
	});

	it('release() marks a key as no longer pressed', () => {
		const keyboard = new KeyboardState<string>();
		keyboard.press('KeyA');
		keyboard.release('KeyA');
		expect(keyboard.isPressed('KeyA')).toBe(false);
	});

	it('pressing an already-pressed key does not notify again', () => {
		const keyboard = new KeyboardState<string>();
		const listener = vi.fn();
		keyboard.keys.subscribe(listener);
		keyboard.press('KeyA');
		keyboard.press('KeyA');
		expect(listener).toHaveBeenCalledOnce();
	});

	it('releasing a key that is not pressed does not notify', () => {
		const keyboard = new KeyboardState<string>();
		const listener = vi.fn();
		keyboard.keys.subscribe(listener);
		keyboard.release('KeyA');
		expect(listener).not.toHaveBeenCalled();
	});
});

describe('KeyboardState.combo / anyPressed', () => {
	it('combo lists every pressed key, sorted', () => {
		const keyboard = new KeyboardState<string>();
		keyboard.press('KeyB');
		keyboard.press('KeyA');
		expect(keyboard.combo()).toEqual(['KeyA', 'KeyB']);
	});

	it('anyPressed is true only while at least one key is down', () => {
		const keyboard = new KeyboardState<string>();
		expect(keyboard.anyPressed()).toBe(false);
		keyboard.press('KeyA');
		expect(keyboard.anyPressed()).toBe(true);
		keyboard.release('KeyA');
		expect(keyboard.anyPressed()).toBe(false);
	});
});

describe('KeyboardState.reset', () => {
	it('clears every pressed key', () => {
		const keyboard = new KeyboardState<string>();
		keyboard.press('KeyA');
		keyboard.press('KeyB');
		keyboard.reset();
		expect(keyboard.anyPressed()).toBe(false);
		expect(keyboard.combo()).toEqual([]);
	});

	it('is a no-op (no notification) when nothing is pressed', () => {
		const keyboard = new KeyboardState<string>();
		const listener = vi.fn();
		keyboard.keys.subscribe(listener);
		keyboard.reset();
		expect(listener).not.toHaveBeenCalled();
	});
});
