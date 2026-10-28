import { PlainDate } from '@ts/plain/date/model';
import type { TMaskCodec, TMaskDefinition } from '../types';
import type { TDateOrder, TMaskDateConfig } from './types';

const YEAR_DIGITS = 4;
const PAIR = 2;
const TOTAL_DIGITS = YEAR_DIGITS + PAIR * 2;

/** Onde cada campo fica nos 8 dígitos digitados. */
const LAYOUT: Readonly<Record<TDateOrder, Readonly<Record<'year' | 'month' | 'day', readonly [number, number]>>>> = {
	ymd: { year: [0, 4], month: [4, 6], day: [6, 8] },
	dmy: { day: [0, 2], month: [2, 4], year: [4, 8] },
	mdy: { month: [0, 2], day: [2, 4], year: [4, 8] },
};

class MaskDateUtils {
	/** Máscara de data: ordem e separador são **parâmetros** (nada de região embutida). Valor tipado = `PlainDate`; checa o calendário. */
	static definition({ order, separator = '-' }: TMaskDateConfig): TMaskDefinition {
		const layout = LAYOUT[order];
		const slice = (field: 'year' | 'month' | 'day') => ({ from: layout[field][0], to: layout[field][1] });
		const pattern = [...order].map((letter) => (letter === 'y' ? '0000' : '00')).join(separator);

		const codec: TMaskCodec<PlainDate> = {
			parse(unmasked) {
				if (unmasked.length !== TOTAL_DIGITS || !/^\d+$/.test(unmasked)) return undefined;
				const part = (field: 'year' | 'month' | 'day') => Number(unmasked.slice(...layout[field]));
				return PlainDate.tryFrom({ year: part('year'), month: part('month'), day: part('day') });
			},
			format(date) {
				const digits = { year: String(date.year).padStart(YEAR_DIGITS, '0'), month: String(date.month).padStart(PAIR, '0'), day: String(date.day).padStart(PAIR, '0') };
				return [...order].map((letter) => digits[letter === 'y' ? 'year' : letter === 'm' ? 'month' : 'day']).join('');
			},
		};

		return { pattern, codec, checks: [{ type: 'date', year: slice('year'), month: slice('month'), day: slice('day') }] };
	}
}

export { MaskDateUtils };
