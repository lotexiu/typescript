import { model } from "../model/model";
import { computed } from "../computed/model";
import { _Time } from "@ts/time/implementations";

class StopWatch {
	private static readonly NOT_STARTED = new Error("StopWatch has not been started");

	private _laps: number[] = []
	
	private startTime: number = -1;
	private readonly model = model(-1)
	readonly totalLaps = model(NaN)

	totalSum = computed(() => {
		return this._laps.reduce((a, b) => a + b, 0);
	}, [this.model])

	avarage = computed(() => {
		return this.totalSum.value / this._laps.length;
	}, [this.totalSum, this.model])

	estimated = computed(() => {
		return this.avarage.value * (this.totalLaps.value - this._laps.length)
	}, [this.avarage, this.totalLaps])

	laps = computed(() => {
		return this._laps.map(lap => _Time.convert(lap))
	}, [this.model])

	start() {
		this._laps = []
		this.model.set(-1)
	}

	lap() {
		if (this.startTime == -1) throw StopWatch.NOT_STARTED;
		const value = performance.now() - this.startTime;
		this._laps.push(value)
		this.model.set(value);
		return this.startTime = performance.now();
	}
}

export {
	StopWatch
}