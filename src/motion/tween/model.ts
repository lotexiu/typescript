import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TEasing } from '../easing/types';
import { EasingUtils } from '../easing/utils';
import { TFrameScheduler } from '../frame/types';
import { FrameUtils } from '../frame/utils';
import { DEFAULT_TWEEN_MILLISECONDS } from './declarations';
import { TTweenOptions } from './types';

/**
 * A number that moves to a target in a fixed time along an easing curve — predictable timing, unlike `Spring`.
 * @example
 * const opacity = new Tween(0, { duration: 150 })
 * opacity.to(1)
 */
class Tween {
	/** Current value. */
	readonly value: Computed<number>;
	/** Whether a transition is running. */
	readonly running: Computed<boolean>;
	/** Default length of a transition, in milliseconds. */
	readonly duration: number;
	/** Curve applied to the progress. */
	readonly easing: TEasing;
	readonly #value: Signal<number>;
	readonly #running: Signal<boolean>;
	readonly #scheduler: TFrameScheduler;
	#from = 0;
	#target = 0;
	#startedAt: number | undefined;
	#length = 0;
	#cancel: (() => void) | undefined;

	/** Moves from the current value to `target` in `duration` milliseconds (default: the tween's). */
	readonly to = (target: number, duration: number = this.duration): void => {
		this.#cancel?.();
		this.#from = Signal.untracked(this.#value);
		this.#target = target;
		this.#length = duration;
		this.#startedAt = undefined;
		this.#running.set(true);
		this.#cancel = this.#scheduler(this.#frame);
	};

	/** Jumps to a value with no animation. */
	readonly jump = (value: number): void => {
		this.stop();
		this.#value.set(value);
	};

	/** Stops where it is. */
	readonly stop = (): void => {
		this.#cancel?.();
		this.#cancel = undefined;
		this.#running.set(false);
	};

	constructor(initial = 0, options: TTweenOptions = {}) {
		this.duration = options.duration ?? DEFAULT_TWEEN_MILLISECONDS;
		this.easing = options.easing ?? EasingUtils.easeOut;
		this.#scheduler = options.scheduler ?? FrameUtils.schedule;
		this.#value = signal(initial);
		this.#running = signal(false);
		this.value = computed(() => this.#value());
		this.running = computed(() => this.#running());
	}

	/** Stops the animation for good. */
	dispose(): void {
		this.stop();
	}

	readonly #frame = (now: number): void => {
		this.#startedAt ??= now;
		const progress = this.#length <= 0 ? 1 : Math.min(1, (now - this.#startedAt) / this.#length);
		this.#value.set(this.#from + (this.#target - this.#from) * this.easing(progress));
		if (progress >= 1) {
			this.stop();
			return;
		}
		this.#cancel = this.#scheduler(this.#frame);
	};
}

export { Tween };
