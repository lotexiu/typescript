/**
 * @internal
*/
class _Math {
	/** Restringe value ao intervalo [min, max]. Bounds ausentes ficam sem limite naquele lado. */
	static clamp(value: number, min?: number, max?: number): number {
		let result = value;
		if (min !== undefined && result < min) result = min;
		if (max !== undefined && result > max) result = max;
		return result;
	}
}

/** Restringe value ao intervalo [min, max]. Bounds ausentes ficam sem limite naquele lado. */
const clamp = _Math.clamp;

export {
	_Math,
	clamp,
}
