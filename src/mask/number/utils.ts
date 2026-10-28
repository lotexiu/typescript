import { TMaskNumber } from '../types';

const DEFAULT_GROUP_SIZE = 3;

/** Número "da direita para a esquerda" a partir dos dígitos digitados (`1234567`, escala 2 → `12.345,67`). Só não negativos. */
class MaskNumberUtils {
	static digits(text: string): string {
		return text.replace(/\D/g, '');
	}

	static format(digits: string, config: TMaskNumber): string {
		if (digits === '') return '';
		const padded = digits.padStart(config.scale + 1, '0');
		const split = padded.length - config.scale;
		const integer = padded.slice(0, split).replace(/^0+(?=\d)/, '');
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
		return value.toFixed(scale).replace('.', '').replace(/^0+(?=\d)/, '');
	}
}

export { MaskNumberUtils };
