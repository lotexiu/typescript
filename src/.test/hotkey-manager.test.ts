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

function fakeKeyboardEvent(type: 'keydown' | 'keyup', code: string, target: any = null) {
	let prevented = false;
	return {
		type, key: code, code, target,
		preventDefault: () => { prevented = true; },
		get defaultPrevented() { return prevented; },
	};
}

function fakeMouseEvent(type: 'mousemove' | 'mousedown' | 'mouseup', options: { button?: number; target?: any } = {}) {
	let prevented = false;
	return {
		type,
		button: options.button ?? 0,
		clientX: 0,
		clientY: 0,
		target: options.target ?? null,
		preventDefault: () => { prevented = true; },
		get defaultPrevented() { return prevented; },
	};
}

// A distância até o alvo (getDistanceToTarget) exige `target instanceof Node`;
// sem isso ela sempre devolve Infinity para todo mundo, o que na prática
// ainda deixa o(s) hotkey(s) cadastrados prontos pra disparar (todos empatam
// em "igualmente inalcançáveis"). Isso cobre o caso comum de um hotkey só;
// a priorização por proximidade real no DOM (múltiplos elementos) não está
// coberta aqui — precisaria de um mock mais profundo de Node/parentNode.
describe('hotkey', () => {
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

	it('triggers when the registered key combo is pressed', async () => {
		const { hotkey } = await import('@ts/html/managers/hotkey/model');
		const trigger = vi.fn();
		hotkey.add({ combos: [['KeyA']], trigger });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));

		expect(trigger).toHaveBeenCalledTimes(1);
		const match = trigger.mock.calls[0][0];
		expect(match.isKeyboardEvent).toBe(true);
		expect(match.combo).toEqual(['KeyA']);
	});

	it('does not trigger for a different, unregistered combo', async () => {
		const { hotkey } = await import('@ts/html/managers/hotkey/model');
		const trigger = vi.fn();
		hotkey.add({ combos: [['KeyA']], trigger });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyB'));

		expect(trigger).not.toHaveBeenCalled();
	});

	it('matches a combo across keyboard + mouse together', async () => {
		const { hotkey } = await import('@ts/html/managers/hotkey/model');
		const trigger = vi.fn();
		hotkey.add({ combos: [['ControlLeft', 'MouseLeft']], trigger });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'ControlLeft'));
		fakeDocument.fire('mousedown', fakeMouseEvent('mousedown', { button: 0 }));

		expect(trigger).toHaveBeenCalledTimes(1);
	});

	it('calls untrigger once the combo stops being satisfied', async () => {
		const { hotkey } = await import('@ts/html/managers/hotkey/model');
		const trigger = vi.fn();
		const untrigger = vi.fn();
		hotkey.add({ combos: [['KeyA']], trigger, untrigger });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));
		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyB'));

		expect(untrigger).toHaveBeenCalledTimes(1);
	});

	it('returning false from trigger stops lower-priority hotkeys for that combo', async () => {
		const { hotkey } = await import('@ts/html/managers/hotkey/model');
		const first = vi.fn(() => false);
		const second = vi.fn();
		hotkey.add({ combos: [['KeyA']], trigger: first });
		hotkey.add({ combos: [['KeyA']], trigger: second });

		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));

		expect(first).toHaveBeenCalledTimes(1);
	});

	it('unsubscribing removes the hotkey from future matches', async () => {
		const { hotkey } = await import('@ts/html/managers/hotkey/model');
		const trigger = vi.fn();
		const unsubscribe = hotkey.add({ combos: [['KeyA']], trigger });

		unsubscribe();
		fakeDocument.fire('keydown', fakeKeyboardEvent('keydown', 'KeyA'));

		expect(trigger).not.toHaveBeenCalled();
	});
});
