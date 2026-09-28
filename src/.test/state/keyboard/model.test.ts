import { describe, it, expect, vi } from 'vitest';
import { KeyboardState } from '@ts/state/keyboard/model';

describe('KeyboardState.press / release / isPressed', () => {
	it('press() marks a key as pressed', () => {
		const kb = new KeyboardState<string>();
		kb.press('KeyA');
		expect(kb.isPressed('KeyA')).toBe(true);
	});

	it('release() marks a key as no longer pressed', () => {
		const kb = new KeyboardState<string>();
		kb.press('KeyA');
		kb.release('KeyA');
		expect(kb.isPressed('KeyA')).toBe(false);
	});

	it('pressing an already-pressed key does not notify again', () => {
		const kb = new KeyboardState<string>();
		const listener = vi.fn();
		kb.keys.subscribe(listener);
		kb.press('KeyA');
		kb.press('KeyA');
		expect(listener).toHaveBeenCalledOnce();
	});

	it('releasing a key that is not pressed does not notify', () => {
		const kb = new KeyboardState<string>();
		const listener = vi.fn();
		kb.keys.subscribe(listener);
		kb.release('KeyA');
		expect(listener).not.toHaveBeenCalled();
	});
});

describe('KeyboardState.combo / anyPressed', () => {
	it('combo lists every pressed key, sorted', () => {
		const kb = new KeyboardState<string>();
		kb.press('KeyB');
		kb.press('KeyA');
		expect(kb.combo()).toEqual(['KeyA', 'KeyB']);
	});

	it('anyPressed is true only while at least one key is down', () => {
		const kb = new KeyboardState<string>();
		expect(kb.anyPressed()).toBe(false);
		kb.press('KeyA');
		expect(kb.anyPressed()).toBe(true);
		kb.release('KeyA');
		expect(kb.anyPressed()).toBe(false);
	});
});

describe('KeyboardState.reset', () => {
	it('clears every pressed key', () => {
		const kb = new KeyboardState<string>();
		kb.press('KeyA');
		kb.press('KeyB');
		kb.reset();
		expect(kb.anyPressed()).toBe(false);
		expect(kb.combo()).toEqual([]);
	});

	it('is a no-op (no notification) when nothing is pressed', () => {
		const kb = new KeyboardState<string>();
		const listener = vi.fn();
		kb.keys.subscribe(listener);
		kb.reset();
		expect(listener).not.toHaveBeenCalled();
	});
});
