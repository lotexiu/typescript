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

function fakeMouseEvent(type: 'mousemove' | 'mousedown' | 'mouseup', options: { button?: number; x?: number; y?: number } = {}) {
	let prevented = false;
	return {
		type,
		button: options.button ?? 0,
		clientX: options.x ?? 0,
		clientY: options.y ?? 0,
		target: null,
		preventDefault: () => { prevented = true; },
		get defaultPrevented() { return prevented; },
	};
}

describe('mouseManager', () => {
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

	it('reports mousemove with coord.current and marks buttonsChanged=false', async () => {
		const { mouseManager } = await import('@ts/html/managers/mouse/model');
		let received: any;
		mouseManager.add((value) => { received = value; });

		fakeDocument.fire('mousemove', fakeMouseEvent('mousemove', { x: 10, y: 20 }));

		expect(received.isMove).toBe(true);
		expect(received.coord.x.current).toBe(10);
		expect(received.coord.y.current).toBe(20);
		expect(received.buttonsChanged).toBe(false);
	});

	it('maps mousedown to a named button and marks buttonsChanged=true', async () => {
		const { mouseManager } = await import('@ts/html/managers/mouse/model');
		let received: any;
		mouseManager.add((value) => { received = value; });

		fakeDocument.fire('mousedown', fakeMouseEvent('mousedown', { button: 0 }));

		expect(received.isMove).toBe(false);
		expect(received.buttons.current).toEqual(['MouseLeft']);
		expect(received.buttonsChanged).toBe(true);
	});

	it('mouseup removes the button from buttons.current and keeps it in previous', async () => {
		const { mouseManager } = await import('@ts/html/managers/mouse/model');
		let received: any;
		mouseManager.add((value) => { received = value; });

		fakeDocument.fire('mousedown', fakeMouseEvent('mousedown', { button: 2 }));
		fakeDocument.fire('mouseup', fakeMouseEvent('mouseup', { button: 2 }));

		expect(received.buttons.current).toEqual([]);
		expect(received.buttons.previous).toEqual(['MouseRight']);
	});

	it('clears pressed buttons on window blur, starting the next move fresh', async () => {
		const { mouseManager } = await import('@ts/html/managers/mouse/model');
		let received: any;
		mouseManager.add((value) => { received = value; });

		fakeDocument.fire('mousedown', fakeMouseEvent('mousedown', { button: 0, x: 5, y: 5 }));
		fakeWindow.fire('blur', {});
		fakeDocument.fire('mousemove', fakeMouseEvent('mousemove', { x: 50, y: 50 }));

		expect(received.buttons.current).toEqual([]);
		// prevX/prevY também resetam pra -1 no blur: a próxima leitura de
		// coordenada não deve "lembrar" de antes da perda de foco.
		expect(received.coord.x.previous).toBe(-1);
	});

	it('detaches real listeners once the last subscriber unsubscribes', async () => {
		const { mouseManager } = await import('@ts/html/managers/mouse/model');
		const fn = vi.fn();
		const unsubscribe = mouseManager.add(fn);

		unsubscribe();
		fakeDocument.fire('mousemove', fakeMouseEvent('mousemove'));

		expect(fn).not.toHaveBeenCalled();
	});
});
