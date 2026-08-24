import { computed } from "../computed/model";
import { model } from "../model/model";

class StopWatch {
	private static readonly NOT_STARTED = new Error("StopWatch has not been started");
	private startTime: number = NaN;

	laps = model<number[]>([])
	totalLaps = model(NaN)

	duration = computed(() => this.laps.value.reduce((a, b) => a + b, 0), [this.laps])
	avarage = computed(() => this.duration.value / this.laps.value.length, [this.duration])
	estimated = computed(() => this.avarage.value * (this.totalLaps.value - this.laps.value.length), [this.avarage, this.totalLaps])
	currentLap = computed(() => this.laps.value[this.laps.value.length - 1], [this.laps])

	start() {
		this.laps.set([]);
		this.startTime = performance.now();
	}

	lap() {
		if (Number.isNaN(this.startTime)) throw StopWatch.NOT_STARTED;
		this.laps.value.push(this.current())
		this.laps.notifies(this.laps.value)
		this.startTime = performance.now();
	}

	current() {return performance.now() - this.startTime}
}

export {
	StopWatch
}