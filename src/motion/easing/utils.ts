import { BEZIER_NEWTON_ITERATIONS, BEZIER_PRECISION } from './declarations';
import { TEasing } from './types';

/** Easing curves for animations: the classic cubic ones and any CSS-like cubic Bézier. */
class EasingUtils {
	/** No easing. */
	static linear(progress: number): number {
		return progress;
	}

	/** Starts slow, ends fast. */
	static easeIn(progress: number): number {
		return progress ** 3;
	}

	/** Starts fast, ends slow — the usual choice for things entering the screen. */
	static easeOut(progress: number): number {
		return 1 - (1 - progress) ** 3;
	}

	/** Slow at both ends. */
	static easeInOut(progress: number): number {
		return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
	}

	/**
	 * The curve of `cubic-bezier(x1, y1, x2, y2)`: control points `(x1, y1)` and `(x2, y2)` between `(0, 0)` and `(1, 1)`.
	 * @example
	 * const standard = EasingUtils.cubicBezier(0.2, 0, 0, 1)
	 * standard(0.5) // ≈ 0.9
	 */
	static cubicBezier(x1: number, y1: number, x2: number, y2: number): TEasing {
		const curve = (first: number, second: number, time: number) => 3 * first * time * (1 - time) ** 2 + 3 * second * time ** 2 * (1 - time) + time ** 3;
		const slope = (first: number, second: number, time: number) => 3 * first * (1 - time) ** 2 + 6 * (second - first) * time * (1 - time) + 3 * (1 - second) * time ** 2;
		return (progress) => {
			if (progress <= 0 || progress >= 1) return progress <= 0 ? 0 : 1;
			let time = progress;
			for (let iteration = 0; iteration < BEZIER_NEWTON_ITERATIONS; iteration++) {
				const error = curve(x1, x2, time) - progress;
				if (Math.abs(error) < BEZIER_PRECISION) break;
				const derivative = slope(x1, x2, time);
				if (derivative === 0) break;
				time -= error / derivative;
			}
			return curve(y1, y2, Math.min(1, Math.max(0, time)));
		};
	}
}

export { EasingUtils };
