import { MAX_STEP_SECONDS, SPRING_DEFAULTS } from './declarations';
import { TSpringConfig, TSpringState } from './types';

/** Pure spring physics: advance a state towards a target, and tell when it has settled. */
class SpringUtils {
	/** The state after `seconds`, integrated in small steps (semi-implicit Euler). */
	static advance(state: TSpringState, target: number, config: TSpringConfig, seconds: number): TSpringState {
		const stiffness = config.stiffness ?? SPRING_DEFAULTS.STIFFNESS;
		const damping = config.damping ?? SPRING_DEFAULTS.DAMPING;
		const mass = config.mass ?? SPRING_DEFAULTS.MASS;
		let { value, velocity } = state;
		let remaining = Math.max(0, seconds);
		while (remaining > 0) {
			const step = Math.min(MAX_STEP_SECONDS, remaining);
			const acceleration = (-stiffness * (value - target) - damping * velocity) / mass;
			velocity += acceleration * step;
			value += velocity * step;
			remaining -= step;
		}
		return { value, velocity };
	}

	/** Close enough to the target and slow enough to stop. */
	static isSettled(state: TSpringState, target: number, precision: number = SPRING_DEFAULTS.PRECISION): boolean {
		return Math.abs(state.value - target) < precision && Math.abs(state.velocity) < precision;
	}
}

export { SpringUtils };
