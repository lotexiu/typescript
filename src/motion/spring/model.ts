import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TFrameScheduler } from '../frame/types';
import { FrameUtils } from '../frame/utils';
import { MILLISECONDS_PER_SECOND, SPRING_DEFAULTS } from './declarations';
import { TSpringConfig, TSpringOptions } from './types';
import { SpringUtils } from './utils';

/**
 * A number that follows its target like a spring — natural motion that keeps its speed when the target changes mid-way.
 * Read `value()` (reactive) and render it; nothing here touches the DOM.
 * @example
 * const scale = new Spring(0.9)
 * scale.set(1) // animates to 1, frame by frame
 */
class Spring {
	/** Current value. */
	readonly value: Computed<number>;
	/** Where the spring is heading. */
	readonly target: Computed<number>;
	/** Whether it is still moving. */
	readonly moving: Computed<boolean>;
	/** Stiffness, damping, mass and precision in use. */
	readonly config: TSpringConfig;
	readonly #value: Signal<number>;
	readonly #target: Signal<number>;
	readonly #moving: Signal<boolean>;
	readonly #scheduler: TFrameScheduler;
	#velocity = 0;
	#lastFrame: number | undefined;
	#cancel: (() => void) | undefined;

	/** Moves towards a new target (keeping the current speed). */
	readonly set = (target: number): void => {
		this.#target.set(target);
		if (SpringUtils.isSettled({ value: Signal.untracked(this.#value), velocity: this.#velocity }, target, this.#precision)) return;
		this.#start();
	};

	/** Jumps to a value with no animation (stops the motion). */
	readonly jump = (value: number): void => {
		this.stop();
		this.#velocity = 0;
		Signal.batch(() => {
			this.#value.set(value);
			this.#target.set(value);
		});
	};

	/** Stops where it is. */
	readonly stop = (): void => {
		this.#cancel?.();
		this.#cancel = undefined;
		this.#lastFrame = undefined;
		this.#moving.set(false);
	};

	constructor(initial = 0, options: TSpringOptions = {}) {
		const { scheduler, ...config } = options;
		this.config = config;
		this.#scheduler = scheduler ?? FrameUtils.schedule;
		this.#value = signal(initial);
		this.#target = signal(initial);
		this.#moving = signal(false);
		this.value = computed(() => this.#value());
		this.target = computed(() => this.#target());
		this.moving = computed(() => this.#moving());
	}

	/** Stops the animation for good. */
	dispose(): void {
		this.stop();
	}

	get #precision(): number {
		return this.config.precision ?? SPRING_DEFAULTS.PRECISION;
	}

	#start(): void {
		this.#moving.set(true);
		if (this.#cancel === undefined) this.#cancel = this.#scheduler(this.#frame);
	}

	readonly #frame = (now: number): void => {
		const elapsed = this.#lastFrame === undefined ? 0 : (now - this.#lastFrame) / MILLISECONDS_PER_SECOND;
		this.#lastFrame = now;
		const target = Signal.untracked(this.#target);
		const next = SpringUtils.advance({ value: Signal.untracked(this.#value), velocity: this.#velocity }, target, this.config, elapsed);
		if (SpringUtils.isSettled(next, target, this.#precision)) {
			this.#velocity = 0;
			this.#value.set(target);
			this.stop();
			return;
		}
		this.#velocity = next.velocity;
		this.#value.set(next.value);
		this.#cancel = this.#scheduler(this.#frame);
	};
}

export { Spring };
