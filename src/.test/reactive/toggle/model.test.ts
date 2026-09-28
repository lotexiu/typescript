import { describe, it, expect } from 'vitest';
import { toggle, Toggle } from '@tsr/toggle/model';
import { Signal } from '@tsr-node/signal/model';

describe('toggle', () => {
	it('defaults to false', () => {
		const t = toggle();
		expect(t()).toBe(false);
	});

	it('accepts an initial value', () => {
		const t = toggle(true);
		expect(t()).toBe(true);
	});

	it('is a real Signal (reads/writes through the underlying node)', () => {
		const t = toggle();
		expect(t instanceof Signal).toBe(true);
		t.set(true);
		expect(t()).toBe(true);
	});

	it('is recognized by `instanceof Toggle`', () => {
		const t = toggle();
		expect(t instanceof Toggle).toBe(true);
		expect(signalLike() instanceof Toggle).toBe(false);
		function signalLike() {
			// a plain Signal, not a Toggle
			return Object.assign(() => false, { set: () => true });
		}
	});
});

describe('toggle.on / off / toggle', () => {
	it('on() sets the value to true', () => {
		const t = toggle();
		t.on();
		expect(t()).toBe(true);
	});

	it('off() sets the value to false', () => {
		const t = toggle(true);
		t.off();
		expect(t()).toBe(false);
	});

	it('toggle() flips the current value', () => {
		const t = toggle();
		t.toggle();
		expect(t()).toBe(true);
		t.toggle();
		expect(t()).toBe(false);
	});

	it('shares the same on/off/toggle function reference across instances (no per-instance closures)', () => {
		const a = toggle();
		const b = toggle();
		expect(a.on).toBe(b.on);
		expect(a.off).toBe(b.off);
		expect(a.toggle).toBe(b.toggle);
	});
});

describe('toggle reactivity', () => {
	it('notifies subscribers when on()/off()/toggle() change the state', () => {
		const t = toggle();
		const seen: boolean[] = [];
		t.subscribe((v) => seen.push(v));
		t.on();
		t.off();
		t.toggle();
		expect(seen).toEqual([true, false, true]);
	});
});
