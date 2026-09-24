import { LocaleError } from '@ts/locale/error';
import { derived, signal } from '@ts/signal/model';
import { STOP_WATCH_LOCALES } from './locale';

class StopWatch {
	#startTime: number = NaN;
	// Mutado no lugar + `notify()` a cada volta.
	readonly laps = signal<number[]>([]);
	readonly totalLaps = signal(NaN);

	readonly duration = derived(() => this.laps().reduce((a, b) => a + b, 0));
	readonly avarage = derived(() => this.duration() / this.laps().length);
	readonly estimated = derived(() => this.avarage() * (this.totalLaps() - this.laps().length));
	readonly currentLap = derived(() => {
		const laps = this.laps();
		return laps[laps.length - 1];
	});

	start() {
		this.laps.set([]);
		this.#startTime = performance.now();
	}

	lap() {
		if (Number.isNaN(this.#startTime)) throw new LocaleError(STOP_WATCH_LOCALES, 'notStarted');
		this.laps().push(this.current());
		this.laps.notify();
		this.#startTime = performance.now();
	}

	current() {
		return performance.now() - this.#startTime;
	}
}

export { StopWatch };
