import { describe, it, expect, vi, afterEach } from 'vitest';
import { StopWatch } from '@ts/stopwatch/model';

// Every call to StopWatch#lap() reads performance.now() twice: once to compute the elapsed
// lap time, once more to reset the clock for the next lap — both queued mocks per lap below
// use the same timestamp, since conceptually both reads happen at the same "now".
function mockNow(...values: number[]) {
	const spy = vi.spyOn(performance, 'now');
	for (const value of values) spy.mockImplementationOnce(() => value);
	return spy;
}

describe('StopWatch', () => {
	afterEach(() => vi.restoreAllMocks());

	it('throws when lap() is called before start()', () => {
		const stopwatch = new StopWatch();
		expect(() => stopwatch.lap()).toThrow();
	});

	it('current() reports elapsed time since start()', () => {
		mockNow(1000, 1500);
		const stopwatch = new StopWatch();
		stopwatch.start();
		expect(stopwatch.current()).toBe(500);
	});

	it('start() resets the laps list', () => {
		mockNow(0, 100, 100);
		const stopwatch = new StopWatch();
		stopwatch.start();
		stopwatch.lap();
		mockNow(0);
		stopwatch.start();
		expect(stopwatch.laps()).toEqual([]);
	});

	it('lap() records the elapsed time and resets the lap clock', () => {
		mockNow(0, 100, 100, 250, 250);
		const stopwatch = new StopWatch();
		stopwatch.start(); // startTime = 0
		stopwatch.lap(); // current = 100 - 0 = 100, startTime reset to 100
		expect(stopwatch.laps()).toEqual([100]);
		stopwatch.lap(); // current = 250 - 100 = 150
		expect(stopwatch.laps()).toEqual([100, 150]);
	});

	it('duration sums every recorded lap', () => {
		mockNow(0, 100, 100, 250, 250, 600, 600);
		const stopwatch = new StopWatch();
		stopwatch.start();
		stopwatch.lap(); // 100
		stopwatch.lap(); // 150
		stopwatch.lap(); // 350
		expect(stopwatch.duration()).toBe(600);
	});

	it('avarage is the mean of the recorded laps', () => {
		mockNow(0, 100, 100, 300, 300);
		const stopwatch = new StopWatch();
		stopwatch.start();
		stopwatch.lap(); // 100
		stopwatch.lap(); // 200
		expect(stopwatch.avarage()).toBe(150);
	});

	it('currentLap returns the most recently completed lap', () => {
		mockNow(0, 100, 100, 300, 300);
		const stopwatch = new StopWatch();
		stopwatch.start();
		stopwatch.lap();
		expect(stopwatch.currentLap()).toBe(100);
		stopwatch.lap();
		expect(stopwatch.currentLap()).toBe(200);
	});

	it('estimated projects the average lap time across the remaining laps', () => {
		mockNow(0, 100, 100, 300, 300);
		const stopwatch = new StopWatch();
		stopwatch.start();
		stopwatch.lap(); // 100
		stopwatch.lap(); // 200, avarage = 150
		stopwatch.totalLaps.set(5);
		expect(stopwatch.estimated()).toBe(150 * (5 - 2));
	});
});

describe('StopWatch.measure / average', () => {
	it('records one lap per measured call, without start()', () => {
		const stopwatch = new StopWatch();
		expect(stopwatch.measure(() => 42)).toBe(42);
		stopwatch.measure(() => 1);
		expect(stopwatch.laps()).toHaveLength(2);
		expect(stopwatch.average()).toBe(stopwatch.duration() / 2);
	});

	it('still records the lap when fn throws', () => {
		const stopwatch = new StopWatch();
		expect(() => stopwatch.measure(() => { throw new Error('x'); })).toThrow('x');
		expect(stopwatch.laps()).toHaveLength(1);
	});

	it('avarage stays as an alias of average', () => {
		const stopwatch = new StopWatch();
		expect(stopwatch.avarage).toBe(stopwatch.average);
	});
});

describe('StopWatch pause / resume', () => {
	afterEach(() => vi.restoreAllMocks());

	it('o tempo parado não conta', () => {
		let now = 1000;
		vi.spyOn(performance, 'now').mockImplementation(() => now);
		const stopwatch = new StopWatch();
		stopwatch.start();
		now = 1300;
		stopwatch.pause();
		now = 5300; // 4 s parado
		expect(stopwatch.current()).toBe(300);
		stopwatch.resume();
		now = 5400;
		expect(stopwatch.current()).toBe(400);
		expect(stopwatch.paused()).toBe(false);
	});

	it('pause/resume repetidos e fora de hora são inofensivos', () => {
		let now = 0;
		vi.spyOn(performance, 'now').mockImplementation(() => now);
		const stopwatch = new StopWatch();
		stopwatch.pause(); // não iniciado
		stopwatch.resume();
		stopwatch.start();
		now = 100;
		stopwatch.pause();
		now = 150;
		stopwatch.pause(); // já pausado: mantém o primeiro instante
		now = 200;
		stopwatch.resume();
		stopwatch.resume();
		now = 300;
		expect(stopwatch.current()).toBe(200);
	});

	it('lap durante a pausa fecha a volta no instante da pausa', () => {
		let now = 0;
		vi.spyOn(performance, 'now').mockImplementation(() => now);
		const stopwatch = new StopWatch();
		stopwatch.start();
		now = 500;
		stopwatch.pause();
		now = 9000;
		stopwatch.lap();
		expect(stopwatch.laps()).toEqual([500]);
		stopwatch.resume();
		now = 9100;
		expect(stopwatch.current()).toBe(100);
	});

	it('start zera a pausa', () => {
		const stopwatch = new StopWatch();
		stopwatch.start();
		stopwatch.pause();
		stopwatch.start();
		expect(stopwatch.paused()).toBe(false);
	});
});
