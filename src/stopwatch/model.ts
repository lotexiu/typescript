import { computed } from '@ts/computed/model';
import { LocaleError } from '@ts/locale/error';
import { model } from '@ts/model/model';
import { STOP_WATCH_LOCALES } from '@ts/subscription/locale';

class StopWatch {
	#startTime: number = NaN;
	readonly laps = model<number[]>([]);
	readonly totalLaps = model(NaN);

	readonly duration = computed(() => this.laps.value.reduce((a, b) => a + b, 0), [this.laps]);
	readonly avarage = computed(() => this.duration.value / this.laps.value.length, [this.duration]);
	readonly estimated = computed(
		() => this.avarage.value * (this.totalLaps.value - this.laps.value.length),
		[this.avarage, this.totalLaps]
	);
	readonly currentLap = computed(() => this.laps.value[this.laps.value.length - 1], [this.laps]);

	start() {
		this.laps.set([]);
		this.#startTime = performance.now();
	}

	lap() {
		if (Number.isNaN(this.#startTime)) throw new LocaleError(STOP_WATCH_LOCALES, 'notStarted');
		this.laps.value.push(this.current());
		this.laps.notifies(this.laps.value);
		this.#startTime = performance.now();
	}

	current() {
		return performance.now() - this.#startTime;
	}
}

export { StopWatch };
