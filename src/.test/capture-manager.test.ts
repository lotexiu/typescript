import { describe, expect, it } from 'vitest';
import { CaptureManager } from '@ts/capture-manager/model';

class TestManager extends CaptureManager<(value: number) => void> {
	startCalls = 0;
	stopCalls = 0;
	private lastId = 0;

	protected start(): void { this.startCalls++; }
	protected stop(): void { this.stopCalls++; }

	protected register(value: (v: number) => void) {
		const id = this.lastId++;
		this.callbackMap.set(id, value);
		return id;
	}

	protected unRegister(id: number): void {
		this.callbackMap.delete(id);
	}

	dispatch(value: number) {
		for (const fn of this.callbacks()) fn(value);
	}
}

describe('CaptureManager', () => {
	it('starts uncaptured and activates start() only on the first subscriber', () => {
		const manager = new TestManager();
		expect(manager.capture).toBe(false);

		manager.add(() => {});
		expect(manager.capture).toBe(true);
		expect(manager.startCalls).toBe(1);
	});

	it('does not call start() again for additional subscribers', () => {
		const manager = new TestManager();
		manager.add(() => {});
		manager.add(() => {});

		expect(manager.startCalls).toBe(1);
	});

	it('calls stop() only when the last subscriber unsubscribes', () => {
		const manager = new TestManager();
		const unsubscribeA = manager.add(() => {});
		const unsubscribeB = manager.add(() => {});

		unsubscribeA();
		expect(manager.stopCalls).toBe(0);
		expect(manager.capture).toBe(true);

		unsubscribeB();
		expect(manager.stopCalls).toBe(1);
		expect(manager.capture).toBe(false);
	});

	it('dispatches to every registered callback', () => {
		const manager = new TestManager();
		const seenA: number[] = [];
		const seenB: number[] = [];
		manager.add((v) => seenA.push(v));
		manager.add((v) => seenB.push(v));

		manager.dispatch(42);

		expect(seenA).toEqual([42]);
		expect(seenB).toEqual([42]);
	});

	it('has()/hasCallbacks() reflect registration state', () => {
		const manager = new TestManager();
		expect(manager.hasCallbacks()).toBe(false);

		const unsubscribe = manager.add(() => {});
		expect(manager.has(0)).toBe(true);
		expect(manager.hasCallbacks()).toBe(true);

		unsubscribe();
		expect(manager.hasCallbacks()).toBe(false);
	});

	it('get() returns an existing value or lazily stores the default', () => {
		const manager = new TestManager();
		const fallback = () => {};

		const first = manager.get(99, fallback);
		expect(first).toBe(fallback);
		expect(manager.has(99)).toBe(true);

		const other = () => {};
		const second = manager.get(99, other);
		expect(second).toBe(fallback);
	});
});
