import { TEasing } from '../easing/types';
import { TFrameScheduler } from '../frame/types';

/** Options of a `Tween`. */
type TTweenOptions = {
	/** Length of each transition in milliseconds. Default 200. */
	readonly duration?: number;
	/** Default `EasingUtils.easeOut`. */
	readonly easing?: TEasing;
	/** Frame scheduler; inject one in tests. Default `FrameUtils.schedule`. */
	readonly scheduler?: TFrameScheduler;
};

export type { TTweenOptions };
