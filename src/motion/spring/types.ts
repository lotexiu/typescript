import { TFrameScheduler } from '../frame/types';

/** Physics of a spring. Stiffer moves faster; more damping bounces less. */
type TSpringConfig = {
	/** Pull towards the target. Default 170. */
	readonly stiffness?: number;
	/** Friction. Default 26. */
	readonly damping?: number;
	/** Inertia. Default 1. */
	readonly mass?: number;
	/** Distance and speed below which the spring snaps to the target and stops. Default 0.001. */
	readonly precision?: number;
};

/** Position and speed of a spring at an instant. */
type TSpringState = {
	/** Position. */
	readonly value: number;
	/** Speed, in units per second. */
	readonly velocity: number;
};

/** Options of a `Spring`. */
type TSpringOptions = TSpringConfig & {
	/** Frame scheduler; inject one in tests. Default `FrameUtils.schedule`. */
	readonly scheduler?: TFrameScheduler;
};

export type { TSpringConfig, TSpringState, TSpringOptions };
