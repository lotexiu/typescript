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

	static hasDecimals(value: number): boolean {
		return _Math.getDecimals(value) > 0
	}

	static getDecimals(value: number): number {
		return value % 1
	}
}

export {
	_Math,
}
