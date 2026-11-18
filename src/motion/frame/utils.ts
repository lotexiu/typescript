import { FALLBACK_FRAME_MILLISECONDS } from './declarations';
import { TAnimationFrameHost, TFrameScheduler } from './types';

/** The default frame scheduler of the animations — `requestAnimationFrame` when the platform has it, a timer otherwise. */
class FrameUtils {
	/** Schedules `callback` for the next frame. Returns the function that cancels it. */
	static readonly schedule: TFrameScheduler = (callback) => {
		const host = globalThis as TAnimationFrameHost;
		if (host.requestAnimationFrame !== undefined && host.cancelAnimationFrame !== undefined) {
			const handle = host.requestAnimationFrame(callback);
			return () => host.cancelAnimationFrame!(handle);
		}
		const timer = setTimeout(() => callback(FrameUtils.now()), FALLBACK_FRAME_MILLISECONDS);
		return () => clearTimeout(timer);
	};

	/** Current time in milliseconds, from `performance.now()` when available. */
	static now(): number {
		return globalThis.performance?.now() ?? Date.now();
	}
}

export { FrameUtils };
