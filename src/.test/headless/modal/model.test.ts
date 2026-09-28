import { describe, it, expect, vi } from 'vitest';
import { modal } from '@ts/headless/modal/model';

describe('modal.show / requestClose', () => {
	it('starts closed', () => {
		const m = modal();
		expect(m.open()).toBe(false);
	});

	it('show() opens it and requestClose() closes it', () => {
		const m = modal();
		m.show();
		expect(m.open()).toBe(true);
		m.requestClose();
		expect(m.open()).toBe(false);
	});

	it('requestClose() returns true when it actually closes', () => {
		const m = modal();
		m.show();
		expect(m.requestClose()).toBe(true);
	});
});

describe('modal.contentVisible', () => {
	it('turns true immediately on show()', () => {
		const m = modal({ exitDelay: 100 });
		m.show();
		expect(m.contentVisible()).toBe(true);
	});

	it('stays true right after requestClose() and only turns false once `exitDelay` elapses', () => {
		vi.useFakeTimers();
		const m = modal({ exitDelay: 100 });
		m.show();
		m.requestClose();
		expect(m.open()).toBe(false);
		expect(m.contentVisible()).toBe(true);
		vi.advanceTimersByTime(100);
		expect(m.contentVisible()).toBe(false);
		vi.useRealTimers();
	});

	it('turns false synchronously when `exitDelay` is 0 (the default)', () => {
		const m = modal();
		m.show();
		m.requestClose();
		expect(m.contentVisible()).toBe(false);
	});

	it('re-opening before `exitDelay` elapses cancels the pending hide', () => {
		vi.useFakeTimers();
		const m = modal({ exitDelay: 100 });
		m.show();
		m.requestClose();
		vi.advanceTimersByTime(50);
		m.show();
		vi.advanceTimersByTime(100);
		expect(m.contentVisible()).toBe(true);
		vi.useRealTimers();
	});
});

describe('modal.beforeClose', () => {
	it('vetoes the close when it returns false, leaving `open` unchanged', () => {
		const m = modal({ beforeClose: () => false });
		m.show();
		expect(m.requestClose()).toBe(false);
		expect(m.open()).toBe(true);
	});

	it('allows the close when it returns anything else', () => {
		const m = modal({ beforeClose: () => undefined });
		m.show();
		expect(m.requestClose()).toBe(true);
		expect(m.open()).toBe(false);
	});

	it('receives the close reason passed to requestClose()', () => {
		const beforeClose = vi.fn(() => true);
		const m = modal({ beforeClose });
		m.show();
		m.requestClose('escape');
		expect(beforeClose).toHaveBeenCalledWith('escape');
	});

	it('defaults the reason to "programmatic" when none is given', () => {
		const beforeClose = vi.fn(() => true);
		const m = modal({ beforeClose });
		m.show();
		m.requestClose();
		expect(beforeClose).toHaveBeenCalledWith('programmatic');
	});
});

describe('modal.closeOnBackdrop', () => {
	it('defaults to true and can be overridden at creation', () => {
		expect(modal().closeOnBackdrop()).toBe(true);
		expect(modal({ closeOnBackdrop: false }).closeOnBackdrop()).toBe(false);
	});
});
