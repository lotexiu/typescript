import { RegexUtils } from '@tsn/regex/utils';
import { TMaskNumber } from '../types';
import { DEFAULT_GROUP_SIZE } from './declarations';

/** Número "da direita para a esquerda" a partir dos dígitos digitados (`1234567`, escala 2 → `12.345,67`). Só não negativos. */
class MaskNumberUtils {
	static digits(text: string): string {
		return RegexUtils.stripNonDigits(text);
	}

	static format(digits: string, config: TMaskNumber): string {
		if (digits === '') return '';
		const padded = digits.padStart(config.scale + 1, '0');
		const split = padded.length - config.scale;
		const integer = RegexUtils.trimLeadingZeros(padded.slice(0, split));
		const fraction = padded.slice(split);
		const grouped = config.group ? MaskNumberUtils.group(integer, config.group, config.groupSize ?? DEFAULT_GROUP_SIZE) : integer;
		return config.scale > 0 ? `${grouped}${config.decimal}${fraction}` : grouped;
	}

	static group(integer: string, separator: string, size: number): string {
		let result = '';
		for (let end = integer.length; end > 0; end -= size) {
			const chunk = integer.slice(Math.max(0, end - size), end);
			result = result === '' ? chunk : `${chunk}${separator}${result}`;
		}
		return result;
	}

	static toTyped(digits: string, scale: number): number | undefined {
		if (digits === '') return undefined;
		const padded = digits.padStart(scale + 1, '0');
		const split = padded.length - scale;
		return Number(scale > 0 ? `${padded.slice(0, split)}.${padded.slice(split)}` : padded);
	}

	static fromTyped(value: number, scale: number): string | undefined {
		if (!Number.isFinite(value) || value < 0) return undefined;
		return RegexUtils.trimLeadingZeros(value.toFixed(scale).replace('.', ''));
	}
}

export { MaskNumberUtils };
