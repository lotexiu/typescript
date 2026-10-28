import { DECIMAL_RADIX } from './declarations';
import type { TRoundingMode } from './types';

/** Aritmética de `bigint` por trás do `Decimal` (não conhece `Decimal`). */
class DecimalUtils {
	static pow10(exponent: number): bigint {
		return DECIMAL_RADIX ** BigInt(exponent);
	}

	static abs(value: bigint): bigint {
		return value < 0n ? -value : value;
	}

	/** Divide `numerator / denominator` (inteiros) e arredonda o quociente pelo `mode`. */
	static divideRounded(numerator: bigint, denominator: bigint, mode: TRoundingMode): bigint {
		const negative = numerator < 0n !== denominator < 0n;
		const top = DecimalUtils.abs(numerator);
		const bottom = DecimalUtils.abs(denominator);
		let quotient = top / bottom;
		const remainder = top % bottom;
		if (remainder !== 0n) {
			const twice = remainder * 2n;
			let increment: boolean;
			switch (mode) {
				case 'up':
					increment = true;
					break;
				case 'down':
					increment = false;
					break;
				case 'ceil':
					increment = !negative;
					break;
				case 'floor':
					increment = negative;
					break;
				case 'half-up':
					increment = twice >= bottom;
					break;
				case 'half-down':
					increment = twice > bottom;
					break;
				case 'half-even':
					increment = twice > bottom || (twice === bottom && quotient % 2n === 1n);
					break;
			}
			if (increment) quotient += 1n;
		}
		return negative ? -quotient : quotient;
	}
}

export { DecimalUtils };
