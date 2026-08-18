import { isNullOrUndefined } from "@tsn-object/implementations";

/**
 * @internal
*/
class _Math {
	/** Restringe value ao intervalo [min, max]. Bounds ausentes ficam sem limite naquele lado. */
	static clamp(value: number, min?: number, max?: number): number {
		let result = value;
		if (!isNullOrUndefined(min) && result < min) result = min;
		if (!isNullOrUndefined(max) && result > max) result = max;
		return result;
	}

	static hasDecimals(value: number): boolean {
		return _Math.getDecimals(value) > 0
	}

	static getDecimals(value: number): number {
		return value % 1
	}

	static decimalsLength(value: number): number {
		return value.toString().split('.')[1]?.length ?? 0
	}
	
	static scaleToInt(...values: number[]): number {
		return 10 ** Math.max(...values.map(v => _Math.decimalsLength(v)))
	}

	static sum(...values: number[]): number {
		const scaleToInt = _Math.scaleToInt(...values)
		return values.reduce((acc, val) => acc + (val * scaleToInt)) / scaleToInt
	}

	static subtract(...values: number[]): number {
		const scaleToInt = _Math.scaleToInt(...values)
		return values.reduce((acc, val) => acc - (val * scaleToInt)) / scaleToInt
	}

	static multiply(...values: number[]): number {
		const scaleToInt = _Math.scaleToInt(...values)
		return values.reduce((acc, val) => acc * (val * scaleToInt)) / (scaleToInt ** values.length)
	}

	static divide(...values: number[]): number {
		const scaleToInt = _Math.scaleToInt(...values)
		return values.reduce((acc, val) => acc / (val * scaleToInt)) * (scaleToInt ** (values.length - 1))
	}
}

export {
	_Math,
}
