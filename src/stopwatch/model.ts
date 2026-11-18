import { LocaleError } from "@ts/locale/error";
import { computed } from "@tsr-node/computed/model";
import { signal } from "@tsr-node/signal/model";
import { STOP_WATCH_LOCALES } from "./locale";


/**
 * Measures laps with `performance.now()`, with pause/resume, totals, average and an estimate of the time left.
 */
class StopWatch {
	#startTime: number = NaN;
	/** Instante da pausa (`NaN` = rodando). Enquanto pausado o tempo não corre. */
	#pausedAt: number = NaN;
	/** Whether it is paused. */
	readonly paused = signal(false);
	// Mutado no lugar + `notify()` a cada volta.
	/** Recorded laps, in milliseconds. */
	readonly laps = signal<number[]>([]);
	/** Expected number of laps, for `estimated` (NaN when unknown). */
	readonly totalLaps = signal(NaN);

	/** Sum of the laps. */
	readonly duration = computed(() => this.laps().reduce((total, lap) => total + lap, 0));
	/** Mean lap. */
	readonly average = computed(() => this.duration() / this.laps().length);
	/**
	 * Old spelling of `average`.
	 * @deprecated Misspelled — use `average`.
	 */
	readonly avarage = this.average;
	/** Time left for the remaining laps at the average pace. */
	readonly estimated = computed(() => this.average() * (this.totalLaps() - this.laps().length));
	/** Last recorded lap. */
	readonly currentLap = computed(() => {
		const laps = this.laps();
		return laps[laps.length - 1];
	});

	/** Clears the laps and starts timing. */
	start() {
		this.laps.set([]);
		this.#startTime = performance.now();
		this.#pausedAt = NaN;
		this.paused.set(false);
	}

	/** Congela a volta atual (não zera nada). Sem efeito se não foi iniciado ou já está pausado. */
	pause() {
		if (Number.isNaN(this.#startTime) || this.paused()) return;
		this.#pausedAt = performance.now();
		this.paused.set(true);
	}

	/** Continua de onde parou: o tempo parado não conta. */
	resume() {
		if (!this.paused()) return;
		this.#startTime += performance.now() - this.#pausedAt;
		this.#pausedAt = NaN;
		this.paused.set(false);
	}

	/** Records the running lap and starts the next one. Throws when not started. */
	lap() {
		if (Number.isNaN(this.#startTime)) throw new LocaleError(STOP_WATCH_LOCALES, 'notStarted');
		this.laps().push(this.current());
		this.laps.notify();
		this.#startTime = this.paused() ? this.#pausedAt : performance.now();
	}

	/**
	 * Times one call of `fn` and records it as a lap — independent of `start()`/`lap()`, so separate
	 * operations can be timed one by one (`average` then is the mean cost per call).
	 */
	measure<T>(fn: () => T): T {
		const begin = performance.now();
		try {
			return fn();
		} finally {
			this.laps().push(performance.now() - begin);
			this.laps.notify();
		}
	}

	/** Milliseconds of the running lap. */
	current() {
		return (this.paused() ? this.#pausedAt : performance.now()) - this.#startTime;
	}
}

export { StopWatch };
