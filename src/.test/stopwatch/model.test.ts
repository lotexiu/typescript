import { describe, it, expect, vi, afterEach } from 'vitest';
import { StopWatch } from '@ts/stopwatch/model';

// Every call to StopWatch#lap() reads performance.now() twice: once to compute the elapsed
// lap time, once more to reset the clock for the next lap — both queued mocks per lap below
// use the same timestamp, since conceptually both reads happen at the same "now".
function mockNow(...values: number[]) {
	const spy = vi.spyOn(performance, 'now');
	for (const v of values) spy.mockImplementationOnce(() => v);
	return spy;
}

describe('StopWatch', () => {
	afterEach(() => vi.restoreAllMocks());

	it('throws when lap() is called before start()', () => {
		const sw = new StopWatch();
		expect(() => sw.lap()).toThrow();
	});

	it('current() reports elapsed time since start()', () => {
		mockNow(1000, 1500);
		const sw = new StopWatch();
		sw.start();
		expect(sw.current()).toBe(500);
	});

	it('start() resets the laps list', () => {
		mockNow(0, 100, 100);
		const sw = new StopWatch();
		sw.start();
		sw.lap();
		mockNow(0);
		sw.start();
		expect(sw.laps()).toEqual([]);
	});

	it('lap() records the elapsed time and resets the lap clock', () => {
		mockNow(0, 100, 100, 250, 250);
		const sw = new StopWatch();
		sw.start(); // startTime = 0
		sw.lap(); // current = 100 - 0 = 100, startTime reset to 100
		expect(sw.laps()).toEqual([100]);
		sw.lap(); // current = 250 - 100 = 150
		expect(sw.laps()).toEqual([100, 150]);
	});

	it('duration sums every recorded lap', () => {
		mockNow(0, 100, 100, 250, 250, 600, 600);
		const sw = new StopWatch();
		sw.start();
		sw.lap(); // 100
		sw.lap(); // 150
		sw.lap(); // 350
		expect(sw.duration()).toBe(600);
	});

	it('avarage is the mean of the recorded laps', () => {
		mockNow(0, 100, 100, 300, 300);
		const sw = new StopWatch();
		sw.start();
		sw.lap(); // 100
		sw.lap(); // 200
		expect(sw.avarage()).toBe(150);
	});

	it('currentLap returns the most recently completed lap', () => {
		mockNow(0, 100, 100, 300, 300);
		const sw = new StopWatch();
		sw.start();
		sw.lap();
		expect(sw.currentLap()).toBe(100);
		sw.lap();
		expect(sw.currentLap()).toBe(200);
	});

	it('estimated projects the average lap time across the remaining laps', () => {
		mockNow(0, 100, 100, 300, 300);
		const sw = new StopWatch();
		sw.start();
		sw.lap(); // 100
		sw.lap(); // 200, avarage = 150
		sw.totalLaps.set(5);
		expect(sw.estimated()).toBe(150 * (5 - 2));
	});
});
