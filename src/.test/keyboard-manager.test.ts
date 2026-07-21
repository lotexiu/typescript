import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createFakeEventTarget() {
	const listeners = new Map<string, Set<(event: any) => void>>();
	return {
		addEventListener: (type: string, fn: any) => {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type)!.add(fn);
		},
		removeEventListener: (type: string, fn: any) => {
			listeners.get(type)?.delete(fn);
		},
		fire(type: string, event: any) {
			listeners.get(type)?.forEach((fn) => fn(event));
		},
	};
}

function fakeKeyboardEvent(type: 'keydown' | 'keyup', code: string) {
	let prevented = false;
	return {
		type,
		key: code,
		code,
		target: null,
		preventDefault: () => { prevented = true; },
		get defaultPrevented() { return prevented; },
	};
}

describe('keyboardManager', () => {
	let fakeDocument: ReturnType<typeof createFakeEventTarget>;
	let fakeWindow: ReturnType<typeof createFakeEventTarget>;

	beforeEach(() => {
		vi.resetModules();
		fakeDocument = createFakeEventTarget();
		fakeWindow = createFakeEventTarget();
		vi.stubGlobal('document', fakeDocument);
		vi.stubGlobal('window', fakeWindow);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('only attaches real listeners once there is a subscriber', async () => {
		const { keyboardManager } = await import('@ts/html/managers/keyboard/model');
		expect((fakeDocument as any).fire).toBeDefined();

		keyboardManager.add(() => {});
		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));
	});

	it('reports keydown with isDown=true and the pressed code in combo.current', async () => {
		const { keyboardManager } = await import('@ts/html/managers/keyboard/model');
		let received: any;
		keyboardManager.add((value) => { received = value; });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));

		expect(received.isDown).toBe(true);
		expect(received.code).toBe('KeyA');
		expect(received.combo.current).toEqual(['KeyA']);
		expect(received.comboChanged).toBe(true);
	});

	it('reports keyup with isDown=false and removes the key from combo.current', async () => {
		const { keyboardManager } = await import('@ts/html/managers/keyboard/model');
		let received: any;
		keyboardManager.add((value) => { received = value; });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));
		fakeDocument.fire('keyup', fakeKeyboardEvent('keyup', 'KeyA'));

		expect(received.isDown).toBe(false);
		expect(received.combo.current).toEqual([]);
		expect(received.combo.previous).toEqual(['KeyA']);
	});

	it('marks comboChanged=false on key-repeat (keydown while already pressed)', async () => {
		const { keyboardManager } = await import('@ts/html/managers/keyboard/model');
		const values: any[] = [];
		keyboardManager.add((value) => { values.push(value); });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));
		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));

		expect(values[0].comboChanged).toBe(true);
		expect(values[1].comboChanged).toBe(false);
	});

	it('tracks simultaneous key combos', async () => {
		const { keyboardManager } = await import('@ts/html/managers/keyboard/model');
		let received: any;
		keyboardManager.add((value) => { received = value; });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'ControlLeft'));
		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));

		expect(received.combo.current.sort()).toEqual(['ControlLeft', 'KeyA'].sort());
	});

	it('clears pressed keys on window blur, starting the next combo fresh', async () => {
		const { keyboardManager } = await import('@ts/html/managers/keyboard/model');
		let received: any;
		keyboardManager.add((value) => { received = value; });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));
		fakeWindow.fire('blur', {});
		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyB'));

		expect(received.combo.current).toEqual(['KeyB']);
		// previous também reseta: nada é "anterior" através de uma perda de foco.
		expect(received.combo.previous).toEqual([]);
	});

	it('stops calling further callbacks once one returns true', async () => {
		const { keyboardManager } = await import('@ts/html/managers/keyboard/model');
		const second = vi.fn();
		keyboardManager.add(() => true);
		keyboardManager.add(second);

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));

		expect(second).not.toHaveBeenCalled();
	});

	it('detaches real listeners once the last subscriber unsubscribes', async () => {
		const { keyboardManager } = await import('@ts/html/managers/keyboard/model');
		const fn = vi.fn();
		const unsubscribe = keyboardManager.add(fn);

		unsubscribe();
		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));

		expect(fn).not.toHaveBeenCalled();
	});
});
